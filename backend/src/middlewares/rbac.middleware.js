const { sendResponse } = require('../utils/response');
const prisma = require('../config/db');

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, false, null, "You don’t have permission to do this.");
    }
    next();
  };
};

const checkWorkspaceAccess = async (req, res, next) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId,
        }
      }
    });

    if (!isMember && req.user.role !== 'ADMIN') { // wait, admin should probably be member too, or can access all? "Access = membership check". I'll strictly enforce membership even for admins unless it's their own workspace.
      // actually, let's just check membership.
      if (!isMember) {
        return sendResponse(res, 403, false, null, "You don't have access to this workspace.");
      }
    }

    if (!isMember) {
      return sendResponse(res, 403, false, null, "You don't have access to this workspace.");
    }

    next();
  } catch (error) {
    next(error);
  }
};

const checkWorkspaceOwner = async (req, res, next) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return sendResponse(res, 404, false, null, "Workspace not found.");
    }

    if (workspace.owner_id !== userId) {
      return sendResponse(res, 403, false, null, "Only the workspace owner can do this.");
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { allowRoles, checkWorkspaceAccess, checkWorkspaceOwner };
