const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
const AuthService = require('../services/AuthService');
const UserDao = require('../dao/UserDao');
const RoleDao = require('../dao/RoleDao');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const { registerSchema, loginSchema, checkEmailSchema } = require('../dto/authDto');

const router = express.Router();

const authLimiter = process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP',
    });

const userDao = new UserDao();
const roleDao = new RoleDao();
const authService = new AuthService(userDao, roleDao);
const authController = new AuthController(authService);

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/check-email', validate(checkEmailSchema, 'query'), authController.checkEmail);
router.post('/refresh', authLimiter, authenticate, authController.refresh);
router.get('/me', authenticate, authController.me);

module.exports = router;
