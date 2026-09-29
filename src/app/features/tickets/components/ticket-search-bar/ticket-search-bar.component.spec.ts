import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TicketsStore } from '../../services/tickets.store';
import { TicketsUrlSync } from '../../services/tickets-url-sync.service';
import { TicketSearchBarComponent } from './ticket-search-bar.component';

describe('TicketSearchBarComponent', () => {
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}));
    navigate = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      imports: [TicketSearchBarComponent],
      providers: [
        TicketsUrlSync,
        TicketsStore,
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamMap$ } },
        { provide: Router, useValue: { navigate } },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes the debounced, trimmed query to the URL', async () => {
    const fixture = TestBed.createComponent(TicketSearchBarComponent);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '  login  ';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    await vi.advanceTimersByTimeAsync(300);
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { q: 'login', status: null },
      queryParamsHandling: 'merge',
      relativeTo: expect.anything(),
    });
  });

  it('writes the selected status, or null for "all statuses"', async () => {
    const fixture = TestBed.createComponent(TicketSearchBarComponent);
    await fixture.whenStable();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = 'open';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { q: null, status: 'open' },
      queryParamsHandling: 'merge',
      relativeTo: expect.anything(),
    });

    queryParamMap$.next(convertToParamMap({ status: 'open' }));
    await fixture.whenStable();

    select.value = '';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(navigate).toHaveBeenLastCalledWith([], {
      queryParams: { q: null, status: null },
      queryParamsHandling: 'merge',
      relativeTo: expect.anything(),
    });
  });

  it('pre-fills the input and select from the URL', async () => {
    queryParamMap$.next(convertToParamMap({ q: 'billing', status: 'pending' }));
    const fixture = TestBed.createComponent(TicketSearchBarComponent);
    await vi.advanceTimersByTimeAsync(0);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(input.value).toBe('billing');
    expect(select.value).toBe('pending');
  });

  it('caps the search field at the query length limit', async () => {
    const fixture = TestBed.createComponent(TicketSearchBarComponent);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.maxLength).toBe(200);
  });
});
