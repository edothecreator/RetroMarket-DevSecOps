# 🚀 Quick Start - Authentication System

Get the authentication system running in 5 minutes.

## Prerequisites Check

```bash
node --version  # Should be 18+
psql --version  # Should be 15+
```

## 1️⃣ Install & Setup (2 minutes)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Create database (using default postgres user)
createdb retromarket
```

**💡 If using different database credentials, edit `.env` first**

## 2️⃣ Seed Database (30 seconds)

```bash
npm run seed
```

Expected output:
```json
{"level":"info","message":"Database connected","timestamp":"..."}
{"level":"info","message":"Database tables created","timestamp":"..."}
{"level":"info","message":"Roles created","timestamp":"..."}
{"level":"info","message":"Admin user created (email: admin@retromarket.local, password: admin123 - DEMO ONLY)","timestamp":"..."}
{"level":"info","message":"Seed completed successfully","timestamp":"..."}
```

## 3️⃣ Start Server (30 seconds)

```bash
npm run dev
```

Expected output:
```json
{"level":"info","message":"Database connection established","timestamp":"..."}
{"level":"info","message":"Database synchronized","timestamp":"..."}
{"level":"info","message":"Server running on port 3000","timestamp":"..."}
```

**✅ Server is running at http://localhost:3000**

## 4️⃣ Test Endpoints (1 minute)

Open a new terminal and run these commands:

### Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok"}`

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "mypassword"
  }'
```

Expected response:
```json
{
  "id": 2,
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "roles": ["acheteur"],
  "createdAt": "2024-..."
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "mypassword"
  }'
```

Expected response:
```json
{
  "user": {
    "id": 2,
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "roles": ["acheteur"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile (Protected Route)
```bash
# Save token from previous login response
TOKEN="<paste-accessToken-here>"

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected: User profile without passwordHash

### Check Email (User Enumeration - VULN-01d)
```bash
curl "http://localhost:3000/api/auth/check-email?email=test@example.com"
```

Expected: `{"exists":true}`

## 5️⃣ Run Tests (1 minute)

```bash
npm test
```

Expected: All tests pass ✅

## 🎯 Test the Vulnerabilities

### VULN-01a: User Enumeration via Registration
```bash
# Try to register with existing email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"pass"}'
```
Expected: `409 Conflict` with message `"Email already registered"` ⚠️

### VULN-01b: User Enumeration via Login Messages
```bash
# Unknown email
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"unknown@example.com","password":"test"}'
```
Expected: `401` with `"Unknown email"` ⚠️

```bash
# Wrong password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}'
```
Expected: `401` with `"Wrong password"` ⚠️

### VULN-02: Weak Password Policy
```bash
# Register with single character password
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Weak","lastName":"Pass","email":"weak@test.com","password":"a"}'
```
Expected: `201 Created` - password accepted! ⚠️

### VULN-07: Stack Traces in Errors
```bash
# Trigger an error (malformed JSON)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d 'not-json'
```
Expected: Error response includes `stack` trace ⚠️

## 📊 Summary

If all steps work, you should have:
- ✅ Server running on port 3000
- ✅ Database seeded with roles and admin user
- ✅ Registration working (creates users as 'acheteur' by default)
- ✅ Login returning JWT tokens
- ✅ Protected routes requiring Bearer token
- ✅ All functional tests passing
- ✅ Vulnerabilities demonstrable

## 🐛 Troubleshooting

### Error: "database does not exist"
```bash
createdb retromarket
# Or: psql -U postgres -c "CREATE DATABASE retromarket;"
```

### Error: "port 3000 already in use"
```bash
# Change PORT in .env
echo "PORT=3001" >> .env
```

### Error: "password authentication failed"
Update `.env` with correct credentials:
```env
DB_USER=your_username
DB_PASSWORD=your_password
```

### Reset everything
```bash
# Drop and recreate database
dropdb retromarket
createdb retromarket
npm run seed
```

## 📚 Next Steps

- Read `docs/AUTH_VULNERABILITIES.md` for vulnerability details
- Read `docs/IMPLEMENTATION_SUMMARY.md` for architecture
- Read `SETUP.md` for detailed setup guide
- Run security scanners and compare with expected findings
- Practice remediation

## ⚠️ Security Warning

This is an intentionally vulnerable teaching application. **Never expose to the public internet.**

---

**Ready to test? Start at step 1!** 🚀
