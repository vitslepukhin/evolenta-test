import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MAX_SEARCH_QUERY_LENGTH } from '../models/ticket-filters.model';
import { TicketsUrlSync } from './tickets-url-sync.service';

describe('TicketsUrlSync', () => {
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let navigate: ReturnType<typeof vi.fn>;
  let service: TicketsUrlSync;

  function setup(initial: Record<string, string> = {}) {
    queryParamMap$ = new BehaviorSubject(convertToParamMap(initial));
    navigate = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        TicketsUrlSync,
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMap$ },
        },
        { provide: Router, useValue: { navigate } },
      ],
    });

    service = TestBed.inject(TicketsUrlSync);
  }

  it('reads q and a known status from query params', () => {
    setup({ q: 'login', status: 'open' });

    expect(service.filters()).toEqual({ query: 'login', status: 'open' });
  });

  it('defaults to an empty query and null status when params are absent or invalid', () => {
    setup({ status: 'nope' });

    expect(service.filters()).toEqual({ query: '', status: null });
  });

  it('reflects updates to the underlying query param map', () => {
    setup({ q: 'a' });

    queryParamMap$.next(convertToParamMap({ q: 'b', status: 'pending' }));

    expect(service.filters()).toEqual({ query: 'b', status: 'pending' });
  });

  it('setFilters navigates with the merged filters when the value changed', () => {
    setup({ q: 'a', status: 'open' });

    service.setFilters({ query: 'b' });

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { q: 'b', status: 'open' },
      queryParamsHandling: 'merge',
      relativeTo: expect.anything(),
    });
  });

  it('truncates q on read and on write so the URL stays bounded', () => {
    const long = 'я'.repeat(MAX_SEARCH_QUERY_LENGTH + 50);
    setup({ q: long });

    expect(service.filters().query).toBe('я'.repeat(MAX_SEARCH_QUERY_LENGTH));

    service.setFilters({ query: long });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('writes a truncated query when the current URL is shorter', () => {
    const long = 'я'.repeat(MAX_SEARCH_QUERY_LENGTH + 50);
    setup();

    service.setFilters({ query: long });

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { q: 'я'.repeat(MAX_SEARCH_QUERY_LENGTH), status: null },
      queryParamsHandling: 'merge',
      relativeTo: expect.anything(),
    });
  });

  it('setFilters does nothing when the value did not change', () => {
    setup({ q: 'a', status: 'open' });

    service.setFilters({ query: 'a', status: 'open' });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('setFilters navigates with null status to clear the filter', () => {
    setup({ status: 'open' });

    service.setFilters({ status: null });

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { q: null, status: null },
      queryParamsHandling: 'merge',
      relativeTo: expect.anything(),
    });
  });
});
