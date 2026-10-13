# Test Organization (MANDATORY)

## Rule
For EVERY feature added or modified, the agent MUST generate:
1. Unit tests
2. Integration tests
3. Security tests
No task is complete until all three exist and pass.

## Structure
tests/<feature>/
├── unit/          # Services, utils, mappers. DAO mocked. No DB, no HTTP.
├── integration/   # Routes through Supertest with a real test DB.
└── security/      # Attack scenarios specific to the feature.

## Splitting rule
- One test file per module or per endpoint. Never one giant test file.
- If a feature has more than 3 test files, they stay grouped in its feature folder.
- File naming: <module>.test.js (kebab-case). Mirror the source name:
  src/services/auth.service.js -> tests/auth/unit/auth.service.test.js
- Shared helpers go in tests/helpers/ only. Never duplicate setup code.

## Unit tests (per service / util / DTO mapper)
- Nominal case, each business rule branch, each AppError thrown.
- Ownership rules: owner allowed, non-owner rejected.
- DTO mappers: sensitive fields (passwordHash, token hash) are absent from output.

## Security tests (per feature, at least the applicable ones)
- Authentication: no token (401), expired, forged, alg=none, wrong signature.
- Authorization: wrong role (403) on every endpoint, deny-by-default check.
- IDOR: user A accesses/modifies/deletes user B's resource (403/404).
- Mass assignment: unknown fields and role/id/ownerId in body are ignored or rejected.
- Injection: SQL payloads in query, params and body; no 500, no data leak.
- XSS payloads in text fields: stored raw, length-limited, never executed.
- Rate limit: brute force returns 429.
- Information leak: no stack trace, no SQL detail, no sensitive field in responses or logs.
- Input limits: oversized body (> 10kb), oversized pagination limit, invalid UUID.
- Upload (if applicable): bad MIME, fake extension, wrong magic bytes, > 5 MB.

## Rules
- Security tests assert the SECURE behavior. A failing security test is a bug to fix, never a test to delete or loosen.
- Tests must be independent of execution order; each test creates its own data.
- Minimum 80% coverage on services/ and middlewares/.
- Never mock the security middlewares (authenticate, authorize) in integration or security tests.
- Test names describe behavior: "returns 403 when a buyer calls POST /products".

## Scripts (package.json)
- npm run test:unit        -> jest tests/**/unit
- npm run test:integration -> jest tests/**/integration
- npm run test:security    -> jest tests/**/security
- npm test                 -> all, with coverage