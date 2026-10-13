# Test Inventory - Auth Feature

## Test Structure Overview

```
tests/auth/
├── unit/          (8 files, 87 tests)
├── integration/   (1 file, 65 tests)
└── security/      (9 files, 35+ tests) - REFACTORED
```

## Security Tests by Theme

### 1. JWT Attacks (`jwt-attacks.test.js`)
- Missing token scenarios (401)
- Invalid signatures (wrong secret, tampered payload)
- Expired tokens
- Algorithm attacks (wrong algorithm, alg=none)
- Malformed tokens
- Control test (valid token acceptance)

### 2. Mass Assignment (`mass-assignment.test.js`)
- Unknown fields rejection
- Role injection prevention
- Sensitive field prevention (passwordHash, id, ownerId)

### 3. Injection Prevention (`injection.test.js`)
- SQL injection in email/password parameters
- XSS payload storage and handling
- Uses `it.each` for individual payload testing

### 4. User Enumeration (`user-enumeration.test.js`)
- Identical login error messages
- Generic registration error messages
- Removed endpoint verification

### 5. Input Validation (`input-validation.test.js`)
- Password policy enforcement
- Field length limits
- Request body size limits

### 6. Rate Limiting (`rate-limit.test.js`)
- Test environment bypass verification
- Production rate limiting (marked as failing)

### 7. Information Disclosure (`information-disclosure.test.js`)
- Stack trace suppression
- Error tracking (requestId)
- Sensitive data exposure prevention

### 8. Refresh Token Security (`refresh-token.test.js`)
- Token rotation (marked as failing - BUG-004)
- Reuse detection (marked as failing - BUG-005)
- Token hashing (marked as failing - BUG-006)

### 9. Missing Controls (`missing-controls.test.js`)
- HPP middleware verification
- Helmet middleware verification
- CORS configuration verification

### 10. Foundation Tests (`tests/foundation/unit/logger.test.js`)
- Logger redaction unit tests
- Sensitive field filtering

## Bugs Found

### Real Bugs (Still Failing)
- **BUG-002**: Rate limiter not testable in production mode
  - **File**: `rate-limit.test.js:24`
  - **Risk**: Medium - Cannot verify actual rate limiting behavior
  - **Proposed Fix**: Add environment variables for rate limiter testing

- **BUG-004**: Missing refresh token rotation
  - **File**: `refresh-token.test.js:18`
  - **Risk**: High - Security vulnerability, tokens not rotated on use
  - **Proposed Fix**: Implement token rotation in AuthService

- **BUG-005**: Missing refresh token reuse detection  
  - **File**: `refresh-token.test.js:36`
  - **Risk**: High - Security vulnerability, reused tokens not rejected
  - **Proposed Fix**: Track used tokens and reject reuse attempts

- **BUG-006**: Missing refresh token hashing in database
  - **File**: `refresh-token.test.js:54`
  - **Risk**: High - Security vulnerability, tokens stored in plaintext
  - **Proposed Fix**: Hash refresh tokens before database storage

### False Bugs (Fixed)
- **BUG-001**: alg=none attack - Was actually working, removed `.failing`
- **BUG-003**: Oversized body limit - Was actually working, removed `.failing`
- **BUG-008**: Logger redaction - Was actually working, removed `.failing`

## Test Helpers Created

### `jwt-forge.js`
- `wrongSecret()` - Token with wrong secret
- `expired()` - Expired token
- `wrongAlgorithm()` - Token with wrong algorithm
- `algNone()` - alg=none attack token
- `tamperedRoles()` - Token with modified roles
- `invalid()` - Completely invalid token
- `valid()` - Valid token for control tests

### `security-payloads.js`
- `SQLI_PAYLOADS` - SQL injection test cases
- `XSS_PAYLOADS` - XSS test cases
- `WEAK_PASSWORDS` - Password policy test cases
- `LONG_STRINGS` - Field length test cases

### `auth-requests.js`
- `register()` - Registration request helper
- `login()` - Login request helper
- `me()` - /me endpoint helper
- `refresh()` - Refresh token helper

## Tests Removed (Proved Nothing)
- Rate limiter library functionality tests
- JWT library behavior verification
- Express middleware existence checks

## Coverage Improvements
- Individual test cases for each security payload
- Better error scenario coverage
- Cleaner test organization by security theme
- Reusable test utilities reduce duplication