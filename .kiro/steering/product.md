# RetroMarket – Product

A marketplace for second-hand vintage items, including cameras, lenses, and accessories.

## Roles

- **buyer:** Can browse products and categories, contact sellers (every conversation must be linked to a product), and use the internal assistant.
- **seller:** Everything a buyer can do, plus the ability to publish and manage **THEIR OWN products only** and reply to buyers' messages.
- **admin:** Manages categories, views statistics, browses the user list, monitors security logs, and receives notifications about suspicious access. **Admins must never read private messages.**

## Features

1. **Authentication & Authorization (RBAC):**
   - Registration (buyer or seller only), login, token refresh, and logout.
   - Admin accounts must be created through a seed script, never through the public API.

2. **Product & Category Management:**
   - Product CRUD operations (ownership verification is mandatory).
   - Category CRUD operations (admin only).
   - Paginated search.

3. **Buyer <-> Seller Messaging:**
   - Every conversation must be linked to a product.
   - Conversations are accessible only to their two participants.

4. **Internal Assistant:**
   - Provides usage guidance and suggestions.
   - Must never access other users' data.

5. **Administration:**
   - Aggregated statistics (no raw personal data).
   - Read-only user directory (filters: role, email search, pagination).
   - Security and audit log viewer (filters and pagination).
   - Admin notifications for suspicious access.

## Logging & Monitoring

- **Events to log:**
  - Successful and failed login attempts.
  - Token refresh and logout events.
  - Unauthorized access (401/403).
  - Attempts to access another user's resources (IDOR).
  - Attempts by non-admin users to access `/admin/*` routes.
  - Rate-limit violations.
  - Creation, modification, and deletion of sensitive resources.

- Logs must be **read-only for admins**. No update or deletion endpoints are allowed.
- Logs must never contain passwords, tokens, cookies, or message contents.

## Suspicious Access (Triggers Admin Notifications)

- Repeated login failures targeting the same account or originating from the same IP address (configurable threshold).
- Reuse of a refresh token that has already been used or revoked (potential token theft).
- A burst of 401/403 responses originating from the same user or IP address.
- Attempts by non-admin users to access `/admin/*` routes.
- Repeated attempts to access resources belonging to other users (IDOR).
- Repeated rate-limit violations.

## Top Priority

**Clean AND secure code.** When speed and security conflict, security always takes priority.

**Security standards:** OWASP Top 10, OWASP ASVS Level 2, OWASP API Security Top 10.