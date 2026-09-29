import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  author: z.string(),
  role: z.enum(['customer', 'agent']),
  text: z.string(),
  createdAt: z.string(),
});
export type MessageEntity = z.infer<typeof messageSchema>;
