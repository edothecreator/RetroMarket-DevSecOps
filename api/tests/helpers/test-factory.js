const { User } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');
const { generateAccessToken } = require('../../src/utils/jwt');
const RoleEnum = require('../../src/constants/roles');

let userCounter = 0;

function uniqueEmail(prefix = 'user') {
  userCounter++;
  return `${prefix}-${userCounter}-${Date.now()}@test.local`;
}

async function createTestUser(roleDao, roleName = RoleEnum.ACHETEUR, overrides = {}) {
  const email = overrides.email || uniqueEmail();
  const password = overrides.password || 'TestPassword123!';
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    email,
    passwordHash,
  });

  const role = await roleDao.findByName(roleName);
  if (role) {
    await user.addRole(role);
  }

  const userWithRoles = await User.findByPk(user.id, {
    include: [{
      model: require('../../src/models').Role,
      as: 'roles',
      attributes: ['id', 'name'],
      through: { attributes: [] },
    }],
  });

  const token = generateAccessToken(userWithRoles);

  return {
    user: userWithRoles,
    token,
    plainPassword: password,
    auth: `Bearer ${token}`,
  };
}

module.exports = {
  uniqueEmail,
  createTestUser,
};
