const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: false,
});

const User = require('./User')(sequelize);
const Role = require('./Role')(sequelize);
const UserRole = require('./UserRole')(sequelize);

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', as: 'users' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
};
