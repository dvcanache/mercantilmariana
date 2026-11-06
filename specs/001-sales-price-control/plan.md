# Implementation Plan: Mercantil Mariana Bi-Monetary Sales Price Control & Financial Management System

**Branch**: `001-sales-price-control` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-sales-price-control/spec.md`

## Summary

Build and deploy a full-stack Next.js web application on Vercel replicating the business logic, calculations, and modules of `CONTROL_DE_PRECIOS_DE_VENTA (4).xlsx` for **Mercantil Mariana**. The application features an authentic Windows 10 desktop aesthetic infused with the corporate green and slate palette of the spreadsheet (`#274E13`, `#38761D`, `#00A758`, `#E2F0D9`, `#FBE3D6`, `#494949`) and the brand logo. It incorporates serverless PostgreSQL (Prisma ORM), role-based authentication (Admin, Manager, Sales Clerk), automated BCV rate synchronization with manual override, a pure TypeScript pricing engine matching Excel formulas with integer upward rounding (`ROUNDUP`), POS sales recording, fixed operational cost break-even analysis, and an executive 12-month dashboard.

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20+

**Primary Dependencies**: Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide React, Prisma ORM (`@prisma/client`), NextAuth.js / Jose for JWT RBAC session, xlsx (SheetJS for data seeding).

**Storage**: PostgreSQL (Serverless via Neon / Supabase / Vercel Postgres) accessed through Prisma.

**Testing**: Vitest for unit testing the pricing engine and formula parity against Excel; Playwright / React Testing Library for critical UI flows.

**Target Platform**: Vercel (Edge & Node.js Serverless Functions) with modern desktop and tablet browser support.

**Project Type**: Full-stack web application (Next.js unified frontend and Node.js Route Handlers).

**Performance Goals**: 
- Price recalculation across the entire catalog in < 50ms in browser memory.
- Sub-500ms API response time for transactional POS recording.
- Instant search and filtering across 1,000+ catalog items.

**Constraints**:
- Exact mathematical match with Excel formulas (`ROUNDUP` behavior, exchange factor quotient, break-even targets).
- Deployable on Vercel without reliance on stateful local disk storage.
- Dense Windows 10 productivity interface with responsive layout.

**Scale/Scope**:
- Multi-user support with 3 roles (Admin, Manager, Sales Clerk).
- Initial seed of categories, products, fixed costs, and historical transactions from the provided workbook.
- 5 primary modules: Control de Precios, Lista de Precios, Registro de Ventas, Punto de Equilibrio, and Resumen de Ganancias.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type Safety & Contracts**: All entities and pricing calculation inputs/outputs are strictly typed via TypeScript interfaces and validated via Prisma schemas. -> PASS
- **Test-First Formula Verification**: Pricing engine functions are isolated in `src/lib/pricing-engine.ts` and independently testable against known Excel rows. -> PASS
- **Simplicity & YAGNI**: Single Next.js project layout with standard Route Handlers, avoiding unnecessary microservices. -> PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-sales-price-control/
├── spec.md              # Requirements and user scenarios
├── plan.md              # Implementation plan (this document)
├── research.md          # Technical research and decisions
├── data-model.md        # Prisma schema and entity diagrams
├── quickstart.md        # Setup and validation guide
├── contracts/           # API routes and calculation engine contracts
│   ├── api-routes.md
│   └── pricing-engine.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
├── prisma/
│   ├── schema.prisma             # Relational data schema
│   └── migrations/               # Database migrations
├── public/
│   └── logo.jpg                  # Mercantil Mariana corporate logo
├── scripts/
│   └── seed-from-excel.ts        # Direct Excel workbook data seeder
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Node.js backend route handlers
│   │   │   ├── auth/             # Login and session validation
│   │   │   ├── rates/            # Exchange rates (get, update, sync)
│   │   │   ├── products/         # Catalog and pricing control CRUD
│   │   │   ├── sales/            # POS sales transactions
│   │   │   ├── break-even/       # Fixed costs and equilibrium calculation
│   │   │   └── dashboard/        # Executive KPIs and 12-month summary
│   │   ├── (auth)/
│   │   │   └── login/            # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Windows 10 window frame, ribbon & status bar
│   │   │   ├── page.tsx          # Default redirect / overview
│   │   │   ├── control-precios/  # Price control & margin management
│   │   │   ├── lista-precios/    # Customer-facing printable catalog
│   │   │   ├── registro-ventas/  # POS transaction recording & history
│   │   │   ├── punto-equilibrio/ # Fixed operational costs & break-even targets
│   │   │   └── resumen-ganancias/# Executive KPI cards & monthly consolidated table
│   │   ├── globals.css           # Tailwind + Windows 10 theme styles
│   │   └── layout.tsx            # Root HTML layout
│   ├── components/
│   │   ├── ui/                   # Windows 10 buttons, inputs, tables, modals, badges
│   │   ├── layout/               # WindowTitleBar, AppRibbon, AppStatusBar
│   │   ├── pricing/              # PriceControlTable, RateUpdateModal
│   │   ├── sales/                # SalesFormModal, SalesHistoryTable
│   │   ├── break-even/           # FixedCostsTable, BreakEvenCard
│   │   └── dashboard/            # KpiCardsGrid, ConsolidatedMonthTable
│   └── lib/
│       ├── db.ts                 # Prisma client instance
│       ├── auth.ts               # NextAuth / session utilities
│       ├── pricing-engine.ts     # Pure Excel calculation formulas
│       └── bcv-service.ts        # Automated BCV exchange rate scraper/fetcher
├── tests/
│   ├── unit/
│   │   └── pricing-engine.test.ts# Excel calculation mathematical parity tests
│   └── integration/
│       └── api-routes.test.ts    # Route handler integration tests
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

**Structure Decision**: A unified Next.js App Router architecture is chosen. It places frontend components and Node.js Route Handlers in a single repository root, optimal for deployment on Vercel while sharing calculation logic (`pricing-engine.ts`) across both server and client.

## Complexity Tracking

No constitution violations detected. The single-project Next.js architecture provides maximum development velocity and zero-overhead Vercel compatibility.
