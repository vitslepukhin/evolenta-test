import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TimeAgoComponent } from '../../../../shared/components/time-ago/time-ago.component';
import { MessageEntity } from '../../models/message.model';

/** One message in the ticket's history. Purely presentational. */
@Component({
  selector: 'app-message-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimeAgoComponent],
  host: {
    '[class.agent]': "message().role === 'agent'",
    '[class.customer]': "message().role === 'customer'",
  },
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss',
})
export class MessageItemComponent {
  readonly message = input.required<MessageEntity>();
}
