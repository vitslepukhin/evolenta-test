import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageEntity } from '../../models/message.model';

/** Chronological list of a ticket's messages. Purely presentational. */
@Component({
  selector: 'app-message-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageItemComponent],
  host: { role: 'log', '[attr.aria-label]': '"История сообщений"' },
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  readonly messages = input.required<MessageEntity[]>();
}
