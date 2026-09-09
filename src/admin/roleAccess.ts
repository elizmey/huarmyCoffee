export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  recepcionista: 'Recepcionista',
  cajero: 'Cajero',
};

export type ModuleDef = {
  key: string;
  path: string;
  label: string;
  roles: string[];
};

export const MODULES: ModuleDef[] = [
  { key: 'dashboard', path: '/admin', label: 'Dashboard', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'scorecard', path: '/admin/scorecard', label: 'Tablero BSC', roles: ['admin', 'gerente'] },
  { key: 'clientes', path: '/admin/clientes', label: 'Clientes', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'citas', path: '/admin/citas', label: 'Citas', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'pedidos', path: '/admin/pedidos', label: 'Pedidos y caja', roles: ['admin', 'gerente', 'recepcionista', 'cajero'] },
  { key: 'menu', path: '/admin/menu', label: 'Menú', roles: ['admin', 'gerente', 'recepcionista'] },
  { key: 'inventarios', path: '/admin/inventarios', label: 'Inventarios', roles: ['admin', 'gerente', 'recepcionista'] },
  { key: 'capacidad', path: '/admin/capacidad', label: 'Capacidad', roles: ['admin', 'gerente', 'recepcionista'] },
  { key: 'sucursales', path: '/admin/sucursales', label: 'Sucursales', roles: ['admin', 'gerente'] },
  { key: 'proveedores', path: '/admin/proveedores', label: 'Proveedores', roles: ['admin', 'gerente'] },
  { key: 'socios', path: '/admin/socios', label: 'Socios', roles: ['admin', 'gerente'] },
  { key: 'comunicacion', path: '/admin/comunicacion', label: 'Comunicación', roles: ['admin', 'gerente'] },
  { key: 'usuarios', path: '/admin/usuarios', label: 'Usuarios', roles: ['admin'] },
];

export function currentRole(): string {
  try {
    return JSON.parse(localStorage.getItem('adminUser') || '{}').rol || '';
  } catch {
    return '';
  }
}

function normalizePath(path: string): string {
  const p = path.replace(/\/$/, '') || '/admin';
  if (p === '/admin/servicios' || p === '/admin/galeria' || p === '/admin/promociones') return '/admin/menu';
  if (p === '/admin/personal') return '/admin/usuarios';
  return p;
}

export function canAccessModule(path: string, rol = currentRole()): boolean {
  if (rol === 'admin') return true;
  const mapped = normalizePath(path);
  if (mapped === '/admin/roles') return false;
  const mod = MODULES.find((m) => (m.path === '/admin' ? mapped === '/admin' : mapped === m.path || mapped.startsWith(`${m.path}/`)));
  if (!mod) return false;
  return mod.roles.includes(rol);
}
