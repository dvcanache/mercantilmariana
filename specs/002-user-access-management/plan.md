# Implementation Plan: User Authentication and Role-Based Access Control

**Branch**: `002-user-access-management` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-user-access-management/spec.md`

## Summary

Implement secure authentication, session switching, and role-based access control (RBAC) across Mercantil Mariana's bi-monetary system. The feature delivers:
1. A dedicated authentication barrier requiring login before accessing any protected application resource, with session termination / quick user switching.
2. A Master administrative suite (`/usuarios` and `/api/users`) enabling the Master administrator to view, create, edit, reassign roles, reset credentials, and delete/deactivate staff user accounts, protected by a safeguard that prevents deleting the last active Master account.
3. Strict role isolation for the "Price List Viewer" (`SALES_CLERK`) category, routing them solely to the public price list, hiding administrative navigation, blocking restricted URLs via Next.js Edge Middleware, and sanitizing API responses to ensure 0% leakage of confidential supplier wholesale costs or margin percentages.

## Technical Context

**Language/Version**: TypeScript 5.6, Node.js 20+  
**Primary Dependencies**: Next.js 14.2 (App Router), React 18, Prisma ORM 5.21, bcryptjs 2.4, jose 5.9, Lucide React, Tailwind CSS  
**Storage**: PostgreSQL (via Prisma ORM) with local fallback support  
**Testing**: Vitest 2.1 (`pnpm test`)  
**Target Platform**: Linux Server / Vercel Serverless & Edge Runtime  
**Project Type**: Fullstack Web Application  
**Performance Goals**: < 3s login completion, < 50ms Edge middleware auth verification, < 1s user session switching  
**Constraints**: Zero sensitive supplier cost/margin leakage in Price List Viewer projection; strict prevention of administrative lockout  
**Scale/Scope**: Internal multi-user retail management (1-50 staff accounts, shared counter terminals)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simplicity & YAGNI**: Pass. Leverages existing libraries (`jose`, `bcryptjs`, Next.js middleware) without heavy third-party identity provider complexity.
- **Security & Least Privilege**: Pass. Access control is enforced at both the Edge middleware boundary and server-side route handlers. Confidential pricing formulas and supplier wholesale costs are sanitized at the backend API layer before delivery to restricted roles.
- **Resilience**: Pass. Safe guardrail ensures the final active Master administrator account cannot be deleted or demoted.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-access-management/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical decisions & research
├── data-model.md        # Prisma entities, JWT claims, data projections
├── quickstart.md        # End-to-end verification and testing guide
├── contracts/           # API interface specifications
│   ├── auth-api.md      # Login, logout, session info contracts
│   ├── users-api.md     # Master user administration contracts
│   └── price-list-api.md# Role-sanitized catalog projection contract
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login screen with Windows 10 styling & role routing
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Authenticated layout feeding session context
│   │   ├── lista-precios/page.tsx    # Customer price list (accessible to all authenticated)
│   │   ├── control-precios/page.tsx  # Pricing control (ADMIN/MANAGER only)
│   │   ├── registro-ventas/page.tsx  # Sales POS (ADMIN/MANAGER only)
│   │   ├── punto-equilibrio/page.tsx # Break-even analysis (ADMIN/MANAGER only)
│   │   ├── resumen-ganancias/page.tsx# Profitability summary (ADMIN/MANAGER only)
│   │   └── usuarios/
│   │       └── page.tsx              # Master User Management interface (ADMIN only)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts        # Credential validation & JWT cookie issuance
│       │   ├── logout/route.ts       # Cookie clearance & session termination
│       │   └── me/route.ts           # Current authenticated session inspection
│       ├── users/
│       │   ├── route.ts              # GET (list) & POST (create) users (ADMIN only)
│       │   └── [id]/route.ts         # PUT (update/reset) & DELETE users (ADMIN only)
│       └── products/
│           └── route.ts              # Role-aware catalog data sanitization
├── components/
│   ├── layout/
│   │   ├── WindowTitleBar.tsx        # User badge & "Salir / Cambiar Usuario" button
│   │   ├── AppRibbon.tsx             # Ribbon tabs filtered strictly by user role
│   │   └── AppShell.tsx              # Dynamic session loader and role provider
│   ├── users/
│   │   ├── UserManagementTable.tsx   # User table with status, role badges, action buttons
│   │   └── UserFormModal.tsx         # Modal for user creation, credential setup, edit
│   └── catalog/
│       └── PublicPriceTable.tsx      # Sanitized customer-facing pricing table
├── lib/
│   ├── auth.ts                       # JWT creation/verification, password hashing, session utils
│   └── db.ts                         # Prisma client instance
└── middleware.ts                     # Edge routing, unauth redirection, and RBAC enforcement

tests/
├── unit/
│   └── auth.test.ts                  # Password hashing & JWT token verification tests
└── integration/
    ├── rbac-middleware.test.ts       # Route protection & role isolation tests
    └── users-api.test.ts             # Master CRUD operations & lockout prevention tests
```

**Structure Decision**: Next.js 14 App Router layout adhering to clean separation of concerns: route handlers under `src/app/api/`, UI pages under `src/app/(dashboard)/` and `src/app/(auth)/`, UI components under `src/components/`, business security utilities in `src/lib/`, and Edge enforcement in `src/middleware.ts`.

## Complexity Tracking

> No unjustified violations. System adheres strictly to standard Next.js, Prisma, and JWT principles.
