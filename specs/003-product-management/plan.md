# Implementation Plan: Product Lifecycle & Dynamic Catalog Management

**Branch**: `003-product-management` | **Date**: 2026-11-06 | **Spec**: [specs/003-product-management/spec.md](spec.md)

**Input**: Feature specification from `specs/003-product-management/spec.md`

## Summary

Deliver complete CRUD lifecycle operations (add, edit, soft-archive/delete) for the product catalog to support daily commercial inventory changes at Mercantil Mariana. The solution implements full Prisma database persistence with graceful in-memory fallbacks, an Excel-themed Windows 10 `ProductFormModal` with live bi-monetary price previews, conditional deletion that safeguards historical sales transactions, and strict role-based access control prohibiting unauthorized modifications by sales clerks.

## Technical Context

**Language/Version**: TypeScript 5.4 / Node.js 20+  
**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Prisma Client  
**Storage**: PostgreSQL via Prisma ORM with structured JSON cache fallback  
**Testing**: Vitest (unit tests for pricing engine & API validation)  
**Target Platform**: Linux Server / Vercel Edge Runtime  
**Project Type**: Full-stack Next.js web application with App Router API routes  
**Performance Goals**: Product creation & live price derivation < 500ms; instant real-time pricing preview in modal  
**Constraints**: Zero data loss for historical sales; immediate bi-monetary calculation recalculation; responsive spreadsheet aesthetic  
**Scale/Scope**: Catalogs up to 5,000 products with daily dynamic changes  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Independent Testability**: PASSED. Each user story (add, edit, delete/archive, search/filter) can be developed and verified independently.
- **Role Isolation**: PASSED. Clear security boundary preventing `SALES_CLERK` from mutating products or viewing masked financial columns.
- **Financial Referential Integrity**: PASSED. Soft deletion ensures past `SaleTransaction` rows retain immutable product and margin references.
- **Aesthetic Consistency**: PASSED. Aligns with Windows 10 desktop theme and Mercantil Mariana Excel green palette (`#1E4620`, `#274E13`).

## Project Structure

### Documentation (this feature)

```text
specs/003-product-management/
├── plan.md              # This implementation plan
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Entity schemas, state transitions, validation rules
├── quickstart.md        # Step-by-step verification guide
├── contracts/           # API and UI interface contracts
│   ├── products-api.md  # REST API specification for /api/products
│   └── ui-contracts.md  # Component props and interaction contracts
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── products/
│   │       ├── route.ts          # GET (list/filter) & POST (create)
│   │       └── [id]/
│   │           └── route.ts      # PUT (update all fields) & DELETE (safe delete/archive)
│   ├── control-precios/
│   │   └── page.tsx              # Host page for Price Control
│   └── lista-precios/
│       └── page.tsx              # Public Price Catalog
├── components/
│   ├── layout/
│   │   ├── AppRibbon.tsx         # Ribbon toolbar action buttons
│   │   └── AppShell.tsx          # App shell managing global modal states
│   ├── pricing/
│   │   ├── PriceControlTable.tsx # Table with "Nuevo Producto", Edit, Delete actions
│   │   └── ProductFormModal.tsx  # New modal for Create and Edit workflows
│   └── catalog/
│       └── PublicPriceTable.tsx  # Read-only customer catalog view
├── lib/
│   ├── pricing-engine.ts         # Bi-monetary financial formula calculations
│   └── auth.ts                   # Role checks and session validation
└── prisma/
    └── schema.prisma             # Product, Category, and SaleTransaction models
```

**Structure Decision**: Integrated within the existing Next.js App Router architecture. API handlers in `src/app/api/products` handle backend validation and persistence; UI components in `src/components/pricing/` handle user interactions, live previews, and dialog states.

## Complexity Tracking

*No constitutional violations. Design uses standard Next.js App Router patterns and existing application modals without unnecessary abstraction layers.*
