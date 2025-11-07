# SYE API - Sistema de Gestión Distribuidora

API REST desarrollada con Node.js y Express para la gestión de clientes, productos, bodegas, facturas y reportes de una distribuidora. La API se conecta a SQL Server y proporciona endpoints para consultas, reportes y análisis de datos.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Prerrequisitos](#-prerrequisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Endpoints Disponibles](#-endpoints-disponibles)
- [Documentación API](#-documentación-api)
- [Manejo de Errores](#-manejo-de-errores)
- [Scripts Disponibles](#-scripts-disponibles)
- [Base de Datos](#-base-de-datos)
- [Contribución](#-contribución)

## 🎯 Descripción

SYE API es una API REST completa que proporciona servicios para:

- **Gestión de Clientes**: Consulta de clientes, reportes de ventas por cliente, top 10 clientes y análisis de clientes nuevos vs recurrentes
- **Gestión de Productos**: Consulta de productos, reportes de ventas por producto y productos más/menos vendidos
- **Gestión de Bodegas**: Consulta de bodegas y reportes de ventas por bodega
- **Gestión de Facturas**: Consulta de facturas, estados financieros, estados de resultados y tendencias mensuales
- **Reportes**: Pedidos diarios, resúmenes de ventas, vendedores, tendencias mensuales y comparativos año contra año y mes contra mes
- **Gestión de Compañías**: Consulta de compañías activas

La API utiliza SQL Server como base de datos y está completamente documentada con Swagger.

## 🛠️ Tecnologías

- **Node.js** - Entorno de ejecución de JavaScript
- **Express** - Framework web para Node.js
- **mssql** - Cliente de SQL Server para Node.js
- **Swagger (swagger-jsdoc, swagger-ui-express)** - Documentación interactiva de la API
- **Helmet** - Seguridad HTTP
- **Morgan** - Logger de peticiones HTTP
- **dotenv** - Gestión de variables de entorno
- **ESLint** - Linter para JavaScript
- **Nodemon** - Herramienta de desarrollo para reiniciar automáticamente el servidor

## 📦 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 14 o superior ([Descargar Node.js](https://nodejs.org/))
- **SQL Server** 2012 o superior
- **npm** (viene incluido con Node.js) o **yarn**
- Acceso a una base de datos SQL Server con los datos necesarios

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd API
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Puerto del servidor
PORT=3000

# Configuración de base de datos SQL Server
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=nombre_base_datos
DB_PORT=1433
```

**Nota**: Ajusta los valores según tu configuración de SQL Server.

### 4. Verificar la conexión a la base de datos

Asegúrate de que SQL Server esté ejecutándose y que las credenciales sean correctas.

### 5. Iniciar el servidor

#### Modo desarrollo (con auto-recarga):

```bash
npm run dev
```

#### Modo producción:

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000` (o el puerto especificado en la variable de entorno `PORT`).

## ⚙️ Configuración

### Variables de Entorno

El archivo `.env` debe contener las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de SQL Server | `localhost` |
| `DB_USER` | Usuario de la base de datos | `sa` |
| `DB_PASS` | Contraseña de la base de datos | `tu_contraseña` |
| `DB_NAME` | Nombre de la base de datos | `SYE_DB` |
| `DB_PORT` | Puerto de SQL Server | `1433` |

### Configuración de SQL Server

La conexión a SQL Server está configurada con:

- **Encrypt**: `false` (usa `true` si el servidor requiere SSL)
- **TrustServerCertificate**: `true` (para entornos locales)
- **RequestTimeout**: `120000` ms (2 minutos)
- **Pool**: Máximo 10 conexiones, mínimo 0
- **ConnectionTimeout**: `30000` ms (30 segundos)

## 💻 Uso

### Ejemplo de petición GET

```bash
# Obtener todos los clientes
curl http://localhost:3000/api/clients

# Obtener reporte de ventas por cliente
curl http://localhost:3000/api/clients/sales-report?yearMonth=202501&companyId=1

# Obtener top 10 clientes
curl http://localhost:3000/api/clients/top-10?yearMonth=202501
```

### Ejemplo de respuesta

```json
{
  "success": true,
  "data": [
    {
      "f9740_id": 101,
      "f9740_nit": "901123456",
      "f9740_razon_social": "Distribuidora S.A.S",
      "f9740_nombre": "Distribuidora Principal",
      "f9740_email": "info@empresa.com",
      "f9740_celular": "3001234567",
      "f9740_direccion1": "Calle 123 #45-67"
    }
  ]
}
```

## 📁 Estructura del Proyecto

```
src/
├── index.js                    # Punto de entrada de la aplicación
├── app.js                      # Configuración de Express y rutas
├── config/                     # Configuración
│   ├── env.js                 # Variables de entorno
│   └── swagger.js             # Configuración de Swagger
├── db/                        # Base de datos
│   └── db.js                  # Configuración de SQL Server
├── routes/                     # Rutas de la API
│   ├── clients.routes.js      # Rutas de clientes
│   ├── companies.routes.js    # Rutas de compañías
│   ├── products.routes.js     # Rutas de productos
│   ├── warehouses.routes.js   # Rutas de bodegas
│   ├── factura.routes.js      # Rutas de facturas
│   └── reports.routes.js      # Rutas de reportes
├── controllers/                # Controladores
│   ├── clients.controller.js
│   ├── companies.controller.js
│   ├── products.controller.js
│   ├── warehouses.controller.js
│   ├── factura.controller.js
│   └── reports.controller.js
├── services/                   # Lógica de negocio
│   ├── clients.service.js
│   ├── companies.service.js
│   ├── products.service.js
│   ├── warehouses.service.js
│   ├── factura.service.js
│   └── reports.service.js
└── middlewares/                # Middlewares
    └── errorHandler.js        # Manejo de errores
```

## 🔌 Endpoints Disponibles

### Clientes (`/api/clients`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clients` | Obtener todos los clientes |
| GET | `/api/clients/sales-report` | Reporte de ventas por cliente |
| GET | `/api/clients/top-10` | Top 10 clientes del mes |
| GET | `/api/clients/new-vs-recurrent` | Análisis de clientes nuevos vs recurrentes |

**Parámetros de consulta:**
- `yearMonth` (opcional): Formato YYYYMM (ej: 202501)
- `companyId` (opcional): ID de la compañía (default: 1)
- `currentMonth` (requerido para new-vs-recurrent): Formato YYYYMM
- `previousMonth` (opcional para new-vs-recurrent): Formato YYYYMM

### Productos (`/api/products`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Obtener todos los productos |
| GET | `/api/products/sales-report` | Reporte de ventas por producto |
| GET | `/api/products/top-10-best-selling` | Top 10 productos más vendidos |
| GET | `/api/products/top-10-least-selling` | Top 10 productos menos vendidos |

**Parámetros de consulta:**
- `yearMonth` (opcional): Formato YYYYMM (ej: 202501)
- `companyId` (opcional): ID de la compañía (default: 1)

### Bodegas (`/api/warehouses`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/warehouses` | Obtener todas las bodegas |
| GET | `/api/warehouses/sales-report` | Reporte de ventas por bodega |

**Parámetros de consulta:**
- `yearMonth` (opcional): Formato YYYYMM (ej: 202501)
- `companyId` (opcional): ID de la compañía (default: 1)

### Facturas (`/api/factura`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/factura/facturas` | Obtener listado de facturas |
| GET | `/api/factura/estados-financieros` | Obtener estados financieros |
| GET | `/api/factura/perdidas-ganancias` | Estado de Resultados (Pérdidas y Ganancias) |
| GET | `/api/factura/tendencia-mensual` | Tendencia mensual de ingresos, costos y gastos |

**Parámetros de consulta:**
- `periodoInicial` (opcional): Formato YYYYMM (default: 202401)
- `periodoFinal` (opcional): Formato YYYYMM (default: 202412)
- `page` (opcional, solo para facturas): Número de página (default: 1)
- `pageSize` (opcional, solo para facturas): Tamaño de página (default: 1000, max: 5000)

### Reportes (`/api/reports`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reports/daily-orders` | Obtener pedidos diarios |
| GET | `/api/reports/sales-summary` | Resumen de ventas TPV |
| GET | `/api/reports/vendors` | Obtener vendedores |
| GET | `/api/reports/monthly-sales-trend` | Tendencia mensual de ventas |
| GET | `/api/reports/year-over-year` | Comparativo año contra año (YoY) |
| GET | `/api/reports/month-over-month` | Variación porcentual mensual (MoM) |

**Parámetros de consulta:**
- `companyId` (opcional): ID de la compañía (default: 1)

### Compañías (`/api/companies`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies` | Obtener todas las compañías |

## 📘 Documentación API

La API está completamente documentada con Swagger. Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva en:

**http://localhost:3000/api/docs**

La documentación Swagger incluye:

- Descripción de todos los endpoints
- Parámetros de consulta y sus tipos
- Ejemplos de solicitudes y respuestas
- Esquemas de datos (schemas)
- Códigos de respuesta HTTP

### Ejemplo de uso de Swagger

1. Inicia el servidor: `npm run dev`
2. Abre tu navegador en `http://localhost:3000/api/docs`
3. Explora los endpoints disponibles
4. Prueba las peticiones directamente desde la interfaz de Swagger

## ⚠️ Manejo de Errores

La API utiliza un middleware de manejo de errores centralizado. Todas las respuestas de error siguen el siguiente formato:

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

### Códigos de Estado HTTP

- `200` - OK: Petición exitosa
- `400` - Bad Request: Parámetros inválidos o faltantes
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error interno del servidor

### Ejemplo de respuesta de error

```json
{
  "success": false,
  "error": "Error al obtener el reporte de ventas por cliente"
}
```

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con nodemon (auto-recarga) |
| `npm run lint` | Ejecuta ESLint para revisar el código |

## 🗄️ Base de Datos

### Requisitos

- **SQL Server** 2012 o superior
- Base de datos con las siguientes tablas/vistas:
  - `t9740_mc_clientes` - Tabla de clientes
  - `t120_mc_productos` - Tabla de productos
  - `t150_mc_bodegas` - Tabla de bodegas
  - `t010_mc_companias` - Tabla de compañías
  - Vistas de facturación y reportes

### Configuración de la Conexión

La conexión a SQL Server utiliza un pool de conexiones con las siguientes características:

- **Máximo de conexiones**: 10
- **Mínimo de conexiones**: 0
- **Timeout de solicitud**: 120 segundos
- **Timeout de conexión**: 30 segundos
- **Idle timeout**: 30 segundos

### Estructura de Respuestas

Todas las respuestas exitosas siguen el formato:

```json
{
  "success": true,
  "data": [...]
}
```

Algunas respuestas incluyen paginación:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 1000,
    "total": 5000,
    "totalPages": 5
  }
}
```

## 🔒 Seguridad

La API implementa las siguientes medidas de seguridad:

- **Helmet**: Protege la aplicación de vulnerabilidades HTTP conocidas
- **Validación de entrada**: Los parámetros son validados antes de procesar las consultas
- **Manejo seguro de errores**: Los errores no exponen información sensible
- **Pool de conexiones**: Limita el número de conexiones simultáneas a la base de datos

## 🚦 Estado de la API

La API está en producción y lista para ser utilizada. Todos los endpoints están documentados y probados.

### Endpoints Disponibles por Módulo

- ✅ **Clientes**: 4 endpoints
- ✅ **Productos**: 4 endpoints
- ✅ **Bodegas**: 2 endpoints
- ✅ **Facturas**: 4 endpoints
- ✅ **Reportes**: 6 endpoints
- ✅ **Compañías**: 1 endpoint

**Total: 21 endpoints disponibles**

## 📝 Notas Importantes

1. **Formato de fechas**: Los periodos deben especificarse en formato `YYYYMM` (ej: 202501 para enero 2025)
2. **Paginación**: El endpoint de facturas implementa paginación por defecto (1000 registros por página, máximo 5000)
3. **Timeouts**: Las consultas complejas tienen un timeout de 120 segundos
4. **Company ID**: La mayoría de endpoints aceptan el parámetro `companyId` (default: 1)

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

## 👥 Autores

- Equipo de Desarrollo SYE

## 📞 Soporte

Para soporte, contacta al equipo de desarrollo en: dev@distrisye.com

## 🔄 Versión

**Versión actual**: 1.0.0

---

**¡Gracias por usar SYE API!** 🚀
