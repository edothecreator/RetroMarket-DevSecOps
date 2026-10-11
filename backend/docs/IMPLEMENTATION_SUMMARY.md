# Authentication System - Implementation Summary

## ✅ Step 1 Complete: Register & Login with Intentional Vulnerabilities

### Files Created (24 files)

#### 📦 Models (4 files)
- ✅ `src/models/index.js` - Sequelize setup & associations
- ✅ `src/models/User.js` - User entity schema
- ✅ `src/models/Role.js` - Role entity schema
- ✅ `src/models/UserRole.js` - Many-to-many junction table

#### 📦 Constants (1 file)
- ✅ `src/constants/roles.js` - Role enum (ADMIN, ACHETEUR, VENDEUR)

#### 📦 DAO (2 files)
- ✅ `src/dao/UserDao.js` - User database queries
- ✅ `src/dao/RoleDao.js` - Role database queries

#### 📦 Utils (4 files)
- ✅ `src/utils/password.js` - bcrypt hashing & comparison
- ✅ `src/utils/jwt.js` - Token generation (access & refresh)
- ✅ `src/utils/errors.js` - Custom error classes
- ✅ `src/utils/logger.js` - Simple JSON logger

#### 📦 Config (2 files)
- ✅ `src/config/database.js` - PostgreSQL configuration
- ✅ `src/config/jwt.js` - JWT secret (VULN-05: hardcoded)

#### 📦 DTO (1 file)
- ✅ `src/dto/authDto.js` - Zod validation schemas (VULN-02: weak password)

#### 📦 Services (1 file)
- ✅ `src/services/AuthService.js` - Business logic (VULN-01: user enumeration)

#### 📦 Controllers (1 file)
- ✅ `src/controllers/AuthController.js` - HTTP handlers

#### 📦 Middlewares (4 files)
- ✅ `src/middlewares/authenticate.js` - JWT auth (VULN-04: no verify)
- ✅ `src/middlewares/authorize.js` - Role-based access control
- ✅ `src/middlewares/validate.js` - Zod validation wrapper
- ✅ `src/middlewares/errorHandler.js` - Global errors (VULN-07: stack traces)

#### 📦 Routes (2 files)
- ✅ `src/routes/authRoutes.js` - Auth endpoints with rate limiting
- ✅ `src/routes/index.js` - Main router

#### 📦 App (2 files)
- ✅ `src/app.js` - Express setup (VULN-06: open CORS)
- ✅ `src/server.js` - Server startup

#### 🧪 Tests (1 file)
- ✅ `tests/auth.test.js` - Happy path functional tests

#### 🔧 Scripts (1 file)
- ✅ `scripts/seed.js` - Database seeding

#### 📄 Config Files
- ✅ `.env.example` - Environment template
- ✅ `package.json` - Dependencies (VULN-08: vulnerable versions)
- ✅ `.gitleaks.toml` - Updated with JWT secret note
- ✅ `SETUP.md` - Setup instructions
- ✅ `docs/AUTH_VULNERABILITIES.md` - Vulnerability mapping

## 🔐 Intentional Vulnerabilities Implemented

### VULN-01: User Enumeration (All 5 variants)
| Variant | Location | Trigger |
|---------|----------|---------|
| 01a - Registration | `AuthService.register()` | Register existing email → "Email already registered" |
| 01b - Login messages | `AuthService.login()` | "Unknown email" vs "Wrong password" |
| 01c - Login timing | `AuthService.login()` | No bcrypt call for unknown emails |
| 01d - Check endpoint | `GET /api/auth/check-email` | Public endpoint returns exists: true/false |
| 01e - Refresh errors | `AuthService.refresh()` | "User not found" vs token errors |

### VULN-02: Weak Password Policy
- **Location**: `src/dto/authDto.js`
- **Issue**: `password: z.string().min(1)` - accepts single character
- **Missing**: No complexity rules, no max length, no common password check

### VULN-03: No 2FA
- **Location**: Entire auth flow
- **Issue**: Only email + password required, no second factor

### VULN-04: JWT Not Verified
- **Location**: `src/middlewares/authenticate.js`
- **Issue**: Uses `jwt.decode()` instead of `jwt.verify()`
- **Impact**: Signature not checked, payload trusted blindly

### VULN-05: Hardcoded JWT Secret
- **Location**: `src/config/jwt.js`
- **Value**: `"retromarket-fake-secret-do-not-use"`
- **Documented**: In `.gitleaks.toml` and README

