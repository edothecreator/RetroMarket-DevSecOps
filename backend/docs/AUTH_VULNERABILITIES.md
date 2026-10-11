# Authentication System - Intentional Vulnerabilities

This document maps the intentional vulnerabilities implemented in the authentication system for the RetroMarket DevSecOps teaching application.

## Implemented Vulnerabilities

| ID | Vulnerability | OWASP Category | File(s) | How to Trigger | Expected Detection Tool |
|---|---|---|---|---|---|
| VULN-01a | User enumeration via registration | API4, API8 | `src/services/AuthService.js` | Register with existing email → returns "Email already registered" (409) | DAST |
| VULN-01b | User enumeration via login (distinct messages) | API4, API8 | `src/services/AuthService.js` | Login with unknown email → "Unknown email" vs wrong password → "Wrong password" | DAST |
| VULN-01c | User enumeration via timing | API4, API8 | `src/services/AuthService.js` | Login with unknown email returns faster (no bcrypt.compare call) | DAST (timing analysis) |
| VULN-01d | User enumeration via check-email endpoint | API4, API8 | `src/routes/authRoutes.js`, `src/services/AuthService.js` | GET `/api/auth/check-email?email=user@example.com` → returns `{ exists: true/false }` | DAST |
| VULN-01e | User enumeration via refresh endpoint | API4, API8 | `src/services/AuthService.js` | POST `/api/auth/refresh` with invalid user token → "User not found" vs expired token → different error | DAST |
| VULN-02 | Weak password policy | API2 | `src/dto/authDto.js` | Register with password "a" (single character, no complexity rules) | SAST (code review) |
| VULN-03 | No 2FA | API2 | Entire auth flow | Login with only email + password, no second factor required | Manual review |
| VULN-04 | JWT not verified | API2 | `src/middlewares/authenticate.js` | Uses `jwt.decode()` instead of `jwt.verify()`, trusts payload without signature verification | SAST |
| VULN-05 | Hardcoded JWT secret | Web Cryptographic Failures, Mobile M1 | `src/config/jwt.js` | Secret `"retromarket-fake-secret-do-not-use"` hardcoded in source | Secret scanning, SAST |
| VULN-06 | Open CORS | Web Misconfiguration | `src/app.js` | `app.use(cors())` with no origin restrictions | SAST, Manual review |
| VULN-07 | Detailed error responses | Web Security Misconfiguration | `src/middlewares/errorHandler.js` | Any error returns `message` AND `stack` trace in JSON | SAST, DAST |
| VULN-08a | Vulnerable dependency (jsonwebtoken) | Web Supply Chain | `package.json` | `"jsonwebtoken": "8.5.1"` pinned (CVE-2022-23529, CVE-2022-23539, CVE-2022-23540, CVE-2022-23541) | SCA |
| VULN-08b | Vulnerable dependency (lodash) | Web Supply Chain | `package.json` | `"lodash": "4.17.15"` pinned (CVE-2019-10744, CVE-2020-8203, prototype pollution) | SCA |

## Secure Practices Maintained

Despite the intentional vulnerabilities, the following secure practices are maintained:

✅ **Parameterized queries**: All database access uses Sequelize ORM with parameterized queries  
✅ **Password hashing**: All passwords hashed with bcrypt (SALT_ROUNDS=10)  
✅ **No password in responses**: `passwordHash` never returned in API responses  
✅ **Input validation**: Zod `.strict()` schemas on all endpoints  
✅ **Helmet**: Security headers enabled  
✅ **Rate limiting**: Applied to all auth endpoints  
✅ **No logging of sensitive data**: Passwords and tokens not logged in request bodies  

## Architecture Flow

```
POST /api/auth/register
  → validate(registerSchema)
  → authController.register()
  → authService.register()
    → userDao.findByEmail() [VULN-01a: returns specific error]
    → hashPassword()
    → userDao.create()
    → userDao.addRole() [Secure: admin role blocked at DTO level]
  → returns user (no passwordHash)

POST /api/auth/login
  → validate(loginSchema)
  → authController.login()
  → authService.login()
    → userDao.findByEmail() [VULN-01b,c: distinct errors, timing]
    → comparePassword() [Secure: bcrypt]
    → generateAccessToken() [VULN-04,05: weak secret, not verified]
    → generateRefreshToken()
  → returns { user, accessToken, refreshToken }

GET /api/auth/check-email
  → validate(checkEmailSchema, 'query')
  → authController.checkEmail()
  → authService.checkEmailExists() [VULN-01d: user enumeration]
  → returns { exists: boolean }

POST /api/auth/refresh
  → authenticate [VULN-04: jwt.decode without verify]
  → authController.refresh()
  → authService.refresh() [VULN-01e: distinct errors]
  → returns new tokens

GET /api/auth/me
  → authenticate [VULN-04: jwt.decode without verify]
  → authController.me()
  → authService.getProfile()
  → returns user profile
```

## Testing

Run functional tests (happy path only):
```bash
npm test
```

## Database Setup

1. Ensure PostgreSQL is running
2. Create database and configure `.env`:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run seed script:
```bash
npm run seed
```

This creates:
- 3 roles: admin, acheteur, vendeur
- 1 admin user: `admin@retromarket.local` / `admin123` (DEMO ONLY)

## Notes

- The JWT secret is a **FAKE demo value** for educational purposes
- All secrets are fake and documented in `.gitleaks.toml`
- The application must **NEVER be exposed publicly**
- These vulnerabilities are intentional and documented in `docs/VULN_REGISTRY.md`
