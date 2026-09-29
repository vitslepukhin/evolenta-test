import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { createApiError } from '../../../core/api/api-error';
import { TicketsApiService } from '../api/tickets-api.service';
import { emptyTicketFilters, TicketFilters } from '../models/ticket-filters.model';
import { TicketSummary } from '../models/ticket.model';
import { TicketsUrlSync } from './tickets-url-sync.service';
import { TicketsStore } from './tickets.store';

describe('TicketsStore', () => {
  const ticket: TicketSummary = {
    id: '1',
    subject: 'Cannot login',
    requester: 'Jane Doe',
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  function setup(apiOverrides: Partial<Record<keyof TicketsApiService, unknown>> = {}) {
    const filters = signal<TicketFilters>(emptyTicketFilters());
    const api = {
      getTickets: vi.fn(() => of([ticket])),
      getTicket: vi.fn(() => of({ ...ticket, messages: [] })),
      updateStatus: vi.fn(() => of({ ...ticket, status: 'resolved' as const })),
      sendReply: vi.fn(),
      ...apiOverrides,
    } as {
      getTickets: ReturnType<typeof vi.fn>;
      getTicket: ReturnType<typeof vi.fn>;
      updateStatus: ReturnType<typeof vi.fn>;
      sendReply: ReturnType<typeof vi.fn>;
    };

    TestBed.configureTestingModule({
      providers: [
        TicketsStore,
        { provide: TicketsApiService, useValue: api },
        { provide: TicketsUrlSync, useValue: { filters, setFilters: vi.fn() } },
      ],
    });

    const store = TestBed.inject(TicketsStore);
    TestBed.flushEffects();
    api.getTickets.mockClear();
    return { store, api, filters };
  }

  it('reloads the list when URL filters change', () => {
    const { api, filters } = setup();

    filters.set({ query: 'login', status: null });
    TestBed.flushEffects();

    expect(api.getTickets).toHaveBeenCalledWith({ query: 'login', status: null });
  });

  it('loadList sets entities and listStatus on success', () => {
    const { store, api } = setup();

    store.loadList({ query: '', status: null });

    expect(api.getTickets).toHaveBeenCalledWith({ query: '', status: null });
    expect(store.entities()).toEqual([ticket]);
    expect(store.listStatus()).toBe('success');
    expect(store.listError()).toBeNull();
  });

  it('loadList keeps the ApiError message on failure', () => {
    const { store } = setup({
      getTickets: vi.fn(() => throwError(() => createApiError('http', 'boom', { status: 500 }))),
    });

    store.loadList({ query: '', status: null });

    expect(store.listStatus()).toBe('error');
    expect(store.listError()).toBe('boom');
  });

  it('patchTicket updates an existing row and ignores a missing one', () => {
    const { store } = setup();
    store.loadList({ query: '', status: null });

    store.patchTicket('1', { updatedAt: '2026-01-02T00:00:00.000Z' });
    store.patchTicket('missing', { updatedAt: '2026-01-02T00:00:00.000Z' });

    expect(store.entityMap()['1'].updatedAt).toBe('2026-01-02T00:00:00.000Z');
    expect(store.entityMap()['missing']).toBeUndefined();
  });
});
