# Quickstart & Validation Guide: Mercantil Mariana Bi-Monetary System

**Feature**: `001-sales-price-control`
**Date**: 2026-11-05
**Status**: Draft

## 1. Prerequisites
- Node.js 18.18+ or 20+
- PostgreSQL database (Local, Docker, or Serverless Neon/Supabase connection string)
- Vercel CLI (optional, for cloud deploy)

---

## 2. Environment Configuration
Create a `.env` file in the project root:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mercantilmariana"
NEXTAUTH_SECRET="super-secret-key-at-least-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Mercantil Mariana — Control de Precios"
```

---

## 3. Installation & Database Setup
```bash
# 1. Install dependencies
npm install

# 2. Run Prisma migrations
npx prisma migrate dev --name init

# 3. Seed data directly from Excel file
npx ts-node scripts/seed-from-excel.ts
```

---

## 4. Local Development Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. End-to-End Validation Scenarios

### Validation 1: Exchange Rate & Bi-Monetary Recalculation
1. Log in as Administrator (`admin@mercantilmariana.com` / `admin123`).
2. Observe the Windows 10 title bar and status bar at the bottom displaying:
   - Tasa Compra Variante: `970.00`
   - Tasa Venta BCV: `849.56`
   - Factor de Cambio: `0.8758`
3. Click "Actualizar Tasas" on the top toolbar. Change Tasa BCV to `850.00`.
4. Verify that prices in the **Control de Precios** table update instantaneously in < 500ms without page reload.

### Validation 2: Financial Accuracy Verification (Excel Parity)
1. Navigate to product `PROD-001` ("Colchón Matrimonial Ortopédico"):
   - Base Cost: `$180.00`
   - Margin: `50%`
2. Verify calculated values match Excel:
   - Costo Unitario Ajustado: `$158.00`
   - Precio BCV: `$316.00`
   - Precio de Venta (Bs): `268,461 Bs`
   - Margen Bruto Bs: `134,231 Bs`
   - Promo en Divisas ($): `$277.00`
   - Promo en Divisas 2 (6%): `$261.00`

### Validation 3: Record a Sale (Sales Clerk Flow)
1. Switch to user role "Vendedor" or navigate to **Registro de Ventas**.
2. Click "Nueva Venta".
3. Select `Colchón Matrimonial Ortopédico`, payment method `Divisas Efectivo`, quantity `1`.
4. Notice that Unit Cost (`$158.00`), Sale Price (`$277.00`), Total (`$277.00`), and Margin (`$119.00`) auto-fill.
5. Save the transaction. Confirm it appears in the transaction history table.

### Validation 4: Executive Dashboard & Break-Even
1. Navigate to **Resumen de Ganancias**.
2. Confirm the KPI cards reflect the newly logged transaction:
   - Ganancia Diaria: `$119.00` (or cumulative for today)
   - Costos Fijos Mes: `$1,600.00`
   - Utilidad Neta Mes: recalculated accordingly.
3. Navigate to **Punto de Equilibrio** and verify the 10 fixed cost items total `$1,600.00` and monthly break-even sales target is displayed.

---

## 6. Vercel Cloud Deployment Check
```bash
# Verify production build locally
npm run build

# Deploy to Vercel
vercel --prod
```
Ensure `DATABASE_URL` and `NEXTAUTH_SECRET` are configured in Vercel Project Settings > Environment Variables.
