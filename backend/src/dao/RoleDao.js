const { Role } = require('../models');

class RoleDao {
  async findByName(name) {
    return await Role.findOne({ where: { name } });
  }

  async findAll() {
    return await Role.findAll();
  }

  async create(roleData) {
    return await Role.create(roleData);
  }
}

module.exports = RoleDao;
