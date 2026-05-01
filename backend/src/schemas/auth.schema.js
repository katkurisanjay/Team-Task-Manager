const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("That doesn't look like a valid email"),
  password: z.string().min(6, "Password needs to be at least 6 characters"),
  role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER'),
});

const loginSchema = z.object({
  email: z.string().email("That doesn't look like a valid email"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
