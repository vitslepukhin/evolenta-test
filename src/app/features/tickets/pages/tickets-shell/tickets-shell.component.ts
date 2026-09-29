import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { TicketSearchBarComponent } from '../../components/ticket-search-bar/ticket-search-bar.component';
import { TicketListComponent } from '../../components/ticket-list/ticket-list.component';
import { RequestStatus } from '../../models/request-status.model';
import { TicketSummary } from '../../models/ticket.model';
import { TicketsStore } from '../../services/tickets.store';

@Component({
  selector: 'app-tickets-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    TicketSearchBarComponent,
    TicketListComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './tickets-shell.component.html',
  styleUrl: './tickets-shell.component.scss',
})
export class TicketsShellComponent {
  private readonly store = inject(TicketsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly listView = computed(() =>
    toListView(this.store.entities(), this.store.listStatus(), this.store.listError()),
  );

  protected readonly selectedId = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => ticketIdFrom(this.route)),
    ),
    { initialValue: ticketIdFrom(this.route) },
  );

  protected onTicketSelect(id: string): void {
    void this.router.navigate([id], { relativeTo: this.route });
  }

  protected onRetry(): void {
    this.store.loadList(this.store.filters());
  }
}

function ticketIdFrom(route: ActivatedRoute): string | null {
  return route.firstChild?.snapshot?.paramMap?.get('ticketId') ?? null;
}

const LIST_ERROR_FALLBACK = 'Не удалось загрузить список обращений';

type ListView =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' }
  | { kind: 'stale'; message: string; tickets: TicketSummary[] }
  | { kind: 'ready'; tickets: TicketSummary[] };

function toListView(tickets: TicketSummary[], status: RequestStatus, error: string | null): ListView {
  if (tickets.length === 0 && (status === 'idle' || status === 'loading')) {
    return { kind: 'loading' };
  }
  if (tickets.length === 0 && status === 'error') {
    return { kind: 'error', message: error ?? LIST_ERROR_FALLBACK };
  }
  if (tickets.length === 0) {
    return { kind: 'empty' };
  }
  if (status === 'error') {
    return { kind: 'stale', message: error ?? LIST_ERROR_FALLBACK, tickets };
  }
  return { kind: 'ready', tickets };
}
