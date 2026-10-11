# Vulnerability Registry

| ID | Vulnerability | Exact behavior to implement | Framework refs |
|---|---|---|---|
| V01 | SQL injection | Listing `search` and `sort` params concatenated into SQL | Web Injection, API8 (misconfig of input handling) |
| V02 | BOLA / IDOR | `GET/PATCH /api/orders/:id` check the token but not ownership | API1 |
| V03 | Mass assignment / privilege escalation | `PATCH /api/users/me` merges the whole body (`lodash` merge), including `role` | API3, API5 |
| V04 | Broken authentication tokens | Weak guessable JWT secret, no expiry, `requireAdmin` uses `jwt.decode` without verification, token in web localStorage | API2 |
| V05 | Hardcoded secrets | `config/default.js` holds fake DB password `Passw0rd123!`, the AWS documentation example key pair `AKIAIOSFODNN7EXAMPLE` / `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`, and a fake internal AI key `internal-ai-key-0000-FAKE`. Also a committed `.env`. | Mobile M1 / Web Cryptographic failures |
| V06 | Vulnerable dependency | `lodash` pinned to exactly `4.17.15`, used in a real code path (V03) | Web Supply chain |
| V07 | Unrestricted file upload | No type, extension or size limits, original filename kept, `/uploads` served statically | Web Insecure design |
| V08 | No abuse protection | No rate limiting or lockout on login, checkout and AI; distinct login error messages | API4, API6 |
| V09 | Security misconfiguration | No security headers (no helmet), `x-powered-by` on, CORS reflecting any origin, stack traces in error responses | Web Misconfiguration |
| V10 | Stored XSS | Descriptions stored raw, rendered with `dangerouslySetInnerHTML` | Web Injection |
| V11 | Business logic flaw | Checkout trusts client `unitPrice` / `total`, accepts zero or negative quantity | API6, Web Insecure design |
| V12 | Logging failures | Request bodies (including passwords) logged, no logging of failed logins, admin actions or access denials | Web Logging and alerting failures |
| V13 | LLM risks | Unseparated prompt (injection), system prompt with internal notes and fake key (disclosure), tools without per-user authorization (excessive agency), output rendered as HTML (insecure output handling), no usage limits | LLM01, LLM02, LLM05, LLM06, LLM10 |
| V14 | SSRF | `POST /api/listings/import-image` fetches any URL server-side, follows redirects | API7 |
| V15 | Weak password storage | Passwords hashed with unsalted MD5 | Web Cryptographic failures |
| V16 | Insecure container setup | Runs as root, EOL base image `node:18`, `npm install` with dev dependencies, `.env` copied into the image, Postgres port 5432 published to the host with default credentials | Web Misconfiguration |
| M01 | Insecure data storage | JWT in plain AsyncStorage | Mobile M9 |
| M02 | Insecure communication | Cleartext HTTP allowed, no certificate pinning | Mobile M5 |
| M03 | Credential and logging leakage | Hardcoded fake API key in app config, tokens and responses logged with `console.log` | Mobile M1, M6 |
| M04 | Unvalidated deep link and WebView | Deep link opens a JS-enabled WebView on an unvalidated URL | Mobile M4 |
```[cite: 1]