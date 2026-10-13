const RoleDao = require('../../../src/dao/RoleDao');
const { setupTestDatabase, cleanupTestDatabase } = require('../../helpers/test-db');

describe('RoleDao', () => {
  let roleDao;

  beforeAll(async () => {
    await setupTestDatabase();
    roleDao = new RoleDao();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('findByName', () => {
    it('finds existing role by name', async () => {
      const role = await roleDao.findByName('acheteur');
      
      expect(role).toBeTruthy();
      expect(role.name).toBe('acheteur');
      expect(role.id).toBeDefined();
    });

    it('returns null for non-existent role', async () => {
      const role = await roleDao.findByName('nonexistent');
      
      expect(role).toBeNull();
    });

    it('handles empty string input', async () => {
      const role = await roleDao.findByName('');
      
      expect(role).toBeNull();
    });

    it('handles null input gracefully', async () => {
      const role = await roleDao.findByName(null);
      
      expect(role).toBeNull();
    });

    it('handles undefined input gracefully', async () => {
      const role = await roleDao.findByName(undefined);
      
      expect(role).toBeNull();
    });

    it('is case sensitive for role names', async () => {
      const lowerCase = await roleDao.findByName('acheteur');
      const upperCase = await roleDao.findByName('ACHETEUR');
      
      expect(lowerCase).toBeTruthy();
      expect(upperCase).toBeNull();
    });
  });

  describe('findById', () => {
    it('finds existing role by id', async () => {
      // First get a role to have a valid ID
      const existingRole = await roleDao.findByName('acheteur');
      const role = await roleDao.findById(existingRole.id);
      
      expect(role).toBeTruthy();
      expect(role.id).toBe(existingRole.id);
      expect(role.name).toBe('acheteur');
    });

    it('returns null for non-existent id', async () => {
      const role = await roleDao.findById(99999);
      
      expect(role).toBeNull();
    });

    it('handles invalid id types gracefully', async () => {
      const roleString = await roleDao.findById('invalid');
      const roleNull = await roleDao.findById(null);
      const roleUndefined = await roleDao.findById(undefined);
      
      expect(roleString).toBeNull();
      expect(roleNull).toBeNull();
      expect(roleUndefined).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all roles', async () => {
      const roles = await roleDao.findAll();
      
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThan(0);
      
      // Should contain at least the seeded roles
      const roleNames = roles.map(r => r.name);
      expect(roleNames).toContain('acheteur');
      expect(roleNames).toContain('vendeur');
    });

    it('returns roles with required properties', async () => {
      const roles = await roleDao.findAll();
      
      roles.forEach(role => {
        expect(role.id).toBeDefined();
        expect(role.name).toBeDefined();
        expect(typeof role.name).toBe('string');
      });
    });
  });
});