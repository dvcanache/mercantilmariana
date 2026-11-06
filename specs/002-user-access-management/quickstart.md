# Quickstart & Verification Guide: User Authentication and Role-Based Access Control

**Feature**: `002-user-access-management`  
**Date**: 2026-11-06  
**Status**: Ready for Implementation Verification  

---

## Prerequisites & Setup

1. **Environment Setup**:
   Ensure PostgreSQL database connection or local SQLite/mock is available:
   ```bash
   pnpm install
   pnpm prisma:generate
   ```

2. **Database Migration / Seed**:
   Seed default users (Master Admin, Manager, and Sales Clerk):
   ```bash
   pnpm seed
   ```

3. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in a browser.

---

## Verification Scenarios

### Scenario 1: Unauthenticated Route Interception
1. In an Incognito browser window, navigate directly to `http://localhost:3000/control-precios`.
2. **Expected Outcome**:
   - Middleware intercepts the request.
   - User is automatically redirected to `http://localhost:3000/login`.
   - No sensitive financial tables or figures are flashed or downloaded.

---

### Scenario 2: Master (Admin) Login and Full Access
1. On `http://localhost:3000/login`, enter credentials:
   - **Email**: `admin@mercantilmariana.com`
   - **Password**: `admin123`
2. Click **"Acceder al Sistema"**.
3. **Expected Outcome**:
   - User is redirected to `/control-precios`.
   - Titlebar displays user badge `ADMIN` and name `Administrador General`.
   - Ribbon navigation displays all tabs: **Control de Precios**, **Lista de Precios**, **Registro de Ventas**, **Punto de Equilibrio**, **Resumen de Ganancias**, and **Usuarios**.
   - Exchange rate edit button and "Registrar Venta" are accessible.

---

### Scenario 3: Master User Management Operations
1. As Master, click on the **"Usuarios"** tab (`/usuarios`).
2. Verify all existing staff users are listed.
3. Click **"Nuevo Usuario"** and fill out:
   - **Name**: `Pedro Vendedor`
   - **Email**: `pedro@mercantilmariana.com`
   - **Role**: `SALES_CLERK`
   - **Password**: `pedro123`
4. Submit and verify `Pedro Vendedor` appears in the user list.
5. Edit Pedro's profile, update his name, and test password reset.
6. Verify Sole Master Protection:
   - Attempt to delete or demote the only remaining Master user (`admin@mercantilmariana.com`).
   - System displays an error modal/alert preventing the action.

---

### Scenario 4: User Session Switching & Logout
1. In the titlebar, click the **"Salir"** / **"Cambiar Usuario"** button.
2. **Expected Outcome**:
   - Session cookie is deleted.
   - Browser immediately returns to `/login`.
   - Attempting to use the browser "Back" button does not restore the authenticated state.

---

### Scenario 5: Restricted Role (Price List Viewer) Enforced Isolation
1. On the login screen, enter credentials for the sales clerk:
   - **Email**: `pedro@mercantilmariana.com` (or `vendedor@mercantilmariana.com`)
   - **Password**: `pedro123` (or `vendedor123`)
2. Click **"Acceder al Sistema"**.
3. **Expected Outcome**:
   - User is routed directly to `http://localhost:3000/lista-precios`.
   - Ribbon navigation shows **ONLY** the **"Lista de Precios"** tab.
   - Rate adjustment button is hidden.
   - Financial cost columns (supplier cost, margins, markup) are omitted.
4. Test URL Tampering Defense:
   - Manually type `http://localhost:3000/control-precios` or `http://localhost:3000/usuarios` into the browser URL bar.
   - Middleware blocks the request and redirects back to `/lista-precios`.
5. Test API Tampering Defense:
   - Open browser developer tools and inspect the payload for `GET /api/products`.
   - Verify that `supplierCostUsd` and `targetMarginPercentage` are completely stripped/null.

---

## Automated Test Execution

Run the automated test suite covering authentication, middleware guards, and user administration:
```bash
pnpm test
```
