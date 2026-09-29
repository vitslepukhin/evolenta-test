import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { readApiError } from '../../../core/api/api-error';
import { TicketsApiService } from '../api/tickets-api.service';
import { TicketStatus } from '../models/ticket-status.model';
import { TicketsStore } from './tickets.store';

interface TicketStatusState {
  updatingStatusIds: Record<string, true>;
  statusErrors: Record<string, string>;
}

const initialState: TicketStatusState = {
  updatingStatusIds: {},
  statusErrors: {},
};

export const TicketStatusStore = signalStore(
  withState(initialState),
  withMethods((store, api = inject(TicketsApiService), ticketsStore = inject(TicketsStore)) => ({
    getStatusById(id: string): TicketStatus | undefined {
      return ticketsStore.entityMap()[id]?.status;
    },

    isUpdating(id: string): boolean {
      return store.updatingStatusIds()[id] === true;
    },

    error(id: string): string | null {
      return store.statusErrors()[id] ?? null;
    },

    async changeStatus(id: string, status: TicketStatus): Promise<void> {
      patchState(store, (state) => ({
        updatingStatusIds: { ...state.updatingStatusIds, [id]: true as const },
        statusErrors: deleteById(state.statusErrors, id),
      }));

      try {
        const ticket = await firstValueFrom(api.updateStatus(id, status));
        ticketsStore.patchTicket(id, ticket);
      } catch (error: unknown) {
        patchState(store, (state) => ({
          statusErrors: {
            ...state.statusErrors,
            [id]: readApiError(error)?.message ?? 'Не удалось изменить статус',
          },
        }));
      } finally {
        patchState(store, (state) => ({
          updatingStatusIds: deleteById(state.updatingStatusIds, id),
        }));
      }
    },
  })),
);

function deleteById<T>(record: Record<string, T>, id: string): Record<string, T> {
  if (!(id in record)) return record;
  const next = { ...record };
  delete next[id];
  return next;
}
