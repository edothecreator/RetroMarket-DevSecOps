const _ = require('lodash');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const Role = require('../constants/roles');

class AuthService {
  constructor(userDao, roleDao) {
    this.userDao = userDao;
    this.roleDao = roleDao;
  }

  async register(data) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await this.userDao.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await this.userDao.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: normalizedEmail,
      passwordHash,
    });

    const roleName = data.role || Role.ACHETEUR;
    const role = await this.roleDao.findByName(roleName);
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await this.userDao.addRole(user, role);

    const userWithRoles = await this.userDao.findById(user.id);
    return this.formatUser(userWithRoles);
  }

  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userDao.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError('Unknown email');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Wrong password');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async checkEmailExists(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userDao.findByEmail(normalizedEmail);
    return { exists: !!user };
  }

  async refresh(userId) {
    const user = await this.userDao.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId) {
    const user = await this.userDao.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.formatUser(user);
  }

  formatUser(user) {
    return _.pick(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles.map(r => r.name),
        createdAt: user.createdAt,
      },
      ['id', 'firstName', 'lastName', 'email', 'roles', 'createdAt']
    );
  }
}

module.exports = AuthService;
