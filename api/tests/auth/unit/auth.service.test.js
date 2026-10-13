const AuthService = require('../../../src/services/AuthService');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../../../src/utils/errors');
const { hashPassword } = require('../../../src/utils/password');
const RoleEnum = require('../../../src/constants/roles');

describe('AuthService - Unit Tests', () => {
  let authService;
  let mockUserDao;
  let mockRoleDao;

  beforeEach(() => {
    mockUserDao = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      addRole: jest.fn(),
    };

    mockRoleDao = {
      findByName: jest.fn(),
    };

    authService = new AuthService(mockUserDao, mockRoleDao);
  });

  describe('register', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPass123!',
      role: RoleEnum.ACHETEUR,
    };

    it('should register a new user successfully', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);
      mockUserDao.create.mockResolvedValue({ id: 1, ...validData });
      mockRoleDao.findByName.mockResolvedValue({ id: 1, name: RoleEnum.ACHETEUR });
      mockUserDao.addRole.mockResolvedValue(true);
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: [{ name: RoleEnum.ACHETEUR }],
        createdAt: new Date(),
      });

      const result = await authService.register(validData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('roles');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('password');
    });

    it('should normalize email to lowercase', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);
      mockUserDao.create.mockResolvedValue({ id: 1 });
      mockRoleDao.findByName.mockResolvedValue({ id: 1, name: RoleEnum.ACHETEUR });
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        roles: [{ name: RoleEnum.ACHETEUR }],
      });

      const dataWithUppercase = { ...validData, email: 'John@EXAMPLE.COM' };
      await authService.register(dataWithUppercase);

      expect(mockUserDao.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should trim email whitespace', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);
      mockUserDao.create.mockResolvedValue({ id: 1 });
      mockRoleDao.findByName.mockResolvedValue({ id: 1, name: RoleEnum.ACHETEUR });
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        roles: [{ name: RoleEnum.ACHETEUR }],
      });

      const dataWithSpaces = { ...validData, email: '  john@example.com  ' };
      await authService.register(dataWithSpaces);

      expect(mockUserDao.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw ConflictError when email already exists', async () => {
      mockUserDao.findByEmail.mockResolvedValue({ id: 1, email: 'john@example.com' });

      await expect(authService.register(validData)).rejects.toThrow(ConflictError);
      await expect(authService.register(validData)).rejects.toThrow(/Unable to complete registration/);
    });

    it('should hash password before storing', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);
      mockUserDao.create.mockImplementation(async (data) => {
        expect(data.passwordHash).toBeDefined();
        expect(data.passwordHash).not.toBe(validData.password);
        expect(data.passwordHash).toMatch(/^\$2[aby]\$12\$/);
        return { id: 1, ...data };
      });
      mockRoleDao.findByName.mockResolvedValue({ id: 1, name: RoleEnum.ACHETEUR });
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        roles: [{ name: RoleEnum.ACHETEUR }],
      });

      await authService.register(validData);

      expect(mockUserDao.create).toHaveBeenCalled();
    });

    it('should assign correct role', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);
      const mockUser = { id: 1, addRole: jest.fn() };
      mockUserDao.create.mockResolvedValue(mockUser);
      const mockRole = { id: 2, name: RoleEnum.VENDEUR };
      mockRoleDao.findByName.mockResolvedValue(mockRole);
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        roles: [mockRole],
      });

      const dataWithVendeur = { ...validData, role: RoleEnum.VENDEUR };
      await authService.register(dataWithVendeur);

      expect(mockRoleDao.findByName).toHaveBeenCalledWith(RoleEnum.VENDEUR);
    });
  });

  describe('login', () => {
    const email = 'user@example.com';
    const password = 'TestPassword123!';

    beforeEach(async () => {
      const passwordHash = await hashPassword(password);
      mockUserDao.findByEmail.mockResolvedValue({
        id: 1,
        email,
        passwordHash,
        roles: [{ name: RoleEnum.ACHETEUR }],
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await authService.login(email, password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedError for unknown email', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);

      await expect(authService.login('unknown@example.com', password)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login('unknown@example.com', password)).rejects.toThrow(/Invalid credentials/);
    });

    it('should throw UnauthorizedError for wrong password', async () => {
      await expect(authService.login(email, 'WrongPassword123!')).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(email, 'WrongPassword123!')).rejects.toThrow(/Invalid credentials/);
    });

    it('should return same error message for unknown email and wrong password', async () => {
      // Test unknown email
      mockUserDao.findByEmail.mockResolvedValueOnce(null);
      const unknownEmailPromise = authService.login('unknown@test.com', password).catch(err => err.message);
      
      // Test wrong password - need fresh hash for this test
      const newPasswordHash = await hashPassword(password);
      mockUserDao.findByEmail.mockResolvedValueOnce({
        id: 1,
        email,
        passwordHash: newPasswordHash,
        roles: [{ name: RoleEnum.ACHETEUR }],
      });
      const wrongPasswordPromise = authService.login(email, 'WrongPass123!').catch(err => err.message);

      const [message1, message2] = await Promise.all([unknownEmailPromise, wrongPasswordPromise]);

      expect(message1).toBe(message2);
      expect(message1).toBe('Invalid credentials');
    });

    it('should normalize email before lookup', async () => {
      await authService.login('  User@EXAMPLE.COM  ', password);

      expect(mockUserDao.findByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('should perform timing attack mitigation for unknown email', async () => {
      mockUserDao.findByEmail.mockResolvedValue(null);

      const start = Date.now();
      await authService.login('unknown@test.com', password).catch(() => {});
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThan(50);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens for valid user', async () => {
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        roles: [{ name: RoleEnum.ACHETEUR }],
      });

      const result = await authService.refresh(1);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedError for unknown user', async () => {
      mockUserDao.findById.mockResolvedValue(null);

      await expect(authService.refresh(999)).rejects.toThrow(UnauthorizedError);
      await expect(authService.refresh(999)).rejects.toThrow(/Invalid credentials/);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      mockUserDao.findById.mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: '$2b$12$hashedpassword',
        roles: [{ name: RoleEnum.ACHETEUR }],
        createdAt: new Date(),
      });

      const result = await authService.getProfile(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('roles');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundError for unknown user', async () => {
      mockUserDao.findById.mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('formatUser', () => {
    it('should remove passwordHash from user object', () => {
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: '$2b$12$hashedpassword',
        roles: [{ name: RoleEnum.ACHETEUR }],
        createdAt: new Date(),
      };

      const result = authService.formatUser(user);

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should include only safe fields', () => {
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: '$2b$12$hashedpassword',
        secretField: 'should-not-be-included',
        roles: [{ name: RoleEnum.ACHETEUR }],
        createdAt: new Date(),
      };

      const result = authService.formatUser(user);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('secretField');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
