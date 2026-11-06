# UI Component & Layout Contracts: UI/UX Modernization

## 1. `LoginPage` Visual Contract (`src/app/(auth)/login/page.tsx`)

### Layout
- Outer Container: Full-screen acrylic gradient backdrop (`bg-gradient-to-br from-[#1E3B0F] via-[#274E13] to-[#122409]`).
- Card Container: Centered Windows 10 acrylic modal (`max-w-md bg-white/95 backdrop-blur-md shadow-2xl`).
- Logo Container: Circular frame `w-28 h-28` (112px x 112px), white background, 2px border in `excel-mediumGreen`, shadow-lg.
- Logo Image: `src="/logo.jpg"`, `fill`, `object-contain`.
- Heading: `text-base font-extrabold tracking-wider uppercase text-excel-darkGreen`.
- Subtitle: `text-xs text-gray-600 font-medium`.
- Interactive Controls: Input fields and action button `h-10` (40px) minimum tap target.

---

## 2. `WindowTitleBar` Contract (`src/components/layout/WindowTitleBar.tsx`)

### Props Interface
```typescript
interface WindowTitleBarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}
```

### Visual Specifications
- Height: `h-12` (48px)
- Logo Container: `w-9 h-9` (36px x 36px), rounded white surface with subtle border.
- Title: `text-xs font-bold tracking-wide uppercase`.
- Role Badge: Clear contrast pill badge with explicit role name translation.
- Action Button: "Cambiar Usuario / Salir" button with minimum 32px height, icon, and clear red hover state.

---

## 3. `PublicPriceTable` Contract (`src/components/catalog/PublicPriceTable.tsx`)

### Props Interface
```typescript
interface PublicPriceTableProps {
  products: ProductItem[];
  rates: ExchangeRates;
  onPrint?: () => void;
}
```

### Visual Specifications
- Header Banner:
  - Left: Logo container `w-14 h-14` (56px) + Title "MERCANTIL MARIANA — LISTA DE PRECIOS AL PÚBLICO".
  - Right: Exchange rate pill and "Imprimir Catálogo" button (`h-9` / 36px minimum).
- Toolbar: Search input (`h-9`), category selector (`h-9`).
- Table Structure:
  - Sticky Header (`sticky top-0 z-10 shadow-sm`).
  - Row Hover: `hover:bg-emerald-50/50 transition-colors`.
  - Column Color Differentiation:
    - Precios BCV ($): `bg-gray-100 text-gray-900 font-mono font-bold`
    - Precio Venta (Bs.): `bg-excel-lightSage/60 text-excel-darkGreen font-mono font-extrabold`
    - Promo Divisas ($): `bg-amber-100/70 text-amber-950 font-mono font-bold`
    - Promo 2 ($): `bg-emerald-100/70 text-emerald-950 font-mono font-bold`
- Print Mode: Media query `@media print` displaying full-width header with logo, hide toolbars and app shell.
