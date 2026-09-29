import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { RovingTabindexDirective } from '../../../../shared/directives/roving-tabindex/roving-tabindex.directive';
import { TicketSummary } from '../../models/ticket.model';
import { TicketListItemComponent } from '../ticket-list-item/ticket-list-item.component';

@Component({
  selector: 'app-ticket-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TicketListItemComponent],
  hostDirectives: [RovingTabindexDirective],
  host: {
    role: 'listbox',
    '[attr.aria-label]': '"Список обращений"',
  },
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
})
export class TicketListComponent {
  readonly tickets = input.required<TicketSummary[]>();
  readonly selectedId = input<string | null>(null);

  readonly ticketSelect = output<string>();

  private readonly roving = inject(RovingTabindexDirective);

  constructor() {
    afterRenderEffect(() => {
      this.tickets();
      untracked(() => this.roving.syncTabindex());
    });
  }
}
