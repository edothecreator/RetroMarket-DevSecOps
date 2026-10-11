const { z } = require('zod');
const Role = require('../constants/roles');

const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(1),
  role: z.enum([Role.ACHETEUR, Role.VENDEUR]).optional().default(Role.ACHETEUR),
}).strict();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).strict();

const checkEmailSchema = z.object({
  email: z.string().email(),
});

module.exports = {
  registerSchema,
  loginSchema,
  checkEmailSchema,
};
