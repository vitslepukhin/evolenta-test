import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { parseOrThrow } from '../../../shared/validation/zod-parse.util';
import { TicketFilters } from '../models/ticket-filters.model';
import { TicketStatus } from '../models/ticket-status.model';
import { MessageEntity, messageSchema } from '../models/message.model';
import {
  TicketDetail,
  TicketSummary,
  ticketDetailSchema,
  ticketListSchema,
  ticketSummarySchema,
} from '../models/ticket.model';

const API_BASE_URL = 'https://evo-academy.wckz.dev/api/senior-1';

@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private readonly http = inject(HttpClient);

  getTickets(filters: TicketFilters): Observable<TicketSummary[]> {
    let params = new HttpParams();
    if (filters.query.trim()) {
      params = params.set('query', filters.query.trim());
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http
      .get<unknown>(`${API_BASE_URL}/tickets`, { params })
      .pipe(map((response) => parseOrThrow(ticketListSchema, response)));
  }

  getTicket(id: string): Observable<TicketDetail> {
    return this.http
      .get<unknown>(`${API_BASE_URL}/tickets/${id}`)
      .pipe(map((response) => parseOrThrow(ticketDetailSchema, response)));
  }

  updateStatus(id: string, status: TicketStatus): Observable<TicketSummary> {
    return this.http
      .patch<unknown>(`${API_BASE_URL}/tickets/${id}/status`, { status })
      .pipe(map((response) => parseOrThrow(ticketSummarySchema, response)));
  }

  sendReply(id: string, text: string): Observable<MessageEntity> {
    return this.http
      .post<unknown>(`${API_BASE_URL}/tickets/${id}/replies`, { text })
      .pipe(map((response) => parseOrThrow(messageSchema, response)));
  }
}
