/**
 * Puebla la base con datos de demostración coherentes para que ningún módulo
 * del panel admin aparezca vacío. Es idempotente: si una tabla ya tiene
 * filas, no vuelve a insertar (así no duplica datos ni pisa datos reales
 * que el admin ya haya cargado).
 * Uso: npm run seed:demo
 */
const pool = require('./db');

async function isEmpty(client, table) {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
  return rows[0].c === 0;
}

async function seedSucursales(client) {
  if (!(await isEmpty(client, 'sucursales'))) return client.query('SELECT id, nombre FROM sucursales ORDER BY id').then((r) => r.rows);
  const { rows } = await client.query(
    `INSERT INTO sucursales (nombre, direccion, telefono, capacidad_maxima, whatsapp, activo) VALUES
      ('Huarmy Coffee - Matriz', 'Av. Equinoccial y Av. Manuel Córdova Galarza, Quito', '025185964', 60, '593983436356', true),
      ('Huarmy Coffee - La Carolina', 'Av. Amazonas N34-451, Quito', '022265412', 45, '593983436357', true),
      ('Huarmy Coffee - Cumbayá', 'Calle Francisco de Orellana, Cumbayá', '023456789', 35, '593983436358', true)
    RETURNING id, nombre`
  );
  console.log(`✅ sucursales: ${rows.length}`);
  return rows;
}

async function seedCategorias(client) {
  if (!(await isEmpty(client, 'categorias'))) return client.query('SELECT id, nombre FROM categorias ORDER BY id').then((r) => r.rows);
  const { rows } = await client.query(
    `INSERT INTO categorias (nombre, descripcion, activo) VALUES
      ('Desayunos', 'Para empezar el día con energía', true),
      ('Platos Fuertes', 'Sabores tradicionales ecuatorianos', true),
      ('Bebidas', 'Café de especialidad y bebidas naturales', true),
      ('Postres', 'El toque dulce que cierra cada comida', true),
      ('Catering Corporativo', 'Paquetes por persona para eventos y empresas', true)
    RETURNING id, nombre`
  );
  console.log(`✅ categorias: ${rows.length}`);
  return rows;
}

async function seedServicios(client, categorias) {
  if (!(await isEmpty(client, 'servicios'))) return client.query('SELECT id, nombre, precio, categoria_id FROM servicios ORDER BY id').then((r) => r.rows);
  const catId = (nombre) => categorias.find((c) => c.nombre === nombre).id;
  // Precios de referencia acordes al ticket promedio de consumo en Ecuador
  // (almuerzos/desayunos tipo "menú del día" entre $2.50 y $4.50).
  const data = [
    ['Desayunos', 'Desayuno Andino', 'Huevos, tortilla de papa, chorizo y café', 3.5, 15],
    ['Desayunos', 'Bowl de Frutas con Granola', 'Frutas de temporada, granola casera y yogurt', 2.75, 10],
    ['Desayunos', 'Tostadas Francesas', 'Con miel de panela y fruta', 3.0, 12],
    ['Platos Fuertes', 'Locro de Papa', 'Sopa cremosa con aguacate y queso', 3.25, 25],
    ['Platos Fuertes', 'Seco de Pollo', 'Con arroz, plátano maduro y aguacate', 4.0, 30],
    ['Platos Fuertes', 'Fritada Tradicional', 'Con mote, tostado y curtido', 4.5, 35],
    ['Platos Fuertes', 'Llapingachos con Chorizo', 'Tortillas de papa con chorizo y ensalada', 4.25, 25],
    ['Bebidas', 'Café de Especialidad', 'Grano ecuatoriano, tueste medio', 1.5, 5],
    ['Bebidas', 'Chocolate Artesanal', 'Cacao ecuatoriano con canela', 1.75, 8],
    ['Bebidas', 'Jugo Natural', 'Fruta de temporada a elección', 1.5, 5],
    ['Bebidas', 'Colada Morada', 'Bebida tradicional de temporada', 1.75, 10],
    ['Postres', 'Pastel de Choclo Dulce', 'Receta tradicional con queso', 2.0, 10],
    ['Postres', 'Espumilla', 'Postre de guayaba batida', 1.5, 5],
    ['Postres', 'Quesadillas Ecuatorianas', 'Horneadas, rellenas de queso dulce', 1.75, 8],
    ['Catering Corporativo', 'Paquete Coffee Break', 'Café, bocaditos dulces y salados por persona', 3.0, null],
    ['Catering Corporativo', 'Paquete Almuerzo Ejecutivo', 'Entrada, plato fuerte y bebida por persona', 5.5, null],
    ['Catering Corporativo', 'Paquete Evento Premium', 'Menú completo con postre y bebida por persona', 9.5, null],
  ];
  const values = [];
  const placeholders = data.map(([categoria, nombre, descripcion, precio, duracion], i) => {
    const base = i * 6;
    values.push(catId(categoria), nombre, descripcion, precio, duracion, true);
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
  });
  const { rows } = await client.query(
    `INSERT INTO servicios (categoria_id, nombre, descripcion, precio, duracion, activo) VALUES ${placeholders.join(', ')} RETURNING id, nombre, precio, categoria_id`,
    values
  );
  console.log(`✅ servicios: ${rows.length}`);
  return rows;
}

