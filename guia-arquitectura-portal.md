# Guía de Arquitectura — Portal Empresarial Full Stack

> Documento didáctico que explica cómo construir un portal web completo con base de datos, panel de administración y frontend. Diseñado para que una desarrolladora pueda entenderlo **y** su agente de opencode pueda usarlo como contexto para replicar la arquitectura en su propio proyecto.

---

## 1. Introducción

Un **portal empresarial** consta de tres capas principales:

```
┌─────────────────────────────────────────────────┐
│                   USUARIOS                        │
├─────────────────────────────────────────────────┤
│   Frontend (React SPA)        Puerto 3000        │
│   - Página pública (clientes)                     │
│   - Botón WhatsApp, galería, formularios          │
├─────────────────────────────────────────────────┤
│   Backend (Node.js + Express)   Puerto 4000       │
│   - API REST (pública)                            │
│   - Panel Admin (EJS, protegido)                  │
│   - CRUD de servicios, citas, sucursales          │
├─────────────────────────────────────────────────┤
│   Base de Datos (PostgreSQL)     Puerto 5432      │
│   - Tablas, relaciones, vistas, funciones         │
│   - Sesiones, usuarios, configuración             │
└─────────────────────────────────────────────────┘
```

### Stack tecnológico recomendado

| Capa       | Tecnología                          | Alternativa         |
|------------|-------------------------------------|---------------------|
| Frontend   | React 19 + Create React App         | Vite + React        |
| Backend    | Node.js + Express                   | NestJS, Fastify     |
| Base datos | PostgreSQL 16                       | MySQL 8             |
| Contenedor | Docker Desktop (opcional)           | Nativo en Windows   |
| Admin      | EJS (vistas del lado del servidor)  | React Admin, tablero|

---

## 2. Base de Datos

### 2.1 Opciones en Windows

