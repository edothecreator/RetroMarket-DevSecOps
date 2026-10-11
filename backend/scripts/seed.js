require('dotenv').config();
const { sequelize, Role, User } = require('../src/models');
const { hashPassword } = require('../src/utils/password');
const logger = require('../src/utils/logger');
const RoleEnum = require('../src/constants/roles');

async function seed() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');

    await sequelize.sync({ force: true });
    logger.info('Database tables created');

    const adminRole = await Role.create({ name: RoleEnum.ADMIN });
    const acheteurRole = await Role.create({ name: RoleEnum.ACHETEUR });
    const vendeurRole = await Role.create({ name: RoleEnum.VENDEUR });
    logger.info('Roles created');

    const adminPasswordHash = await hashPassword('admin123');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Demo',
      email: 'admin@retromarket.local',
      passwordHash: adminPasswordHash,
    });
    await adminUser.addRole(adminRole);
    logger.info('Admin user created (email: admin@retromarket.local, password: admin123 - DEMO ONLY)');

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed', { error: error.message });
    process.exit(1);
  }
}

seed();
