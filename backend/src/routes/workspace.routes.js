const express = require('express');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  addMember,
  removeMember
} = require('../controllers/workspace.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { allowRoles, checkWorkspaceAccess, checkWorkspaceOwner } = require('../middlewares/rbac.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

router.post('/', allowRoles('ADMIN'), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:workspaceId', checkWorkspaceAccess, getWorkspaceById);
router.delete('/:workspaceId', allowRoles('ADMIN'), checkWorkspaceOwner, deleteWorkspace);

const ticketRoutes = require('./ticket.routes');

// Member management
router.post('/:workspaceId/members', allowRoles('ADMIN'), addMember);
router.delete('/:workspaceId/members/:userId', allowRoles('ADMIN'), removeMember);

// Tickets (Nested router)
router.use('/:workspaceId/tickets', ticketRoutes);

module.exports = router;
