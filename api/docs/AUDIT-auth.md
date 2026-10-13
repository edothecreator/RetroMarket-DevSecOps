# Auth Feature Conformity Audit

This document tracks conformity gaps between the current auth implementation and the steering file requirements.

## Conformity Gaps Found

### File Naming Convention Violations
**Issue**: PascalCase files violate kebab-case rule from structure.md  
**Files**: 
- `src/dao/RoleDao.js` (should be `role.dao.js`)
- `src/controllers/AuthController.js` (should be `auth.controller.js`)
- `src/services/AuthService.js` (should be `auth.service.js`)
- `src/dao/UserDao.js` (should be `user.dao.js`)

**Impact**: Low - functionality not affected, but violates project conventions  
**Proposed Fix**: Rename files to follow kebab-case convention

### Route Versioning
**Issue**: Need to verify if routes use `/api/v1/auth` instead of `/api/auth`  
**Current**: `/api/auth/*`  
**Required by steering**: `/api/v1/*`

**Impact**: Medium - API versioning strategy compliance  
**Proposed Fix**: Update route prefix to include version

### Refresh Token Delivery Method
**Issue**: Need to verify refresh token delivery method  
**Required by security.md**: httpOnly + Secure + SameSite=Strict cookies  
**Current**: Unknown - needs investigation

**Impact**: High - security compliance for token storage  
**Proposed Fix**: Implement secure cookie delivery for refresh tokens

## Test Coverage Conformity

### Missing Security Test Cases
- ✅ JWT expired/forged/alg=none attacks  
- ✅ Mass assignment of role fields
- ✅ User enumeration prevention
- ✅ SQL injection payloads
- ✅ XSS payload handling
- ✅ Oversized request body limits
- ✅ Stack trace suppression
- ⚠️ Rate limiting (disabled in test environment)
- ⚠️ Refresh token rotation (not implemented)
- ⚠️ Refresh token reuse detection (not implemented)

### Security Controls Status

| Control | Status | Notes |
|---------|--------|-------|
| JWT Algorithm Pinning | ✅ EXISTS | HS256 enforced |
| Rate Limiter on /auth/* | ⚠️ DISABLED | Disabled in test env |
| Helmet Middleware | ✅ EXISTS | Security headers set |
| HPP Middleware | ✅ EXISTS | Parameter pollution handled |
| CORS Whitelist | ✅ EXISTS | Origin validation |
| Refresh Token Rotation | ❌ MISSING | BUG-004 |
| Refresh Token Hashing | ❌ MISSING | BUG-006 |
| Logger Redaction | ❌ PARTIAL | BUG-008 (was false bug) |

## Bugs Found During Refactoring

### False Bugs (Fixed)
- **BUG-001**: alg=none attack - Test was passing, removed `.failing` marker
- **BUG-003**: Oversized body limit - Test was passing, removed `.failing` marker  
- **BUG-008**: Logger redaction - Test was passing, removed `.failing` marker

### Real Bugs (Kept)
- **BUG-002**: Rate limiter testing - Needs environment variable control
- **BUG-004**: Missing refresh token rotation
- **BUG-005**: Missing refresh token reuse detection  
- **BUG-006**: Missing refresh token hashing in database

## Recommendations

1. **Immediate**: Fix file naming to follow kebab-case convention
2. **High Priority**: Implement refresh token security features (rotation, reuse detection, hashing)
3. **Medium Priority**: Implement API versioning (`/api/v1/auth`)
4. **Low Priority**: Make rate limiter testable with environment variables

## Test Refactoring Summary

✅ **Completed**:
- Split monolithic security test into 9 themed files
- Created reusable helper utilities (jwt-forge, security-payloads, auth-requests)
- Replaced `for` loops with `it.each` for individual payload testing
- Removed meaningless tests that only test library functionality
- Created foundation unit tests for logger redaction
- Fixed 3 false bug markers (BUG-001, BUG-003, BUG-008)

✅ **Benefits**:
- Better test organization and maintainability
- Individual test cases for each payload (better debugging)
- Reusable security testing utilities
- Clear separation of concerns by security theme