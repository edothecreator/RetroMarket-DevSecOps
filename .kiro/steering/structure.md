# Layered Architecture (backend/src)
Strict flow: route -> middleware -> controller -> service -> dao -> model

## Layer Tree

backend/src/
├── routes/
│   ├── Role: declares endpoints, chains auth + authorize + validate
│   └── PROHIBITED: business logic
├── middlewares/
│   ├── Role: auth, rbac, validate, rateLimit, errorHandler, upload
│   └── PROHIBITED: direct DB access
├── dto/
│   ├── Role: Joi input schemas + output mappers (field whitelisting)
│   └── PROHIBITED: business logic
├── controllers/
│   ├── Role: reads req, calls service, formats res (HTTP only)
│   └── PROHIBITED: SQL, business rules
├── services/
│   ├── Role: business logic, ownership rules, orchestration
│   └── PROHIBITED: req/res, SQL
├── dao/
│   ├── Role: the only layer that talks to Sequelize
│   └── PROHIBITED: business rules
├── models/
│   ├── Role: schema and association definitions
│   └── PROHIBITED: logic
└── utils/
    ├── Role: pure functions (hash, token, logger, AppError)
    └── PROHIBITED: global state

# Rules
├── Files
│   └── One file per resource per layer:
│       product.routes.js, product.controller.js, product.service.js,
│       product.dao.js, product.dto.js
├── Responses
│   └── A controller NEVER returns a raw model object:
│       always go through a DTO mapper (never expose passwordHash)
├── Errors
│   ├── Services: throw new AppError(status, code, message)
│   ├── The global errorHandler formats the response
│   └── Format: { "error": { "code": "PRODUCT_NOT_FOUND", "message": "..." } }
├── API
│   └── Versioned: /api/v1/...
└── Features
    └── Each feature = migration + model + dao + service + controller + routes + dto + tests