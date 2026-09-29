import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TicketDetail, TicketSummary } from '../models/ticket.model';
import { TicketsApiService } from './tickets-api.service';

describe('TicketsApiService', () => {
  let service: TicketsApiService;
  let httpMock: HttpTestingController;

  const validTicket: TicketSummary = {
    id: '1',
    subject: 'Cannot login',
    requester: 'Jane Doe',
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TicketsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTickets sends query and status as HTTP params and validates the list response', async () => {
    const request = firstValueFrom(
      service.getTickets({ query: 'login', status: 'open' }),
    );

    const testRequest = httpMock.expectOne(
      (req) =>
        req.url === 'https://evo-academy.wckz.dev/api/senior-1/tickets' &&
        req.params.get('query') === 'login' &&
        req.params.get('status') === 'open',
    );
    testRequest.flush([validTicket]);

    await expect(request).resolves.toEqual([validTicket]);
  });

  it('getTickets omits empty query/status params', async () => {
    const request = firstValueFrom(service.getTickets({ query: '', status: null }));

    const testRequest = httpMock.expectOne(
      (req) => req.url === 'https://evo-academy.wckz.dev/api/senior-1/tickets',
    );
    expect(testRequest.request.params.has('query')).toBe(false);
    expect(testRequest.request.params.has('status')).toBe(false);
    testRequest.flush([]);

    await request;
  });

  it('getTicket validates and returns a ticket with messages', async () => {
    const ticketWithMessages: TicketDetail = {
      ...validTicket,
      messages: [
        {
          id: 'm1',
          ticketId: '1',
          author: 'Jane Doe',
          role: 'customer',
          text: 'Help please',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };

    const request = firstValueFrom(service.getTicket('1'));

    httpMock
      .expectOne('https://evo-academy.wckz.dev/api/senior-1/tickets/1')
      .flush(ticketWithMessages);

    await expect(request).resolves.toEqual(ticketWithMessages);
  });

  it('getTicket rejects a list payload that has no messages', async () => {
    const request = firstValueFrom(service.getTicket('1'));

    httpMock.expectOne('https://evo-academy.wckz.dev/api/senior-1/tickets/1').flush(validTicket);

    await expect(request).rejects.toMatchObject({ kind: 'validation' });
  });

  it('getTicket rejects with a validation ApiError when the response shape is invalid', async () => {
    const request = firstValueFrom(service.getTicket('1'));

    httpMock
      .expectOne('https://evo-academy.wckz.dev/api/senior-1/tickets/1')
      .flush({ id: '1' });

    await expect(request).rejects.toMatchObject({ kind: 'validation' });
  });

  it('updateStatus sends a PATCH with the new status and validates the returned ticket', async () => {
    const updated: TicketSummary = { ...validTicket, status: 'resolved' };
    const request = firstValueFrom(service.updateStatus('1', 'resolved'));

    const testRequest = httpMock.expectOne(
      'https://evo-academy.wckz.dev/api/senior-1/tickets/1/status',
    );
    expect(testRequest.request.method).toBe('PATCH');
    expect(testRequest.request.body).toEqual({ status: 'resolved' });
    testRequest.flush(updated);

    await expect(request).resolves.toEqual(updated);
  });

  it('sendReply sends a POST with trimmed text and validates the created message', async () => {
    const message = {
      id: 'm2',
      ticketId: '1',
      author: 'Agent Smith',
      role: 'agent' as const,
      text: 'We are looking into it',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    const request = firstValueFrom(service.sendReply('1', message.text));

    const testRequest = httpMock.expectOne(
      'https://evo-academy.wckz.dev/api/senior-1/tickets/1/replies',
    );
    expect(testRequest.request.method).toBe('POST');
    expect(testRequest.request.body).toEqual({ text: message.text });
    testRequest.flush(message);

    await expect(request).resolves.toEqual(message);
  });
});
