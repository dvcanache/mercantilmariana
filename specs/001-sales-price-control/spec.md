# Feature Specification: Mercantil Mariana Bi-Monetary Sales Price Control & Financial Management System

**Feature Branch**: `001-sales-price-control`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "tienes este archivo CONTROL_DE_PRECIOS_DE_VENTA (4).xlsx en el directorio, necesito que repliques en una app con nextjs y node de backend que se hara deploy en vercel, que lo hagas similar con una estetica que use los colores del excel, con su logo con una estetica parecida a windows 10"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Exchange Rate & Dynamic Price Calculation (Priority: P1)

As a commercial manager at Mercantil Mariana, I need to update daily currency exchange rates (official Central Bank rate and supplier replacement rate) and profit margins so that product sale prices in both local currency (Bolívares) and foreign currency (USD) are automatically and accurately calculated to prevent currency-gap losses.

**Why this priority**: Correct bi-monetary pricing is the fundamental business engine. Without accurate real-time rate conversion and margin formulas, pricing mistakes will lead to immediate financial losses on retail sales.

**Independent Test**: Can be fully tested by entering a replacement rate (e.g., 970.00 Bs/$) and official BCV rate (e.g., 849.56 Bs/$), configuring a product with base cost $180 and margin 50%, and verifying that the resulting unit cost ($158), official price ($316 / 268,461 Bs), cash promo price ($277), and secondary promo price ($261) match the financial model.

**Acceptance Scenarios**:

1. **Given** an official BCV rate of 849.56 and a supplier replacement rate of 970.00, **When** the manager updates the exchange rates, **Then** the exchange factor (tasa venta BCV / tasa compra variante) recalibrates across all catalog items immediately.
2. **Given** an active product in the price control sheet, **When** the user modifies the contribution margin percentage, **Then** the system recalculates the BCV USD price, retail Bolívares price, gross profit in Bolívares, and cash promotion price in real time.
3. **Given** a general promotional discount percentage (e.g., 6%), **When** applied, **Then** the secondary promotional foreign currency price is derived with integer rounding as prescribed in business rules.

---

### User Story 2 - Point of Sale Sales Recording & Real-Time Margin Tracking (Priority: P2)

As a sales clerk or store administrator, I need to record daily customer transactions selecting items from the catalog, payment method, quantity, and applied unit price, so that revenue and profit margins are calculated automatically and added to the commercial history.

**Why this priority**: Captures actual business operations, establishes traceability for inventory movement and sales revenue, and feeds the financial analytics engine.

**Independent Test**: Can be tested by creating a sales record with date, payment method, product selection, and quantity, and verifying that total sale amount, unit profit margin, and total profit margin are calculated and persisted correctly.

**Acceptance Scenarios**:

1. **Given** an active product in the catalog with a known cost, **When** a sale of 2 units is registered with a payment method (e.g., Cash USD), **Then** the total sale amount and total profit margin are calculated automatically as `(Sale Price - Unit Cost) * Quantity`.
2. **Given** the sales transaction ledger, **When** viewing the recorded transactions, **Then** records are displayed chronologically with invoice number, date, payment method, product, quantity, unit price, total, and profit margin.

---

### User Story 3 - Operational Break-Even & Fixed Cost Structure Analysis (Priority: P3)

As a business owner, I need to manage monthly operational fixed costs (rent, payroll, utilities, municipal taxes, software, accounting) and compare them with our average product contribution margin so that I know exactly the daily and monthly sales revenue required to break even.

**Why this priority**: Provides essential financial viability insights, preventing underperformance and guiding daily sales targets for commercial staff.

**Independent Test**: Can be tested by entering monthly fixed expense items totaling $1,600.00 and an average contribution margin, and verifying that the system calculates the exact monthly break-even sales target and daily minimum sales target in both USD and Bolívares.

**Acceptance Scenarios**:

1. **Given** a total monthly fixed operational cost of $1,600.00 and an average margin across catalog items, **When** the break-even tab is consulted, **Then** the required monthly break-even sales ($ and Bs) and daily minimum sales target ($ and Bs) are clearly displayed.
2. **Given** changes in individual fixed cost lines (such as rent or payroll), **When** a line item is edited, **Then** the overall break-even threshold and percentage breakdown per cost category recalculate instantly.

---

### User Story 4 - Executive Profitability Dashboard & 12-Month Performance (Priority: P4)

As an executive, I need a visual summary dashboard displaying daily, weekly, monthly, and yearly net profit against monthly fixed costs, along with a 12-month consolidated performance table, so that I can evaluate business health and net profitability at a glance.

**Why this priority**: Consolidates operational data into actionable executive metrics for strategic decision-making.

**Independent Test**: Can be tested by having sales entries spanning different dates and verifying that Daily Profit, Rolling 7-Day Profit, Monthly Profit, Annual Accumulated Profit, and Net Operating Income (Monthly Gross Profit minus Fixed Costs) match the aggregated calculations.

