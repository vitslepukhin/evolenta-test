import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { ReplyFormComponent } from '../../components/reply-form/reply-form.component';
import { TicketStatusComponent } from '../../components/ticket-status/ticket-status.component';
import { RequestStatus } from '../../models/request-status.model';
import { TicketDetail } from '../../models/ticket.model';
import { TicketDetailStore } from '../../services/ticket-detail.store';

@Component({
  selector: 'app-ticket-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoadingIndicatorComponent,
    ErrorStateComponent,
    TicketStatusComponent,
    MessageListComponent,
    ReplyFormComponent,
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss',
})
export class TicketDetailComponent {
  readonly ticketId = input.required<string>();

  private readonly store = inject(TicketDetailStore);

  protected readonly detailView = computed(() =>
    toDetailView(this.store.ticket(), this.store.detailStatus(), this.store.detailError()),
  );
  protected readonly replyError = this.store.replyError;
  protected readonly replyPending = this.store.replyPending;

  protected readonly replyDraft = signal('');

  constructor() {
    this.store.load(this.ticketId);
  }

  protected async onReplySubmit(text: string): Promise<void> {
    const sent = await this.store.sendReply(this.ticketId(), text);
    if (sent) {
      this.replyDraft.set('');
    }
  }

  protected onRetry(): void {
    this.store.load(this.ticketId());
  }
}

const DETAIL_ERROR_FALLBACK = 'Не удалось загрузить обращение';

type DetailView =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; ticket: TicketDetail };

function toDetailView(
  ticket: TicketDetail | null,
  status: RequestStatus,
  error: string | null,
): DetailView {
  if (status === 'idle' || status === 'loading') {
    return { kind: 'loading' };
  }
  if (status === 'error' || ticket === null) {
    return { kind: 'error', message: error ?? DETAIL_ERROR_FALLBACK };
  }
  return { kind: 'ready', ticket };
}
