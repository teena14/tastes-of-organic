# Tastes of Organic — Production-Grade Refactoring Plan

## A. Current Architecture

### Backend
- **Runtime**: Node.js + Express 5 (ES modules)
- **Database**: MongoDB via Mongoose 9
- **Auth**: JWT (7-day expiry), bcryptjs hashing, Google OAuth via access-token verification
- **Payment**: PhonePe (sandbox) — redirect-based flow with S2S callback
- **Email**: Nodemailer + Gmail for password-reset OTP
- **Structure**: Flat — controllers talk directly to models, no service/repository layer
- **Security**: Helmet, CORS whitelist, express-rate-limit (auth + global), express-mongo-sanitize, 10kb body limit

### Frontend
- **Framework**: React 19 + Vite 7 with React Compiler (babel plugin)
- **State**: Redux Toolkit (auth, cart, wishlist, subscription slices)
- **Routing**: react-router-dom v7 with lazy-loaded pages + `ProtectedRoute`
- **Styling**: Tailwind CSS 3 + heavy inline styles in page components
- **API**: Centralized Axios instance ([api.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/frontend/src/services/api.js)) + function exports ([apiClient.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/frontend/src/services/apiClient.js))
- **Auth**: Token stored in `localStorage`, loaded into Redux on boot

### Data Flow
```
Frontend (Axios + Bearer token)
  → Express Route
    → auth.middleware (JWT verify + User.findById)
      → Controller (business logic + DB calls mixed together)
        → Mongoose Model
          → MongoDB
```

---

## B. Problems Found

### CRITICAL