**Acceptance Scenarios**:

1. **Given** recorded sales in the system, **When** opening the Executive Dashboard, **Then** KPI indicator cards show today's gross profit, last 7 days rolling gross profit, current month gross profit, annual gross profit, monthly fixed costs, and net monthly income.
2. **Given** the 12-month annual consolidated table, **When** navigated, **Then** each month displays total sales volume, gross profit, fixed cost deduction, net income, and net profit margin percentage.

---

### User Story 5 - Public & Printable Sales Price Catalog (Priority: P5)

As a sales representative, I need an uncluttered, branded, and printable price list showing product name, category, brand, model, official BCV price, Bolívares price, and cash promotion prices without revealing sensitive supplier costs or internal margin percentages.

**Why this priority**: Allows sales staff to quote prices quickly to customers and print or export customer-facing price lists without compromising internal margin confidentiality.

**Independent Test**: Can be tested by opening the Price List view and verifying that supplier purchase costs and contribution percentages are hidden while customer prices, brands, and BCV reference rates are clearly readable and formatted for printing.

**Acceptance Scenarios**:

1. **Given** active catalog products with calculated prices, **When** the Price List view is displayed, **Then** it presents product descriptions, categories, brands, models, BCV dollar price, Bolívares price, and promotional cash prices.
2. **Given** the price list, **When** filtered by category or searched by product name, **Then** matching products are filtered instantly.

---

### User Story 6 - Windows 10 & Excel Green Aesthetic Interface (Priority: P6)

As a desktop user accustomed to spreadsheet tools and the Windows environment, I want the web application to feature an interface reminiscent of a Windows 10 productivity application with the Mercantil Mariana corporate green palette, branded logo, crisp typography, and compact tabular layouts.

**Why this priority**: Preserves user familiarity, speeds up workflow adoption, and creates a professional branded tool for store personnel.

**Independent Test**: Can be verified by reviewing the application layout to confirm the presence of the Mercantil Mariana logo, the green and slate color theme (`#274E13`, `#38761D`, `#00A758`, `#E2F0D9`), a Windows-styled window frame / header bar, crisp grid borders, and a bottom status bar displaying active exchange rates.

**Acceptance Scenarios**:

1. **Given** any screen of the application, **When** viewed on desktop, **Then** the header displays the Mercantil Mariana logo and title with a Windows 10 styling bar and clear module navigation tabs.
2. **Given** data tables across modules, **When** data is rendered, **Then** headers use the deep corporate greens (`#274E13`, `#38761D`, `#494949`), rows feature clean alternate shading (`#E2F0D9`), and promotional values are highlighted in soft accents (`#FBE3D6`).

---

### Edge Cases

- **Zero or Negative Exchange Rate**: How does the system handle an accidental entry of 0 or a negative number for exchange rates? The system must reject values ≤ 0 and display a non-blocking validation warning, preventing division-by-zero errors in the exchange factor (`Tasa BCV / Tasa Compra`).
- **100% or Greater Contribution Margin**: If a user enters a margin of 100% or more (`H >= 1`), the standard formula `Cost / (1 - Margin)` would divide by zero or become negative. The system must enforce an upper limit (e.g., maximum margin 99.9%) or fallback cleanly to base cost.
- **Leap Year and Month Boundaries**: The 12-month consolidated summary and daily/weekly rolling filters must correctly calculate date ranges across 28/29/30/31-day months and leap years.
- **Empty Catalog or Zero Sales Days**: When no sales exist for the current day or month, KPI cards must display zero or appropriate baseline values without crashing or displaying `NaN` / `null`.
- **Offline / Transient Connectivity on Device**: If the store loses internet connection briefly while recording a sale, the application must provide clear feedback and avoid duplicate submissions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authorized users to view and update the three global pricing parameters: Tasa de Compra Variante (supplier replacement rate), Tasa de Venta Oficial BCV (official central bank rate), and Porcentaje de Descuento Promocional.
- **FR-002**: The system MUST calculate the Factor de Cambio as `Tasa Venta BCV / Tasa Compra Variante` and automatically recalculate adjusted unit costs, BCV prices, Bolívares prices, gross margins, and promotional foreign currency prices for all products.
- **FR-003**: The system MUST apply integer upward rounding (`ROUNDUP`) to calculated prices and margins, preserving the mathematical behavior of the source spreadsheet.
- **FR-004**: The system MUST maintain a Master Database containing product categories (with code, description, and suggested margin) and product catalog (with SKU, description, category, brand, model, supplier cost, unit of measure, and active inventory stock).
- **FR-005**: The system MUST provide a Sales Price Control module where operators can adjust product purchase costs and contribution margin percentages, instantly seeing projected prices and profit margins.
- **FR-006**: The system MUST provide a Customer-Facing Price List module displaying products, categories, brands, models, and bi-monetary retail prices while hiding supplier costs and internal margin percentages.
- **FR-007**: The system MUST allow recording sales transactions with fields: Date, Payment Method (Divisas Efectivo, Punto de Venta / Bolívares, Pago Móvil, Zelle, Transferencia), Product, Invoice Number, Quantity, Sale Price ($), and automatically compute Unit Cost, Total Sale Amount, Unit Margin, and Total Margin.
- **FR-008**: The system MUST provide an Operational Fixed Costs & Break-Even module allowing users to manage fixed monthly operating cost items (rent, payroll, utilities, services, taxes, contingency) and view monthly and daily break-even sales targets in both USD and Bolívares.
- **FR-009**: The system MUST generate an Executive Financial Dashboard with real-time KPI cards for Daily Profit, Rolling 7-Day Profit, Monthly Profit, Annual Accumulated Profit, Monthly Fixed Costs, and Net Monthly Profit.
- **FR-010**: The system MUST compute a 12-month consolidated financial summary showing total revenue, gross profit, fixed expenses, net operating profit, and net profit margin percentage for each month of the year.
- **FR-011**: The system MUST incorporate the Mercantil Mariana corporate logo and use the visual identity of the spreadsheet (forest greens `#274E13`, `#38761D`, `#00A758`, sage highlights `#E2F0D9`, promotional accents `#FBE3D6`, and slate headers `#494949`) paired with a Windows 10 desktop application aesthetic (crisp borders, flat window title bar, compact data density, Segoe UI typography).
- **FR-012**: System data persistence MUST be managed using a serverless-ready PostgreSQL database (e.g., Neon, Supabase, or Vercel Postgres) ensuring scalable multi-user transaction integrity and persistence across cloud deployments.
- **FR-013**: Access and modification permissions MUST be governed by a role-based user authentication model supporting Administrator (full access to global settings, fixed costs, margins, and rates), Manager (access to pricing control, catalog, and sales reporting), and Sales Clerk (restricted to customer price catalog and sales transaction recording).
- **FR-014**: Daily official BCV exchange rate updates MUST be handled via automated synchronization from an exchange rate API service with full support for manual inspection, adjustment, and override by authorized administrators.