async function seedClientes(client) {
  if (!(await isEmpty(client, 'clientes'))) return client.query('SELECT id, nombre FROM clientes ORDER BY id').then((r) => r.rows);
  const { rows } = await client.query(
    `INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
      ('María Fernanda Torres', 'mtorres@example.com', '0991234561', 'Calle Los Cerezos N12-45, Quito'),
      ('Carlos Andrés Salazar', 'csalazar@example.com', '0991234562', 'Av. 6 de Diciembre y Colón, Quito'),
      ('Lucía Beatriz Rivadeneira', 'lrivadeneira@example.com', '0991234563', 'Sector La Floresta, Quito'),
      ('Jorge Esteban Camacho', 'jcamacho@example.com', '0991234564', 'Av. Interoceánica, Cumbayá'),
      ('Paola Andrea Vega', 'pvega@example.com', '0991234565', 'Av. República del Salvador, Quito'),
      ('Diego Fernando Moreta', 'dmoreta@example.com', '0991234566', 'Calle Whymper, Quito')
    RETURNING id, nombre`
  );
  console.log(`✅ clientes: ${rows.length}`);
  return rows;
}

async function seedProveedores(client) {
  if (!(await isEmpty(client, 'proveedores'))) return client.query('SELECT id, nombre FROM proveedores ORDER BY id').then((r) => r.rows);
  const { rows } = await client.query(
    `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
      ('Café Andino Cía. Ltda.', 'Rodrigo Paredes', '022345671', 'ventas@cafeandino.ec', 'Vía a Nanegalito Km 8'),
      ('Distribuidora La Pradera', 'Sandra Chuquimarca', '022345672', 'pedidos@lapradera.ec', 'Mercado Mayorista, Quito'),
      ('Panificadora Dulce Hogar', 'Mónica Espín', '022345673', 'contacto@dulcehogar.ec', 'Calle Ambato, Quito'),
      ('Bebidas del Valle S.A.', 'Iván Cabrera', '022345674', 'iventas@bebidasdelvalle.ec', 'Parque Industrial, Quito')
    RETURNING id, nombre`
  );
  console.log(`✅ proveedores: ${rows.length}`);
  return rows;
}

async function seedPersonal(client, sucursales) {
  if (!(await isEmpty(client, 'personal'))) return;
  const suc = (i) => sucursales[i % sucursales.length].id;
  await client.query(
    `INSERT INTO personal (nombre, cargo, telefono, email, salario, sucursal_id) VALUES
      ('Ana Lucía Puma', 'Gerente de Sucursal', '0987654321', 'ana.puma@huarmycoffee.com', 750.00, $1),
      ('Byron Alexander Quishpe', 'Chef Principal', '0987654322', 'byron.quishpe@huarmycoffee.com', 650.00, $1),
      ('Cristina Elizabeth Yépez', 'Barista', '0987654323', 'cristina.yepez@huarmycoffee.com', 460.00, $2),
      ('Fernando José Aguirre', 'Mesero', '0987654324', 'fernando.aguirre@huarmycoffee.com', 425.00, $2),
      ('Gabriela Nicole Chasi', 'Barista', '0987654325', 'gabriela.chasi@huarmycoffee.com', 460.00, $3),
      ('Henry Patricio Males', 'Auxiliar de Cocina', '0987654326', 'henry.males@huarmycoffee.com', 430.00, $3)
    `,
    [suc(0), suc(1), suc(2)]
  );
  console.log('✅ personal: 6');
}

