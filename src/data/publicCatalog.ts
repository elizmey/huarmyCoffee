import { apiUrl } from '../api';

export type PublicServicio = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria_id?: number;
  categoria_nombre?: string;
};

export const FALLBACK_SERVICIOS: PublicServicio[] = [
  { id: 101, categoria_id: 1, categoria_nombre: 'Desayunos', nombre: 'Desayuno Andino', descripcion: 'Huevos, tortilla de papa, chorizo y café', precio: 3.5 },
  { id: 102, categoria_id: 1, categoria_nombre: 'Desayunos', nombre: 'Bowl de Frutas con Granola', descripcion: 'Frutas de temporada, granola casera y yogurt', precio: 2.75 },
  { id: 103, categoria_id: 1, categoria_nombre: 'Desayunos', nombre: 'Tostadas Francesas', descripcion: 'Con miel de panela y fruta', precio: 3 },
  { id: 104, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Locro de Papa', descripcion: 'Sopa cremosa con aguacate y queso', precio: 3.25 },
  { id: 105, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Seco de Pollo', descripcion: 'Con arroz, plátano maduro y aguacate', precio: 4 },
  { id: 106, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Fritada Tradicional', descripcion: 'Con mote, tostado y curtido', precio: 4.5 },
  { id: 107, categoria_id: 2, categoria_nombre: 'Platos Fuertes', nombre: 'Llapingachos con Chorizo', descripcion: 'Tortillas de papa con chorizo y ensalada', precio: 4.25 },
  { id: 108, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Café de Especialidad', descripcion: 'Grano ecuatoriano, tueste medio', precio: 1.5 },
  { id: 109, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Chocolate Artesanal', descripcion: 'Cacao ecuatoriano con canela', precio: 1.75 },
  { id: 110, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Jugo Natural', descripcion: 'Fruta de temporada a elección', precio: 1.5 },
  { id: 111, categoria_id: 3, categoria_nombre: 'Bebidas', nombre: 'Colada Morada', descripcion: 'Bebida tradicional de temporada', precio: 1.75 },
  { id: 112, categoria_id: 4, categoria_nombre: 'Postres', nombre: 'Pastel de Choclo Dulce', descripcion: 'Receta tradicional con queso', precio: 2 },
  { id: 113, categoria_id: 4, categoria_nombre: 'Postres', nombre: 'Espumilla', descripcion: 'Postre de guayaba batida', precio: 1.5 },
  { id: 114, categoria_id: 4, categoria_nombre: 'Postres', nombre: 'Quesadillas Ecuatorianas', descripcion: 'Horneadas, rellenas de queso dulce', precio: 1.75 },
  { id: 115, categoria_id: 5, categoria_nombre: 'Catering Corporativo', nombre: 'Paquete Coffee Break', descripcion: 'Café, bocaditos dulces y salados por persona', precio: 3 },
  { id: 116, categoria_id: 5, categoria_nombre: 'Catering Corporativo', nombre: 'Paquete Almuerzo Ejecutivo', descripcion: 'Entrada, plato fuerte y bebida por persona', precio: 5.5 },
  { id: 117, categoria_id: 5, categoria_nombre: 'Catering Corporativo', nombre: 'Paquete Evento Premium', descripcion: 'Menú completo con postre y bebida por persona', precio: 9.5 },
];

export async function loadPublicServicios(): Promise<PublicServicio[]> {
  try {
    const response = await fetch(apiUrl('/public/servicios'));
    const rows = await response.json();
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch (_) {
    /* use fallback */
  }
  return FALLBACK_SERVICIOS;
}
