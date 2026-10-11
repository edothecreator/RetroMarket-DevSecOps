# 🔒 Security Tests - Quick Start

## Setup (2 minutes)

### 1. Create test database
```bash
createdb retromarket_test
```

### 2. Configure test environment
```bash
cp .env.test.example .env.test
# Edit .env.test if your database credentials differ from defaults
```

### 3. Run security tests
```bash
npm run test:security
```

## Expected Results (Vulnerable Baseline)

### ❌ These tests SHOULD FAIL (proving vulnerabilities exist):

1. **VULN-04: JWT not verified**
   - ❌ Random string `not.a.jwt` → Should reject (401), but accepts (200)
   - ❌ Token with wrong secret → Should reject (401), but accepts (200)
   - ❌ Modified payload (admin role) → Should reject (401), but accepts (200)
   - ❌ Expired token → Should reject (401), but accepts (200)
   - ❌ Refresh token as access token → Should reject (401), but accepts (200)

2. **VULN-01: User enumeration**
   - ❌ Login errors are different for "Unknown email" vs "Wrong password"

3. **VULN-07: Stack traces exposed**
   - ❌ Error responses contain stack traces

### ✅ These tests SHOULD PASS (security measures maintained):

- ✅ Protected routes require token
- ✅ Admin role cannot be selected at registration
- ✅ No passwordHash in responses
- ✅ Valid tokens work correctly

## Example Output

```bash
$ npm run test:security

PASS  tests/security.test.js
  Security Tests
    Group 1: No token -> 401 (protected routes)
      ✓ GET /api/auth/me without Authorization header -> 401 (25 ms)
      ✓ POST /api/auth/refresh without Authorization header -> 401 (8 ms)
      ✓ GET /api/auth/me with invalid header (no Bearer prefix) -> 401 (7 ms)
    Group 2: Rejected tokens (VULN-04)
      ✕ VULN-04: Random string not.a.jwt -> 401 (15 ms)
      ✕ VULN-04: Token forged with wrong secret and role admin -> 401 (12 ms)
      ✕ VULN-04: Valid token with modified payload (role admin) and original signature -> 401 (89 ms)
      ✕ VULN-04: Expired token -> 401 (11 ms)
      ✕ VULN-04: Refresh token used as access token -> 401 (78 ms)
      ✓ Control: Valid token -> 200 (67 ms)
    Group 3: Registration and roles
      ✓ Registration with role admin is rejected (400) (9 ms)
      ✓ Registration with unknown extra field does not create admin (8 ms)
      ✓ Control: Registration with role vendeur -> 201 (45 ms)
    Group 4: Login and response leaks (VULN-01, VULN-07)
      ✕ VULN-01: Same status and same body for unknown email and wrong password (98 ms)
      ✓ No response contains passwordHash on register (43 ms)
      ✓ No response contains passwordHash on login (76 ms)
      ✓ No response contains passwordHash on /me (68 ms)
      ✕ VULN-07: Error on unknown route has no stack trace in body (6 ms)

Test Suites: 1 failed, 1 total
Tests:       7 failed, 11 passed, 18 total
```

**This is expected!** 7 failing tests = 7 vulnerabilities to fix.

## Quick Commands

```bash
# Run all tests (happy-path + security)
npm test

# Run only security tests
npm run test:security

# Run only one test group
npm run test:security -- -t "Rejected tokens"

# Run in watch mode
npm run test:security -- --watch

# Verbose output
npm run test:security -- --verbose
```

## After Fixing Vulnerabilities

Once you implement the security fixes:

1. Replace `jwt.decode()` with `jwt.verify()` in `src/middlewares/authenticate.js`
2. Return generic "Invalid credentials" message in `AuthService.login()`
3. Remove `stack` from error responses in `src/middlewares/errorHandler.js`

Then run:

```bash
npm run test:security
```

Expected: ✅ **All 18 tests pass**

## Troubleshooting

### Database doesn't exist
```bash
createdb retromarket_test
```

### Wrong credentials
```bash
# Edit .env.test with your PostgreSQL credentials
nano .env.test
```

### Tests hang
```bash
# Restart PostgreSQL
sudo service postgresql restart

# Or on macOS
brew services restart postgresql
```

### Reset test database
```bash
dropdb retromarket_test
createdb retromarket_test
npm run test:security
```

## Safety Features

The test suite has **built-in safety guards**:

1. ✅ Tests only run if `NODE_ENV=test`
2. ✅ Tests only run if database name ends with `_test`
3. ✅ These checks happen **before** tables are dropped

This prevents accidentally wiping your main database! 🛡️

## Documentation

For detailed information, see:
- `docs/SECURITY_TESTS.md` - Complete test documentation
- `docs/AUTH_VULNERABILITIES.md` - Vulnerability mapping
- `tests/security.test.js` - Test source code

---

**Ready to test?** Run `npm run test:security` 🚀
