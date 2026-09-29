import { TicketStatus, ticketStatusSchema } from './ticket-status.model';

export const MAX_SEARCH_QUERY_LENGTH = 200;

export interface TicketFilters {
  readonly query: string;
  readonly status: TicketStatus | null;
}

export function emptyTicketFilters(): TicketFilters {
  return { query: '', status: null };
}

export function sameTicketFilters(a: TicketFilters, b: TicketFilters): boolean {
  return a.query === b.query && a.status === b.status;
}

export function ticketFiltersFromParams(params: {
  get(name: string): string | null;
}): TicketFilters {
  const status = ticketStatusSchema.safeParse(params.get('status'));
  return {
    query: (params.get('q') ?? '').slice(0, MAX_SEARCH_QUERY_LENGTH),
    status: status.success ? status.data : null,
  };
}
