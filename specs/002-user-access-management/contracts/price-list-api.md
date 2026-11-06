# API Contract: Role-Sanitized Product Catalog (`GET /api/products`)

## Behavior by Role

### 1. Request by ADMIN or MANAGER
Returns full catalog data including confidential supplier cost and target margin percentage:
- **Status**: `200 OK`
- **Item Schema**:
```json
[
  {
    "id": "cuid-prod-1",
    "sku": "PROD-001",
    "name": "NEVERA 12 PIES",
    "brand": "MABE",
    "model": "RMA250",
    "category": { "id": "cat-1", "name": "Refrigeración" },
    "supplierCostUsd": 280.00,
    "targetMarginPercentage": 0.35,
    "currentStock": 5
  }
]
```

### 2. Request by SALES_CLERK (Price List Viewer)
Returns sanitized catalog data with sensitive financial indicators stripped and pre-computed retail pricing:
- **Status**: `200 OK`
- **Item Schema**:
```json
[
  {
    "id": "cuid-prod-1",
    "sku": "PROD-001",
    "name": "NEVERA 12 PIES",
    "brand": "MABE",
    "model": "RMA250",
    "category": { "id": "cat-1", "name": "Refrigeración" },
    "supplierCostUsd": null,
    "targetMarginPercentage": null,
    "currentStock": 5,
    "sanitizedPricing": {
      "bcvPriceUsd": 430.77,
      "salePriceBs": 365965.88,
      "promoPriceUsd": 405.00,
      "promoPriceUsd2": 381.00
    }
  }
]
```
*Zero supplier cost and margin percentages are transmitted.*
