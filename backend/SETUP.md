# RetroMarket - Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retromarket
DB_USER=postgres
DB_PASSWORD=postgres
```

3. **Create database**
```bash
# Using psql
createdb retromarket

# Or via SQL
psql -U postgres -c "CREATE DATABASE retromarket;"
```

4. **Seed the database**
```bash
npm run seed
```

This will:
- Create all tables (users, roles, user_roles)
- Insert the 3 roles (admin, acheteur, vendeur)
- Create a demo admin user:
  - Email: `admin@retromarket.local`
  - Password: `admin123` (DEMO ONLY - NEVER use in production)

## Running the Application

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## Testing

### Health check
```bash
curl http://localhost:3000/health
```

### Run tests
```bash
npm test
```

## API Endpoints

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "acheteur"  // optional: "acheteur" (default) or "vendeur"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Returns:
```json
{
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "roles": ["acheteur"]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Check Email
```bash
GET /api/auth/check-email?email=john@example.com
```

#### Get Profile
```bash
GET /api/auth/me
Authorization: Bearer <accessToken>
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer <refreshToken>
```

## Folder Structure

```
src/
├── constants/        # Enums and constants (Role enum)
├── models/           # Sequelize models (User, Role, UserRole)
├── dao/              # Data Access Objects (database queries)
├── services/         # Business logic (AuthService)
├── controllers/      # HTTP controllers (AuthController)
├── routes/           # API routes
├── middlewares/      # Express middlewares (auth, validate, errors)
├── dto/              # Validation schemas (Zod)
├── utils/            # Utilities (password, JWT, errors, logger)
├── config/           # Configuration (database, JWT)
├── app.js            # Express app setup
└── server.js         # Server entry point

tests/                # Jest tests
scripts/              # Utility scripts (seed)
docs/                 # Documentation
```

## Security Notes

⚠️ **WARNING: This is an intentionally vulnerable application for educational purposes.**

This application contains documented security vulnerabilities for teaching DevSecOps practices:
- User enumeration
- Weak password policy
- No 2FA
- JWT signature not verified
- Hardcoded secrets
- Open CORS
- Detailed error messages
- Vulnerable dependencies

See `docs/AUTH_VULNERABILITIES.md` for complete details.

**NEVER expose this application to the public internet.**

## Troubleshooting

### Database connection error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify the database exists: `psql -l`

### Port already in use
- Change `PORT` in `.env` to a different value
- Or stop the process using port 3000

### Module not found errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Next Steps

After verifying the authentication system works:
- Run security scanners (SAST, SCA, secret scanning)
- Compare findings with `docs/AUTH_VULNERABILITIES.md`
- Practice remediation by fixing the intentional vulnerabilities
