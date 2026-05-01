const prisma = require('../config/db');
const { sendResponse } = require('../utils/response');
const { createWorkspaceSchema, addMemberSchema } = require('../schemas/workspace.schema');

const createWorkspace = async (req, res, next) => {
  try {
    const validatedData = createWorkspaceSchema.parse(req.body);

    const newWorkspace = await prisma.workspace.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        owner_id: req.user.id,
        members: {
          create: {
            user_id: req.user.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        }
      }
    });

    return sendResponse(res, 201, true, newWorkspace, "Workspace created successfully!");
  } catch (error) {
    next(error);
  }
};

const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            user_id: req.user.id
          }
        }
      },
      include: {
        owner: {
          select: { id: true, name: true }
        },
        _count: {
          select: { members: true, tickets: true }
        }
      }
    });

    return sendResponse(res, 200, true, workspaces, "Workspaces fetched successfully.");
  } catch (error) {
    next(error);
  }
};

const getWorkspaceById = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        tickets: {
          include: {
            assignee: { select: { id: true, name: true } },
            creator: { select: { id: true, name: true } }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!workspace) {
      return sendResponse(res, 404, false, null, "Workspace not found.");
    }

    return sendResponse(res, 200, true, workspace, "Workspace details fetched.");
  } catch (error) {
    next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    return sendResponse(res, 200, true, null, "Workspace deleted forever.");
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const validatedData = addMemberSchema.parse(req.body);

    const userToAdd = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!userToAdd) {
      return sendResponse(res, 404, false, null, "We couldn't find a user with that email.");
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userToAdd.id
        }
      }
    });

    if (existingMember) {
      return sendResponse(res, 400, false, null, "User is already part of this workspace.");
    }

    await prisma.workspaceMember.create({
      data: {
        workspace_id: workspaceId,
        user_id: userToAdd.id
      }
    });

    return sendResponse(res, 201, true, null, "Member added successfully.");
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { workspaceId, userId } = req.params;

    // Check if trying to remove the owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (workspace.owner_id === userId) {
      return sendResponse(res, 400, false, null, "You can’t remove the workspace owner.");
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId
        }
      }
    });

    if (!existingMember) {
      return sendResponse(res, 404, false, null, "User is not in this workspace.");
    }

    await prisma.workspaceMember.delete({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId
        }
      }
    });

    return sendResponse(res, 200, true, null, "Member removed from workspace.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  addMember,
  removeMember
};
