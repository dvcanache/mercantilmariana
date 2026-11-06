# Feature Specification: Product Lifecycle & Dynamic Catalog Management

**Feature Branch**: `003-product-management`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "i need to add, delete, change, the products, because this is going to be use for a real business with daily changing products"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add New Products to Daily Catalog (Priority: P1)

As a store administrator or commercial manager, I need to register new items into the product catalog with their identifying details (SKU code, name, category, brand, model), supplier acquisition cost in USD, target margin, and initial stock, so that newly arrived merchandise is immediately priced, available for point-of-sale recording, and published to the customer price list.

**Why this priority**: Daily business turnover requires immediate onboarding of new stock. Without the ability to add new products, the business cannot sell newly acquired items or adapt to daily supplier shipments.

**Independent Test**: Can be tested by submitting a new product registration form with valid attributes (e.g., SKU "ELEC-045", Name "Smart TV 50 Pulgadas 4K", Category "Línea Marrón", Supplier Cost $250.00, Margin 32%), and verifying that the product appears in the price control sheet, has its bi-monetary prices derived instantly, and can be selected in the sales registration workflow.

**Acceptance Scenarios**:

1. **Given** an administrator on the product management view, **When** they submit a new product with unique SKU, name, category, brand, model, supplier cost, and target margin, **Then** the product is created, active by default, and immediately reflected in the catalog.
2. **Given** a new product form submission, **When** the supplier cost in USD and target margin percentage are provided, **Then** the system computes the initial unit cost, official BCV price in USD and Bolívares, and promotional cash prices based on the current exchange rates.
3. **Given** an attempt to create a product, **When** a duplicate SKU or missing mandatory field (name, cost, category) is submitted, **Then** the system rejects the creation and presents a clear, actionable validation message.

---

### User Story 2 - Edit & Update Existing Product Details (Priority: P1)

As a commercial manager, I need to edit any existing product's attributes—including supplier cost, target margin percentage, product name, model, brand, category, and inventory count—so that prices adjust immediately to supplier invoice changes and catalog corrections.

**Why this priority**: In an environment with daily price variations and supplier fluctuations, rapid adjustment of acquisition costs and profit margins is essential to prevent operational losses and keep retail prices accurate.

**Independent Test**: Can be tested by modifying an existing product's supplier cost from $100 to $120 and target margin from 30% to 35%, confirming that all dependent prices (unit cost, BCV price in USD, retail Bolívares, promo cash USD) update immediately across the entire platform.

**Acceptance Scenarios**:

1. **Given** an existing active product, **When** an administrator updates its supplier cost or target margin percentage, **Then** all dependent prices recalibrate immediately in the price control table, public price list, and POS.
2. **Given** an existing product, **When** non-financial metadata (name, brand, model, category, current stock) is edited, **Then** the changes are saved and immediately reflected across all catalog views.
3. **Given** an edit operation in progress, **When** the user enters an invalid number (such as a negative cost or negative margin), **Then** the system rejects the update and retains the previous valid values.

---

### User Story 3 - Remove or Deactivate Obsolete Products (Priority: P2)

As a store administrator, I need to safely remove or deactivate products that are discontinued, defective, or permanently out of stock, so they no longer clutter the active catalog or appear as options in the sales register.

**Why this priority**: Maintains a clean, relevant catalog for day-to-day operations and prevents sales clerks from mistakenly selling discontinued items.

**Independent Test**: Can be tested by selecting an obsolete product, triggering deletion/deactivation, and verifying that the item is no longer visible in the active public catalog or POS item picker, while any prior sales records featuring this product retain their full historical data and profit calculations intact.

**Acceptance Scenarios**:

1. **Given** an active product with no previous sales history, **When** the administrator confirms deletion, **Then** the product is completely removed from the catalog.
2. **Given** an active product with existing recorded sales transactions, **When** the administrator initiates removal, **Then** the system safely archives or deactivates the product (soft deletion), preventing future sales while preserving all historical sales records, invoices, and margin reports.
3. **Given** an archived/deactivated product, **When** viewed in administrative audit views, **Then** it can be reactivated if new stock arrives.

---

### User Story 4 - Rapid Catalog Search, Filter & Bulk Management (Priority: P3)

As an inventory or store manager working with high-turnover goods, I need quick real-time search (by name, SKU, brand, model) and category filtering to locate and manage products swiftly during busy business hours.

