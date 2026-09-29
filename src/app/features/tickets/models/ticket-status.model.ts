import { z } from 'zod';
import type { StatusBadgeType } from '../../../shared/components/status-badge/status-badge.component';

export const TICKET_STATUSES = ['new', 'open', 'pending', 'resolved'] as const;

export const ticketStatusSchema = z.enum(TICKET_STATUSES);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'Новое',
  open: 'В работе',
  pending: 'Ожидание',
  resolved: 'Решено',
};

export const TICKET_STATUS_TYPES: Record<TicketStatus, StatusBadgeType> = {
  new: 'info',
  open: 'progress',
  pending: 'waiting',
  resolved: 'success',
};
