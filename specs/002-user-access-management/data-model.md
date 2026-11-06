# Data Model: User Authentication and Role-Based Access Control

**Feature**: `002-user-access-management`  
**Date**: 2026-11-06  
**Status**: Draft  

---

## 1. Entities & Database Schema

### 1.1 `UserRole` Enum
Defines the authorization tiers in the application:
```prisma
enum UserRole {
  ADMIN        // Master / Administrador General (Full access + User Management)
  MANAGER      // Gerente Comercial (Full financial/operational access, no user admin)
  SALES_CLERK  // Vendedor / Lista de Precios (Restricted strictly to Price List)
}
```

### 1.2 `User` Model
Represents staff user accounts managed by the Master user:
```prisma
model User {
  id           String             @id @default(cuid())
  email        String             @unique
  name         String
  passwordHash String
  role         UserRole           @default(SALES_CLERK)
  active       Boolean            @default(true)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  sales        SaleTransaction[]

  @@index([role, active])
}
```

#### Fields Description
- `id`: Unique identifier (CUID).
- `email`: User's login identifier / email address (unique, lowercased).
- `name`: Full display name of the staff member (e.g., "Juan Pérez").
- `passwordHash`: Bcrypt hash (salt rounds 10) of user's password. Never returned in API responses.
- `role`: Access tier enum (`ADMIN`, `MANAGER`, `SALES_CLERK`).
- `active`: Boolean flag indicating whether the user is permitted to authenticate. If `false`, login is denied and active sessions are terminated.
- `createdAt`: Timestamp when the account was registered.
- `updatedAt`: Timestamp when the account was last updated.

---

## 2. Session Entity (JWT Claims)

Stored in the `session_token` HTTP-only signed cookie:

| Claim | Type | Description |
|---|---|---|
| `id` | `string` | User ID |
| `email` | `string` | User email address |
| `name` | `string` | User display name |
| `role` | `UserRole` | User role (`ADMIN`, `MANAGER`, `SALES_CLERK`) |
| `iat` | `number` | Issued At timestamp (Unix epoch seconds) |
| `exp` | `number` | Expiration timestamp (7 days from issuance) |

---

## 3. Data Projections & Sanitization

### 3.1 Full Product Model (ADMIN / MANAGER)
Contains complete financial margin structure:
```typescript
interface FullProductItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  category: { id: string; name: string };
  supplierCostUsd: number;        // Confidential: Wholesale purchase cost
  targetMarginPercentage: number; // Confidential: Contribution margin %
  unitOfMeasure: string;
  currentStock: number;
  active: boolean;
  pricing: {
    unitCostUsd: number;
    bcvPriceUsd: number;
    salePriceBs: number;
    profitBs: number;
    promoPriceUsd: number;
    promoPriceUsd2: number;
  };
}
```

### 3.2 Sanitized Product Model (SALES_CLERK / Price List Viewer)
Sanitized projection stripped of all supplier costs and internal margin data:
```typescript
interface SanitizedProductItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  categoryName: string;
  unitOfMeasure: string;
  pricing: {
    bcvPriceUsd: number;       // Official BCV Retail USD Price
    salePriceBs: number;       // Retail Bolívares Price
    promoPriceUsd: number;     // Cash Promo USD Price
    promoPriceUsd2: number;    // Secondary Promo USD Price
  };
}
```

---

## 4. Validation Rules & State Transitions

### 4.1 User Creation & Updates
- **Email**: Must be a valid email format, trimmed, and converted to lowercase. Must be unique across all users.
- **Name**: Must be non-empty string, 2-100 characters.
- **Password**: Minimum 6 characters required when creating a user or resetting password.
- **Role**: Must be a valid `UserRole` value (`ADMIN`, `MANAGER`, `SALES_CLERK`).

### 4.2 Sole Master Account Protection Guardrail
```text
State Transition:
  Target User is currently ADMIN and active:
  Attempting: Delete User OR Set active=false OR Update role != ADMIN
  Rule:
    Count active ADMINs in system.
    If count <= 1:
      REJECT operation with HTTP 400 Bad Request
      Message: "Operación rechazada: Debe existir al menos una cuenta de Administrador activa en el sistema."
```