### VULN-06: Open CORS
- **Location**: `src/app.js`
- **Issue**: `app.use(cors())` with no origin restrictions

### VULN-07: Detailed Error Responses
- **Location**: `src/middlewares/errorHandler.js`
- **Issue**: Returns both `message` and `stack` in JSON

### VULN-08: Vulnerable Dependencies
- **Location**: `package.json`
- **Versions**:
  - `jsonwebtoken: 8.5.1` (CVEs in 8.x, fixed in 9.x)
  - `lodash: 4.17.15` (prototype pollution CVEs)
- **Usage**: `lodash` used in `AuthService.formatUser()` with `_.pick()`

## 🛡️ Security Measures Maintained

✅ Bcrypt password hashing (10 rounds)  
✅ Parameterized queries via Sequelize ORM  
✅ Never return `passwordHash` in responses  
✅ Zod `.strict()` validation prevents admin role escalation  
✅ Email normalization (trim + lowercase)  
✅ Helmet security headers  
✅ Rate limiting on auth endpoints (100 req/15min)  
✅ No logging of passwords or tokens  

## 📋 API Endpoints

| Method | Path | Auth | Rate Limited | Purpose |
|--------|------|------|--------------|---------|
| POST | `/api/auth/register` | No | Yes | Create new user |
| POST | `/api/auth/login` | No | Yes | Authenticate user |
| GET | `/api/auth/check-email` | No | No | Check if email exists (VULN-01d) |
| POST | `/api/auth/refresh` | Yes | Yes | Refresh access token |
| GET | `/api/auth/me` | Yes | No | Get current user profile |

## 🔄 Request Flow Example

```
POST /api/auth/register
  │
  ├─→ Rate limiter (100/15min)
  ├─→ validate(registerSchema) [Zod strict, blocks "admin" role]
  ├─→ authController.register()
  │     └─→ authService.register()
  │           ├─→ userDao.findByEmail() [VULN-01a: exists check]
  │           ├─→ hashPassword() [✅ bcrypt]
  │           ├─→ userDao.create() [✅ parameterized]
  │           └─→ userDao.addRole()
  │
  └─→ Response: user (no passwordHash) + 201
```

```
POST /api/auth/login
  │
  ├─→ Rate limiter
  ├─→ validate(loginSchema)
  ├─→ authController.login()
  │     └─→ authService.login()
  │           ├─→ userDao.findByEmail() [VULN-01b: "Unknown email"]
  │           ├─→ comparePassword() [VULN-01c: timing, 01b: "Wrong password"]
  │           ├─→ generateAccessToken() [VULN-04,05: weak secret, 15m exp]
  │           └─→ generateRefreshToken() [7d exp]
  │
  └─→ Response: { user, accessToken, refreshToken }
```

```
GET /api/auth/me
  │
  ├─→ authenticate [VULN-04: jwt.decode without verify]
  │     └─→ req.user = { sub, roles }
  ├─→ authController.me()
  │     └─→ authService.getProfile(req.user.sub)
  │
  └─→ Response: user profile
```

## 🧪 Testing Commands

```bash
# Install dependencies
npm install

# Setup database
cp .env.example .env
# (edit .env with your database credentials)
npm run seed

# Run server
npm run dev

# Run tests
npm test

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"test123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Test user enumeration
curl "http://localhost:3000/api/auth/check-email?email=john@test.com"
```

## 📊 Vulnerability Detection Matrix

| Tool Type | Should Detect | Count |
|-----------|---------------|-------|
| SAST | VULN-02, 04, 05, 06, 07, 08 | 6 |
| SCA | VULN-08 (both dependencies) | 2 |
| Secret Scanning | VULN-05 (hardcoded secret) | 1 |
| DAST | VULN-01 (all 5 variants), 07 | 6 |
| Manual Review | VULN-03, 06 | 2 |

## ✅ Ready for Testing

The authentication system is complete and ready for:
1. ✅ Manual testing (see curl examples above)
2. ✅ Jest test suite (`npm test`)
3. ✅ Security scanner testing (SAST/SCA/secrets/DAST)
4. ✅ Code review

## 🎯 Next Steps (Step 2)

After you verify Step 1 works correctly:
- Add JWT expiry handling
- Implement token refresh flow improvements
- Document additional edge cases
- Prepare for integration with other features

---

**Note**: All vulnerabilities are intentional and documented. This is a teaching application for DevSecOps training.
