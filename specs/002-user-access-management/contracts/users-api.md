# API Contract: User Administration (`/api/users`)

*Access Restriction: All endpoints below strictly require `role === 'ADMIN'` (Master). Any other role receives HTTP 403 Forbidden.*

---

## 1. GET `/api/users`
Returns all registered user accounts (passwords omitted).

### Request
- **Method**: `GET`
- **Headers**: Cookie `session_token`

### Responses
- **200 OK**:
```json
{
  "users": [
    {
      "id": "cuid-user-1",
      "email": "admin@mercantilmariana.com",
      "name": "Administrador General",
      "role": "ADMIN",
      "active": true,
      "createdAt": "2026-11-06T10:00:00.000Z",
      "updatedAt": "2026-11-06T10:00:00.000Z"
    },
    {
      "id": "cuid-user-2",
      "email": "vendedor@mercantilmariana.com",
      "name": "Vendedor Mostrador",
      "role": "SALES_CLERK",
      "active": true,
      "createdAt": "2026-11-06T10:30:00.000Z",
      "updatedAt": "2026-11-06T10:30:00.000Z"
    }
  ]
}
```

- **403 Forbidden**:
```json
{
  "error": "Acceso restringido: Se requieren permisos de Administrador Master"
}
```

---

## 2. POST `/api/users`
Creates a new staff user account.

### Request
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "email": "carlos@mercantilmariana.com",
  "name": "Carlos Rodríguez",
  "password": "password123",
  "role": "SALES_CLERK"
}
```

### Responses
- **201 Created**:
```json
{
  "success": true,
  "user": {
    "id": "cuid-user-3",
    "email": "carlos@mercantilmariana.com",
    "name": "Carlos Rodríguez",
    "role": "SALES_CLERK",
    "active": true,
    "createdAt": "2026-11-06T11:00:00.000Z"
  }
}
```

- **400 Bad Request**:
```json
{
  "error": "El correo electrónico ya se encuentra registrado"
}
```

---

## 3. PUT `/api/users/[id]`
Updates user details, modifies role, or resets password.

### Request
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "name": "Carlos R. Actualizado",
  "role": "MANAGER",
  "active": true,
  "password": "newPassword456" // optional; only provided when resetting credentials
}
```

### Responses
- **200 OK**:
```json
{
  "success": true,
  "user": {
    "id": "cuid-user-3",
    "email": "carlos@mercantilmariana.com",
    "name": "Carlos R. Actualizado",
    "role": "MANAGER",
    "active": true,
    "updatedAt": "2026-11-06T11:15:00.000Z"
  }
}
```

- **400 Bad Request** (Sole Master Protection):
```json
{
  "error": "No es posible degradar o desactivar la única cuenta de Administrador activa."
}
```

---

## 4. DELETE `/api/users/[id]`
Permanently deletes or deactivates a user account.

### Request
- **Method**: `DELETE`

### Responses
- **200 OK**:
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente"
}
```

- **400 Bad Request** (Sole Master Protection):
```json
{
  "error": "No es posible eliminar la única cuenta de Administrador activa."
}
```