### Key Entities

- **User**: Represents an authenticated system operator with `id`, `name`, `email`, `role` (Admin, Manager, Sales Clerk), and `active` status.
- **ExchangeRateSetting**: Represents the bi-monetary rate configuration containing `supplierReplacementRate` (Tasa Compra Variante in Bs/$), `officialBcvRate` (Tasa Venta BCV in Bs/$), `promoDiscountPercentage` (e.g. 6%), and `lastUpdated` timestamp.
- **Category**: Represents a commercial product grouping with `code` (e.g. CAT-01), `name` (e.g. Colchones), and `suggestedMargin` (e.g. 0.35).
- **Product**: Represents a sellable merchandise item with `sku` (e.g. PROD-001), `name`, `category`, `brand`, `model`, `supplierCostUsd`, `unitOfMeasure`, `currentStock`, and `targetMarginPercentage`.
- **SaleTransaction**: Represents an individual sales event containing `id`, `date`, `paymentMethod`, `productId`, `invoiceNumber`, `quantity`, `unitSalePriceUsd`, `unitCostUsd`, `totalSaleUsd`, `unitMarginUsd`, and `totalMarginUsd`.
- **FixedCostItem**: Represents a recurrent operational expense with `concept`, `monthlyAmountUsd`, `categoryPercentage`, and `active` status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When exchange rates or contribution margins are modified, all affected product prices and break-even metrics across the application recalculate and update on screen in less than 500 milliseconds.
- **SC-002**: A store clerk can search for a product and complete registering a new sales transaction in under 20 seconds.
- **SC-003**: 100% of mathematical outputs (Factor de cambio, Costo Unitario, Precio BCV, Precio Bs, Margen Bruto, Promo Divisas, Punto de Equilibrio, and KPIs) match the reference Excel calculations identically for equivalent inputs.
- **SC-004**: Users can filter, search, and sort a catalog of over 1,000 products with instant feedback and zero visible interface lag.
- **SC-005**: The customer-facing price list can be printed or exported to PDF in a clean, legible format on standard Letter/A4 paper with a single click.

## Assumptions

- The primary user base operates from desktop or laptop computers at store counters or administrative offices using standard modern web browsers.
- Transactions are conducted in an environment where dual-currency operations (US Dollars and Venezuelan Bolívares) require continuous reference to both official BCV rates and parallel/supplier replacement rates.
- Integer upward rounding (`ROUNDUP`) is the established pricing standard for the business to protect margins and simplify cash transactions.
- Historical data from the provided Excel spreadsheet (`CONTROL_DE_PRECIOS_DE_VENTA (4).xlsx`) serves as the initial seed dataset for categories, products, fixed costs, and sales records.
- Deployment target is Vercel; therefore, application backend logic and database connectivity must adhere to serverless-compatible paradigms.
