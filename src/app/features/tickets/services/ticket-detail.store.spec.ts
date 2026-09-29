import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { createApiError } from '../../../core/api/api-error';
import { TicketsApiService } from '../api/tickets-api.service';
import { MessageEntity } from '../models/message.model';
import { emptyTicketFilters, TicketFilters } from '../models/ticket-filters.model';
import { TicketDetail, TicketSummary } from '../models/ticket.model';
import { TicketDetailStore } from './ticket-detail.store';
import { TicketsUrlSync } from './tickets-url-sync.service';
import { TicketsStore } from './tickets.store';

describe('TicketDetailStore', () => {
  const ticket: TicketSummary = {
    id: '1',
    subject: 'Cannot login',
    requester: 'Jane Doe',
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const detail: TicketDetail = { ...ticket, messages: [] };

  function setup(apiOverrides: Partial<Record<keyof TicketsApiService, unknown>> = {}) {
    const filters = signal<TicketFilters>(emptyTicketFilters());
    const api = {
      getTickets: vi.fn(() => of([ticket])),
      getTicket: vi.fn(() => of(detail)),
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
        TicketDetailStore,
        TicketsStore,
        { provide: TicketsApiService, useValue: api },
        { provide: TicketsUrlSync, useValue: { filters, setFilters: vi.fn() } },
      ],
    });

    const store = TestBed.inject(TicketDetailStore);
    const ticketsStore = TestBed.inject(TicketsStore);
    TestBed.flushEffects();
    api.getTickets.mockClear();
    return { store, ticketsStore, api };
  }

  it('load stores the opened ticket', () => {
    const { store, api } = setup();

    store.load('1');

    expect(api.getTicket).toHaveBeenCalledWith('1');
    expect(store.ticket()).toEqual(detail);
    expect(store.detailStatus()).toBe('success');
  });

  it('load reports a missing ticket as not found', () => {
    const { store } = setup({
      getTicket: vi.fn(() =>
        throwError(() => createApiError('http', 'Ticket not found', { status: 404 })),
      ),
    });

    store.load('1');

    expect(store.detailStatus()).toBe('error');
    expect(store.detailError()).toBe('Обращение не найдено');
    expect(store.ticket()).toBeNull();
  });

  it('sendReply appends the message and refreshes the list row timestamp', async () => {
    const message: MessageEntity = {
      id: 'm1',
      ticketId: '1',
      author: 'Agent',
      role: 'agent',
      text: 'On it',
      createdAt: '2026-01-01T00:05:00.000Z',
    };
    const { store, ticketsStore } = setup({ sendReply: vi.fn(() => of(message)) });
    ticketsStore.loadList({ query: '', status: null });
    store.load('1');

    await expect(store.sendReply('1', 'On it')).resolves.toBe(true);

    expect(store.ticket()?.messages).toEqual([message]);
    expect(ticketsStore.entityMap()['1'].updatedAt).toBe(message.createdAt);
    expect(store.replyPending()).toBe(false);
    expect(store.replyError()).toBeNull();
  });

  it('sendReply keeps the ticket unchanged and records the ApiError message', async () => {
    const { store } = setup({
      sendReply: vi.fn(() => throwError(() => createApiError('http', 'boom', { status: 500 }))),
    });
    store.load('1');

    await expect(store.sendReply('1', 'please help')).resolves.toBe(false);

    expect(store.ticket()?.messages).toEqual([]);
    expect(store.replyPending()).toBe(false);
    expect(store.replyError()).toBe('boom');
  });
});