**Why this priority**: Daily business operations require speed; locating an item out of hundreds in seconds saves customer service time and prevents manual entry errors.

**Independent Test**: Can be tested by typing partial keywords (e.g., "Oster", "Matrimonial") or filtering by category, verifying that matching products appear instantly and can be directly opened for editing or status toggle.

**Acceptance Scenarios**:

1. **Given** a catalog with diverse items, **When** a user types any text into the search bar, **Then** the list filters in real time matching SKU, name, brand, or model.
2. **Given** a selected category filter, **When** applied, **Then** only products assigned to that category are listed.
3. **Given** a product in the table, **When** the user clicks a quick status switch, **Then** the product toggles between active and paused status without navigating away from the page.

---

### Edge Cases

- **Zero or Negative Costs**: What happens if a user enters a supplier cost of $0 or a negative margin? The system must enforce positive non-zero acquisition costs and valid margins (typically 0% to 100%) to prevent division by zero or negative retail prices.
- **Products with Historical Sales**: What happens when a user attempts to delete a product that has 50 historical sales records? The system must prevent hard deletion that would cascade or break foreign keys; instead, it automatically transitions the product to an inactive/archived state.
- **Duplicate SKU Conflict**: What happens if a user attempts to register a new product with an SKU already in use? The system warns the user that the SKU already exists and prompts them to use an unused SKU or update the existing item.
- **Concurrent Rate/Price Updates**: What happens if an exchange rate update occurs while a product is being edited? The system saves the product base parameters and recalculates current derived prices against the latest exchange rates.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authorized users (Admin and Manager roles) to create new products with SKU, name, category, brand, model, supplier cost (in USD), target margin percentage, unit of measure, and initial stock.
- **FR-002**: System MUST automatically validate that product SKUs are unique across the system before saving.
- **FR-003**: System MUST allow authorized users to edit all attributes of an existing product, including name, category, brand, model, supplier cost, margin, and stock.
- **FR-004**: System MUST recalculate unit cost, official BCV price (in USD and Bolívares), and promotional prices immediately upon any modification to a product's supplier cost or target margin.
- **FR-005**: System MUST allow authorized users to delete products that have no linked sales transactions.
- **FR-006**: System MUST gracefully deactivate (archive) products that have existing sales records when deletion is requested, ensuring historical transactions and financial calculations remain unaffected.
- **FR-007**: System MUST provide an intuitive interface (such as a modal dialog or dedicated form) to add and edit products with clear field labels, validation messages, and currency indicators.
- **FR-008**: System MUST allow authorized users to toggle product active status directly from the management interface.
- **FR-009**: System MUST prevent Sales Clerk roles from creating, editing, or deleting products, while allowing them to view active products and their public retail prices.
- **FR-010**: System MUST support dynamic category assignment, allowing products to be assigned to existing categories or new categories created by administrators.

### Key Entities *(include if feature involves data)*

- **Product**: Represents a physical retail item managed by the store. Attributes include unique SKU, descriptive name, category reference, brand, model, supplier cost in USD, target contribution margin percentage, unit of measure, current stock balance, and active status flag.
- **Category**: Represents a classification grouping for products (e.g., Colchones, Línea Blanca, Audio y Video) with a default suggested contribution margin.
- **SaleTransaction Reference**: Historical link connecting past sales transactions to products, requiring referential integrity preservation during product deletion or modification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Store administrators can register a new product and have its retail prices generated in under 30 seconds.
- **SC-002**: Updated product costs or margins recalculate and reflect in the public price catalog within 1 second of saving.
- **SC-003**: 100% of historical sales records remain intact with accurate financial reporting when a product is deleted or archived.
- **SC-004**: 95% of product searches return targeted results in under 500 milliseconds for catalogs of up to 5,000 items.
- **SC-005**: Zero price calculation errors or negative prices permitted through input validation.

## Assumptions

- Users with roles `ADMIN` and `MANAGER` have full permissions to add, edit, and delete products; `SALES_CLERK` users only have read-only access to product information needed for sales.
- Deletion of products with existing sales transactions will perform a soft delete (marking `active = false`), hiding them from POS pickers and public catalogs while retaining historical sales reporting integrity.
- Products without historical sales may be permanently deleted upon user confirmation.
- Default currency for supplier costs and financial margins is US Dollars (USD), with Bolívares prices dynamically derived using active BCV and replacement rates.
