import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TicketsApiService } from '../../api/tickets-api.service';
import { emptyTicketFilters } from '../../models/ticket-filters.model';
import { TicketSummary } from '../../models/ticket.model';
import { TicketStatusStore } from '../../services/ticket-status.store';
import { TicketsStore } from '../../services/tickets.store';
import { TicketsUrlSync } from '../../services/tickets-url-sync.service';
import { TicketListComponent } from './ticket-list.component';

describe('TicketListComponent', () => {
  const tickets: TicketSummary[] = [
    {
      id: '1',
      subject: 'Cannot login',
      requester: 'Jane Doe',
      status: 'open',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      subject: 'Billing question',
      requester: 'John Roe',
      status: 'new',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  function createFixture() {
    TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        TicketsStore,
        TicketStatusStore,
        {
          provide: TicketsApiService,
          useValue: {
            getTickets: () => of([]),
            getTicket: () => of(null),
            updateStatus: () => of(null),
            sendReply: () => of(null),
          },
        },
        {
          provide: TicketsUrlSync,
          useValue: { filters: signal(emptyTicketFilters()), setFilters: () => undefined },
        },
      ],
    });
    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.componentRef.setInput('tickets', tickets);
    return fixture;
  }

  it('renders one row per ticket and exposes listbox role', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.getAttribute('role')).toBe('listbox');
    expect(fixture.nativeElement.querySelectorAll('[role="option"]').length).toBe(2);
  });

  it('marks the row matching selectedId', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('selectedId', '2');
    await fixture.whenStable();

    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
  });

  it('re-emits the selected ticket id from the child item', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    let selectedId: string | null = null;
    fixture.componentInstance.ticketSelect.subscribe((id) => (selectedId = id));

    fixture.nativeElement.querySelectorAll('[role="option"]')[1].click();
    await fixture.whenStable();

    expect(selectedId).toBe('2');
  });
});
