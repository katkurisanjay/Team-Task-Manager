const { z } = require('zod');

const createTicketSchema = z.object({
  title: z.string().min(1, "Ticket title is required"),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  due_date: z.string().datetime().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
});

const updateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  due_date: z.string().datetime().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
});

module.exports = { createTicketSchema, updateTicketSchema };
