import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TYPES,
  TICKET_STATUSES,
  TicketStatus,
  ticketStatusSchema,
} from '../../models/ticket-status.model';

@Component({
  selector: 'app-status-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent],
  host: { class: 'status-select' },
  templateUrl: './status-select.component.html',
  styleUrl: './status-select.component.scss',
})
export class StatusSelectComponent {
  readonly status = input.required<TicketStatus>();
  readonly disabled = input(false);

  readonly statusChange = output<TicketStatus>();

  protected readonly statuses = TICKET_STATUSES;
  protected readonly statusLabels = TICKET_STATUS_LABELS;
  protected readonly statusTypes = TICKET_STATUS_TYPES;

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const parsed = ticketStatusSchema.safeParse(value);
    if (!parsed.success || parsed.data === this.status()) return;
    this.statusChange.emit(parsed.data);
  }
}
