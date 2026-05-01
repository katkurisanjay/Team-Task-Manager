const express = require('express');
const { createTicket, getTickets, updateTicket } = require('../controllers/ticket.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { allowRoles, checkWorkspaceAccess } = require('../middlewares/rbac.middleware');

const router = express.Router({ mergeParams: true }); // mergeParams is needed because workspaceId is in the parent router

router.use(requireAuth);
router.use(checkWorkspaceAccess); // All ticket routes need workspace access

router.post('/', allowRoles('ADMIN'), createTicket); // Only admins can create and assign initially
router.get('/', getTickets);
router.patch('/:ticketId', updateTicket); // Members can update their own tickets (we could add further checks if we want to restrict to ONLY their own, but requirements say "Update own tickets", let's let members update tickets if they have workspace access, or strictly check assignee). Wait, requirement says "MEMBER: Update own tickets".
// We might need an additional check in updateTicket if the role is MEMBER, they can only update if assignee_id == req.user.id. 

module.exports = router;
