import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, firstValueFrom, of, pipe, switchMap, tap } from 'rxjs';
import { apiErrorMessage, readApiError } from '../../../core/api/api-error';
import { TicketsApiService } from '../api/tickets-api.service';
import { RequestStatus } from '../models/request-status.model';
import { TicketDetail } from '../models/ticket.model';
import { TicketsStore } from './tickets.store';

interface TicketDetailState {
  ticket: TicketDetail | null;
  detailStatus: RequestStatus;
  detailError: string | null;
  replyPending: boolean;
  replyError: string | null;
}

const initialState: TicketDetailState = {
  ticket: null,
  detailStatus: 'idle',
  detailError: null,
  replyPending: false,
  replyError: null,
};

export const TicketDetailStore = signalStore(
  withState(initialState),
  withMethods((store, api = inject(TicketsApiService), ticketsStore = inject(TicketsStore)) => ({
    load: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            detailStatus: 'loading',
            detailError: null,
            replyPending: false,
            replyError: null,
          }),
        ),
        switchMap((id) =>
          api.getTicket(id).pipe(
            tap((ticket) => {
              patchState(store, { ticket, detailStatus: 'success' });
            }),
            catchError((error: unknown) => {
              patchState(store, {
                ticket: null,
                detailStatus: 'error',
                detailError: detailErrorMessage(error),
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    async sendReply(id: string, text: string): Promise<boolean> {
      patchState(store, { replyPending: true, replyError: null });
      try {
        const message = await firstValueFrom(api.sendReply(id, text));
        const ticket = store.ticket();
        if (ticket?.id === id) {
          patchState(store, {
            ticket: { ...ticket, messages: ticket.messages.concat(message) },
          });
        }
        ticketsStore.patchTicket(id, { updatedAt: message.createdAt });
        return true;
      } catch (error: unknown) {
        patchState(store, {
          replyError: apiErrorMessage(error, 'Не удалось отправить ответ, попробуйте ещё раз'),
        });
        return false;
      } finally {
        patchState(store, { replyPending: false });
      }
    },
  })),
);

function detailErrorMessage(error: unknown): string {
  const apiError = readApiError(error);
  if (apiError?.kind === 'http' && apiError.status === 404) {
    return 'Обращение не найдено';
  }
  return apiError?.message || 'Не удалось загрузить обращение';
}
