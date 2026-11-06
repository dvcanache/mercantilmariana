# API Contract: Products Management REST API

**Feature**: `003-product-management`  
**Base Path**: `/api/products`  
**Authentication**: Session cookie (`mm_session`) or header; role check enforced.  

---

## 1. List Products: `GET /api/products`

Retrieves the product catalog with derived bi-monetary prices.

### Query Parameters
- `includeArchived` (boolean, optional, default: `false`): When `true` and requested by `ADMIN` or `MANAGER`, returns both active and archived items. For `SALES_CLERK`, always returns only active products.
- `category` (string, optional): Filter by category code or name.
- `search` (string, optional): Filter by SKU, name, brand, or model.

### Response `200 OK`
```json
[
  {
    "id": "prod_1",
    "sku": "PROD-001",
    "name": "Colchón Matrimonial Ortopédico",
    "category": { "id": "cat_1", "name": "Colchonería" },
    "brand": "Simmons",
    "model": "Beautyrest 2024",
    "supplierCostUsd": 180.0,
    "targetMarginPercentage": 0.5,
    "unitOfMeasure": "Unidad",
    "currentStock": 12,
    "active": true,
    "pricing": {
      "exchangeFactor": 0.87583505,
      "unitCostUsd": 157.65,
      "bcvPriceUsd": 315.3,
      "salePriceBs": 268461.0,
      "grossProfitBs": 134440.0,
      "promoPriceUsd": 277,
      "promoPriceUsd2": 261
    }
  }
]
```
*Note: For `SALES_CLERK`, `supplierCostUsd`, `targetMarginPercentage`, `unitCostUsd`, and `grossProfitBs` are masked as `null`.*

---

## 2. Create Product: `POST /api/products`

Creates a new product in the catalog and calculates its initial derived prices.

### Permissions
Restricted to `ADMIN` and `MANAGER` roles. Forbidden (`403`) for `SALES_CLERK`.

### Request Body
```json
{
  "sku": "PROD-021",
  "name": "Licuadora Clásica 3 Velocidades",
  "category": "Electrodomésticos",
  "brand": "Oster",
  "model": "BLST4128",
  "supplierCostUsd": 45.0,
  "targetMarginPercentage": 0.35,
  "unitOfMeasure": "Unidad",
  "currentStock": 20,
  "active": true
}
```

### Response `201 Created`
```json
{
  "id": "prod_21",
  "sku": "PROD-021",
  "name": "Licuadora Clásica 3 Velocidades",
  "category": { "id": "cat_elec", "name": "Electrodomésticos" },
  "brand": "Oster",
  "model": "BLST4128",
  "supplierCostUsd": 45.0,
  "targetMarginPercentage": 0.35,
  "unitOfMeasure": "Unidad",
  "currentStock": 20,
  "active": true,
  "createdAt": "2026-11-06T14:10:00Z"
}
```

### Error Responses
- `400 Bad Request`: Validation failure (missing SKU/name, non-positive cost, margin out of 0-1 bounds).
- `409 Conflict`: Product with this SKU already exists.
- `403 Forbidden`: Authenticated user lacks permission (`SALES_CLERK`).

---

## 3. Update Product: `PUT /api/products/[id]`

Updates any attribute of an existing product.

### Permissions
Restricted to `ADMIN` and `MANAGER` roles.

### Request Body
All fields optional (partial update supported):
```json
{
  "name": "Licuadora Clásica 3 Velocidades Cromada",
  "category": "Electrodomésticos",
  "brand": "Oster",
  "model": "BLST4128-PRO",
  "supplierCostUsd": 48.0,
  "targetMarginPercentage": 0.38,
  "unitOfMeasure": "Unidad",
  "currentStock": 18,
  "active": true
}
```

### Response `200 OK`
```json
{
  "id": "prod_21",
  "sku": "PROD-021",
  "name": "Licuadora Clásica 3 Velocidades Cromada",
  "brand": "Oster",
  "model": "BLST4128-PRO",
  "supplierCostUsd": 48.0,
  "targetMarginPercentage": 0.38,
  "unitOfMeasure": "Unidad",
  "currentStock": 18,
  "active": true,
  "updatedAt": "2026-11-06T14:15:00Z"
}
```

### Error Responses
- `404 Not Found`: Product with specified `id` does not exist.
- `400 Bad Request`: Invalid numeric fields.
- `403 Forbidden`: Unauthorized role.

---

## 4. Delete / Archive Product: `DELETE /api/products/[id]`

Deletes or safely archives a product.

### Permissions
Restricted to `ADMIN` and `MANAGER` roles.

### Behavior
- If product has **0** associated `SaleTransaction`s: **Permanently deleted**.
- If product has **> 0** associated `SaleTransaction`s: Automatically marked `active = false` (archived).

### Response `200 OK` (Hard Delete)
```json
{
  "success": true,
  "action": "DELETED",
  "id": "prod_21",
  "message": "Producto eliminado exitosamente del catálogo"
}
```

### Response `200 OK` (Soft Archive)
```json
{
  "success": true,
  "action": "ARCHIVED",
  "id": "prod_1",
  "message": "El producto tiene ventas registradas en el historial. Ha sido desactivado/archivado para preservar la integridad financiera."
}
```

### Error Responses
- `404 Not Found`: Product does not exist.
- `403 Forbidden`: Unauthorized role.
