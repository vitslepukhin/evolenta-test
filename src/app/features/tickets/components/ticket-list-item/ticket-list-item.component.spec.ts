import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TicketsApiService } from '../../api/tickets-api.service';
import { emptyTicketFilters } from '../../models/ticket-filters.model';
import { TicketSummary } from '../../models/ticket.model';
import { TicketStatusStore } from '../../services/ticket-status.store';
import { TicketsStore } from '../../services/tickets.store';
import { TicketsUrlSync } from '../../services/tickets-url-sync.service';
import { TicketListItemComponent } from './ticket-list-item.component';

describe('TicketListItemComponent', () => {
  const ticket: TicketSummary = {
    id: '1',
    subject: 'Cannot login',
    requester: 'Jane Doe',
    status: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  function createFixture() {
    TestBed.configureTestingModule({
      imports: [TicketListItemComponent],
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
    const fixture = TestBed.createComponent(TicketListItemComponent);
    fixture.componentRef.setInput('ticket', ticket);
    return fixture;
  }

  it('renders the subject and requester', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cannot login');
    expect(el.textContent).toContain('Jane Doe');
  });

  it('exposes role="option" on the host for roving tabindex/listbox semantics', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.getAttribute('role')).toBe('option');
  });

  it('emits select with the ticket id on click', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    let selectedId: string | null = null;
    fixture.componentInstance.select.subscribe((id) => (selectedId = id));

    (fixture.nativeElement as HTMLElement).click();
    await fixture.whenStable();

    expect(selectedId).toBe('1');
  });

  it('reflects the selected input via aria-selected and a modifier class', async () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('selected', true);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('aria-selected')).toBe('true');
    expect(el.classList.contains('selected')).toBe(true);
  });
});
