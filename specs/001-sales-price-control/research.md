# Research & Technical Architecture: Mercantil Mariana Bi-Monetary Pricing System

**Feature**: `001-sales-price-control`
**Date**: 2026-11-05
**Status**: Completed

## 1. Architecture & Framework Selection

### Decision: Next.js (App Router) with Full-Stack Node.js Architecture
- **Decision**: Adopt Next.js 14+ with App Router (TypeScript), React Server Components, and Route Handlers for API endpoints.
- **Rationale**: 
  - The user explicitly requested Next.js and a Node.js backend deployable on Vercel. Next.js App Router provides seamless co-location of server-side API Route Handlers (`/api/...`) with client UI components, native Vercel optimization, and zero cold-start routing configuration.
  - Full-stack TypeScript guarantees 100% type safety between pricing engine calculation models and front-end state management.
- **Alternatives considered**:
  - Separate Express.js backend + standalone Next.js frontend: Rejected due to unnecessary deployment complexity on Vercel (requiring either multiple projects, custom rewrites, or standalone container hosting).
  - Remix: Rejected because Next.js has native Vercel first-party integration requested by the user.

---

## 2. Database & ORM Strategy

### Decision: PostgreSQL (Neon / Supabase / Vercel Postgres) via Prisma ORM
- **Decision**: Prisma ORM with PostgreSQL client engine optimized for serverless pools (`@prisma/client` + `pg` or `@prisma/adapter-pg`).
- **Rationale**:
  - Relational integrity is vital: Products belong to Categories, Sales refer to Products and Users, Fixed Costs and Exchange Rate logs are strongly typed.
  - Prisma generates type-safe database queries and automated migrations (`npx prisma migrate dev`).
  - Seamlessly runs locally with a local PostgreSQL container or remote connection string (e.g. Neon serverless connection string), and deploys effortlessly to Vercel.
- **Alternatives considered**:
  - Drizzle ORM: Extremely performant, but Prisma provides superior schema declaration clarity and immediate admin visualization (`prisma studio`) which is beneficial for store operators.
  - Raw JSON file storage: Not viable on Vercel serverless functions due to ephemeral read-only filesystem limits in production.

---

## 3. Calculation Engine & Excel Formula Fidelity

### Decision: Pure Functional Calculation Engine with Integer Upward Rounding (`ROUNDUP`)
- **Decision**: Implement the financial formula engine in an isolated, pure TypeScript utility module (`src/lib/pricing-engine.ts`) with 100% unit test coverage against the exact Excel values.
- **Key Formulas**:
  1. `Factor de Cambio`:
     $$Factor = \frac{Tasa\_BCV}{Tasa\_Compra\_Variante}$$
  2. `Costo Unitario Ajustado`:
     $$Costo\_Unitario = \lceil Costo\_Proveedor \times Factor \rceil$$
  3. `Precio BCV ($)`:
     $$Precio\_BCV = \lceil \frac{Costo\_Unitario}{1 - Margen\_Contribucion} \rceil \quad (\text{if } Margen < 1)$$
  4. `Precio de Venta (Bolívares)`:
     $$Precio\_Bs = \lceil Precio\_BCV \times Tasa\_BCV \rceil$$
  5. `Margen Bruto (Bolívares)`:
     $$Margen\_Bruto\_Bs = \lceil Precio\_Bs - (Costo\_Unitario \times Tasa\_BCV) \rceil$$
  6. `Precio Promo en Divisas ($)`:
     $$Promo\_Divisas = \lceil \frac{Precio\_Bs}{Tasa\_Compra\_Variante} \rceil$$
  7. `Precio Promoción en Divisas 2 (con % Descuento, ej. 6%)`:
     $$Promo\_Divisas\_2 = \lceil Promo\_Divisas \times (1 - Descuento) \rceil$$
  8. `Punto de Equilibrio (Break-Even)`:
     $$Ventas\_Equilibrio\_Mes\_USD = \frac{\sum Costos\_Fijos}{Margen\_Promedio}$$
     $$Meta\_Diaria\_Minima\_USD = \frac{Ventas\_Equilibrio\_Mes\_USD}{30}$$
- **Rationale**: Pure functions allow instantaneous client-side preview in the browser (< 10ms) while executing identically on the server during batch updates or seed migrations.

---

## 4. Design System & Aesthetics: Windows 10 Desktop + Excel Palette

### Decision: Tailwind CSS + Lucide Icons + Custom Windows 10 Theme
- **Decision**: 
  - Create a custom theme in Tailwind CSS recreating the Windows 10 desktop application experience (title bar with window control glyphs, ribbon tabs, segmented control toolbars, crisp borders, Segoe UI typography, and bottom status bar showing rates).
  - Apply the exact Excel palette:
    - Forest Green: `#274E13` (window header, primary banners)
    - Medium Forest Green: `#38761D` (table headers, active tabs)
    - Emerald Accent: `#00A758` / `#31C75B` (call-to-actions, positive margins)
    - Sage Tint: `#E2F0D9` (table zebra stripes, selected row highlight)
    - Soft Peach: `#FBE3D6` (promotional prices and highlights)
    - Slate Charcoal: `#494949` and `#595959` (dense table header backgrounds)
    - Desktop Neutral: `#F3F3F3` (application workspace canvas) and crisp `#D1D5DB` borders.
  - Display the Mercantil Mariana logo (`public/logo.jpg`) prominently in the app title bar and dashboard banner.
- **Rationale**:
  - The user explicitly requested an aesthetic that matches the colors of the Excel file and feels like a Windows 10 application. This gives store operators an instantly familiar, dense, high-productivity interface.

---

## 5. Exchange Rate Synchronization & Fallback

### Decision: Automated API Service with Administrative Manual Override
- **Decision**: 
  - Create an endpoint/service (`/api/rates/sync`) that fetches the current official BCV exchange rate from public Venezuelan financial APIs (e.g. `https://ve.dolarapi.com/v1/dolares/oficial` or BCV portal endpoint).
  - Store rates in the database with timestamps.
  - In the UI, display the active rate in the Windows status bar and top toolbar with a prominent "Editar Tasas" dialog where administrators can manually enter/override both `Tasa Compra Variante` and `Tasa Venta BCV`.
- **Rationale**: Eliminates routine manual input errors while granting managers absolute sovereignty to set rates during market volatility or bank discrepancies.

---

## 6. Authentication & Role-Based Access Control (RBAC)

### Decision: NextAuth.js (Auth.js) / JWT Session with 3 Roles
- **Decision**: Role-based access control with credentials-based authentication:
  - **ADMIN**: Full management of users, global exchange rates, fixed cost structure, category margins, and database seeding.
  - **MANAGER**: Full access to Price Control catalog, inventory stock adjustments, and financial dashboard reports.
  - **SALES_CLERK**: Restricted access; can only access the Customer Price List and the Sales Registry (POS transaction input).
- **Rationale**: Protects sensitive profit margins and supplier acquisition costs from floor sales clerks and customers, while keeping sales entry straightforward.

---

## 7. Initial Data Seeding from Excel

### Decision: TypeScript Database Seeder Script (`scripts/seed-from-excel.ts`)
- **Decision**: Provide a seeder script that parses `CONTROL_DE_PRECIOS_DE_VENTA (4).xlsx` directly using `xlsx` (SheetJS) and populates the database with the initial catalog, categories, active fixed costs, and historical sales transactions.
- **Rationale**: Allows the application to be deployed with all historical data immediately populated and operational on day 1.
