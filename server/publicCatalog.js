const FALLBACK_SERVICIOS = [
  { id: 101, categoria_id: 1, categoria_nombre: 'Desayunos', nombre: 'Desayuno Andino', descripcion: 'Huevos, tortilla de papa, chorizo y café', precio: 3.5, duracion: 15, activo: true },
  { id: 102, categoria_id: 1, categoria_nombre: 'Desayunos', nombre: 'Bowl de Frutas con Granola', descripcion: 'Frutas de temporada, granola casera y yogurt', precio: 2.75, duracion: 10, activo: true },
  { id: 103, categoria_id: 1, categoria_nombre: 'Desayunos', nombre: 'Tostadas Francesas', descripcion: 'Con miel de panela y fruta', precio: 3.0, duracion: 12, activo: true },
  { id: 104, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Locro de Papa', descripcion: 'Sopa cremosa con aguacate y queso', precio: 3.25, duracion: 25, activo: true },
  { id: 105, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Seco de Pollo', descripcion: 'Con arroz, plátano maduro y aguacate', precio: 4.0, duracion: 30, activo: true },
  { id: 106, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Fritada Tradicional', descripcion: 'Con mote, tostado y curtido', precio: 4.5, duracion: 35, activo: true },
  { id: 107, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Llapingachos con Chorizo', descripcion: 'Tortillas de papa con chorizo y ensalada', precio: 4.25, duracion: 25, activo: true },
  { id: 108, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Café de Especialidad', descripcion: 'Grano ecuatoriano, tueste medio', precio: 1.5, duracion: 5, activo: true },
  { id: 109, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Chocolate Artesanal', descripcion: 'Cacao ecuatoriano con canela', precio: 1.75, duracion: 8, activo: true },
  { id: 110, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Jugo Natural', descripcion: 'Fruta de temporada a elección', precio: 1.5, duracion: 5, activo: true },
  { id: 111, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Colada Morada', descripcion: 'Bebida tradicional de temporada', precio: 1.75, duracion: 10, activo: true },
  { id: 112, categoria_id: 4, categoria_nombre: 'Postres', nombre: 'Pastel de Choclo Dulce', descripcion: 'Receta tradicional con queso', precio: 2.0, duracion: 10, activo: true },
  { id: 113, categoria_id: 4, categoria_nombre: 'Postres', nombre: 'Espumilla', descripcion: 'Postre de guayaba batida', precio: 1.5, duracion: 5, activo: true },
  { id: 114, categoria_id: 4, categoria_nombre: 'Postres', nombre: 'Quesadillas Ecuatorianas', descripcion: 'Horneadas, rellenas de queso dulce', precio: 1.75, duracion: 8, activo: true },
  { id: 115, categoria_id: 5, categoria_nombre: 'Catering Corporativo', nombre: 'Paquete Coffee Break', descripcion: 'Café, bocaditos dulces y salados por persona', precio: 3.0, duracion: null, activo: true },
  { id: 116, categoria_id: 5, categoria_nombre: 'Catering Corporativo', nombre: 'Paquete Almuerzo Ejecutivo', descripcion: 'Entrada, plato fuerte y bebida por persona', precio: 5.5, duracion: null, activo: true },
  { id: 117, categoria_id: 5, categoria_nombre: 'Catering Corporativo', nombre: 'Paquete Evento Premium', descripcion: 'Menú completo con postre y bebida por persona', precio: 9.5, duracion: null, activo: true },
];

const FALLBACK_PROMOCIONES = [
  {
    id: 201,
    titulo: 'Coffee Break Corporativo',
    descripcion: 'Paquete especial para reuniones empresariales, mínimo 15 personas.',
    tipo: 'Corporativa',
    precio: 4.0,
    fecha_inicio: null,
    fecha_fin: null,
    url_imagen: '/imagenes/servicios/comida1.jpg',
    activo: true,
  },
  {
    id: 202,
    titulo: 'Paquete Cumpleaños Dulce',
    descripcion: 'Torta, bocaditos y bebidas para tu celebración especial.',
    tipo: 'Celebración',
    precio: 6.5,
    fecha_inicio: null,
    fecha_fin: null,
    url_imagen: '/imagenes/servicios/comida2.jpg',
    activo: true,
  },
  {
    id: 203,
    titulo: 'Delivery Corporativo Semanal',
    descripcion: 'Entregas programadas de almuerzos ejecutivos para tu oficina.',
    tipo: 'Logística',
    precio: 8.5,
    fecha_inicio: null,
    fecha_fin: null,
    url_imagen: '/imagenes/servicios/comida3.jpg',
    activo: true,
  },
];

function orFallback(rows, fallback) {
  return Array.isArray(rows) && rows.length ? rows : fallback;
}

module.exports = { FALLBACK_SERVICIOS, FALLBACK_PROMOCIONES, orFallback };
