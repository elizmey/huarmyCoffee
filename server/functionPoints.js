const WEIGHTS = {
  ILF: { baja: 7, media: 10, alta: 15 },
  EIF: { baja: 5, media: 7, alta: 10 },
  EI: { baja: 3, media: 4, alta: 6 },
  EO: { baja: 4, media: 5, alta: 7 },
  EQ: { baja: 3, media: 4, alta: 6 },
};

const CATALOG = [
  { tipo: 'ILF', nombre: 'Clientes', complejidad: 'media', det: 5, descripcion: 'Archivo lógico de clientes.' },
  { tipo: 'ILF', nombre: 'Usuarios y roles', complejidad: 'media', det: 7, descripcion: 'Cuentas internas, rol y sucursal.' },
  { tipo: 'ILF', nombre: 'Sucursales y capacidad', complejidad: 'baja', det: 6, descripcion: 'Sedes y aforo.' },
  { tipo: 'ILF', nombre: 'Servicios y categorías', complejidad: 'media', det: 8, descripcion: 'Catálogo de menú.' },
  { tipo: 'ILF', nombre: 'Citas', complejidad: 'media', det: 6, descripcion: 'Reservas y estados.' },
  { tipo: 'ILF', nombre: 'Inventarios', complejidad: 'media', det: 6, descripcion: 'Stock por sucursal.' },
  { tipo: 'ILF', nombre: 'Indicadores BSC', complejidad: 'baja', det: 6, descripcion: 'Metas, estándares y perspectivas.' },
  { tipo: 'ILF', nombre: 'Plan del proyecto', complejidad: 'media', det: 6, descripcion: 'Tareas, predecesoras y CPM.' },
  { tipo: 'ILF', nombre: 'Bitácora', complejidad: 'baja', det: 7, descripcion: 'Auditoría de acciones.' },
  { tipo: 'ILF', nombre: 'Contenido público', complejidad: 'alta', det: 12, descripcion: 'Galería, promociones, misión, configuración, postulaciones.' },
  { tipo: 'EIF', nombre: 'Firebase Auth (opcional)', complejidad: 'baja', det: 3, descripcion: 'Identidad externa opcional.' },
  { tipo: 'EI', nombre: 'Login / reset de contraseña', complejidad: 'media', det: 4, descripcion: 'Entradas de autenticación.' },
  { tipo: 'EI', nombre: 'CRUD autenticado', complejidad: 'alta', det: 20, descripcion: 'Altas y cambios de las entidades de negocio.' },
  { tipo: 'EI', nombre: 'Reserva pública y postulación', complejidad: 'media', det: 8, descripcion: 'Entradas del sitio público.' },
  { tipo: 'EO', nombre: 'Dashboard y tablero BSC', complejidad: 'media', det: 10, descripcion: 'Reportes gerenciales con gráficos.' },
  { tipo: 'EO', nombre: 'Informe de bitácora', complejidad: 'media', det: 7, descripcion: 'Salida de auditoría para el superadmin.' },
  { tipo: 'EO', nombre: 'Red crítica / Gantt', complejidad: 'media', det: 8, descripcion: 'Salida de CPM y holguras.' },
  { tipo: 'EQ', nombre: 'Consultas públicas', complejidad: 'media', det: 8, descripcion: 'Menú, sucursales, galería, misión.' },
  { tipo: 'EQ', nombre: 'Consultas de módulos internos', complejidad: 'alta', det: 16, descripcion: 'Listados GET del back-office.' },
];

function buildFunctionPoints() {
  const items = CATALOG.map((item) => ({
    ...item,
    puntos: WEIGHTS[item.tipo][item.complejidad],
  }));
  const ufp = items.reduce((sum, item) => sum + item.puntos, 0);
  const gscPromedio = 3;
  const vaf = 0.65 + 0.01 * (14 * gscPromedio);
  const afp = Math.round(ufp * vaf * 100) / 100;
  const porTipo = items.reduce((acc, item) => {
    acc[item.tipo] = (acc[item.tipo] || 0) + item.puntos;
    return acc;
  }, {});
  return {
    metodo: 'IFPUG — puntos de función no ajustados (UFP) y ajustados (AFP)',
    vaf,
    gsc: { factores: 14, valor_medio: gscPromedio, formula: 'VAF = 0.65 + 0.01 × ΣGSC' },
    ufp,
    afp,
    porTipo,
    items,
  };
}

module.exports = { buildFunctionPoints };
