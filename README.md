# Tastes of Organic 🌿

A production-grade full-stack MERN e-commerce application for natural and organic goods, featuring recurring subscriptions, PhonePe payment gateway integration with cryptographic S2S callback verification, atomic inventory management, and role-based access control.

[![CI](https://github.com/<your-org>/tastes-of-organic/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-org>/tastes-of-organic/actions/workflows/ci.yml)

---

## Table of Contents

- [Architecture](#architecture)
- [Feature Highlights](#feature-highlights)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Running Tests](#running-tests)
- [Docker & Containerization](#docker--containerization)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Model](#security-model)
- [Order & Payment Flow](#order--payment-flow)

---

## Architecture

```
Frontend (React 19 + Vite 7)
  ↓ Axios + Bearer JWT
Express 5 API (Node.js ESM)
  ├── Rate Limiting (per route)
  ├── Correlation IDs (X-Request-ID)
  ├── Zod Validation Middleware
  ├── JWT Auth Middleware → bcryptjs 12-round verification
  ├── RBAC Middleware (USER / ADMIN)
  └── Controllers → Services → Mongoose 9 → MongoDB
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7 (React Compiler), Redux Toolkit, Tailwind CSS, React Router v7 |
| **Backend** | Node.js 22 (ES modules), Express 5 |
| **Database** | MongoDB via Mongoose 9 |
| **Auth** | JWT (7-day), bcryptjs 12 rounds + auto legacy migration, Google OAuth 2.0 |
| **Payments** | PhonePe (sandbox) — redirect flow + S2S SHA-256 callback verification |
| **Validation** | Zod schema validation middleware on all routes |
| **Email** | Nodemailer + Gmail App Password for OTP delivery |
| **Security** | Helmet, CORS whitelist, Express rate limiting, Express Mongo Sanitize |
| **Container** | Docker multi-stage builds + Docker Compose + Nginx (frontend) |
| **CI** | GitHub Actions (test + lint + build on every push/PR) |

---

## Feature Highlights

### Security
- **PhonePe SHA-256 Callback Verification** — All S2S payment callbacks verify `X-VERIFY` headers before mutating order/subscription state. Forged callbacks are rejected with `401 INVALID_SIGNATURE`.
- **RBAC** — Product creation and update routes require `ADMIN` role via `authorize("ADMIN")` middleware.
- **Zod Validation** — All request bodies, query parameters, and route params are validated and sanitized at the middleware layer before reaching controllers.
- **Rate Limiting** — Auth routes: 20 req/15m. OTP endpoints: 5 req/15m. Payment endpoints: 30 req/15m. General API: 200 req/15m.
- **NoSQL Injection Defense** — `express-mongo-sanitize` strips `$` operators from all request bodies and query strings.
- **Sensitive Field Exclusion** — User profile queries explicitly exclude `password`, `resetOtp`, `resetOtpExpiry`, and `resetOtpVerified`.

### E-Commerce Correctness
- **Atomic Inventory Management** — Stock is validated on `addToCart`, `placeOrder`, and decremented atomically via `$inc` with `$gte` condition on payment. Race conditions cannot oversell.
- **Order State Machine** — Legal transitions only: `placed → processing → shipped → delivered` and `placed/processing → cancelled`. State changes violating the machine are rejected with `400 INVALID_STATUS_TRANSITION`.
- **Checkout Idempotency** — Duplicate order submissions within 60 seconds return the existing pending order instead of creating duplicates.
- **Cart Data Isolation** — Cart is stored in a dedicated `Cart` collection (not embedded in `User`), eliminating write contention. On-the-fly migration from legacy embedded carts is handled transparently.

### Observability
- **Structured Logging** — All logs go through `logger.js` with timestamps, log levels, and request correlation IDs. JSON format in production.
- **Request Logger** — Every HTTP request logs `method`, `url`, `status`, `durationMs`, and `X-Request-ID`.
- **Readiness Probes** — `GET /health` and `GET /api/health` report MongoDB connection state, system uptime, heap memory, and API version. Returns `503` if DB is disconnected in production.
- **Process Guards** — `unhandledRejection` and `uncaughtException` process listeners log stack traces via `logger.error` and initiate graceful connection draining.

---

## Repository Structure

```text
tastes-of-organic/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection with retry logic
│   │   └── env.js              # Fail-fast env validation on startup
│   ├── constants/
│   │   └── orderStatus.js      # Order lifecycle state machine
│   ├── controllers/            # Thin route handlers (asyncHandler wrapped)
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification → req.user
│   │   ├── authorize.middleware.js  # RBAC: authorize('ADMIN')
│   │   ├── error.middleware.js # Centralized error normalizer
│   │   └── validate.middleware.js   # Zod schema validation
│   ├── models/
│   │   ├── Cart.js             # Dedicated Cart collection (indexed)
│   │   ├── Order.js            # Order with state machine status
│   │   ├── Product.js          # Full-text + compound indexes
│   │   ├── Review.js           # Compound unique index (product+user)
│   │   ├── Subscription.js
│   │   └── User.js
│   ├── routes/                 # RESTful route definitions with validation
│   ├── services/
│   │   ├── cart.service.js     # Cart CRUD + transparent migration
│   │   ├── inventory.service.js  # Atomic stock validation & decrement
│   │   └── payment.service.js  # PhonePe initiation, status, checksum
│   ├── tests/                  # node --test native test runner
│   │   ├── appError.test.js
│   │   ├── authService.test.js
│   │   ├── authorize.test.js
│   │   ├── cart.test.js
│   │   ├── integration.test.js # Live HTTP integration tests
│   │   ├── orderStatus.test.js
│   │   ├── pagination.test.js
│   │   ├── signature.test.js
│   │   └── validation.test.js
│   ├── utils/
│   │   ├── AppError.js         # Custom operational error class
│   │   ├── asyncHandler.js     # Async try/catch wrapper
│   │   └── logger.js           # Structured logger (JSON in production)
│   ├── validators/             # Zod schemas per domain
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile              # Multi-stage production image
│   ├── app.js                  # Express setup + middleware pipeline
│   └── server.js               # Server bootstrap + graceful shutdown
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application views
│   │   ├── redux/              # Redux Toolkit slices
│   │   └── services/           # Axios client + interceptors
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile              # Multi-stage: Node build → Nginx serve
│   └── nginx.conf              # SPA routing + asset caching
├── .gitignore
├── docker-compose.yml          # Full-stack local container setup
├── package.json                # Monorepo convenience scripts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 22+ (or 18+)
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Gmail account with a [16-character App Password](https://myaccount.google.com/apppasswords) for OTP emails

### 1. Clone & install

```bash
git clone https://github.com/<your-org>/tastes-of-organic.git
cd tastes-of-organic
```

### 2. Backend Setup

```bash
cd backend

# Copy and fill in environment variables
cp .env.example .env

# Install dependencies
npm install

# Run all tests (54 tests, 14 suites)
npm test

# Start development server (nodemon)
npm run dev
```

Backend starts on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend

# Copy and fill in environment variables
cp .env.example .env

# Install dependencies
npm install

# Run linter
npm run lint

# Start Vite dev server
npm run dev
```

Frontend starts on `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `MONGO_URI` | MongoDB connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars, random) | `openssl rand -hex 32` |
| `PHONEPE_MERCHANT_ID` | PhonePe Merchant ID | From PhonePe dashboard |
| `PHONEPE_SALT_KEY` | PhonePe API Salt Key | From PhonePe dashboard |
| `PHONEPE_SALT_INDEX` | PhonePe Salt Index | `1` |
| `PHONEPE_BASE_URL` | PhonePe gateway URL | `https://api-preprod.phonepe.com/apis/pg-sandbox` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `BACKEND_URL` | Backend URL for PhonePe callbacks | `http://localhost:5000` |
| `EMAIL_USER` | Gmail address for OTP emails | `you@gmail.com` |
| `EMAIL_PASS` | 16-char Gmail App Password | From Google Account settings |
| `LOG_LEVEL` | Logging verbosity | `debug` / `info` / `warn` / `error` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | From Google Cloud Console |

---

## API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Register with name, email, password |
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `POST` | `/api/auth/google` | — | Google OAuth login |
| `POST` | `/api/auth/forgot-password` | — | Send OTP to email (rate limited: 5/15m) |
| `POST` | `/api/auth/verify-otp` | — | Verify OTP (rate limited: 5/15m) |
| `POST` | `/api/auth/reset-password` | — | Reset password with verified OTP |
| `GET` | `/api/products` | — | List products (paginated, filterable, searchable) |
| `GET` | `/api/products/:id` | — | Get product + reviews |
| `POST` | `/api/products` | ADMIN | Create product |
| `PUT` | `/api/products/:id` | ADMIN | Update product |
| `GET` | `/api/cart` | USER | Get cart with totals |
| `POST` | `/api/cart/add` | USER | Add item to cart |
| `PUT` | `/api/cart/update` | USER | Update item quantity |
| `DELETE` | `/api/cart/remove/:productId` | USER | Remove item from cart |
| `DELETE` | `/api/cart/clear` | USER | Clear entire cart |
| `POST` | `/api/orders/place` | USER | Place order (idempotent, 60s window) |
| `GET` | `/api/orders` | USER | Get user orders (paginated) |
| `GET` | `/api/orders/:id` | USER | Get single order |
| `PATCH` | `/api/orders/:id/cancel` | USER/ADMIN | Cancel order + restore stock |
| `PATCH` | `/api/orders/:id/status` | ADMIN | Update order status (state machine) |
| `POST` | `/api/payment/initiate` | USER | Initiate PhonePe payment |
| `POST` | `/api/payment/phonepe-callback` | — | PhonePe S2S callback (signature verified) |
| `GET` | `/api/payment/status/:orderId` | USER | Poll payment status |
| `POST` | `/api/subscriptions/create` | USER | Create subscription + initiate payment |
| `GET` | `/api/subscriptions` | USER | Get user subscriptions |
| `POST` | `/api/subscriptions/phonepe-callback` | — | PhonePe S2S callback for subscriptions |
| `GET` | `/api/subscriptions/status/:id` | USER | Poll subscription payment status |
| `PATCH` | `/api/subscriptions/:id/cancel` | USER | Cancel active subscription |
| `GET` | `/health` | — | Readiness probe (DB + memory + uptime) |
| `GET` | `/api/health` | — | Alias for `/health` |

---

## Running Tests

```bash
# Run from backend directory
cd backend
npm test

# Or from project root
npm test
```

The native Node.js test runner (`node --test`) runs **54 tests across 14 suites** without any additional test framework dependencies:

| Suite | Tests | Description |
|-------|-------|-------------|
| `AppError` | 2 | Custom error class behavior |
| `Auth Primitives` | 5 | bcryptjs 12-round hashing, OTP, JWT |
| `Authorize Middleware` | 3 | RBAC allow/deny/missing-user |
| `Cart Service` | 4 | Pricing, delivery threshold, null products |
| `HTTP Integration` | 13 | Live HTTP tests against ephemeral server |
| `Order State Machine` | 2 | Legal/illegal state transitions |
| `Inventory Service` | 3 | Stock validation, AppError on insufficient |
| `PhonePe Payment Service` | 2 | Checksum generation & verification |
| `Pagination Logic` | 6 | Bounds clamping, skip math, canonicalization |
| `PhonePe Callback Verification` | 4 | Valid/forged/tampered/null signature cases |
| `Validation Middleware` | 2 | Zod pass/fail |
| `Auth Validators` | 3 | Registration, password policy, OTP format |
| `Cart & Order Validators` | 3 | ObjectId, action verbs, shipping address |
| `Product Validator` | 2 | Category enum, price validation |

---

## Docker & Containerization

### Run with Docker Compose (Full Stack)

```bash
# Copy environment file
cp backend/.env.example backend/.env
# Fill in your secrets in backend/.env

# Build and start all services
docker compose up --build

# Or using the root script
npm run docker:up
```

Services:
- **MongoDB** → `localhost:27017`
- **Backend API** → `http://localhost:5000`
- **Frontend (Nginx)** → `http://localhost:80`

```bash
# Stop and remove containers
npm run docker:down

# Stream logs from all services
npm run docker:logs
```

### Build Individual Images

```bash
# Backend
docker build -t tastes-backend ./backend

# Frontend (pass Vite env vars as build args)
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com/api \
  --build-arg VITE_GOOGLE_CLIENT_ID=your_client_id \
  -t tastes-frontend ./frontend
```

---

## CI/CD Pipeline

The [GitHub Actions workflow](.github/workflows/ci.yml) runs on every push to `main`/`master`/`develop` and on all pull requests:

```
push / pull_request
├── backend-test
│   ├── npm ci
│   └── npm test (54 tests, node --test, ~3s)
└── frontend-build
    ├── npm ci
    ├── npm run lint (ESLint, 0 errors)
    └── npm run build (Vite, 1863 modules)
```

Both jobs run in parallel. The CI uses Node.js 22 on `ubuntu-latest`.

---

## Security Model

### Authentication Flow

```
POST /api/auth/login
  → Zod validates { email, password }
  → User.findOne({ email })
  → bcryptjs.compare(password, user.password)
  → if bcrypt.getRounds(hash) < 12: re-hash to 12 rounds (transparent upgrade)
  → jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
```

### Request Authorization Flow

```
Any protected route
  → protect middleware: extracts Bearer token
  → jwt.verify(token, JWT_SECRET)
  → User.findById(decoded.id).select('-password -resetOtp ...')
  → req.user = user
  → [optionally] authorize('ADMIN'): checks req.user.role
  → Controller
```

### PhonePe Payment Security

```
POST /api/payment/phonepe-callback
  → Extract X-VERIFY header
  → SHA256(base64(response) + "/pg/v1/pay" + PHONEPE_SALT_KEY) + ### + SALT_INDEX
  → Compare to X-VERIFY (constant-time)
  → On mismatch: 401 INVALID_SIGNATURE (logged as security event)
  → On match: update order paymentStatus, decrement stock atomically
```

---

## Order & Payment Flow

```
1. User adds items to cart (stock validated)
2. POST /api/orders/place → creates Order (status: placed, paymentStatus: pending)
3. POST /api/payment/initiate → creates PhonePe session → returns redirect URL
4. User completes payment on PhonePe page
5. PhonePe → POST /api/payment/phonepe-callback (signature verified)
   → Order.paymentStatus = 'paid'
   → Stock decremented atomically ($inc with $gte)
   → Cart cleared
6. Frontend polls GET /api/payment/status/:orderId for confirmation
```

Subscription flow mirrors the above but uses `/api/subscriptions/create` and `/api/subscriptions/phonepe-callback`.
