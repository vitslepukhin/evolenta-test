import { z } from 'zod';
import { messageSchema } from './message.model';
import { ticketStatusSchema } from './ticket-status.model';

const ticketBaseSchema = z.object({
  id: z.string(),
  subject: z.string(),
  requester: z.string(),
  status: ticketStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** List row and status-update payload. Messages belong to the detail response. */
export const ticketSummarySchema = ticketBaseSchema;
export type TicketSummary = z.infer<typeof ticketSummarySchema>;

export const ticketDetailSchema = ticketBaseSchema.extend({
  messages: z.array(messageSchema),
});
export type TicketDetail = z.infer<typeof ticketDetailSchema>;

export const ticketListSchema = z.array(ticketSummarySchema);