async function seedInventarios(client, sucursales, proveedores) {
  if (!(await isEmpty(client, 'inventarios'))) return;
  const s = (i) => sucursales[i % sucursales.length].id;
  const p = (i) => proveedores[i % proveedores.length].id;
  await client.query(
    `INSERT INTO inventarios (producto, cantidad, unidad, stock_minimo, sucursal_id, proveedor_id) VALUES
      ('Café en grano', 25, 'kg', 10, $1, $4),
      ('Leche entera', 8, 'l', 15, $1, $5),
      ('Azúcar', 30, 'kg', 10, $2, $5),
      ('Harina de trigo', 12, 'kg', 15, $2, $6),
      ('Papas', 5, 'kg', 20, $3, $5),
      ('Pechuga de pollo', 18, 'kg', 10, $3, $5),
      ('Servilletas', 200, 'unidad', 100, $1, $7),
      ('Vasos desechables', 50, 'unidad', 100, $2, $7)
    `,
    [s(0), s(1), s(2), p(0), p(1), p(2), p(3)]
  );
  console.log('✅ inventarios: 8 (2 por debajo del stock mínimo para probar la alerta)');
}

async function seedCitas(client, clientes, sucursales, servicios) {
  if (!(await isEmpty(client, 'citas'))) return;
  const c = (i) => clientes[i % clientes.length].id;
  const s = (i) => sucursales[i % sucursales.length].id;
  const sv = (i) => servicios[i % servicios.length].id;
  const now = new Date();
  const inDays = (n) => new Date(now.getTime() + n * 86400000).toISOString();
  await client.query(
    `INSERT INTO citas (cliente_id, sucursal_id, servicio_id, fecha_hora, estado) VALUES
      ($1, $2, $3, $4, 'pendiente'),
      ($5, $6, $7, $8, 'confirmada'),
      ($9, $10, $11, $12, 'completada'),
      ($13, $14, $15, $16, 'cancelada'),
      ($17, $18, $19, $20, 'pendiente')
    `,
    [
      c(0), s(0), sv(4), inDays(2),
      c(1), s(1), sv(15), inDays(5),
      c(2), s(0), sv(16), inDays(-10),
      c(3), s(2), sv(5), inDays(-3),
      c(4), s(1), sv(14), inDays(7),
    ]
  );
  console.log('✅ citas: 5');
}

async function seedGaleria(client) {
  if (!(await isEmpty(client, 'galeria'))) return;
  await client.query(
    `INSERT INTO galeria (titulo, url_imagen, categoria, orden) VALUES
      ('Interior de nuestro local', '/imagenes/local/lugar1.jpg', 'local', 1),
      ('Ambiente acogedor', '/imagenes/local/lugar2.jpg', 'local', 2),
      ('Mesas y decoración', '/imagenes/local/lugar3.jpg', 'local', 3),
      ('Preparación de café', '/imagenes/local/lugar4.jpg', 'local', 4),
      ('Detalles del local', '/imagenes/local/lugar5.jpg', 'local', 5),
      ('Espacio familiar', '/imagenes/local/lugar6.jpg', 'local', 6)
    `
  );
  await client.query(
    `INSERT INTO galeria (titulo, url_imagen, categoria, orden, autor, comentario, calificacion) VALUES
      ('Reseña destacada de una clienta', '/imagenes/clientes/resena-destacada.png', 'reseña', 7, 'Gabriela Torres', 'El ambiente es acogedor y el café tiene un sabor increíble. Se nota el cuidado en cada detalle, desde la atención hasta la presentación de los platos.', 5),
      ('Reseña de cliente', '/imagenes/clientes/cliente1.jpg', 'reseña', 8, 'Andrés Molina', 'Excelente lugar para reuniones de trabajo. El servicio es rápido y el menú tiene opciones deliciosas para todos los gustos.', 5),
      ('Reseña de cliente', '/imagenes/clientes/cliente2.jpg', 'reseña', 9, 'Daniela Espinoza', 'Volvería una y mil veces. La fritada es espectacular y el personal siempre te recibe con una sonrisa.', 4),
      ('Reseña de cliente', '/imagenes/clientes/cliente3.jpg', 'reseña', 10, 'Ricardo Vallejo', 'Un espacio ideal para disfrutar en familia. Los precios son justos y la calidad de la comida es consistente en cada visita.', 5)
    `
  );
  console.log('✅ galeria: 10');
}

