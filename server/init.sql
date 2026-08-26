-- Esquema limpio: solo tablas funcionales del proyecto

CREATE TABLE IF NOT EXISTS sucursales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion TEXT NOT NULL,
  telefono VARCHAR(20),
  capacidad_maxima INTEGER NOT NULL DEFAULT 50,
  whatsapp VARCHAR(100),
  activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'admin',
  sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(200),
  telefono VARCHAR(20),
  direccion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(150),
  telefono VARCHAR(20),
  email VARCHAR(200),
  direccion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  cargo VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(200),
  salario DECIMAL(10,2) NOT NULL DEFAULT 0,
  sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  duracion INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventarios (
  id SERIAL PRIMARY KEY,
  producto VARCHAR(150) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidad VARCHAR(20) NOT NULL DEFAULT 'kg',
  stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
  sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL,
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL,
  servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMP NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS galeria (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200),
  url_imagen TEXT NOT NULL,
  categoria VARCHAR(50),
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS socios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'socio',
  contacto VARCHAR(150),
  telefono VARCHAR(20),
  email VARCHAR(200),
  direccion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comunicaciones (
  id SERIAL PRIMARY KEY,
  asunto VARCHAR(200) NOT NULL,
  mensaje TEXT,
  destinatario VARCHAR(50) DEFAULT 'todos',
  fecha_publicacion DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indicadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  perspectiva VARCHAR(50) NOT NULL DEFAULT 'financiera',
  valor_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
  meta DECIMAL(12,2) NOT NULL DEFAULT 0,
  unidad VARCHAR(20) DEFAULT '%',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS postulaciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(200),
  telefono VARCHAR(20),
  mensaje TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente',
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50),
  precio DECIMAL(10,2) DEFAULT 0,
  fecha_inicio DATE,
  fecha_fin DATE,
  url_imagen TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger updated_at para categorías
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_updated_at ON categorias;
CREATE TRIGGER trg_actualizar_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_correo ON clientes(email);
