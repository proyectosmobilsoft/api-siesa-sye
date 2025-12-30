# Guía de Uso: Segunda Base de Datos

Esta guía explica cómo usar la funcionalidad de múltiples conexiones a bases de datos en la API.

## 📋 Configuración

### 1. Configurar la Segunda Base de Datos

Edita el archivo `src/config/config.json` y agrega las credenciales de tu segunda base de datos:

```json
{
  "DB2_HOST": "servidor-bd2.ejemplo.com",
  "DB2_PORT": 1433,
  "DB2_NAME": "NombreBaseDatos2",
  "DB2_USER": "usuario2",
  "DB2_PASS": "password2",
  "DB2_TRUST_SERVER_CERTIFICATE": false,
  "DB2_ENCRYPT": true
}
```

### 2. Variables de Configuración

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB2_HOST` | Host del servidor SQL Server | `localhost` o `servidor.ejemplo.com` |
| `DB2_PORT` | Puerto de SQL Server | `1433` |
| `DB2_NAME` | Nombre de la base de datos | `MiBaseDatos2` |
| `DB2_USER` | Usuario de la base de datos | `usuario2` |
| `DB2_PASS` | Contraseña de la base de datos | `password2` |
| `DB2_TRUST_SERVER_CERTIFICATE` | Confiar en certificado del servidor | `true` o `false` |
| `DB2_ENCRYPT` | Usar encriptación SSL | `true` o `false` |

## 🔧 Uso en el Código

### Usar la Segunda Base de Datos en un Servicio

```javascript
const { getPool2 } = require('../db/db');

async function miFuncion() {
  // Obtener el pool de la segunda BD
  const pool = await getPool2();
  
  const request = pool.request();
  request.input('parametro', require('mssql').Int, 123);
  
  const query = 'SELECT * FROM mi_tabla WHERE id = @parametro';
  const result = await request.query(query);
  
  return result.recordset;
}
```

### Comparación: Primera vs Segunda BD

```javascript
// Primera BD (principal)
const { getPool } = require('../db/db');
const pool = await getPool();

// Segunda BD
const { getPool2 } = require('../db/db');
const pool2 = await getPool2();
```

## 📝 Ejemplo Completo

### 1. Servicio (`src/services/mi-servicio-secundario.service.js`)

```javascript
const { getPool2 } = require('../db/db');

async function obtenerDatos(limit = 100) {
  const pool = await getPool2();
  const request = pool.request();
  
  request.input('limit', require('mssql').Int, limit);
  
  const query = `
    SELECT TOP (@limit) *
    FROM mi_tabla
    ORDER BY fecha_creacion DESC
  `;
  
  const result = await request.query(query);
  return result.recordset;
}

module.exports = { obtenerDatos };
```

### 2. Controlador (`src/controllers/mi-controlador-secundario.controller.js`)

```javascript
const miServicio = require('../services/mi-servicio-secundario.service');

async function getDatos(req, res, next) {
  try {
    const { limit } = req.query;
    const datos = await miServicio.obtenerDatos(limit ? parseInt(limit) : 100);
    
    res.json({
      success: true,
      data: datos
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDatos };
```

### 3. Ruta (`src/routes/mi-ruta-secundaria.routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const controlador = require('../controllers/mi-controlador-secundario.controller');

router.get('/datos', controlador.getDatos);

module.exports = router;
```

### 4. Registrar en `src/app.js`

```javascript
const miRutaSecundaria = require('./routes/mi-ruta-secundaria.routes');

// ... otras rutas ...
app.use('/api/mi-endpoint', miRutaSecundaria);
```

## 🚀 Endpoints de Ejemplo

Ya existe un endpoint de ejemplo configurado:

- **GET** `/api/local/data` - Obtiene datos de la segunda BD
- **GET** `/api/local/data/:id` - Obtiene un registro específico

### Adaptar el Ejemplo

1. Edita `src/services/local.service.js`
2. Cambia las consultas SQL según tus necesidades
3. Modifica los nombres de tablas y columnas
4. Ajusta los parámetros según tu caso de uso

## ⚠️ Notas Importantes

1. **Conexión Opcional**: Si la segunda BD no está disponible, la API seguirá funcionando con la primera BD
2. **Pools Independientes**: Cada BD tiene su propio pool de conexiones (máximo 10 cada uno)
3. **Timeouts**: Ambas conexiones tienen timeout de 120 segundos para consultas complejas
4. **Seguridad**: No olvides actualizar las credenciales en `config.json` según tu entorno

## 🔍 Verificar Conexión

Al iniciar el servidor, verás en la consola:

```
✅ Primary Database connected successfully
✅ Secondary Database connected successfully
```

Si la segunda BD falla, verás:

```
✅ Primary Database connected successfully
⚠️  Secondary Database connection failed (continuing with primary DB only): [mensaje de error]
```

## 📚 Documentación Swagger

Los endpoints de la segunda BD están documentados en Swagger:

- Accede a: `http://localhost:3000/api/docs`
- Busca la sección "Base de Datos Secundaria"

## 🛠️ Troubleshooting

### Error: "Cannot find module '../db/db'"
- Verifica que el archivo `src/db/db.js` existe
- Asegúrate de usar `getPool2` (no `getPool`)

### Error de conexión a la segunda BD
- Verifica las credenciales en `config.json`
- Asegúrate de que el servidor SQL Server esté accesible
- Verifica el firewall y la red

### La segunda BD no se conecta pero la primera sí
- Revisa los logs del servidor al iniciar
- Verifica que todas las variables `DB2_*` estén configuradas correctamente

