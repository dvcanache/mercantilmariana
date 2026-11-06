# Feature Specification: UI/UX Modernization and Enhanced Brand Visibility

**Feature Branch**: `004-improve-ui-ux-logo`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "mejora la ui/ux y haz el logo mas grande"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prominent Brand Identity & Enlarged Logo Visibility (Priority: P1)

As a business owner, store manager, or customer, I need the Mercantil Mariana company logo to be prominent, sharp, and clearly legible on the login screen, main application header, and printable price lists, so that the brand presence is authoritative and professional across all touchpoints.

**Why this priority**: Direct stakeholder priority. The previous logo sizing was overly constrained and lost visual impact on both shared sales terminals and printed catalogs.

**Independent Test**: Load the login screen, main application window, and public price catalog. Verify that the logo is noticeably larger, centrally or proportionally balanced, crisp, and properly integrated into the visual layout.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor on the login screen, **When** the page loads, **Then** the Mercantil Mariana logo is displayed in an enlarged, prominent frame with clear visual hierarchy above the application title.
2. **Given** an authenticated user in the main application layout, **When** viewing the top titlebar or navigation header, **Then** the logo is visibly enlarged and paired with crisp company typography.
3. **Given** a salesperson or customer viewing or printing the public price catalog, **When** looking at the header of the price list, **Then** the official logo appears prominently alongside the catalog title and official Central Bank exchange rate.

---

### User Story 2 - Modernized Bi-Monetary Table Readability & Excel Precision (Priority: P2)

As a sales clerk or commercial manager, I need data grids (price control sheet, public price table, sales ledger) to feature sticky headers, distinct currency styling, and smooth row highlights, so that reading, comparing, and quoting bi-monetary prices is effortless and error-free during peak sales hours.

**Why this priority**: Staff spend hours inspecting dense tables of numbers. Poor contrast or misaligned figures lead to fatigue and costly pricing errors at the sales counter.

**Independent Test**: Open the price control sheet or public price list; scroll vertically through multiple products, verify that column headers stay pinned at the top, local and foreign currency values are distinctly colored, and hovering across rows highlights the entire row.

**Acceptance Scenarios**:

1. **Given** a user viewing an extensive product list, **When** scrolling vertically, **Then** table header rows remain sticky and pinned at the top of the viewport.
2. **Given** a user examining bi-monetary pricing columns, **When** inspecting foreign currency (USD) and local currency (Bolívares) columns, **Then** each currency category has distinct, clear typographic styling and color indicators that prevent confusion between currencies.
3. **Given** a user moving the cursor over table rows, **When** hovering over any row, **Then** the full row displays a subtle accent highlight to facilitate horizontal scanning across wide tables.

---

### User Story 3 - Touch & Ergonomic Usability on Counter Terminals and Tablets (Priority: P3)

As a counter clerk using a desktop monitor or tablet touchscreen, I need generous tap targets, responsive filters, and comfortable dialog windows, so that I can search products, filter categories, and switch users swiftly without accidental clicks.

**Why this priority**: Speed and ergonomics are vital on the sales floor. Small buttons or cramped touch targets slow down customer service and cause operational friction.

**Independent Test**: Navigate filters, search bars, action buttons, and modal dialogs on different viewport sizes (tablet and desktop); verify that interactive elements are easy to click or tap without overlapping or clipping.

**Acceptance Scenarios**:

1. **Given** a user interacting with search inputs, category selectors, and ribbon buttons, **When** tapping or clicking them, **Then** interactive elements offer generous touch areas (minimum 36px height) and immediate visual feedback.
2. **Given** a user opening any modal window (user management, rates update, sales form), **When** the modal appears, **Then** it centers cleanly, prevents background scroll jumping, and provides clear, prominent confirmation and cancel actions.

---

### User Story 4 - High-Fidelity Printable Customer Catalog Layout (Priority: P4)

As a salesperson or store administrator, I need the public price catalog to print cleanly on paper with professional branding, automatic pagination, and zero clutter, so that physical price sheets distributed to customers look executive and polished.

**Why this priority**: Retail walk-in clients frequently ask for physical printed price sheets or written quotes to review products and prices.

