# Phase 0 Research & Technical Decisions: User Authentication and Role-Based Access Control

**Feature**: `002-user-access-management`  
**Date**: 2026-11-06  
**Status**: Completed  

---

## 1. Authentication & Session Management Strategy

### Decision
Use lightweight, stateless JWT tokens signed with `jose` stored in an `httpOnly`, `SameSite=Lax`, secure cookie named `session_token`, managed via Next.js 14 Edge Middleware and server-side route handlers.

### Rationale
- **Already present in repository**: `jose` and `bcryptjs` are already dependencies in `package.json`.
- **Edge Runtime Compatibility**: `jose` runs seamlessly in Next.js `middleware.ts` (Edge runtime) without Node.js crypto polyfill issues.
- **Zero External Identity Provider Overhead**: Keeps the application self-contained for Vercel deployment with PostgreSQL (Prisma), without requiring external paid auth services.
- **Stateless Verification**: Middleware can verify token integrity, expiration, user ID, email, and role instantaneously on every incoming request without incurring a database roundtrip for every static or asset navigation.

### Alternatives Considered
- *NextAuth.js / Auth.js*: Requires complex adapter configuration, adds multiple dependencies, and introduces breaking v4/v5 migration churn in Next.js 14 App Router.
- *Database-backed sessions*: Incurs a database query per request in middleware, slowing down edge response times in serverless environments.

---

## 2. Route Protection & RBAC Enforcement Matrix

### Decision
Enforce authorization at two complementary layers:
1. **Next.js Edge Middleware (`src/middleware.ts`)**: Fast boundary defense that intercepts unauthorized URL visits and redirects unauthenticated users to `/login`, and redirects restricted users (`SALES_CLERK`) attempting to access administrative routes (`/control-precios`, `/resumen-ganancias`, `/punto-equilibrio`, `/registro-ventas`, `/usuarios`) directly to `/lista-precios`.
2. **Server-Side API Route Protection (`src/lib/auth.ts`)**: Route-level session verification verifying token and user role before executing any database query or mutation.

### Access Control Matrix

| Role | Role Name / Label | Allowed Pages | Prohibited Pages | Allowed APIs | Prohibited APIs |
|---|---|---|---|---|---|
| **ADMIN** | Master / Administrador General | All (`/`, `/control-precios`, `/lista-precios`, `/registro-ventas`, `/punto-equilibrio`, `/resumen-ganancias`, `/usuarios`) | None | All (`/api/rates`, `/api/products`, `/api/sales`, `/api/break-even`, `/api/dashboard`, `/api/users`) | None |
| **MANAGER** | Gerente Comercial | All except `/usuarios` | `/usuarios` | All except `/api/users` | `/api/users` (read/write) |
| **SALES_CLERK** | Vendedor / Lista de Precios | `/lista-precios` strictly | `/control-precios`, `/resumen-ganancias`, `/punto-equilibrio`, `/registro-ventas`, `/usuarios` | `GET /api/products` (sanitized projection only), `GET /api/rates`, `GET /api/auth/me` | `/api/products` (write), `/api/rates` (write), `/api/sales`, `/api/break-even`, `/api/dashboard`, `/api/users` |

### Alternatives Considered
- *Client-only guards (React useEffect)*: Rejected because client-side redirects flash protected content and allow data extraction via network tab inspection.
- *Permission strings array*: Overkill for a 3-tier retail system; enum-based role hierarchy (`ADMIN`, `MANAGER`, `SALES_CLERK`) perfectly satisfies the specification.

---

## 3. Data Sanitization & Zero Cost/Margin Leakage for Restricted Role

### Decision
Sanitize product payloads returned to the frontend based on the authenticated caller's role:
- When a `SALES_CLERK` calls `GET /api/products` or views `/lista-precios`, the backend calculates and delivers only:
  - `id`, `sku`, `name`, `brand`, `model`, `category`, `unitOfMeasure`
  - `bcvPriceUsd`, `salePriceBs`, `promoPriceUsd`, `promoPriceUsd2`
- Sensitive fields (`supplierCostUsd`, `targetMarginPercentage`) are strictly stripped and set to null/omitted before the JSON payload is dispatched.

### Rationale
- Fulfills **FR-011** and **SC-005**: 0% of confidential financial indicators (supplier costs, profit margins) are visible or retrievable in the Price List Viewer role, preventing network payload sniffing via DevTools.

### Alternatives Considered
- *Calculating prices entirely on client*: Rejected because it requires sending raw `supplierCostUsd` and `targetMarginPercentage` to the client browser, directly violating security requirements.

---

## 4. Master Account Deletion & Lockout Prevention Guardrail

### Decision
Implement strict transactional verification on user deletion, deactivation, and role modification:
- Count active users with role `ADMIN`: `prisma.user.count({ where: { role: 'ADMIN', active: true } })`.
- If active admin count ≤ 1 and the target user is currently an `ADMIN`, and the operation attempts to delete, deactivate, or change their role away from `ADMIN`, reject the request with HTTP 400: `"No es posible eliminar o degradar la única cuenta de Administrador activa."`

### Rationale
- Fulfills **FR-009** and **SC-006**: Guarantees system resilience against accidental total administrative lockout.

---

## 5. Bootstrap & Initial Seed Workflow

### Decision
1. In `scripts/seed-from-excel.ts` (and during application initialization if zero users exist), ensure an initial Master user is seeded:
   - Email/Username: `admin@mercantilmariana.com`
   - Role: `ADMIN`
   - Name: `Administrador General`
   - Initial Password: `admin123` (hashed with bcrypt cost factor 10)
2. Provide pre-seeded test accounts for testing and evaluation (`vendedor@mercantilmariana.com` with role `SALES_CLERK`).

### Rationale
- Ensures clean out-of-the-box bootstrapping on both fresh databases and existing deployments.