async function seedSocios(client) {
  if (!(await isEmpty(client, 'socios'))) return;
  await client.query(
    `INSERT INTO socios (nombre, tipo, contacto, telefono, email, direccion) VALUES
      ('Verónica Cumandá Rivera', 'socio', 'Verónica Rivera', '0998765432', 'veronica.rivera@huarmycoffee.com', 'Quito'),
      ('Inversiones Andes Capital', 'inversionista', 'Patricio Naranjo', '0998765433', 'contacto@andescapital.ec', 'Quito'),
      ('Cámara de Comercio de Quito', 'aliado', 'Relaciones Institucionales', '0998765434', 'convenios@ccq.ec', 'Quito')
    `
  );
  console.log('✅ socios: 3');
}

async function seedComunicaciones(client) {
  if (!(await isEmpty(client, 'comunicaciones'))) return;
  await client.query(
    `INSERT INTO comunicaciones (asunto, mensaje, destinatario, fecha_publicacion, activo) VALUES
      ('Bienvenida al nuevo sistema de gestión', 'A partir de hoy usamos este panel para gestionar citas, inventario y personal. Cualquier duda contacten a su gerente de sucursal.', 'todos', CURRENT_DATE - 20, true),
      ('Capacitación en atención al cliente', 'Este viernes tendremos una capacitación obligatoria para todo el personal de atención.', 'personal', CURRENT_DATE - 10, true),
      ('Resultados del trimestre', 'Compartimos los resultados financieros del trimestre con los socios estratégicos.', 'socios', CURRENT_DATE - 5, true),
      ('Actualización de horarios de feriado', 'Los horarios de atención cambiarán durante el feriado. Revisen el nuevo cronograma.', 'gerentes', CURRENT_DATE - 2, false)
    `
  );
  console.log('✅ comunicaciones: 4');
}

async function seedIndicadores(client) {
  if (!(await isEmpty(client, 'indicadores'))) return;
  await client.query(
    `INSERT INTO indicadores (nombre, perspectiva, valor_actual, meta, unidad) VALUES
      ('Ingresos mensuales', 'financiera', 8200, 10000, '$'),
      ('Costo de insumos sobre ventas', 'financiera', 32, 28, '%'),
      ('Satisfacción del cliente', 'cliente', 88, 95, '%'),
      ('Clientes recurrentes', 'cliente', 65, 80, '%'),
      ('Tiempo promedio de preparación', 'procesos', 12, 10, 'días'),
      ('Eficiencia de servicio', 'procesos', 90, 95, '%'),
      ('Capacitaciones realizadas', 'aprendizaje', 3, 6, 'unidades'),
      ('Retención de personal', 'aprendizaje', 78, 90, '%')
    `
  );
  console.log('✅ indicadores: 8');
}

async function seedPostulaciones(client) {
  if (!(await isEmpty(client, 'postulaciones'))) return;
  await client.query(
    `INSERT INTO postulaciones (nombre, correo, telefono, mensaje, estado, fecha) VALUES
      ('Katherine Soledad Ortega', 'katherine.ortega@example.com', '0995551111', 'Tengo experiencia como barista y me interesa unirme al equipo.', 'aprobada', CURRENT_DATE - 15),
      ('Luis Miguel Chávez', 'luis.chavez@example.com', '0995551112', 'Busco una oportunidad como mesero, disponibilidad inmediata.', 'pendiente', CURRENT_DATE - 6),
      ('Andrea Belén Suquilanda', 'andrea.suquilanda@example.com', '0995551113', 'Soy chef con experiencia en cocina ecuatoriana.', 'pendiente', CURRENT_DATE - 3),
      ('Pedro Antonio Guaman', 'pedro.guaman@example.com', '0995551114', 'Interesado en el área de logística e inventarios.', 'rechazada', CURRENT_DATE - 25)
    `
  );
  console.log('✅ postulaciones: 4');
}

