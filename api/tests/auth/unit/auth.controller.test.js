const AuthController = require('../../../src/controllers/AuthController');

// Create a proper mock for AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  getProfile: jest.fn()
};

describe('AuthController', () => {
  let authController;
  let req, res, next;

  beforeEach(() => {
    authController = new AuthController(mockAuthService);
    
    req = {
      body: {},
      user: { sub: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('returns 201 with user data on successful registration', async () => {
      const userData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['acheteur']
      };
      
      mockAuthService.register.mockResolvedValue(userData);
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPass123!'
      };

      await authController.register(req, res, next);

      expect(mockAuthService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(userData);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error when registration fails', async () => {
      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);
      
      req.body = { email: 'test@example.com' };

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns 200 with auth data on successful login', async () => {
      const authData = {
        user: {
          id: 1,
          email: 'john@example.com'
        },
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token'
      };
      
      mockAuthService.login.mockResolvedValue(authData);
      req.body = {
        email: 'john@example.com',
        password: 'TestPass123!'
      };

      await authController.login(req, res, next);

      expect(mockAuthService.login).toHaveBeenCalledWith('john@example.com', 'TestPass123!');
      expect(res.json).toHaveBeenCalledWith(authData);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error when login fails', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);
      
      req.body = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('returns 200 with new tokens on successful refresh', async () => {
      const refreshData = {
        user: {
          id: 1,
          email: 'john@example.com'
        },
        accessToken: 'new-jwt-token',
        refreshToken: 'new-refresh-token'
      };
      
      mockAuthService.refresh.mockResolvedValue(refreshData);

      await authController.refresh(req, res, next);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(refreshData);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error when refresh fails', async () => {
      const error = new Error('Invalid refresh token');
      mockAuthService.refresh.mockRejectedValue(error);

      await authController.refresh(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('handles missing user in request', async () => {
      req.user = undefined;

      // When req.user is undefined, accessing req.user.sub will throw an error
      await authController.refresh(req, res, next);

      // The controller should catch this error and call next with it
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('me', () => {
    it('returns 200 with user profile on success', async () => {
      const userData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['acheteur']
      };
      
      mockAuthService.getProfile.mockResolvedValue(userData);

      await authController.me(req, res, next);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(userData);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error when profile retrieval fails', async () => {
      const error = new Error('User not found');
      mockAuthService.getProfile.mockRejectedValue(error);

      await authController.me(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('handles missing user in request', async () => {
      req.user = null;

      // When req.user is null, accessing req.user.sub will throw an error
      await authController.me(req, res, next);

      // The controller should catch this error and call next with it
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('handles user with different id format', async () => {
      req.user = { sub: 'string-id' };

      await authController.me(req, res, next);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('string-id');
    });
  });

  describe('error handling', () => {
    it('always calls next with any thrown error', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockAuthService.register.mockImplementation(() => {
        throw unexpectedError;
      });

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(unexpectedError);
    });
  });
});