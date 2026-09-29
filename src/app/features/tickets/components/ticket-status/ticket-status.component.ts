import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { TicketStatus } from '../../models/ticket-status.model';
import { TicketStatusStore } from '../../services/ticket-status.store';
import { StatusSelectComponent } from '../status-select/status-select.component';

@Component({
  selector: 'app-ticket-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusSelectComponent, LoadingIndicatorComponent],
  host: {
    '[attr.aria-busy]': 'updating() ? "true" : null',
    '(click)': '$event.stopPropagation()',
    '(keydown)': '$event.stopPropagation()',
  },
  templateUrl: './ticket-status.component.html',
  styleUrl: './ticket-status.component.scss',
})
export class TicketStatusComponent {
  readonly ticketId = input.required<string>();
  readonly disabled = input(false);

  private readonly statusStore = inject(TicketStatusStore);

  protected readonly updating = computed(() => this.statusStore.isUpdating(this.ticketId()));
  protected readonly error = computed(() => this.statusStore.error(this.ticketId()));
  protected readonly status = computed(() => this.statusStore.getStatusById(this.ticketId()));

  protected onStatusChange(status: TicketStatus): void {
    void this.statusStore.changeStatus(this.ticketId(), status);
  }
}
