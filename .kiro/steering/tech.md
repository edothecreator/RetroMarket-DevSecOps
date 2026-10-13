# Stack (NEVER SUBSTITUTE)

## Technology Tree
retromarket/
├── API
│   ├── Runtime: Node.js (LTS)
│   ├── Framework: Express 4
│   ├── Language: JavaScript CommonJS (require / module.exports)
│   └── PROHIBITED: TypeScript, ESM
├── Database
│   ├── Engine: PostgreSQL 15
│   ├── ORM: Sequelize 6
│   └── Migrations: sequelize-cli
├── Web
│   ├── Library: React 19
│   ├── Build tool: Vite
│   ├── Routing: React Router
│   └── HTTP client: axios
├── Mobile
│   ├── Framework: Expo (React Native)
│   ├── Storage: @react-native-async-storage/async-storage
│   └── WebView: react-native-webview
├── Tests
│   ├── Runner: Jest
│   └── HTTP testing: Supertest
└── Runtime
    ├── Orchestration: Docker Compose (api, web, db)
    └── Rule: `docker compose up` must start everything

# Allowed Libraries (API side)
backend/
├── Security
│   ├── helmet
│   ├── cors
│   ├── express-rate-limit
│   └── hpp
├── Authentication
│   ├── bcrypt (argon2 accepted)
│   ├── jsonwebtoken
│   └── cookie-parser
├── Validation
│   └── joi
├── Logging
│   └── pino
├── Upload
│   └── multer
├── Configuration
│   └── dotenv
└── Database
    ├── sequelize
    └── pg

New dependency rule
└── Any new dependency requires a justification in the PR and a clean `npm audit`

# Conventions
├── Naming
│   ├── camelCase: variables / functions
│   ├── PascalCase: models
│   └── kebab-case: files -> product.service.js
├── Async
│   └── async/await only, never nested callbacks
├── Logging
│   └── No console.log: use utils/logger.js
├── Config
│   ├── Only through process.env, centralized in src/config/env.js
│   └── Must fail at startup if a variable is missing
└── Code quality
    └── ESLint + Prettier are mandatory