async function seedPromociones(client) {
  if (!(await isEmpty(client, 'promociones'))) return;
  await client.query(
    `INSERT INTO promociones (titulo, descripcion, tipo, precio, fecha_inicio, fecha_fin, url_imagen, activo) VALUES
      ('Coffee Break Corporativo', 'Paquete especial para reuniones empresariales, mínimo 15 personas.', 'Corporativa', 4.00, CURRENT_DATE, CURRENT_DATE + 90, '/imagenes/servicios/comida1.jpg', true),
      ('Paquete Cumpleaños Dulce', 'Torta, bocaditos y bebidas para tu celebración especial.', 'Celebración', 6.50, '2026-09-06', '2026-11-05', '/imagenes/servicios/comida2.jpg', true),
      ('Delivery Corporativo Semanal', 'Entregas programadas de almuerzos ejecutivos para tu oficina.', 'Logística', 8.50, '2026-08-27', '2027-01-04', '/imagenes/servicios/comida3.jpg', true)
    `
  );
  console.log('✅ promociones: 3');
}

async function seedConfiguracion(client) {
  if (!(await isEmpty(client, 'configuracion'))) return;
  await client.query(
    `INSERT INTO configuracion (clave, valor, descripcion) VALUES
      ('sitio_nombre', 'Huarmy Coffee', 'Nombre del sitio'),
      ('email_contacto', 'huarmycoffee@gmail.com', 'Correo de contacto general'),
      ('telefono_contacto', '0983436356', 'Teléfono celular de contacto'),
      ('telefono_local', '025185964', 'Teléfono fijo del local'),
      ('horario_atencion', 'Lunes a Domingo: 8:00 - 17:30', 'Horario de atención'),
      ('direccion_matriz', 'Av. Equinoccial &, Quito', 'Dirección de la sucursal matriz'),
      ('whatsapp_matriz', '593983436356', 'Número de WhatsApp principal'),
      ('mostrar_trabaja', 'true', 'Muestra la sección Trabaja con Nosotros en el sitio público')
    `
  );
  console.log('✅ configuracion: 8');
}

async function seedMisionVision(client) {
  if (!(await isEmpty(client, 'mision_vision'))) return;
  await client.query(
    `INSERT INTO mision_vision (tipo, contenido, activo) VALUES
      ('mision', 'Ofrecer una experiencia gastronómica auténtica que rescata los sabores tradicionales ecuatorianos, brindando a nuestros clientes calidad, calidez y un ambiente acogedor en cada una de nuestras sucursales.', true),
      ('vision', 'Ser la cadena de cafeterías y restaurantes ecuatorianos más reconocida del país para 2030, expandiendo nuestra propuesta gastronómica con valores de identidad, sostenibilidad y excelencia en el servicio.', true)
    `
  );
  console.log('✅ mision_vision: 2');
}

async function main() {
  const client = await pool.connect();
  try {
    const sucursales = await seedSucursales(client);
    const categorias = await seedCategorias(client);
    const servicios = await seedServicios(client, categorias);
    const clientes = await seedClientes(client);
    const proveedores = await seedProveedores(client);
    await seedPersonal(client, sucursales);
    await seedInventarios(client, sucursales, proveedores);
    await seedCitas(client, clientes, sucursales, servicios);
    await seedGaleria(client);
    await seedSocios(client);
    await seedComunicaciones(client);
    await seedIndicadores(client);
    await seedPostulaciones(client);
    await seedPromociones(client);
    await seedConfiguracion(client);
    await seedMisionVision(client);
    console.log('\nListo. Datos de demostración disponibles en todos los módulos del panel admin.');
  } catch (err) {
    console.error('Error poblando datos de demostración:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
