# Interface Contract: REST API Route Handlers

**Feature**: `001-sales-price-control`
**Date**: 2026-11-05
**Status**: Draft

All endpoints are hosted under `/api/*` using Next.js Route Handlers. JSON is the primary input/output format.

---

## 1. Authentication & Session

### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@mercantilmariana.com",
    "password": "string"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": "cuid...",
      "name": "Administrador General",
      "email": "admin@mercantilmariana.com",
      "role": "ADMIN"
    },
    "token": "jwt..."
  }
  ```

---

## 2. Currency Rates

### `GET /api/rates`
Retrieves current active exchange rates and the calculated exchange factor.
- **Response `200 OK`**:
  ```json
  {
    "rates": {
      "supplierReplacementRate": 970.00,
      "officialBcvRate": 849.56,
      "promoDiscountPercentage": 0.06,
      "exchangeFactor": 0.875835,
      "updatedAt": "2026-11-05T14:00:00Z"
    }
  }
  ```

### `PUT /api/rates`
Updates rates manually (Admin only).
- **Request Body**:
  ```json
  {
    "supplierReplacementRate": 985.00,
    "officialBcvRate": 855.20,
    "promoDiscountPercentage": 0.06
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "rates": { ... }
  }
  ```

### `POST /api/rates/sync`
Fetches current BCV rate from official exchange service and returns preview/updated setting.
- **Response `200 OK`**:
  ```json
  {
    "source": "BCV_API",
    "officialBcvRate": 851.30,
    "synchronizedAt": "2026-11-05T14:45:00Z"
  }
  ```

---

## 3. Products & Pricing Control

### `GET /api/products`
Query parameters: `?category=CAT-01&search=colchon&view=control|catalog`
- `view=catalog` (Sales Clerk): Hides `supplierCostUsd`, `targetMarginPercentage`, and gross margins.
- `view=control` (Admin/Manager): Returns full financial details.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "cuid...",
      "sku": "PROD-001",
      "name": "Colchón Matrimonial Ortopédico",
      "category": { "code": "CAT-01", "name": "Colchones" },
      "brand": "Pullman",
      "model": "Ortopédico Plus",
      "unitOfMeasure": "Unidad",
      "currentStock": 15,
      "pricing": {
        "supplierCostUsd": 180.00,
        "factor": 0.8758,
        "adjustedUnitCostUsd": 158.00,
        "targetMarginPercentage": 0.50,
        "bcvPriceUsd": 316.00,
        "salePriceBs": 268461.00,
        "grossMarginBs": 134231.00,
        "promoPriceUsd": 277.00,
        "promoPriceUsd2": 261.00,
        "grossMarginPromoUsd": 119.00
      }
    }
  ]
  ```

### `PUT /api/products/:id`
Updates product base cost, margin percentage, or metadata.
- **Request Body**:
  ```json
  {
    "supplierCostUsd": 185.00,
    "targetMarginPercentage": 0.50,
    "currentStock": 18
  }
  ```

---

## 4. Sales Transactions

### `GET /api/sales`
Query parameters: `?startDate=2026-09-01&endDate=2026-09-30&limit=50`
- **Response `200 OK`**:
  ```json
  {
    "transactions": [
      {
        "id": "cuid...",
        "date": "2026-09-21T00:00:00Z",
        "paymentMethod": "DIVISAS_EFECTIVO",
        "invoiceNumber": "F-1024",
        "product": { "id": "...", "name": "Colchón Matrimonial Ortopédico" },
        "quantity": 1,
        "unitSalePriceUsd": 277.00,
        "unitCostUsd": 158.00,
        "totalSaleUsd": 277.00,
        "unitMarginUsd": 119.00,
        "totalMarginUsd": 119.00
      }
    ],
    "totalCount": 1
  }
  ```

### `POST /api/sales`
Records a new sale, automatically resolving current product costs and margins.
- **Request Body**:
  ```json
  {
    "date": "2026-11-05T14:30:00Z",
    "paymentMethod": "DIVISAS_EFECTIVO",
    "productId": "cuid...",
    "invoiceNumber": "F-1025",
    "quantity": 2,
    "unitSalePriceUsd": 277.00
  }
  ```

---

## 5. Fixed Costs & Break-Even

### `GET /api/break-even`
- **Response `200 OK`**:
  ```json
  {
    "fixedCosts": [
      { "id": "...", "concept": "Alquiler de Local Comercial", "monthlyAmountUsd": 450.00, "sharePercentage": 0.28125 },
      { "id": "...", "concept": "Sueldos y Salarios del Personal", "monthlyAmountUsd": 700.00, "sharePercentage": 0.43750 }
    ],
    "totalFixedCostsUsd": 1600.00,
    "totalFixedCostsBs": 1359296.00,
    "averageMargin": 0.04577,
    "breakEvenMonthUsd": 34954.95,
    "breakEvenMonthBs": 29696331.53,
    "dailyTargetMinUsd": 1165.17,
    "dailyTargetMinBs": 989877.72
  }
  ```

---

## 6. Executive Dashboard & Metrics

### `GET /api/dashboard/summary`
- **Response `200 OK`**:
  ```json
  {
    "kpis": {
      "dailyProfitUsd": 62.00,
      "weeklyProfitUsd": 643.00,
      "monthlyProfitUsd": 1224.00,
      "annualProfitUsd": 1911.00,
      "monthlyFixedCostsUsd": 1600.00,
      "monthlyNetIncomeUsd": -376.00
    },
    "monthlyConsolidated": [
      { "month": "Enero", "salesUsd": 0.00, "grossProfitUsd": 0.00, "fixedCostsUsd": 1600.00, "netIncomeUsd": -1600.00, "netMarginPercent": 0.00 },
      { "month": "Septiembre", "salesUsd": 3250.00, "grossProfitUsd": 1224.00, "fixedCostsUsd": 1600.00, "netIncomeUsd": -376.00, "netMarginPercent": -0.1157 }
    ]
  }
  ```