**Independent Test**: Click "Imprimir Catálogo" in the Price List view; verify in print preview that web navigation ribbons, search bars, and action buttons are hidden, while the company logo, exchange rate reference, and neatly formatted table fit standard page margins.

**Acceptance Scenarios**:

1. **Given** a user clicking the print button, **When** the print preview opens, **Then** application navigation ribbons, search bars, and window headers are hidden from print output.
2. **Given** the printed document, **When** inspected, **Then** it features a high-resolution branded header with the enlarged company logo, the official exchange rate, and a neat, paginated product table.

---

### Edge Cases

- **Small Viewports / Counter Tablets**: On narrower touch screens (e.g., iPad or tablet in portrait/landscape), tables must support horizontal scrolling without breaking the layout or hiding titlebar branding.
- **High-DPI / Retina Screens**: Larger logo display must utilize high-resolution rendering without blurriness, compression artifacts, or aspect ratio distortion.
- **Extreme Table Row Counts**: Sticky headers and row hover effects must perform smoothly at 60fps without layout thrashing or stutter when scrolling through hundreds of products.
- **Monochrome / Black-and-White Printing**: Printed catalogs must maintain high text legibility and clear row separation even when printed on basic black-and-white laser printers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an enlarged company logo on the login screen, increasing its visual prominence to become the dominant visual branding element.
- **FR-002**: System MUST display an enlarged, high-visibility company logo in the main application titlebar/header alongside the application title.
- **FR-003**: System MUST include the company logo in the customer-facing public price list header and printable catalog layout.
- **FR-004**: System MUST implement sticky column headers for all data tables (price control, public price list, sales ledger, user management) so header context is preserved during vertical scrolling.
- **FR-005**: System MUST provide distinct visual hierarchy and color differentiation between official foreign currency (USD), retail Bolívares (Bs), and cash promotional prices.
- **FR-006**: System MUST implement row-hover accent highlights and clean cell padding across all data tables to enhance horizontal scanning.
- **FR-007**: System MUST ensure all interactive buttons, inputs, tabs, and action icons provide comfortable target sizes (minimum 36px) suitable for counter tablets and desktop mice.
- **FR-008**: System MUST provide dedicated print styling for the public price list that omits web toolbars, navigation buttons, and status bars while rendering an executive paper catalog with logo, exchange rate, and date.
- **FR-009**: System MUST support responsive layouts from tablet viewports (768px+) up to ultra-wide desktop monitors without layout clipping.
- **FR-010**: System MUST provide clear, immediate visual states (hover, active, focus, disabled, loading) for all interactive components across the application.

### Key Entities *(include if feature involves data)*

- **Brand Presentation Theme**: Visual design tokens defining logo display dimensions, Windows 10/Excel color palettes (emerald, forest green, warm sage, amber, slate), acrylic glass translucency, typography hierarchy, and table border styling.
- **Print Catalog Document**: A print-optimized media projection of the sales price list containing header branding (enlarged logo, store name), rate reference metadata, and a paginated table of products with customer-facing prices.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visible area of the company logo on the login screen is increased by at least 75% compared to the baseline, maintaining crisp resolution and aspect ratio.
- **SC-002**: Visible area of the logo in the application titlebar is increased by at least 50%, remaining clearly distinguishable from a normal workstation viewing distance.
- **SC-003**: 100% of data table column headers remain anchored and visible when users scroll through catalog lists of 100+ items.
- **SC-004**: Printed catalog output fits standard paper formats (Letter / A4) with zero clipped columns and 100% exclusion of digital-only navigation controls.
- **SC-005**: Interactive touch targets across navigation, buttons, and inputs measure at least 36px in clickable height/width.
- **SC-006**: Color contrast for all key financial data, prices, and header text satisfies standard accessibility guidelines (minimum 4.5:1 contrast ratio against background).

## Assumptions

- The existing logo asset in `/public/logo.jpg` has sufficient image resolution to be scaled up cleanly without requiring a new raw graphic file.
- The aesthetic direction maintains fidelity to the Windows 10 / Excel theme (clean borders, acrylic titlebar, structured grid system) requested by the organization.
- Sales staff and managers use modern browsers (Chrome, Edge, Firefox, Safari) with support for modern CSS sticky positioning and print media queries.
- Primary devices are sales counter desktop terminals and touch-capable tablets.
