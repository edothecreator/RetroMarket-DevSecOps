class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body.email, req.body.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  checkEmail = async (req, res, next) => {
    try {
      const result = await this.authService.checkEmailExists(req.query.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const result = await this.authService.refresh(req.user.sub);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.authService.getProfile(req.user.sub);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;
