# Huarmy Coffee

Sistema web de cafetería y restaurante: sitio público, portal empresarial y panel de administración. El expediente académico (puntos de función, Gantt, red crítica, roles, dashboard, indicadores, BSC y modularidad) está en [INFORME.md](INFORME.md).

## Qué incluye

**Sitio público** (`/`): inicio, menú, promociones, historia, servicios, ubicación, contacto (reserva y WhatsApp) y acceso al portal.

**Portal** (`/portal`): entrada empresarial.

**Admin** (`/admin`): dashboard, tablero BSC, menú (pestañas), citas, pedidos y caja, clientes, proveedores, socios, sucursales, inventarios, capacidad, comunicación y usuarios.

## Stack

- Cliente: React (TypeScript/TSX), Create React App, puerto **3000**
- API: Express (JavaScript), puerto **3001** (`proxy` del front apunta aquí)
- Base de datos: PostgreSQL
- Auth: JWT + bcrypt (Firebase Auth es opcional)

## Arranque local

1. PostgreSQL con las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` (o los valores por defecto de `server/db.js`).
2. Instalar dependencias: `npm install`
3. Esquema y usuarios de prueba: `npm run seed`
4. API: `npm run api`
5. Front: `npm start`

En otra terminal, o todo junto: `npm run dev`.

En **Node 17+** (incluye Node 24) el front de CRA suele necesitar:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm start
```

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Superadmin (`admin`) | `admin@huarmycoffee.com` | `admin123` |
| Recepcionista | `recepcionista@huarmycoffee.com` | `recepcionista123` |

Roles del sistema: `admin`, `gerente`, `recepcionista`, `cajero`. Quién ve cada módulo está en [INFORME.md](INFORME.md) (sección 4). El superadmin consulta el reporte de bitácora (`GET /api/auditoria`): qué hicieron los demás en el portal.

## Scripts

| Script | Uso |
|---|---|
| `npm start` | Front en http://localhost:3000 |
| `npm run api` | API en http://localhost:3001 |
| `npm run dev` | API y front a la vez |
| `npm run seed` | `init.sql` + usuarios core |
| `npm run build` | Build de producción del cliente |

## Módulos del admin

| Ruta | Módulo |
|---|---|
| `/admin` | Dashboard (conteos, stock ≤ 3, resumen BSC) |
| `/admin/scorecard` | Tablero de comando BSC (indicadores, meta y estándar; perspectiva Procesos) |
| `/admin/menu` | Servicios y Productos · Galería · Promociones y Paquetes |
| `/admin/citas` | Agenda |
| `/admin/pedidos` | Pedidos y caja |
| `/admin/clientes` | Clientes |
| `/admin/inventarios` | Inventario (Stock Bajo si cantidad ≤ 3) |
| `/admin/capacidad` | Aforo por sucursal |
| `/admin/sucursales` | Sedes |
| `/admin/proveedores` | Proveedores |
| `/admin/socios` | Socios |
| `/admin/comunicacion` | Comunicación interna |
| `/admin/usuarios` | Cuentas, rol y sucursal (solo admin) |

## Entregables académicos

Ver [INFORME.md](INFORME.md): puntos de función IFPUG, diagrama de Gantt, red crítica y holguras, definición de roles, reporte del superadmin, dashboard, indicadores y estándares, tablero BSC (perspectiva Procesos), identidad y modularidad.
