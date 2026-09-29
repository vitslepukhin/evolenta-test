import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { createApiError } from '../../../core/api/api-error';
import { TicketsApiService } from '../api/tickets-api.service';
import { emptyTicketFilters } from '../models/ticket-filters.model';
import { TicketSummary } from '../models/ticket.model';
import { TicketStatusStore } from './ticket-status.store';
import { TicketsStore } from './tickets.store';
import { TicketsUrlSync } from './tickets-url-sync.service';

describe('TicketStatusStore', () => {
  const ticket: TicketSummary = {
    id: '1',
    subject: 'Cannot login',
    requester: 'Jane Doe',
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  function setup(apiOverrides: Partial<Record<keyof TicketsApiService, unknown>> = {}) {
    const api = {
      getTickets: vi.fn(() => of([ticket])),
      getTicket: vi.fn(),
      updateStatus: vi.fn(() => of({ ...ticket, status: 'resolved' as const })),
      sendReply: vi.fn(),
      ...apiOverrides,
    };

    TestBed.configureTestingModule({
      providers: [
        TicketStatusStore,
        TicketsStore,
        { provide: TicketsApiService, useValue: api },
        {
          provide: TicketsUrlSync,
          useValue: { filters: signal(emptyTicketFilters()), setFilters: vi.fn() },
        },
      ],
    });

    const store = TestBed.inject(TicketStatusStore);
    const ticketsStore = TestBed.inject(TicketsStore);
    TestBed.flushEffects();
    return { store, ticketsStore, api };
  }

  it('reports updating until the request settles and patches the list row', async () => {
    const response = new Subject<TicketSummary>();
    const { store, ticketsStore, api } = setup({
      updateStatus: vi.fn(() => response.asObservable()),
    });

    const pending = store.changeStatus('1', 'resolved');

    expect(api.updateStatus).toHaveBeenCalledWith('1', 'resolved');
    expect(store.isUpdating('1')).toBe(true);

    response.next({ ...ticket, status: 'resolved' });
    response.complete();
    await pending;

    expect(ticketsStore.entityMap()['1']?.status).toBe('resolved');
    expect(store.isUpdating('1')).toBe(false);
    expect(store.error('1')).toBeNull();
  });

  it('keeps another ticket updating when the first request settles', async () => {
    const firstResponse = new Subject<TicketSummary>();
    const secondResponse = new Subject<TicketSummary>();
    const { store } = setup({
      updateStatus: vi
        .fn()
        .mockReturnValueOnce(firstResponse.asObservable())
        .mockReturnValueOnce(secondResponse.asObservable()),
    });

    const first = store.changeStatus('1', 'resolved');
    const second = store.changeStatus('2', 'pending');

    expect(store.isUpdating('1')).toBe(true);
    expect(store.isUpdating('2')).toBe(true);

    firstResponse.next({ ...ticket, status: 'resolved' });
    firstResponse.complete();
    await first;

    expect(store.isUpdating('1')).toBe(false);
    expect(store.isUpdating('2')).toBe(true);

    secondResponse.next({ ...ticket, id: '2', status: 'pending' });
    secondResponse.complete();
    await second;

    expect(store.isUpdating('2')).toBe(false);
  });

  it('records an ApiError message when the request fails', async () => {
    const { store, ticketsStore } = setup({
      updateStatus: vi.fn(() => throwError(() => createApiError('http', 'nope', { status: 500 }))),
    });

    await store.changeStatus('1', 'resolved');
    expect(store.error('1')).toBe('nope');
    expect(ticketsStore.entityMap()['1']?.status).toBe('open');
    expect(store.isUpdating('1')).toBe(false);
  });
});
