import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { MAX_SEARCH_QUERY_LENGTH } from '../../models/ticket-filters.model';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUSES,
  ticketStatusSchema,
} from '../../models/ticket-status.model';
import { TicketsStore } from '../../services/tickets.store';

const QUERY_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-ticket-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-search-bar.component.html',
  styleUrl: './ticket-search-bar.component.scss',
})
export class TicketSearchBarComponent {
  private readonly store = inject(TicketsStore);
  private readonly queryInput$ = new Subject<string>();

  protected readonly filters = this.store.filters;
  protected readonly queryDraft = linkedSignal(() => this.filters().query);
  protected readonly maxLength = MAX_SEARCH_QUERY_LENGTH;
  protected readonly statuses = TICKET_STATUSES;
  protected readonly statusLabels = TICKET_STATUS_LABELS;

  constructor() {
    this.queryInput$
      .pipe(
        map((value) => value.trim()),
        debounceTime(QUERY_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((query) => this.store.setFilters({ query }));
  }

  protected onQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.queryDraft.set(value);
    this.queryInput$.next(value);
  }

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const parsed = ticketStatusSchema.safeParse(value);
    this.store.setFilters({ status: parsed.success ? parsed.data : null });
  }
}
