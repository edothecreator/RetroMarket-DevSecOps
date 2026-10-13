# NON-NEGOTIABLE SECURITY RULES

**Standards:** OWASP Top 10 (2021), OWASP ASVS Level 2, OWASP API Security Top 10.

## Authentication

- **Passwords:** Use bcrypt (cost factor >= 12) or Argon2id. Minimum length: 12 characters. Never log passwords or return them in responses.
- **JWT access tokens:** 15-minute lifetime. **Refresh tokens:** 7-day lifetime, cryptographically random, **stored hashed in the database**, rotated on every use, and revoked on logout.
- **Web:** Store refresh tokens in `httpOnly; Secure; SameSite=Strict` cookies. Keep access tokens in JavaScript memory (never in `localStorage`).
- **Mobile:** Store only the tokens that are necessary. Document the risks of using unencrypted AsyncStorage in `ARCHITECTURE.md`.
- **Login error messages:** Use the same error message for both "unknown email" and "incorrect password" to prevent account enumeration.
- **Strict rate limiting** on `/auth/*` (e.g., 5 attempts per 15 minutes per IP + email), combined with temporary account lockout.
- **JWT algorithm:** Explicitly specify the algorithm (HS256 or RS256) and enforce it during verification using `algorithms: [...]`.

## Authorization (OWASP A01 – Absolute Priority)

- **Deny by default:** Every route must be protected unless explicitly included in an allowlist (`/auth/register`, `/auth/login`, `/health`, and the public read-only catalog).
- Apply the `authenticate` middleware followed by `authorize(...roles)` to every protected route.
- **Verify resource ownership in the SERVICE layer** (not just the user's role):
  - A seller can modify or delete only **THEIR OWN products**.
  - A user can access only **THEIR OWN conversations**.
  - A seller cannot grant themselves the admin role.
- The role and `userId` must **ALWAYS** come from the verified token, never from the request body or query parameters.
- **Prevent mass-assignment vulnerabilities:** Whitelist permitted fields using Joi (`stripUnknown: true`).
- Use UUIDs for IDs (no sequential integers) to prevent enumeration and IDOR vulnerabilities.

## Validation & Injection Prevention

- **Validate ALL inputs** (body, params, query, and headers) using Joi schemas in `dto/`.
- **SQL:** Use Sequelize exclusively with parameterized queries. **NEVER** concatenate strings or use template literals to build SQL queries. Raw `sequelize.query` calls are prohibited unless they use `replacements`.
- **Output:** React escapes content by default. `dangerouslySetInnerHTML` is **PROHIBITED**. Do not use `eval` or `new Function`.
- **User messages:** Store raw content and escape it when rendering. Enforce a maximum length.
- **Image uploads:** Whitelist MIME types and file extensions, verify magic bytes, enforce a 5 MB maximum size, generate new filenames (UUIDs), store files outside the web root, and ensure uploaded files are never executable.
- **Mandatory pagination:** All list endpoints must implement pagination, with a maximum `limit` of 50.

## Configuration & Transport Security

- Enable `helmet()` and disable `x-powered-by`.
- **CORS:** Use an exact origin allowlist configured through environment variables. Never use `*` with credentials.
- Limit request body size using `express.json({ limit: '10kb' })`. Enable `hpp()`.
- Implement global rate limiting, with stricter limits for authentication, messaging, and the assistant.
- **HTTPS in production** (via a reverse proxy). Cookies must use the `Secure` attribute.

## Secrets & Infrastructure

- **Never expose secrets** in source code, logs, Docker images, or Git repositories. Add `.env` to `.gitignore` and provide an `.env.example` file without real credentials.
- **Dockerfile:** Use a pinned `node:*-alpine` image version, run as a non-root user (`USER node`), use a multi-stage build, run `npm ci --omit=dev`, and never pass secrets through build arguments (`ARG`).
- **docker-compose:** In production, the database must **NOT expose any ports to the host**. Use an internal network and configure health checks.
- **PostgreSQL application user:** Apply the principle of least privilege. Never use a superuser account for the application.

## Error Handling & Logging

- Never return stack traces or SQL details to clients. Return a generic error message with a `requestId`.
- Use structured logging with Pino and redact sensitive fields, including `password`, `token`, `authorization`, and `cookie`.
- Log the following security-relevant events: successful and failed logins, role changes, deletions, and denied access attempts (403).

## Internal Assistant

- **Never expose API keys** in the web or mobile client. All API calls must go through the backend.
- Treat user input as untrusted to mitigate **prompt injection**. The assistant must not have access to other users' data or be able to perform destructive actions.
- Apply per-user rate limiting and enforce maximum input lengths.

## Dependencies

- `npm audit --audit-level=high` must pass.
- Lock dependency versions. Commit `package-lock.json` and use `npm ci` for installations.

## Checklist the Agent MUST Follow Before Completing a Task
[ ] Route protégée (authenticate + authorize) ?
[ ] Ownership vérifié dans le service ?
[ ] Entrée validée (Joi, stripUnknown) ?
[ ] Aucune donnée sensible dans la réponse ?
[ ] Aucun secret/log sensible ?
[ ] Tests unitaires créés dans tests/<feature>/unit ?
[ ] Tests d'intégration créés dans tests/<feature>/integration ?
[ ] Tests de sécurité créés dans tests/<feature>/security ?
[ ] Cas négatifs couverts (401, 403, 400, 404, IDOR, mass-assignment) ?