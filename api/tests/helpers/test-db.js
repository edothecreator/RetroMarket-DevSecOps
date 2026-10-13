const { sequelize, Role } = require('../../src/models');
const RoleEnum = require('../../src/constants/roles');

async function setupTestDatabase() {
  await sequelize.sync({ force: true });
  
  const roles = await Promise.all([
    Role.create({ name: RoleEnum.ADMIN }),
    Role.create({ name: RoleEnum.ACHETEUR }),
    Role.create({ name: RoleEnum.VENDEUR }),
  ]);

  return {
    adminRole: roles[0],
    acheteurRole: roles[1],
    vendeurRole: roles[2],
  };
}

async function cleanupTestDatabase() {
  await sequelize.close();
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
};
