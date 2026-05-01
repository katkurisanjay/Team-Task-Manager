const prisma = require('../config/db');
const { sendResponse } = require('../utils/response');
const { createTicketSchema, updateTicketSchema } = require('../schemas/ticket.schema');

const createTicket = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const validatedData = createTicketSchema.parse(req.body);

    if (validatedData.assignee_id) {
      const isMember = await prisma.workspaceMember.findUnique({
        where: {
          workspace_id_user_id: {
            workspace_id: workspaceId,
            user_id: validatedData.assignee_id
          }
        }
      });
      if (!isMember) {
        return sendResponse(res, 400, false, null, "Assignee must be a member of this workspace.");
      }
    }

    const newTicket = await prisma.ticket.create({
      data: {
        ...validatedData,
        workspace_id: workspaceId,
        created_by: req.user.id
      },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    return sendResponse(res, 201, true, newTicket, "Ticket created!");
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const tickets = await prisma.ticket.findMany({
      where: { workspace_id: workspaceId },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const now = new Date();
    const ticketsWithOverdue = tickets.map(ticket => ({
      ...ticket,
      is_overdue: ticket.due_date && ticket.status !== 'DONE' && new Date(ticket.due_date) < now
    }));

    return sendResponse(res, 200, true, ticketsWithOverdue, "Tickets fetched.");
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { workspaceId, ticketId } = req.params;
    const validatedData = updateTicketSchema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket || ticket.workspace_id !== workspaceId) {
      return sendResponse(res, 404, false, null, "Ticket not found in this workspace.");
    }

    if (req.user.role !== 'ADMIN' && ticket.assignee_id !== req.user.id) {
      return sendResponse(res, 403, false, null, "You can only update tickets assigned to you.");
    }

    if (validatedData.assignee_id && req.user.role !== 'ADMIN') {
        // Members shouldn't be able to reassign tickets to someone else, or maybe they can?
        // Let's restrict reassignment to ADMINs for simplicity, or just let it pass if we don't care.
        // Actually, requirements say "ADMIN: Assign tickets". So Members can't reassign.
        if (validatedData.assignee_id !== ticket.assignee_id) {
            return sendResponse(res, 403, false, null, "Only admins can reassign tickets.");
        }
    }

    if (validatedData.assignee_id && req.user.role === 'ADMIN') {
      const isMember = await prisma.workspaceMember.findUnique({
        where: {
          workspace_id_user_id: {
            workspace_id: workspaceId,
            user_id: validatedData.assignee_id
          }
        }
      });
      if (!isMember) {
        return sendResponse(res, 400, false, null, "Assignee must be a member of this workspace.");
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: validatedData,
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    return sendResponse(res, 200, true, updatedTicket, "Ticket updated!");
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, getTickets, updateTicket };
