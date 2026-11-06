# Research & Technical Decisions: Product Lifecycle & Dynamic Catalog Management

**Feature**: `003-product-management`  
**Date**: 2026-11-06  
**Status**: Completed  

---

## 1. Product Deletion & Archiving Strategy

### Decision
Implement **conditional deletion with automatic archiving**:
- When an administrator requests deletion of a product:
  - Check whether the product is referenced in any existing `SaleTransaction`.
  - **No linked sales**: Perform a permanent hard delete (`prisma.product.delete` or cache removal).
  - **Linked sales present**: Automatically transition the product to `active = false` (soft-delete / archive) and return a status informing the user that the item has been archived to preserve historical financial records.
- In the public catalog (`/lista-precios`) and Point of Sale picker (`/registro-ventas`), query only active products (`active = true`).
- In the administrator's price control view (`/control-precios`), provide an option or toggle to view all products (including archived ones) with the ability to reactivate them.

### Rationale
In retail operations with daily rotating stock, items get discontinued frequently, but historical invoices, daily balance sheets, and profit reports require immutable references to the products sold. Deleting a product with past sales would either cause database foreign key constraint errors (`foreign key violation`) or create orphaned records that corrupt accounting figures.

### Alternatives Considered
- **Pure Hard Delete with Cascade**: Rejected because cascading deletes on `SaleTransaction` would destroy past revenue and audit data.
- **Pure Soft Delete Always**: Acceptable, but prevents users from removing accidental/mistaken product entries created minutes prior that have no business history.

---

## 2. Product Form & Catalog Management UX

### Decision
Create a dedicated `ProductFormModal.tsx` following the existing Windows 10 / Excel-themed UI pattern used by `RateUpdateModal.tsx` and `SalesFormModal.tsx`.
- The modal handles both **Creation** (`mode="create"`) and **Editing** (`mode="edit"`).
- Add an **"＋ Nuevo Producto"** button to `PriceControlTable.tsx` and the `AppRibbon` quick actions (visible for `ADMIN` and `MANAGER` roles).
- Add an **"Editar"** action button and a **"Eliminar"** action button to each product row in `PriceControlTable.tsx`.
- Form inputs validate:
  - SKU (required, alphanumeric, uppercase, unique check).
  - Name (required, min 3 characters).
  - Category (select existing category or enter custom new category).
  - Brand & Model (optional/recommended strings).
  - Supplier Cost USD (positive number > 0).
  - Target Margin Percentage (number between 0% and 100%, e.g., 35% -> 0.35).
  - Unit of Measure (default "Unidad", e.g., "Docena", "Kg", "Metro").
  - Current Stock (number >= 0).
  - Active status toggle.

### Rationale
Inline table editing is great for quick margin and cost tweaks, but creating a new product or editing 8+ fields inline in a crowded table degrades user experience and causes misaligned layout on smaller screens. A structured modal ensures clean data entry and input validation.

### Alternatives Considered
- **Separate `/productos/nuevo` Route**: Rejected because store administrators prefer a unified single-window spreadsheet workflow without full page transitions.
- **Inline Row Insertion**: Rejected due to high risk of accidental submission and poor mobile/compact view ergonomics.

---

## 3. Database Persistence & Development Fallback Architecture

### Decision
Follow the application's established hybrid persistence pattern:
- The API routes (`/api/products` and `/api/products/[id]`) attempt database operations via `prisma.product` first.
- If the database is unreachable or unconfigured (such as in local build environments without `DATABASE_URL`), the route falls back gracefully to mutating the in-memory `cachedProducts` store initialized from `seed-data.json`.
- Dynamic Category assignment: When creating or updating a product with a category name, the system finds or creates the corresponding `Category` record in Prisma (`upsert`).

### Rationale
Allows production environments to store all catalog mutations in PostgreSQL with full ACID guarantees, while allowing static builds, test suites, and offline dev runs to execute seamlessly.

### Alternatives Considered
- **Strict Database Only**: Would fail Next.js static build pre-rendering if database credentials are not present during build time.
