import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ActivatableDirective } from '../../../../shared/directives/activatable/activatable.directive';
import { TimeAgoComponent } from '../../../../shared/components/time-ago/time-ago.component';
import { TicketSummary } from '../../models/ticket.model';
import { TicketStatusComponent } from '../ticket-status/ticket-status.component';

@Component({
  selector: 'app-ticket-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimeAgoComponent, TicketStatusComponent],
  hostDirectives: [ActivatableDirective],
  host: {
    role: 'option',
    '[class.selected]': 'selected()',
    '[attr.aria-selected]': 'selected()',
  },
  templateUrl: './ticket-list-item.component.html',
  styleUrl: './ticket-list-item.component.scss',
})
export class TicketListItemComponent {
  readonly ticket = input.required<TicketSummary>();
  readonly selected = input(false);

  readonly select = output<string>();

  private readonly activatable = inject(ActivatableDirective);

  constructor() {
    this.activatable.activated.subscribe(() => this.select.emit(this.ticket().id));
  }
}
