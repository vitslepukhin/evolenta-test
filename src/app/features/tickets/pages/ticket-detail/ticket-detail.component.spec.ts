import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { createApiError } from '../../../../core/api/api-error';
import { TicketsApiService } from '../../api/tickets-api.service';
import { emptyTicketFilters } from '../../models/ticket-filters.model';
import { MessageEntity } from '../../models/message.model';
import { TicketDetail } from '../../models/ticket.model';
import { TicketDetailStore } from '../../services/ticket-detail.store';
import { TicketStatusStore } from '../../services/ticket-status.store';
import { TicketsStore } from '../../services/tickets.store';
import { TicketsUrlSync } from '../../services/tickets-url-sync.service';
import { TicketDetailComponent } from './ticket-detail.component';

describe('TicketDetailComponent', () => {
  const baseTicket: TicketDetail = {
    id: 't1',
    subject: 'Cannot login',
    requester: 'Jane Doe',
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    messages: [],
  };

  function setup(apiOverrides: Partial<Record<keyof TicketsApiService, unknown>> = {}) {
    const api = {
      getTickets: vi.fn(() => of([])),
      getTicket: vi.fn(() => of(baseTicket)),
      updateStatus: vi.fn(() => of({ ...baseTicket, status: 'resolved' as const })),
      sendReply: vi.fn(),
      ...apiOverrides,
    };

    TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
      providers: [
        TicketDetailStore,
        TicketsStore,
        TicketStatusStore,
        { provide: TicketsApiService, useValue: api },
        {
          provide: TicketsUrlSync,
          useValue: { filters: signal(emptyTicketFilters()), setFilters: vi.fn() },
        },
      ],
    });
    const fixture = TestBed.createComponent(TicketDetailComponent);
    fixture.componentRef.setInput('ticketId', 't1');
    return { fixture, api };
  }

  it('shows a loading indicator while the ticket is loading', async () => {
    const pending$ = new Subject<TicketDetail>();
    const { fixture } = setup({ getTicket: vi.fn(() => pending$) });
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).not.toBeNull();
    expect(el.textContent).not.toContain(baseTicket.subject);
  });

  it('renders the ticket once loaded', async () => {
    const { fixture, api } = setup();
    await fixture.whenStable();

    expect(api.getTicket).toHaveBeenCalledWith('t1');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cannot login');
    expect(el.textContent).toContain('Jane Doe');
  });

  it('shows not found only when the ticket request returns 404', async () => {
    const { fixture } = setup({
      getTicket: vi.fn(() =>
        throwError(() => createApiError('http', 'Ticket not found', { status: 404 })),
      ),
    });
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Обращение не найдено');
  });

  it('shows the network message instead of not found when the server is unreachable', async () => {
    const { fixture } = setup({
      getTicket: vi.fn(() =>
        throwError(() =>
          createApiError('network', 'Не удалось соединиться с сервером', { status: 0 }),
        ),
      ),
    });
    await fixture.whenStable();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Не удалось соединиться с сервером');
    expect(alert?.textContent).not.toContain('не найдено');
  });

  it('shows the server message instead of not found on a 500', async () => {
    const { fixture } = setup({
      getTicket: vi.fn(() =>
        throwError(() => createApiError('http', 'Внутренняя ошибка сервера', { status: 500 })),
      ),
    });
    await fixture.whenStable();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Внутренняя ошибка сервера');
    expect(alert?.textContent).not.toContain('не найдено');
  });

  it('shows the validation message instead of not found when the payload is invalid', async () => {
    const { fixture } = setup({
      getTicket: vi.fn(() =>
        throwError(() =>
          createApiError('validation', 'Некорректный формат ответа сервера: subject'),
        ),
      ),
    });
    await fixture.whenStable();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Некорректный формат ответа сервера: subject');
    expect(alert?.textContent).not.toContain('не найдено');
  });

  it('sends a reply, appends it to the message list, and clears the draft', async () => {
    const message: MessageEntity = {
      id: 'm1',
      ticketId: 't1',
      author: 'Agent',
      role: 'agent',
      text: 'On it',
      createdAt: '2026-01-01T00:05:00.000Z',
    };
    const { fixture } = setup({ sendReply: vi.fn(() => of(message)) });
    await fixture.whenStable();

    fixture.componentInstance['replyDraft'].set('On it');
    void fixture.componentInstance['onReplySubmit']('On it');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('On it');
    expect(fixture.componentInstance['replyDraft']()).toBe('');
  });

  it('keeps the draft text and shows an error when sending a reply fails', async () => {
    const { fixture } = setup({ sendReply: vi.fn(() => throwError(() => new Error('boom'))) });
    await fixture.whenStable();

    fixture.componentInstance['replyDraft'].set('please help');
    void fixture.componentInstance['onReplySubmit']('please help');
    await fixture.whenStable();

    expect(fixture.componentInstance['replyDraft']()).toBe('please help');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.reply-error')).not.toBeNull();
  });

  it('changes the status from the status control', async () => {
    const { fixture, api } = setup({
      getTickets: vi.fn(() => of([baseTicket])),
    });
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select');
    expect(select).not.toBeNull();
    select!.value = 'resolved';
    select!.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(api.updateStatus).toHaveBeenCalledWith('t1', 'resolved');
    expect(el.textContent).toContain('Решено');
  });
});
