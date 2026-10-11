# Security Tests Documentation

## Overview

The security test suite (`tests/security.test.js`) validates that the authentication system properly handles security scenarios, including testing for the intentional vulnerabilities documented in the project.

## Test Database Setup

### Critical: Separate Test Database

**Never run tests against the main database.** The tests use `sync({ force: true })` which **drops all tables**.

### 1. Create Test Database

```bash
# Using createdb
createdb retromarket_test

# Or via psql
psql -U postgres -c "CREATE DATABASE retromarket_test;"
```

### 2. Configure Test Environment

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your test database credentials:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME_TEST=retromarket_test
DB_USER=postgres
DB_PASSWORD=your_password
```

### Safety Guards

The test suite includes two safety checks that **prevent accidental data loss**:

1. **Environment check**: Tests fail if `NODE_ENV !== 'test'`
2. **Database name check**: Tests fail if database name doesn't end with `_test`

These guards run **before** `sync({ force: true })` is called.

## Running Tests

### Run all tests (happy-path + security)
```bash
npm test
```

### Run only security tests
```bash
npm run test:security
```

### Run specific test group
```bash
npm run test:security -- -t "Rejected tokens"
```

## Test Groups

### Group 1: No Token → 401 (Protected Routes)

Tests that protected routes require authentication:

- `GET /api/auth/me` without Authorization header
- `POST /api/auth/refresh` without Authorization header  
- `GET /api/auth/me` with invalid header format

**Expected:** All return `401 Unauthorized`

### Group 2: Rejected Tokens (VULN-04)

Tests JWT verification vulnerabilities:

| Test | Vulnerability | Expected (Current) | Expected (Fixed) |
|------|---------------|-------------------|------------------|
| Random string `not.a.jwt` | VULN-04 | ❌ FAIL (200) | ✅ PASS (401) |
| Token with wrong secret | VULN-04 | ❌ FAIL (200) | ✅ PASS (401) |
| Modified payload (admin role) | VULN-04 | ❌ FAIL (200) | ✅ PASS (401) |
| Expired token | VULN-04 | ❌ FAIL (200) | ✅ PASS (401) |
| Refresh token as access token | VULN-04 | ❌ FAIL (200) | ✅ PASS (401) |
| Valid token (control) | - | ✅ PASS (200) | ✅ PASS (200) |

**Current behavior:** The `authenticate` middleware uses `jwt.decode()` without verifying the signature, so forged/modified/expired tokens are accepted.

**After fix:** Replace `jwt.decode()` with `jwt.verify()` in `src/middlewares/authenticate.js`.

### Group 3: Registration and Roles

Tests privilege escalation prevention:

- Registration with `role: "admin"` → Rejected (400)
- Registration with extra field `roles: ["admin"]` → Rejected (400)
- Registration with `role: "vendeur"` → Success (201)

**Expected:** All pass (Zod `.strict()` validation blocks admin role).

### Group 4: Login and Response Leaks (VULN-01, VULN-07)

Tests information disclosure vulnerabilities:

| Test | Vulnerability | Expected (Current) | Expected (Fixed) |
|------|---------------|-------------------|------------------|
| Same error for unknown email and wrong password | VULN-01 | ❌ FAIL | ✅ PASS |
| No `passwordHash` in register response | - | ✅ PASS | ✅ PASS |
| No `passwordHash` in login response | - | ✅ PASS | ✅ PASS |
| No `passwordHash` in `/me` response | - | ✅ PASS | ✅ PASS |
| No stack trace in error responses | VULN-07 | ❌ FAIL | ✅ PASS |

**Current behavior:**
- Login returns distinct messages: `"Unknown email"` vs `"Wrong password"` (VULN-01b)
- Error responses include `stack` property (VULN-07)

**After fix:**
- Return the same generic message: `"Invalid credentials"` for both cases
- Remove `stack` from error responses in production

## Helper Functions

### `createUser(email, roleName)`

Creates a test user, assigns role, logs in, and returns auth tokens.

```javascript
const user = await createUser('test@example.com', RoleEnum.ACHETEUR);
// Returns: { id, email, token, refreshToken, auth }

