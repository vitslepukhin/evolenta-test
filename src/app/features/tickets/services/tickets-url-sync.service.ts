import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import {
  MAX_SEARCH_QUERY_LENGTH,
  TicketFilters,
  emptyTicketFilters,
  sameTicketFilters,
  ticketFiltersFromParams,
} from '../models/ticket-filters.model';

@Injectable()
export class TicketsUrlSync {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly filters = toSignal(
    this.activatedRoute.queryParamMap.pipe(
      map((params) => ticketFiltersFromParams(params)),
      distinctUntilChanged(sameTicketFilters),
    ),
    { initialValue: emptyTicketFilters() },
  );

  setFilters(patch: Partial<TicketFilters>): void {
    const current = this.filters();
    const next: TicketFilters = {
      query: (patch.query ?? current.query).slice(0, MAX_SEARCH_QUERY_LENGTH),
      status: patch.status === undefined ? current.status : patch.status,
    };
    if (sameTicketFilters(current, next)) return;
    this.navigate({ q: next.query || null, status: next.status });
  }

  private navigate(queryParams: Params): void {
    void this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
    });
  }
}
