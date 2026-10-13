const { User, Role } = require('../models');

class UserDao {
  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      }],
    });
  }

  async findById(id) {
    return await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      }],
    });
  }

  async addRole(user, role) {
    return await user.addRole(role);
  }
}

module.exports = UserDao;