| # | Problem | Location | Why It Matters |
|---|---------|----------|----------------|
| C1 | **No inventory/stock check on order placement** | [order.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/order.controller.js) | Orders can be placed for out-of-stock products. Stock is never decremented. Overselling is guaranteed. |
| C2 | **No stock decrement at all** | Entire backend | The `stock` field on Product exists but is never read or updated during the order flow. It's purely decorative. |
| C3 | **Race condition on order creation** | [order.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/order.controller.js) | Even when stock checks are added, read-then-write without atomicity will allow concurrent overselling. |
| C4 | **No admin authorization** | [product.routes.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/routes/product.routes.js#L17-L18) | `createProduct` and `updateProduct` only require `protect` (authenticated). Any logged-in user can create/update products. Comment says "will add role middleware later" — never done. |
| C5 | **PhonePe callback has no signature verification** | [payment.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/payment.controller.js#L71-L96) | The S2S callback blindly trusts the payload. An attacker can forge a callback to mark any order as "paid" without actually paying. |
| C6 | **Subscription callback also has no signature verification** | [subscription.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/subscription.controller.js#L104-L123) | Same vulnerability as C5. |
| C7 | **No centralized error handling** | All controllers | Every controller has its own try/catch that catches all errors and returns 500. Mongoose validation errors, cast errors, and actual server errors are all treated identically. |

### HIGH

| # | Problem | Location | Why It Matters |
|---|---------|----------|----------------|
| H1 | **No input validation** | All controllers | Request bodies are never validated. `createProduct` passes `req.body` directly to `Product.create()`. Registration doesn't validate email format or password strength. |
| H2 | **User profile leaks password hash** | [user.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/user.controller.js#L7) | `getUserProfile` calls `User.findById(userId)` without `.select("-password")`, returning the hashed password to the frontend. |
| H3 | **Cart embedded in User document** | [User.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/models/User.js#L52-L66) | Cart is a sub-array on the User document. Every cart mutation triggers a full User document save, creating write contention on the User collection. Also limits cart operations and atomicity. |
| H4 | **Wishlist embedded in User document** | [User.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/models/User.js#L34-L40) | Same sub-document bloat issue as H3. |
| H5 | **Order status enum is incomplete** | [Order.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/models/Order.js#L53-L56) | Missing `cancelled` status. No state transition validation. Any status can change to any other status. |
| H6 | **Duplicate "JUICE" and "JUICES" category** | [Product.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/models/Product.js#L26-L27) | The enum has both `JUICE` and `JUICES`, inviting data inconsistency. |
| H7 | **No .env.example** | Root | No documentation of required environment variables. New developers must reverse-engineer the codebase. |
| H8 | **JWT token never expires in practice** | [auth.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/auth.controller.js#L9) | 7-day expiry with no refresh mechanism. Token stored in localStorage (XSS-accessible). No logout invalidation. |
| H9 | **No graceful shutdown** | [server.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/server.js) | Server doesn't handle SIGTERM/SIGINT. In-flight requests will be killed abruptly on deployment. |
| H10 | **No idempotency on checkout** | Checkout flow | User can click "Pay" multiple times, creating multiple orders and payment sessions. Frontend only disables the button via state, which is easily bypassed. |
| H11 | **401 handler in request interceptor instead of response** | [api.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/frontend/src/services/api.js#L19-L26) | The 401 redirect logic is in the *request* error handler. It should be in a *response* interceptor. It will never fire correctly for 401 responses. |
| H12 | **Broken `.gitignore`** | [backend/.gitignore](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/.gitignore) | File has null bytes / corrupt encoding. `node_modules` is not properly gitignored. |

### MEDIUM

| # | Problem | Location | Why It Matters |
|---|---------|----------|----------------|
| M1 | **No database indexes** | All models | No explicit indexes on `category`, `createdAt`, `user` (on Orders), `product+user` (on Reviews). Queries will slow as data grows. |
| M2 | **No pagination on orders** | [order.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/order.controller.js#L80-L81) | `getUserOrders` returns ALL orders for a user with no limit. |
| M3 | **Default pagination limit is 50** | [product.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/product.controller.js#L38) | Limit defaults to 50 with no max cap. Client can send `limit=100000`. |
| M4 | **No consistent API response structure** | All controllers | Some return `{ success, data }`, some `{ success, cart }`, some `{ success, order }`, some `{ message }`. |
| M5 | **Duplicated PhonePe logic** | [payment.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/payment.controller.js) + [subscription.controller.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/controllers/subscription.controller.js) | PhonePe checksum generation, payment initiation, and status checking are copy-pasted across two controllers. |
| M6 | **Images are just string arrays** | [Product.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/models/Product.js#L38-L42) | No structure for `publicId`, `alt`, or image metadata. Not ready for Cloudinary. |
| M7 | **No request correlation IDs** | Backend | No way to trace a request through logs. |
| M8 | **Console.log/error used for all logging** | All controllers | No structured logging. Raw errors logged including potentially sensitive data. |
| M9 | **No tests at all** | Entire project | Zero unit, integration, or e2e tests. Backend `test` script just echoes "Error: no test specified". |
| M10 | **Root package.json has misplaced dependencies** | [root/package.json](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/package.json) | Root has bcryptjs, mongoose, razorpay etc. as dependencies. These belong in backend only. Also has tailwindcss in devDependencies at root level. |
| M11 | **No review creation/deletion endpoints** | Backend | Review model exists but no controller or routes to create reviews. |
| M12 | **Frontend pages are massive** | `frontend/src/pages/` | Pages like Product.jsx (38KB), Shop.jsx (24KB), Login.jsx (22KB) contain all UI logic, styles, and API calls in single monolithic components. |
| M13 | **`razorpay` dependency unused** | [backend/package.json](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/package.json#L28) + [config/razorpay.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/config/razorpay.js) | Razorpay is configured but never used — payment is via PhonePe. Dead code. |
| M14 | **Both `bcrypt` and `bcryptjs` installed** | [backend/package.json](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/package.json#L17-L18) | Two hashing libraries. Only `bcryptjs` is used. `bcrypt` (native) is dead weight. |

### LOW

| # | Problem | Location | Why It Matters |
|---|---------|----------|----------------|
| L1 | **No README content** | [README.md](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/README.md) | Just contains `# tastes-of-organic`. No setup instructions, architecture docs, or API docs. |
| L2 | **Blog data hardcoded in frontend** | [constants.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/frontend/src/constants.js#L41-L162) | Blog posts are static constants. Fine for now, but not extensible. |
| L3 | **No Docker configuration** | Root | Application cannot be containerized without manual setup. |
| L4 | **No CI/CD pipeline** | Root | No GitHub Actions or equivalent. |
| L5 | **Health endpoint lacks readiness check** | [app.js](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/backend/app.js#L87) | Returns `{ status: "ok" }` without checking DB connectivity. |
| L6 | **Footer is empty** | [Footer.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/tech_files/tastes-of-organic/frontend/src/components/Footer.jsx) | 253 bytes — likely placeholder. |

---

## C. Proposed Target Architecture

### Backend Structure
```
backend/src/
├── config/
│   ├── database.js          # MongoDB connection + event handling
│   ├── env.js               # Environment validation + export
│   └── phonepe.js           # PhonePe client config
│
├── constants/
│   ├── errorCodes.js        # Centralized error codes
│   ├── orderStatus.js       # Order state machine
│   └── httpStatus.js        # HTTP status constants
│
├── controllers/
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   ├── subscription.controller.js
│   ├── user.controller.js
│   ├── wishlist.controller.js
│   └── review.controller.js
│
├── services/
│   ├── auth.service.js       # Password hashing, token gen, OTP
│   ├── product.service.js    # Product queries, search
│   ├── cart.service.js       # Cart operations
│   ├── order.service.js      # Order creation, state transitions
│   ├── payment.service.js    # PhonePe integration (shared)
│   ├── subscription.service.js
│   ├── email.service.js      # Nodemailer abstraction
│   └── inventory.service.js  # Atomic stock operations
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js              # [NEW] Separate cart collection
│   ├── Review.js
│   └── Subscription.js
│
├── routes/
│   └── (same as current, with validation middleware)
│
├── middlewares/
│   ├── auth.middleware.js    # JWT verification
│   ├── authorize.middleware.js  # [NEW] Role-based access
│   ├── error.middleware.js   # [NEW] Centralized error handler
│   ├── validate.middleware.js   # [NEW] Joi/Zod validation
│   ├── requestId.middleware.js  # [NEW] Correlation IDs
│   └── asyncHandler.js      # [NEW] Try/catch wrapper
│
├── validators/
│   ├── auth.validator.js
│   ├── product.validator.js
│   ├── order.validator.js
│   └── cart.validator.js
│
├── utils/
│   ├── AppError.js          # [NEW] Custom error class
│   ├── logger.js            # [NEW] Structured logging
│   └── pagination.js        # [NEW] Pagination helper
│
├── app.js
└── server.js
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular monolith** | Single deployable unit, clear module boundaries, one developer can understand the entire system |
| **Service layer** | Extracts business logic from controllers; controllers become thin request/response handlers |
| **Separate Cart collection** | Eliminates write contention on User document; allows atomic cart operations |
| **Centralized error middleware** | Eliminates duplicated try/catch across 30+ controller methods |
| **Inventory service with atomic updates** | Prevents overselling via `$inc` with `$gte` condition |
| **PhonePe service** | Consolidates duplicated payment code from 2 controllers |
| **Keep MongoDB** | Appropriate for this scale; no justification for changing |
| **Keep JWT in localStorage for now** | Moving to httpOnly cookies is ideal but requires significant frontend refactoring — defer to Phase 2 |

---

## D. Refactoring Roadmap

### Phase 1 — Foundation & Critical Fixes ← **START HERE**
> Fix what's broken and dangerous *today*

- [ ] Add admin authorization middleware (`authorize('ADMIN')`)
- [ ] Protect product create/update with admin-only access
- [ ] Add centralized error handling (AppError + error middleware + asyncHandler)
- [ ] Fix user profile leaking password hash
- [ ] Fix broken `.gitignore`
- [ ] Remove dead dependencies (razorpay, bcrypt)
- [ ] Create `.env.example` for backend and frontend
- [ ] Validate required environment variables on startup
- [ ] Add graceful shutdown to `server.js`
- [ ] Fix frontend 401 response interceptor (move from request to response handler)

### Phase 2 — Security
- [ ] Add PhonePe callback signature verification
- [ ] Add input validation (Joi) for all endpoints
- [ ] Add rate limiting for checkout and payment endpoints
- [ ] Improve password requirements (min length, complexity)
- [ ] Exclude sensitive fields from all user queries
- [ ] Add request correlation IDs
- [ ] Review & tighten CORS for production

### Phase 3 — E-commerce Correctness
- [ ] Implement atomic inventory management (stock check + decrement)
- [ ] Add stock validation on add-to-cart and checkout
- [ ] Add order status state machine (valid transitions only)
- [ ] Add `cancelled` and `failed` order statuses
- [ ] Add idempotency to checkout (prevent duplicate orders)
- [ ] Ensure backend is source of truth for all pricing
- [ ] Handle edge cases: deleted products in cart, price changes before checkout
- [ ] Consolidate PhonePe logic into a shared payment service

### Phase 4 — Architecture & Maintainability
- [ ] Extract service layer from controllers
- [ ] Create Cart as separate collection (migrate from User sub-document)
- [ ] Standardize API response structure across all endpoints
- [ ] Add structured logging (replace console.log/error)
- [ ] Refine pagination (max limit cap, consistent response)
- [ ] Clean up image schema for future Cloudinary support
- [ ] Fix duplicate JUICE/JUICES category

### Phase 5 — Database & Performance
- [ ] Add indexes: `email`, `category`, `createdAt`, `user` (orders), `product+user` (reviews), `phonePeTransactionId`
- [ ] Add pagination to orders endpoint
- [ ] Optimize product queries (projections, lean queries where appropriate)
- [ ] Audit and optimize populate usage

### Phase 6 — Testing
- [ ] Set up Jest + Supertest for backend
- [ ] Unit tests for: inventory logic, order state machine, price calculation, auth service
- [ ] Integration tests for: auth flow, cart operations, order + payment flow
- [ ] Set up frontend testing (Vitest + React Testing Library)

### Phase 7 — Observability & Reliability
- [ ] Structured logging with request IDs
- [ ] Enhanced health check (DB connectivity)
- [ ] Error tracking preparation (Sentry-ready)
- [ ] Basic request metrics

### Phase 8 — CI/CD & Deployment
- [ ] GitHub Actions pipeline (lint → test → build)
- [ ] Docker configuration (backend + frontend)
- [ ] Environment-specific configs (dev / test / production)
- [ ] Documentation (README, ARCHITECTURE, API docs)

### Phase 9 — Scale Preparation (Future)
- [ ] Redis caching layer (products, categories)
- [ ] Cloudinary image integration
- [ ] Review system (create/update/delete)
- [ ] Admin dashboard APIs
- [ ] Audit logging for admin actions

---

## Open Questions

> [!IMPORTANT]
> **Q1**: The `Cart` is currently embedded as a sub-array in the `User` document. Migrating to a separate `Cart` collection is cleaner but requires a data migration script for existing users. Should I proceed with this migration in Phase 4, or keep the embedded cart and just improve the operations?

> [!IMPORTANT]
> **Q2**: The app has both `bcrypt` (native, requires C++ build tools) and `bcryptjs` (pure JS) installed. Only `bcryptjs` is used. I plan to remove `bcrypt` — is that correct, or was there an intent to switch to the native version?

> [!IMPORTANT]
> **Q3**: PhonePe is currently using the sandbox URL (`api-preprod.phonepe.com`). Should I keep this for now and make the base URL environment-configurable, or is there a production PhonePe URL ready?

> [!WARNING]
> **Q4**: The payment callback endpoints (`/api/payment/phonepe-callback` and `/api/subscriptions/phonepe-callback`) have **no signature verification**. This means anyone can forge a POST request to mark orders as paid. I will add checksum verification in Phase 2 — please confirm this is acceptable priority ordering (it's a critical security issue but requires understanding PhonePe's verification spec).

## Verification Plan

### Automated Tests
- `npm test` — Jest + Supertest integration tests after each phase
- `npm run lint` — ESLint on frontend after frontend changes

### Manual Verification
- After Phase 1: Verify login, register, product CRUD, cart, checkout, payment flow all still work
- After Phase 3: Test concurrent order placement, verify stock is decremented atomically
- After each phase: Run the existing app end-to-end in development mode
