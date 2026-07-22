# Huarmy Coffee

Pagina web de Huarmy Coffee - Menu, promociones y cotizaciones por WhatsApp.

## Stack

- React 19
- Framer Motion (animaciones)
- Lucide React (iconos)
- Firebase Firestore (base de datos en la nube, solo para admin)

## Ejecutar localmente

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

## Subir al host

```bash
npm run build
```

Sube la carpeta `build/` a Netlify, Vercel o GitHub Pages.

## Panel de Administrador

La dueña puede cambiar el menu y las promociones desde el navegador.

### Como acceder

- **Celular**: tocar el icono hamburguesa → "Administrador"
- **Computadora**: tocar el icono de engranaje arriba a la derecha

### Contrasena

```
huarmy2026
```

Para cambiar la contrasena, editar `src/components/AdminPanel.js` linea 4:

```js
const ADMIN_PASSWORD = "tu_nueva_contrasena";
```

### Que se puede editar

- **Menu**: platos, precios, agregar/eliminar items por categoria
- **Promociones**: titulo, tipo, descripcion, imagen (URL), fechas, paquetes

### Como funciona

1. La dueña edita desde el admin y toca "Guardar todos los cambios"
2. Los datos se guardan en Firebase Firestore
3. La pagina se recarga sola
4. Todos los visitantes ven los cambios

## Firebase

El proyecto usa Firebase Firestore para guardar los datos del admin.

### Configuracion

El archivo `src/f.js` contiene la configuracion de Firebase. No cambiar el nombre del archivo.

### Reglas de Firestore

En Firebase Console → Firestore Database → Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Estructura de datos en Firestore

```
huarmy/
  menu/           → { mar: [...], sierra: [...], postres: [...], ... }
  promociones/    → { promotions: [...], packages: [...], highlight: {...}, featuredPromotionId: "..." }
```

## Archivos importantes

| Archivo | Funcion |
|---|---|
| `src/App.js` | Layout principal, header, navegacion, admin button |
| `src/components/Menu.js` | Seccion de menu (solo lectura) |
| `src/components/Promociones.js` | Seccion de promociones (solo lectura) |
| `src/components/AdminPanel.js` | Panel de administrador (edicion) |
| `src/f.js` | Configuracion y funciones de Firebase |
| `src/assets/css/style.css` | Estilos globales |

## Seguridad

- El panel de admin tiene contrasena
- Las reglas de Firestore estan abiertas (proyecto personal)
- No hay datos sensibles en el repositorio
- Las imagenes se guardan como URLs, no como archivos
