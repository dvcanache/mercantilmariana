# UI Contracts: Product Management Components

**Feature**: `003-product-management`  
**Date**: 2026-11-06  
**Status**: Ready for Implementation  

---

## 1. `ProductFormModal.tsx`

Modal dialog used for creating new products and editing existing products.

### Props Contract
```typescript
export interface ProductFormData {
  id?: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  supplierCostUsd: number;
  targetMarginPercentage: number;
  unitOfMeasure: string;
  currentStock: number;
  active?: boolean;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: ProductFormData | null;
  existingCategories?: string[];
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}
```

### Visual & Interactive Specifications
- **Window Header**: Styled in Excel dark green (`#1E4620`), matching `SalesFormModal` and `RateUpdateModal` with title:
  - Create: `Nuevo Producto — Registro en Catálogo`
  - Edit: `Editar Producto — [SKU] [Nombre]`
  - Right-aligned close button (`win-ctrl-btn close`).
- **Form Layout**: 2-column responsive layout for compact spreadsheet feel:
  - Column 1: SKU, Nombre del Producto, Categoría (Select existing or type new), Marca.
  - Column 2: Modelo, Costo Proveedor ($), Margen de Contribución (%), Unidad de Medida, Stock Actual.
  - Full width: Active switch / checkbox ("Producto Activo en Catálogo").
- **Real-Time Live Price Preview**: Shows estimated calculated prices (Unit Cost, BCV USD, Retail Bs, Cash Promo) as the user adjusts Cost and Margin.
- **Footer**:
  - `Cancelar` button (`win-btn`).
  - `Guardar Producto` primary button (`win-btn primary`), displays loading state during submission.

---

## 2. `PriceControlTable.tsx` Enhancements

Enhancements to the main price control table view.

### Added Controls
1. **Header Action Bar**:
   - `＋ Nuevo Producto` primary action button (visible when `!readOnly`), opens `ProductFormModal` in `create` mode.
   - Filter dropdown or toggle: `Mostrar archivados` to inspect deactivated products.
2. **Row Action Buttons**:
   - `Editar` action: Opens `ProductFormModal` in `edit` mode pre-filled with row data.
   - `Eliminar` action: Opens confirmation prompt:
     - Prompts: *"¿Está seguro de eliminar o archivar este producto?"*
     - Invokes `DELETE /api/products/[id]`.
     - Displays feedback toast or notification if the item was permanently deleted or archived.
3. **Status Indicator**:
   - Visual pill badge for Active (`Activo` green) vs Archived (`Archivado` gray).

---

## 3. `AppShell.tsx` / `AppRibbon.tsx` Integration

- Exposes an optional quick action `onOpenNewProductModal?: () => void` when user is `ADMIN` or `MANAGER`.
- Updates the product state across the app upon creation/update/deletion so that the public catalog and sales point immediately reflect catalog changes without a full page refresh.
