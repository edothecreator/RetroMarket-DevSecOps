const { z } = require('zod');
const Role = require('../constants/roles');

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');

const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: passwordSchema,
  role: z.enum([Role.ACHETEUR, Role.VENDEUR]).optional().default(Role.ACHETEUR),
}).strict();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).strict();

module.exports = {
  registerSchema,
  loginSchema,
  passwordSchema,
};
