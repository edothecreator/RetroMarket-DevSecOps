const { Role } = require('../models');

class RoleDao {
  async findByName(name) {
    if (name === null || name === undefined) {
      return null;
    }
    return await Role.findOne({ where: { name } });
  }

  async findById(id) {
    if (!id || isNaN(id)) {
      return null;
    }
    return await Role.findByPk(id);
  }

  async findAll() {
    return await Role.findAll();
  }

  async create(roleData) {
    return await Role.create(roleData);
  }
}

module.exports = RoleDao;