**Opción A — Docker Desktop (recomendada)**
```bash
# Instalar Docker Desktop desde: https://www.docker.com/products/docker-desktop/
# Luego crear un docker-compose.yml:

services:
  db:
    image: postgres:16-alpine
    container_name: mi-proyecto-db
    environment:
      POSTGRES_DB: mi_bd
      POSTGRES_USER: mi_usuario
      POSTGRES_PASSWORD: MiPassword2024
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mi_usuario -d mi_bd"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

```bash
docker compose up -d   # Inicia la base de datos
docker compose down    # Detiene
```

**Opción B — PostgreSQL nativo en Windows**
- Descargar desde: https://www.postgresql.org/download/windows/
- Usar **pgAdmin** incluido para administrar
- O instalar **DBeaver** (alternativa gratuita)

### 2.2 Estructura de tablas

```sql
-- Categorías / servicios
CREATE TABLE categoria (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE servicio (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER REFERENCES categoria(id),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2),
  duracion INTEGER, -- minutos
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sucursales
CREATE TABLE sucursal (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion TEXT NOT NULL,
  telefono VARCHAR(20),
  whatsapp VARCHAR(100),
  activo BOOLEAN DEFAULT true
);

-- Clientes y citas
CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(200),
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cita (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES cliente(id),
  sucursal_id INTEGER REFERENCES sucursal(id),
  servicio_id INTEGER REFERENCES servicio(id),
  fecha_hora TIMESTAMP NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmada, completada, cancelada
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios administradores
CREATE TABLE usuario_admin (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'admin',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Postulaciones (formulario de trabajo)
CREATE TABLE postulacion (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(200) NOT NULL,
  telefono VARCHAR(20),
  mensaje TEXT,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Galería de imágenes
CREATE TABLE galeria (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200),
  url_imagen TEXT NOT NULL,
  categoria VARCHAR(50),
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configuración general (clave-valor)
CREATE TABLE configuracion (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion VARCHAR(255)
);
```

### 2.3 Buenas prácticas

```sql
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_updated_at
  BEFORE UPDATE ON categoria
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Vista para facilitar consultas
CREATE VIEW v_citas_completas AS
SELECT
  c.id, c.fecha_hora, c.estado,
  cl.nombre AS cliente, cl.telefono,
  s.nombre AS servicio,
  su.nombre AS sucursal
FROM cita c
JOIN cliente cl ON cl.id = c.cliente_id
JOIN servicio s ON s.id = c.servicio_id
JOIN sucursal su ON su.id = c.sucursal_id;

-- Índices para rendimiento
CREATE INDEX idx_cita_fecha ON cita(fecha_hora);
CREATE INDEX idx_cita_estado ON cita(estado);
CREATE INDEX idx_cliente_correo ON cliente(correo);
```

### 2.4 Seed data (datos de prueba)

```sql
-- Usuario admin por defecto (contraseña hasheada con bcrypt)
INSERT INTO usuario_admin (nombre, email, password_hash, rol)
VALUES ('Admin', 'admin@tusitio.com', '$2b$10$...hash...', 'superadmin');

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion)
VALUES
  ('sitio_nombre', 'Mi Empresa', 'Nombre del sitio'),
  ('email_contacto', 'info@tusitio.com', 'Correo de contacto'),
  ('whatsapp_numero', '593999999999', 'Número de WhatsApp'),
  ('horario_atencion', 'Lun-Vie 9:00-18:00', 'Horario de atención');
```

### 2.5 Herramientas para gestionar la BD

- **pgAdmin** — viene con la instalación de PostgreSQL en Windows
- **DBeaver** — https://dbeaver.io/ (universal, funciona con cualquier BD)
- Desde Node.js: cualquier cliente SQL (pg, mysql2, etc.)

---

## 3. Backend con Node.js + Express

### 3.1 Estructura del proyecto

```
mi-proyecto/
├── backend/
│   ├── .env                        # Variables de entorno
│   ├── package.json                # Dependencias
│   ├── src/
│   │   ├── server.js               # Entry point
│   │   ├── config/
│   │   │   └── db.js               # Conexión a la BD
│   │   ├── middleware/
│   │   │   └── auth.js             # Middleware de autenticación
│   │   ├── routes/
│   │   │   ├── auth.js             # Login / Logout
│   │   │   ├── dashboard.js        # Panel principal
│   │   │   ├── servicios.js        # CRUD servicios
│   │   │   ├── sucursales.js       # CRUD sucursales
│   │   │   ├── citas.js            # Gestión de citas
│   │   │   ├── postulaciones.js    # Postulaciones recibidas
│   │   │   ├── galeria.js          # Galería de imágenes
│   │   │   ├── configuracion.js    # Configuración del sitio
│   │   │   └── api.js              # API pública (sin auth)
│   │   └── views/
│   │       ├── partials/
│   │       │   ├── header.ejs      # Shell del admin (CSS + nav)
│   │       │   └── footer.ejs
│   │       ├── login.ejs           # Página de login
│   │       ├── dashboard.ejs       # Panel principal
│   │       └── ...                 # Demás vistas CRUD
│   └── public/
│       └── logo.svg
```

### 3.2 Configuración inicial

```bash
# En Windows (PowerShell o CMD)
mkdir mi-proyecto
cd mi-proyecto
mkdir backend database

# Inicializar Node.js
cd backend
npm init -y

# Instalar dependencias
npm install express pg ejs express-session connect-pg-simple bcrypt dotenv multer
npm install --save-dev nodemon
```

**package.json:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 3.3 Conexión a la base de datos

**`backend/src/config/db.js`:**
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mi_bd',
  user: process.env.DB_USER || 'mi_usuario',
  password: process.env.DB_PASSWORD || 'MiPassword2024',
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool:', err);
});

module.exports = pool;
```

### 3.4 Servidor principal

**`backend/src/server.js`:**
```javascript
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
// ... importar demás rutas

const app = express();
const PORT = process.env.ADMIN_PORT || 4000;

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesiones en PostgreSQL
app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'mi-secreto',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Rutas
app.use('/', authRoutes);        // Login (sin auth)
app.use('/', dashboardRoutes);   // Dashboard (con auth)
app.use('/api', apiRoutes);      // API pública (sin auth)
// ... demás rutas protegidas con requireAuth

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

### 3.5 Variables de entorno

**`backend/.env`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mi_bd
DB_USER=mi_usuario
DB_PASSWORD=MiPassword2024
SESSION_SECRET=clave-secreta-cambiar-en-produccion
ADMIN_PORT=4000
```

### 3.6 Autenticación — Middleware

**`backend/src/middleware/auth.js`:**
```javascript
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { requireAuth };
```

### 3.7 Rutas de autenticación

**`backend/src/routes/auth.js`:**
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM usuario_admin WHERE email = $1 AND activo = true',
      [email]
    );
    if (result.rows.length === 0) {
      return res.render('login', { error: 'Credenciales inválidas' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { error: 'Credenciales inválidas' });
    }
    req.session.userId = user.id;
    req.session.user = { nombre: user.nombre, email: user.email, rol: user.rol };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Error del servidor' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
```

### 3.8 Ejemplo de ruta CRUD

**`backend/src/routes/servicios.js`:**
```javascript
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const pool = require('../config/db');

router.get('/servicios', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.nombre AS categoria_nombre
      FROM servicio s
      JOIN categoria c ON c.id = s.categoria_id
      ORDER BY c.nombre, s.nombre
    `);
    const categorias = await pool.query(
      'SELECT * FROM categoria ORDER BY nombre'
    );
    res.render('servicios', {
      servicios: result.rows,
      categorias: categorias.rows,
      user: req.session.user,
      path: req.path
    });
  } catch (err) {
    console.error(err);
    res.redirect('/?msg=Error al cargar servicios');
  }
});

router.post('/servicios', requireAuth, async (req, res) => {
  const { nombre, descripcion, precio, duracion, categoria_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO servicio (nombre, descripcion, precio, duracion, categoria_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [nombre, descripcion, precio, duracion, categoria_id]
    );
    res.redirect('/servicios?msg=Servicio creado exitosamente');
  } catch (err) {
    console.error(err);
    res.redirect('/servicios?msg=Error al crear servicio');
  }
});

// DELETE /servicios/:id
router.post('/servicios/:id/delete', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM servicio WHERE id = $1', [req.params.id]);
  res.redirect('/servicios?msg=Servicio eliminado');
});

// Toggle activo
router.post('/servicios/:id/toggle', requireAuth, async (req, res) => {
  await pool.query(
    'UPDATE servicio SET activo = NOT activo WHERE id = $1',
    [req.params.id]
  );
  res.redirect('/servicios');
});

module.exports = router;
```

### 3.9 API pública

**`backend/src/routes/api.js`:**
```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Endpoint público para recibir postulaciones desde el frontend
router.post('/postular', async (req, res) => {
  const { nombre, correo, telefono, mensaje } = req.body;
  try {
    await pool.query(
      `INSERT INTO postulacion (nombre, correo, telefono, mensaje)
       VALUES ($1, $2, $3, $4)`,
      [nombre, correo, telefono, mensaje]
    );
    res.json({ success: true, message: 'Postulación recibida' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router;
```

### 3.10 Vistas EJS (ejemplo)

**`backend/src/views/login.ejs`:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciar Sesión — Mi Admin</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f0ebe3;
      display: flex; justify-content: center; align-items: center;
      height: 100vh; margin: 0;
    }
    .login-card {
      background: white; padding: 40px; border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1); width: 360px;
    }
    h1 { text-align: center; margin-bottom: 30px; font-size: 1.4rem; }
    input {
      width: 100%; padding: 10px 12px; margin-bottom: 16px;
      border: 2px solid #ddd; border-radius: 6px; font-size: 0.9rem;
    }
    button {
      width: 100%; padding: 12px; background: #2F4A34; color: white;
      border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;
    }
    .error { color: #c0392b; margin-bottom: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>Panel de Administración</h1>
    <% if (error) { %><div class="error"><%= error %></div><% } %>
    <form method="POST" action="/login">
      <input type="email" name="email" placeholder="Correo electrónico" required>
      <input type="password" name="password" placeholder="Contraseña" required>
      <button type="submit">Iniciar Sesión</button>
    </form>
  </div>
</body>
</html>
```

---

## 4. Frontend con React

### 4.1 Crear proyecto

```bash
# En la raíz del proyecto
npx create-react-app spa
cd spa
npm start   # Corre en http://localhost:3000
```

### 4.2 Estructura del frontend

```
spa/
├── public/
│   └── index.html
├── src/
│   ├── index.js              # Entry point
│   ├── App.js                # Componente principal
│   ├── App.test.js           # Tests
│   ├── assets/               # Imágenes, videos
│   │   ├── logo.svg
│   │   └── ...
│   ├── styles/               # CSS
│   │   ├── index.css         # Estilos globales
│   │   ├── App.css           # Estilos del layout
│   │   └── menu.css          # Menú móvil
│   ├── i18n.js               # Config de traducciones (opcional)
│   ├── locales/
│   │   ├── es.json
│   │   ├── en.json
│   │   └── ca.json
│   └── AccessibilityWidget.js # Widget de accesibilidad (opcional)
└── package.json
```

### 4.3 Componente principal — App.js

```javascript
import React, { useState, useEffect } from 'react';
import './styles/App.css';
import './styles/menu.css';
import logoImage from './assets/logo.svg';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsappMenuOpen, setWhatsappMenuOpen] = useState(false);

  // Navegación por scroll
  const handleNavClick = (id) => {
    setMenuOpen(false);
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll al inicio al cargar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* NAVBAR */}
      <nav>
        <div className="navbar-logo">
          <img src={logoImage} alt="Logo" />
          <span>Mi Empresa</span>
        </div>
        <div className="navbar-links">
          <button onClick={() => handleNavClick('about')}>Nosotros</button>
          <button onClick={() => handleNavClick('services')}>Servicios</button>
          <button onClick={() => handleNavClick('gallery')}>Galería</button>
          <button onClick={() => handleNavClick('branches')}>Sucursales</button>
          <button onClick={() => handleNavClick('contact')}>Contacto</button>
          <button onClick={() => handleNavClick('work')}>Trabaja</button>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <h1>Bienvenido a Mi Empresa</h1>
        <p>Descripción breve del negocio</p>
        <button onClick={() => handleNavClick('contact')}>Contáctanos</button>
      </section>

      {/* SECCIONES */}
      <section id="about">... Nosotros ...</section>
      <section id="services">... Servicios ...</section>
      <section id="gallery">... Galería ...</section>
      <section id="branches">... Sucursales ...</section>
      <section id="contact">... Contacto ...</section>
      <section id="work">... Formulario de trabajo ...</section>

      {/* FOOTER */}
      <footer>© {new Date().getFullYear()} Mi Empresa</footer>

      {/* WHATSAPP FLOTANTE */}
      <div className="whatsapp-float-container">
        <button onClick={() => setWhatsappMenuOpen(!whatsappMenuOpen)}>
          <WhatsAppIcon />
        </button>
        {whatsappMenuOpen && (
          <div className="whatsapp-menu">
            <a href="https://wa.me/593999999999" target="_blank">Sucursal 1</a>
            <a href="https://wa.me/593999999998" target="_blank">Sucursal 2</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

### 4.4 Consumo de API desde el frontend

```javascript
// Ejemplo: formulario de postulación
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:4000/api/postular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data.success) {
      alert('Postulación enviada con éxito');
    }
  } catch (err) {
    alert('Error al enviar. Intenta de nuevo.');
  }
};
```

### 4.5 i18n — Traducciones (opcional pero recomendado)

Instalar:
```bash
npm install i18next react-i18next
```

**`src/i18n.js`:**
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('idioma') || 'es',
  fallbackLng: 'es',
  resources: {
    es: { translation: { hero_titulo: 'Bienvenido', ... } },
    en: { translation: { hero_titulo: 'Welcome', ... } },
    ca: { translation: { hero_titulo: 'Benvingut', ... } }
  }
});

export default i18n;
```

**En App.js:**
```javascript
import { useTranslation } from 'react-i18next';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();
  return <h1>{t('hero_titulo')}</h1>;
}
```

### 4.6 Widget de accesibilidad (opcional)

Un widget flotante con opciones como:
- Aumentar / disminuir texto
- Alto contraste
- Escala de grises
- Fuente legible
- Selector de idioma

Las preferencias se guardan en `localStorage` para persistencia.

---

## 5. Panel de Administración

El panel admin es la **interfaz protegida** donde el dueño del negocio gestiona:

### Módulos del panel

| Módulo        | Función                                      |
|---------------|----------------------------------------------|
| Dashboard     | Estadísticas generales (counts, KPIs)        |
| Servicios     | CRUD de categorías y servicios               |
| Sucursales    | CRUD de sucursales con WhatsApp              |
| Citas         | Ver y cambiar estado de citas                |
| Postulaciones | Ver, marcar como leído, eliminar             |
| Galería       | Subir/eliminar imágenes                      |
| Configuración | Editar datos del sitio (email, WhatsApp, etc)|
| BSC / Tablero | Indicadores de gestión (opcional)            |

### Cómo se protege

1. El middleware `requireAuth` revisa `req.session.userId`
2. Si no hay sesión → redirige a `/login`
3. Las contraseñas se guardan hasheadas con `bcrypt`
4. Las sesiones se almacenan en la misma base de datos (tabla `session`)

### Autenticación: flujo completo

```
Usuario → GET / → requireAuth → no hay sesión → redirect /login
→ GET /login → render login.ejs
→ POST /login → buscar email en usuario_admin → bcrypt.compare → 
  → OK: crear sesión → redirect /
  → FAIL: render login.ejs con error
→ GET / → requireAuth → hay sesión → render dashboard.ejs
```

---

## 6. Conexión Frontend ↔ Backend

### 6.1 Cómo conviven

| Servicio    | Puerto | URL                           |
|-------------|--------|-------------------------------|
| Frontend    | 3000   | http://localhost:3000         |
| Backend     | 4000   | http://localhost:4000         |
| Base datos  | 5432   | postgresql://localhost:5432   |

### 6.2 CORS

El backend debe permitir peticiones desde el frontend:

```javascript
// En server.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### 6.3 Opción: servir el frontend desde el backend

Para producción, el build de React puede servirse directamente desde Express:

```javascript
// En server.js
app.use(express.static(path.join(__dirname, '..', '..', 'spa', 'build')));

// Todas las rutas que no coincidan con el admin redirigen al SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/login')) {
    // Si no es una ruta del admin, servir el frontend
  }
});
```

### 6.4 Variables de entorno: resumen

```env
# Backend (.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mi_bd
DB_USER=mi_usuario
DB_PASSWORD=MiPassword2024
SESSION_SECRET=clave-secreta
ADMIN_PORT=4000
```

El frontend NO usa .env directamente (CRA usa `REACT_APP_` variables). Para la URL del API, se configura en el código.

---

## 7. Docker en Windows

### 7.1 Instalación

1. Descargar Docker Desktop desde: https://www.docker.com/products/docker-desktop/
2. Instalar (requiere WSL 2 o Hyper-V, el instalador guía el proceso)
3. Abrir Docker Desktop y esperar a que inicie el motor

### 7.2 Comandos básicos

```bash
# Iniciar los contenedores
docker compose up -d

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Eliminar volúmenes (borra datos)
docker compose down -v

# Ver contenedores activos
docker ps
```

### 7.3 Solución de problemas comunes en Windows

| Problema                           | Solución                                               |
|------------------------------------|--------------------------------------------------------|
| WSL 2 no instalado                 | `wsl --install` en PowerShell como administrador       |
| Puerto 5432 ocupado                | Cambiar el puerto en `docker-compose.yml` y `.env`     |
| Docker no inicia                   | Activar virtualización en BIOS                         |
| Permiso denegado al montar archivo | Usar rutas con `/` en lugar de `\`                     |

---

## 8. Flujo completo paso a paso (Windows)

### 8.1 Requisitos previos

- [ ] Node.js (v18+): https://nodejs.org/
- [ ] npm (viene con Node.js) o pnpm: `npm install -g pnpm`
- [ ] Docker Desktop (recomendado) o PostgreSQL nativo
- [ ] Git: https://git-scm.com/
- [ ] opencode (si usará agente IA)

### 8.2 Clonar repositorio (si ya existe) o crear desde cero

```bash
# Opción 1: Clonar existente
git clone https://github.com/tuusuario/mi-proyecto.git
cd mi-proyecto

# Opción 2: Crear desde cero
mkdir mi-proyecto && cd mi-proyecto
```

### 8.3 Base de datos

```bash
# Con Docker Desktop
docker compose up -d

# Sin Docker: instalar PostgreSQL nativo, luego ejecutar el SQL
# psql -U mi_usuario -d mi_bd -f database/init.sql
```

### 8.4 Backend

```bash
cd backend
pnpm install    # o npm install
# Crear archivo .env con los datos de conexión
pnpm dev        # o npm run dev
# El admin corre en http://localhost:4000
```

### 8.5 Frontend

```bash
cd spa
npm install
npm start
# El SPA corre en http://localhost:3000
```

### 8.6 Verificar

- Abrir http://localhost:3000 → ver la página pública
- Abrir http://localhost:4000 → ver el login del admin
- Login con: admin@tusitio.com / la contraseña que definiste en seed

---

## 9. Checklist para el Agente de opencode

Tu compañera puede darle este prompt a su agente para que replique la arquitectura:

```
Necesito construir un portal empresarial completo con:
- Base de datos PostgreSQL con tablas para: categorías, servicios, sucursales, 
  clientes, citas, usuarios admin, postulaciones, galería, configuración
- Backend en Node.js + Express con panel admin protegido (login con bcrypt + sesiones), 
  CRUD para cada módulo, y una API pública para postulaciones
- Frontend en React (Create React App) con navegación por scroll, galería, 
  botón WhatsApp flotante con sucursales, formulario de trabajo que consuma la API
- Panel admin con EJS que tenga: dashboard, servicios, sucursales, citas, 
  postulaciones, galería y configuración

Usa la guía en /home/snxz/Proyectos/Emprendimientos/guia-arquitectura-portal.md 
como referencia para la arquitectura y estructura. Genera todos los archivos 
necesarios y dame las instrucciones exactas para ejecutar el proyecto en Windows.
```

---

## 10. Conclusión

Esta arquitectura de **tres capas** (BD → Backend → Frontend) es la base de cualquier portal empresarial moderno. Los conceptos son los mismos sin importar el negocio:

1. **Base de datos** guarda los datos del negocio
2. **Backend** provee la lógica de negocio y un panel admin
3. **Frontend** muestra la cara pública a los clientes
4. **La conexión** entre frontend y backend se hace mediante APIs REST

Cada capa es independiente y puede ser modificada, reemplazada o escalada sin afectar a las demás.

---

> Documento generado como guía didáctica basada en el proyecto Lush Nails Spa.
> Creado: Julio 2026
