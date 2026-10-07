# Stack (do not substitute)
- API: Node.js, Express 4, plain JavaScript (CommonJS), no TypeScript
- Database: PostgreSQL 15 with the `pg` driver, plain SQL, NO ORM
- Auth: jsonwebtoken (HS256)
- Uploads: multer. HTTP client: axios. Logging: morgan plus a small custom logger
- Utilities: lodash (version pinned in docs/VULN_REGISTRY.md)
- Web: React 18, Vite, React Router, axios
- Mobile: Expo (React Native), @react-native-async-storage/async-storage, react-native-webview
- Tests: Jest and Supertest, HAPPY-PATH FUNCTIONAL TESTS ONLY
- Runtime: Docker Compose (api, web, db). `docker compose up` must start everything.

# Conventions
- Small files, simple readable code, one responsibility per file. Students must be able to explain every line.
- Layers: routes -> controllers -> services -> db. Config in config/.
- Input validation with `zod` on every endpoint EXCEPT where docs/VULN_REGISTRY.md says otherwise.