# Mercantil Mariana — Sistema Bi-Monetario y Control de Precios

Sistema comercial y financiero bi-monetario desarrollado para **Mercantil Mariana**, con autenticación segura, control de acceso basado en roles (RBAC) y gestión de precios según la tasa oficial BCV y la tasa de reposición en divisas.

---

## 👥 Cuentas de Acceso Preconfiguradas

| Rol / Categoría | Correo / Usuario | Contraseña | Permisos y Alcance |
|---|---|---|---|
| **Master (Administrador)** | `admin@mercantilmariana.com` | `admin123` | **Acceso Total**: Control de precios, finanzas, ventas, punto de equilibrio y administración completa de usuarios y credenciales (`/usuarios`). Protegido contra eliminación accidental del último Master. |
| **Gerente Comercial** | `gerente@mercantilmariana.com` | `gerente123` | **Operaciones y Finanzas**: Control de márgenes, tasas de cambio, registro de ventas y punto de equilibrio. Sin acceso a gestión de usuarios. |
| **Vendedor (Solo Precios)** | `vendedor@mercantilmariana.com` | `vendedor123` | **Restricción Estricta**: Acceso exclusivo a la **Lista de Precios al Público**. Los costos confidenciales de proveedores y márgenes de ganancia están completamente ocultos y omitidos del tráfico de red. |

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
pnpm install

# 2. Generar cliente de Prisma
pnpm prisma:generate

# 3. Poblar base de datos con cuentas y catálogo
pnpm seed

# 4. Iniciar servidor de desarrollo
pnpm dev
```
Abra [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🧪 Pruebas Automatizadas

Ejecutar la suite completa de pruebas unitarias y de integración:
```bash
pnpm test
```

---

## 🔒 Seguridad y Control de Acceso (RBAC)

1. **Protección en el Borde (Next.js Edge Middleware)**: Todas las rutas protegidas interceptan visitantes no autenticados y los redirigen a `/login`.
2. **Aislamiento del Rol Vendedor**: Redirige cualquier intento de navegación fuera de `/lista-precios` y bloquea solicitudes API a módulos financieros o de usuarios.
3. **Protección de Cuenta Maestra**: La API bloquea automáticamente cualquier intento de eliminar o degradar la última cuenta activa con rol `ADMIN`.
4. **Sanitización de Datos de Proveedor**: La API `/api/products` entrega proyecciones precalculadas para el rol `SALES_CLERK`, garantizando 0% de filtración de costos o márgenes confidenciales.
