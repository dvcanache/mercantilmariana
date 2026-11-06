# API Contract: Authentication & Session (`/api/auth`)

## 1. POST `/api/auth/login`
Authenticates a user using credentials and returns a session token + sets the HTTP-only cookie.

### Request
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "email": "admin@mercantilmariana.com",
  "password": "admin123"
}
```

### Responses
- **200 OK**:
```json
{
  "success": true,
  "user": {
    "id": "cuid-user-1",
    "email": "admin@mercantilmariana.com",
    "name": "Administrador General",
    "role": "ADMIN"
  },
  "redirectUrl": "/control-precios"
}
```
*Note: If user role is `SALES_CLERK`, `redirectUrl` is `/lista-precios`.*
*Header*: `Set-Cookie: session_token=<jwt>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; ...`

- **401 Unauthorized**:
```json
{
  "error": "Credenciales inválidas"
}
```

- **403 Forbidden**: (When user exists but `active === false`):
```json
{
  "error": "Esta cuenta ha sido desactivada por el administrador"
}
```

---

## 2. POST `/api/auth/logout`
Terminates the current session and clears the session cookie.

### Request
- **Method**: `POST`
- **Headers**: Cookie `session_token`

### Responses
- **200 OK**:
```json
{
  "success": true,
  "message": "Sesión finalizada correctamente"
}
```
*Header*: `Set-Cookie: session_token=; Path=/; HttpOnly; Max-Age=0`

---

## 3. GET `/api/auth/me`
Retrieves the currently authenticated user's profile and permissions.

### Request
- **Method**: `GET`
- **Headers**: Cookie `session_token` or `Authorization: Bearer <token>`

### Responses
- **200 OK**:
```json
{
  "authenticated": true,
  "user": {
    "id": "cuid-user-1",
    "email": "admin@mercantilmariana.com",
    "name": "Administrador General",
    "role": "ADMIN"
  }
}
```

- **401 Unauthorized**:
```json
{
  "authenticated": false,
  "user": null
}
```
