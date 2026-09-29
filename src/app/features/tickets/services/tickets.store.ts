import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { TicketsApiService } from '../api/tickets-api.service';
import { RequestStatus } from '../models/request-status.model';
import { TicketFilters } from '../models/ticket-filters.model';
import { TicketSummary } from '../models/ticket.model';
import { TicketsUrlSync } from './tickets-url-sync.service';

interface TicketsState {
  listStatus: RequestStatus;
  listError: string | null;
}

const initialState: TicketsState = {
  listStatus: 'idle',
  listError: null,
};

export const TicketsStore = signalStore(
  withState(initialState),
  withEntities<TicketSummary>(),
  withProps((_, urlSync = inject(TicketsUrlSync)) => ({
    filters: urlSync.filters,
  })),
  withMethods((store, api = inject(TicketsApiService), urlSync = inject(TicketsUrlSync)) => ({
    setFilters(patch: Partial<TicketFilters>): void {
      urlSync.setFilters(patch);
    },

    patchTicket(id: string, changes: Partial<TicketSummary>): void {
      if (!store.entityMap()[id]) return;
      patchState(store, updateEntity({ id, changes }));
    },

    loadList: rxMethod<TicketFilters>(
      pipe(
        tap(() => patchState(store, { listStatus: 'loading', listError: null })),
        switchMap((filters) =>
          api.getTickets(filters).pipe(
            tap((tickets) => {
              patchState(store, setAllEntities(tickets), { listStatus: 'success' });
            }),
            catchError((error: unknown) => {
              patchState(store, {
                listStatus: 'error',
                listError: apiErrorMessage(error, 'Не удалось выполнить запрос'),
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadList(store.filters);
    },
  }),
);
