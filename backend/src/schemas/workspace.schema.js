const { z } = require('zod');

const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  email: z.string().email("Please provide a valid email address to add"),
});

module.exports = { createWorkspaceSchema, addMemberSchema };
