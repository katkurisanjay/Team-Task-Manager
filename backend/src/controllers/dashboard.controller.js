const prisma = require('../config/db');
const { sendResponse } = require('../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all workspaces the user is part of
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { user_id: userId }
        }
      },
      include: {
        _count: {
          select: { tickets: true }
        },
        tickets: {
          select: { status: true }
        }
      }
    });

    // Calculate progress for each workspace
    const workspaceProgress = workspaces.map(ws => {
      const totalTickets = ws._count.tickets;
      const doneTickets = ws.tickets.filter(t => t.status === 'DONE').length;
      return {
        id: ws.id,
        name: ws.name,
        totalTickets,
        doneTickets,
        progressPercentage: totalTickets === 0 ? 0 : Math.round((doneTickets / totalTickets) * 100)
      };
    });

    // Get tickets assigned to the user across all workspaces
    const myTickets = await prisma.ticket.findMany({
      where: { assignee_id: userId },
      include: {
        workspace: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    const now = new Date();
    const myTicketsWithOverdue = myTickets.map(ticket => ({
      ...ticket,
      is_overdue: ticket.due_date && ticket.status !== 'DONE' && new Date(ticket.due_date) < now
    }));

    // Aggregate my tickets stats
    const ticketStats = {
      TODO: myTicketsWithOverdue.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: myTicketsWithOverdue.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: myTicketsWithOverdue.filter(t => t.status === 'DONE').length,
      OVERDUE: myTicketsWithOverdue.filter(t => t.is_overdue).length,
    };

    return sendResponse(res, 200, true, {
      workspaceProgress,
      myTickets: myTicketsWithOverdue,
      ticketStats
    }, "Dashboard data fetched.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
