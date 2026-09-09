const ROLES = ['admin', 'gerente', 'recepcionista', 'cajero'];

const ROLE_LABELS = {
  admin: 'Administrador',
  gerente: 'Gerente',
  recepcionista: 'Recepcionista',
  cajero: 'Cajero',
};

const MODULES = [
  { key: 'dashboard', path: '/admin', api: '/api/dashboard', label: 'Dashboard', identidad: 'Tablero operativo con conteos y resumen BSC.', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'scorecard', path: '/admin/scorecard', api: '/api/indicadores', label: 'Tablero de comando BSC', identidad: 'Indicadores, estándares y perspectivas del Balanced Scorecard, con foco en procesos.', roles: ['admin', 'gerente'] },
  { key: 'clientes', path: '/admin/clientes', api: '/api/clientes', label: 'Clientes', identidad: 'Registro y actualización del repositorio de clientes.', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'citas', path: '/admin/citas', api: '/api/citas', label: 'Citas', identidad: 'Agenda de reservas y atención de sede.', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'pedidos', path: '/admin/pedidos', api: '/api/pedidos', label: 'Pedidos y caja', identidad: 'Recepción de pedidos de mostrador y registro de cobros.', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'menu', path: '/admin/menu', api: '/api/servicios', label: 'Menú', identidad: 'Página única con Servicios y Productos, Galería, y Promociones y Paquetes.', roles: ['admin', 'gerente', 'recepcionista'] },
  { key: 'inventarios', path: '/admin/inventarios', api: '/api/inventarios', label: 'Inventarios', identidad: 'Existencias por sucursal y alerta de stock bajo.', roles: ['admin', 'gerente', 'recepcionista'] },
  { key: 'capacidad', path: '/admin/capacidad', api: '/api/sucursales', label: 'Capacidad', identidad: 'Aforo y ocupación de personal por sucursal.', roles: ['admin', 'gerente', 'recepcionista'] },
  { key: 'sucursales', path: '/admin/sucursales', api: '/api/sucursales', label: 'Sucursales', identidad: 'Sedes, dirección, cupo y estado.', roles: ['admin', 'gerente'] },
  { key: 'proveedores', path: '/admin/proveedores', api: '/api/proveedores', label: 'Proveedores', identidad: 'Cadena de abastecimiento.', roles: ['admin', 'gerente'] },
  { key: 'socios', path: '/admin/socios', api: '/api/socios', label: 'Socios', identidad: 'Aliados comerciales y de negocio.', roles: ['admin', 'gerente'] },
  { key: 'comunicacion', path: '/admin/comunicacion', api: '/api/comunicaciones', label: 'Comunicación', identidad: 'Mensajería interna y registro histórico gerencial.', roles: ['admin', 'gerente'] },
  { key: 'usuarios', path: '/admin/usuarios', api: '/api/usuarios', label: 'Usuarios', identidad: 'Cuentas, roles y sucursal asignada.', roles: ['admin'] },
];

const TABLE_ROLES = {
  clientes: ['admin', 'gerente', 'recepcionista', 'cajero'],
  citas: ['admin', 'gerente', 'recepcionista', 'cajero'],
  pedidos: ['admin', 'gerente', 'recepcionista', 'cajero'],
  pedido_items: ['admin', 'gerente', 'recepcionista', 'cajero'],
  pedido_detalles: ['admin', 'gerente', 'recepcionista', 'cajero'],
  servicios: ['admin', 'gerente', 'recepcionista'],
  categorias: ['admin', 'gerente', 'recepcionista'],
  inventarios: ['admin', 'gerente', 'recepcionista'],
  sucursales: ['admin', 'gerente', 'recepcionista'],
  personal: ['admin', 'gerente'],
  proveedores: ['admin', 'gerente'],
  socios: ['admin', 'gerente'],
  galeria: ['admin', 'gerente'],
  promociones: ['admin', 'gerente'],
  comunicaciones: ['admin', 'gerente'],
  indicadores: ['admin', 'gerente'],
  postulaciones: ['admin', 'gerente'],
  configuracion: ['admin'],
  mision_vision: ['admin', 'gerente'],
  proyecto_tareas: ['admin', 'gerente'],
};

const BRANCH_SCOPED = ['citas', 'inventarios', 'personal', 'pedidos'];

function canAccess(rol, moduleKey) {
  if (rol === 'admin') return true;
  const mod = MODULES.find((m) => m.key === moduleKey);
  return Boolean(mod && mod.roles.includes(rol));
}

function canAccessTable(rol, tableName) {
  if (rol === 'admin') return true;
  const allowed = TABLE_ROLES[tableName];
  return Array.isArray(allowed) && allowed.includes(rol);
}

module.exports = {
  ROLES,
  ROLE_LABELS,
  MODULES,
  TABLE_ROLES,
  BRANCH_SCOPED,
  canAccess,
  canAccessTable,
};
