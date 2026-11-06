# Quickstart & Verification Guide: Product Lifecycle & Dynamic Catalog Management

**Feature**: `003-product-management`  
**Date**: 2026-11-06  

---

## Prerequisites

1. Working application environment with Node.js 20+ and dependencies installed:
   ```bash
   pnpm install
   ```
2. Running local dev server:
   ```bash
   pnpm dev
   ```
   Or executing unit/integration tests:
   ```bash
   pnpm test
   ```

---

## Validation Scenario 1: Register a New Product (Create)

1. Sign in as an administrator (`ADMIN` or `MANAGER`).
2. Navigate to **Control de Precios** (`/control-precios`).
3. Click the **＋ Nuevo Producto** button located on the top toolbar.
4. Fill in the form fields:
   - **SKU**: `TEST-001`
   - **Nombre**: `Ventilador de Pedestal 18"`
   - **Categoría**: `Ventilación`
   - **Marca**: `Samurai`
   - **Modelo**: `Turbo Silence Max`
   - **Costo Proveedor ($)**: `30.00`
   - **Margen (%)**: `40%` (or `0.40`)
   - **Stock**: `15`
5. Observe the live preview of derived prices updating in real time.
6. Click **Guardar Producto**.
7. **Verification**:
   - The modal closes.
   - The table displays `TEST-001 Ventilador de Pedestal 18"` with calculated unit cost, BCV price in Bs, and promo prices.
   - Navigate to **Lista de Precios** (`/lista-precios`); verify the new product appears in the customer catalog.
   - Open **Registrar Venta** modal; verify the product is selectable in the product dropdown.

---

## Validation Scenario 2: Edit an Existing Product (Update)

1. In **Control de Precios**, find `TEST-001`.
2. Click the **Editar** button on that row.
3. Modify:
   - **Costo Proveedor ($)**: change from `30.00` to `35.00`.
   - **Margen (%)**: change from `40%` to `45%`.
4. Click **Guardar Cambios**.
5. **Verification**:
   - The row values update immediately.
   - The retail price in Bolívares and USD increases according to the financial formula.

---

## Validation Scenario 3: Delete Product Without Sales History (Hard Delete)

1. On the newly created `TEST-001` (which has 0 recorded sales), click the **Eliminar** button.
2. Confirm the prompt.
3. **Verification**:
   - The product is completely removed from the table.
   - Check `/lista-precios`; the product is no longer present.

---

## Validation Scenario 4: Delete Product With Existing Sales History (Safe Archive)

1. Select a product that has existing sales transactions recorded in **Registro de Ventas** (e.g. `PROD-001`).
2. Click the **Eliminar** button on `PROD-001`.
3. Confirm the prompt.
4. **Verification**:
   - The API reports `ARCHIVED` status.
   - The product status badge changes to `Archivado` or disappears from active lists.
   - Navigate to **Registro de Ventas** (`/registro-ventas`); verify past sales transactions of `PROD-001` remain completely intact with all quantities, totals, and profit calculations preserved.

---

## Validation Scenario 5: Role-Based Access Enforcement

1. Sign in or switch user to a `SALES_CLERK` account.
2. Navigate to `/lista-precios` or `/control-precios`.
3. **Verification**:
   - The clerk cannot see or click `＋ Nuevo Producto`, `Editar`, or `Eliminar`.
   - Attempting a direct `POST` or `DELETE` to `/api/products` returns HTTP `403 Forbidden`.
