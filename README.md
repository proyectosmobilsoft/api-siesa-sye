# SYE API

API REST desarrollada con Node.js y Express.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 14+
- MySQL 8+

### Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de base de datos.

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 📜 Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm run lint` - Ejecuta ESLint para revisar el código

## 📁 Estructura del Proyecto

```
src/
├── index.js              # Punto de entrada de la aplicación
├── app.js                # Configuración de Express
├── config/               # Configuración
│   └── env.js           # Variables de entorno
├── db/                   # Base de datos
│   └── db.js            # Configuración de MySQL
├── routes/               # Rutas
│   └── clients.routes.js
├── controllers/          # Controladores
│   └── clients.controller.js
├── services/             # Lógica de negocio
│   └── clients.service.js
└── middlewares/          # Middlewares
    └── errorHandler.js
```

## 🛠️ Tecnologías

- Express
- MySQL2
- Helmet (seguridad)
- Morgan (logging)
- ESLint
- Nodemon