// Use in tests:
const response = await request(app)
  .get('/api/auth/me')
  .set('Authorization', user.auth);
```

### `uniqueEmail()`

Generates a unique email for each test to avoid conflicts.

```javascript
const email = uniqueEmail();
// Returns: test-user-1-1728398400000@test.local
```

## Expected Results

### Vulnerable Branch (Current)

```bash
npm run test:security
```

**Expected output:**
- ❌ 6 tests fail (VULN-04 tests + VULN-01 + VULN-07)
- ✅ Remaining tests pass
- Total: ~17 tests, 6 failing

### After Security Fixes

After implementing the remediations:

1. Replace `jwt.decode()` with `jwt.verify()` in authenticate middleware
2. Return generic error message for login failures
3. Remove stack traces from error responses

```bash
npm run test:security
```

**Expected output:**
- ✅ All tests pass
- Total: ~17 tests, 0 failing

## Configuration Changes Summary

### Files Modified

1. **`src/config/database.js`**
   - Added test database detection via `NODE_ENV`
   - Uses `DB_NAME_TEST` when in test mode

2. **`src/routes/authRoutes.js`**
   - Disabled rate limiter when `NODE_ENV === 'test'`

3. **`package.json`**
   - Added `setupFiles: ["<rootDir>/jest.setup.js"]` to jest config
   - Updated test scripts to set `NODE_ENV=test`

### Files Created

1. **`jest.setup.js`** - Sets `NODE_ENV` and loads `.env.test`
2. **`.env.test.example`** - Test environment template
3. **`tests/security.test.js`** - Security test suite

## Troubleshooting

### Error: "SAFETY: Tests must run with NODE_ENV=test"

**Cause:** `NODE_ENV` is not set to `test`.

**Fix:** Use the npm scripts which set it automatically:
```bash
npm test  # or npm run test:security
```

### Error: "SAFETY: Test database name must end with _test"

**Cause:** `DB_NAME_TEST` in `.env.test` doesn't end with `_test`.

**Fix:** Update `.env.test`:
```env
DB_NAME_TEST=retromarket_test
```

### Error: "database does not exist"

**Cause:** Test database not created.

**Fix:**
```bash
createdb retromarket_test
```

### Error: "password authentication failed"

**Cause:** Wrong credentials in `.env.test`.

**Fix:** Update `.env.test` with correct PostgreSQL credentials.

### Tests hanging or timing out

**Cause:** Database connection not closed properly.

**Fix:** Ensure `afterAll(() => sequelize.close())` is present.

### Rate limit errors in tests

**Cause:** Rate limiter not disabled in test mode.

**Fix:** Verify `src/routes/authRoutes.js` has the conditional rate limiter:
```javascript
const authLimiter = process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next()
  : rateLimit({ ... });
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Setup test database
  run: |
    sudo -u postgres psql -c "CREATE DATABASE retromarket_test;"
    
- name: Run security tests
  run: npm run test:security
  env:
    NODE_ENV: test
    DB_NAME_TEST: retromarket_test
    DB_USER: postgres
    DB_PASSWORD: postgres
```

## Best Practices

1. **Always use npm scripts** - They set `NODE_ENV` correctly
2. **Never commit `.env.test`** - It's in `.gitignore`
3. **Unique emails per test** - Use `uniqueEmail()` helper
4. **Strong test passwords** - Use complex passwords in tests
5. **Test isolation** - Each test creates its own users
6. **Database safety** - Safety guards prevent accidents

## Next Steps

1. Run the tests to see current vulnerabilities
2. Implement security fixes one by one
3. Re-run tests to verify fixes
4. Document remediation in vulnerability registry
5. Add more edge case tests as needed

---

**Remember:** These tests are designed to **fail** on the vulnerable baseline and **pass** after remediation. Failing tests indicate vulnerabilities that need to be fixed by students.
