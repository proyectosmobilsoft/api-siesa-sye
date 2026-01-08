# Análisis de Documentos - Centro de Operación 001

## Resumen Ejecutivo
Análisis de 100 registros recientes del centro de operación "001" de la tabla `t350_co_docto_contable`.

## Distribución por Tipo de Documento

### Tipos de Documentos Encontrados

| Tipo | Cantidad | Descripción | Uso Principal |
|------|----------|-------------|---------------|
| **BQE** | ~35 | Boletas de Venta | Facturación de ventas a clientes |
| **RMV** | ~35 | Remisiones de Venta | Remisiones asociadas a facturas BQE |
| **RC** | ~8 | Recibo de Caja | Recibos de caja estándar |
| **RCC** | 1 | Recibo de Caja Complementario | Recibo complementario (el que creamos con el API) |
| **TC** | ~8 | Transferencias de Caja | Movimientos de caja entre cuentas/bancos |
| **TRI** | ~6 | Traslados Internos | Movimientos de inventario entre ubicaciones |
| **NC1** | ~4 | Notas Crédito | Correcciones/ajustes a facturas |
| **DVV** | ~3 | Devoluciones de Venta | Devoluciones de productos vendidos |
| **CE** | ~3 | Comprobantes de Egreso | Pagos y egresos |
| **EA** | ~3 | Entradas de Almacén | Ingresos de inventario |
| **DC** | ~2 | Documentos de Caja | Documentos de caja menores |
| **NTR** | 1 | Notas de Traslado | Notas de traslado |

### Observaciones
- **BQE y RMV** aparecen siempre en pares (cada factura tiene su remisión)
- Los documentos se crean en secuencia muy rápida (milisegundos de diferencia)
- **RC y RCC** son menos frecuentes que las facturas

## Análisis de Valores Monetarios

### Rangos de Valores

| Rango | Cantidad | Ejemplos |
|-------|----------|----------|
| **Muy Bajos (< 1,000)** | 2 | 99.00, 741.00 |
| **Bajos (1,000 - 100,000)** | ~15 | 697,629.00, 560,270.00 |
| **Medios (100,000 - 1,000,000)** | ~20 | 500,804.00, 662,621.00 |
| **Altos (1,000,000 - 10,000,000)** | ~40 | 1,533,940.00, 5,008,040.00 |
| **Muy Altos (10,000,000 - 100,000,000)** | ~20 | 29,250,067.00, 41,810,000.00 |
| **Extremos (> 100,000,000)** | 3 | 379,000,000.00, 741,174,443.00 |

### Valores Promedio por Tipo

- **BQE**: Promedio ~15,000,000 (rango: 92,600 - 41,810,000)
- **RMV**: Promedio ~12,000,000 (rango: 56,001 - 35,519,000)
- **RC**: Promedio ~3,000,000 (rango: 100 - 6,626,214)
- **TC**: Promedio ~8,000,000 (rango: 99 - 17,694,406)
- **TRI**: Promedio ~2,500,000 (rango: 23,964 - 8,529,256)

### Balance Contable
✅ **Todos los documentos mantienen balance**: `total_db = total_cr` (principio de partida doble)

## Análisis de Fechas y Periodos

### Distribución de Fechas

| Fecha | Cantidad | Observación |
|-------|----------|-------------|
| **2025-12-31** | ~70 | Cierre de mes diciembre 2025 |
| **2026-01-06** | ~20 | Operaciones de enero 2026 |
| **2026-01-07** | ~8 | Operaciones de enero 2026 |
| **2025-12-30** | ~2 | Operaciones previas al cierre |

### Distribución de Periodos

| Periodo | Cantidad | Observación |
|---------|----------|-------------|
| **202512** | ~75 | Periodo de diciembre 2025 |
| **202601** | ~25 | Periodo de enero 2026 |

### Anomalías Detectadas
⚠️ **Algunos documentos tienen fecha de un mes pero periodo de otro**:
- Fecha: 2025-12-31, Periodo: 202512 ✅ Correcto
- Fecha: 2026-01-06, Periodo: 202601 ✅ Correcto
- Fecha: 2025-12-30, Periodo: 202512 ✅ Correcto

## Análisis de Usuarios

### Usuarios Principales

| Usuario | Cantidad Docs | Tipos Principales | Observación |
|---------|---------------|-------------------|-------------|
| **jhernandez** | ~60 | BQE, RMV, TRI, NC1, DVV | Usuario más activo, maneja cierres de mes |
| **lcastillo** | ~12 | RC, RCC, RC1 | Maneja recibos de caja |
| **ycervantes** | ~25 | TC, CE, NTR, DC | Maneja transferencias y egresos |
| **cmartinez** | 1 | CE | Usuario con pocos documentos |
| **Sin usuario** | 1 | RCC | Documento creado por API (nuestro recibo de prueba) |

### Patrones de Uso
- **jhernandez**: Principalmente cierres de mes y facturación
- **lcastillo**: Recibos de caja y pagos
- **ycervantes**: Operaciones de caja y bancos

## Análisis de Clases de Documento

| Clase | Cantidad | Tipo Doc Asociado | Descripción |
|-------|----------|-------------------|-------------|
| **523** | ~35 | BQE | Boletas de venta |
| **513** | ~35 | RMV | Remisiones de venta |
| **13** | ~8 | RC | Recibos de caja estándar |
| **1** | ~3 | RCC, RC1 | Recibos complementarios |
| **67** | ~6 | TRI | Traslados internos |
| **0** | ~8 | TC, CE, EA, NTR, DC | Varios tipos |
| **526** | ~4 | NC1 | Notas crédito |
| **518** | ~3 | DVV | Devoluciones |
| **408** | ~3 | EA | Entradas de almacén |
| **14** | 1 | RC1 | Recibos tipo 1 |

## Análisis de Estados

### Distribución de Estados

| Estado | Cantidad | Significado |
|--------|----------|-------------|
| **1** (Activo) | ~98 | Documentos activos y válidos |
| **2** (Anulado/Procesado) | 2 | Documentos anulados o procesados |

### Indicadores de Transmisión

| Transmit | Cantidad | Significado |
|----------|----------|-------------|
| **0** (No transmitido) | ~98 | Documentos no transmitidos |
| **1** (Transmitido) | 2 | Documentos transmitidos (posiblemente a sistemas externos) |

### Indicadores de Impresión

| Impreso | Cantidad | Observación |
|---------|----------|-------------|
| **0** (No impreso) | ~30 | Principalmente RMV, TRI, algunos TC |
| **1** (Impreso) | ~70 | Principalmente BQE, RC, NC1 |

## Análisis de Notas y Referencias

### Patrones en Notas

1. **"CIERRE DE MES"**: Aparece en ~60 documentos
   - Principalmente en BQE, RMV, NC1, DVV
   - Asociado a cierres contables de diciembre 2025

2. **Referencias a COT**: Aparece en ~40 documentos
   - Formato: "COT-XXXXX" (ej: COT-99262, COT-99345)
   - Probablemente órdenes de compra o cotizaciones

3. **Referencias a BQE**: Aparece en ~10 documentos
   - Formato: "BQE-XXXXX" o "BQE XXXXX_XXXXX"
   - Relación entre documentos (RC que paga BQE)

4. **Referencias a CRUCE**: Aparece en documentos TC
   - Formato: "CRUCE 1380 XX DIC BOGOTA"
   - Transferencias bancarias

5. **Referencias a GASTOS**: Aparece en documentos CE
   - "GASTOS PL 30 DIC", "GASTOS MOSTRADOR"

6. **Referencias a INGRESO PROVISIONAL**: Aparece en documentos EA
   - "INGRESO PROVISIONAL P7", "INGRESO PROVISION KNAUF"

### Referencias Vacías
- Muchos documentos tienen `f350_referencia = ''` (vacío)
- Los documentos TRI generalmente no tienen referencia

## Análisis de Terceros

### Terceros Más Frecuentes

| RowID Tercero | Cantidad | Observación |
|---------------|----------|-------------|
| **36955** | ~8 | Cliente frecuente en cierres de mes |
| **37758** | ~6 | Cliente con facturación alta |
| **659** | ~4 | Cliente con múltiples facturas |
| **74** | ~5 | Tercero para operaciones de caja |
| **82** | ~8 | Tercero para transferencias bancarias |
| **34580** | 1 | EL BUFETE KYRIOS SAS (nuestro recibo de prueba) |
| **NULL** | ~6 | Principalmente TRI (traslados internos no tienen tercero) |

## Análisis de Sesiones

### Sesiones Identificadas

| RowID Sesión | Cantidad | Observación |
|--------------|----------|-------------|
| **364000** | ~70 | Sesión principal de cierre de mes |
| **364234** | ~8 | Sesión de facturación enero 2026 |
| **364218** | ~8 | Sesión de recibos de caja |
| **364216** | ~8 | Sesión de transferencias de caja |
| **364215** | ~2 | Sesión de comprobantes |
| **364212** | ~2 | Sesión de documentos de caja |
| **364213** | 1 | Sesión de comprobante anulado |
| **NULL** | 1 | RCC creado por API (sin sesión) |

## Análisis de Monedas y Conversiones

### Monedas Utilizadas

| Moneda | Cantidad | Observación |
|--------|----------|-------------|
| **COP** | 100 | Todos los documentos usan pesos colombianos |

### Tasas de Conversión
- **Tasa de conversión**: 1.0000 (todos los documentos)
- **Tasa local**: 1.0000 (todos los documentos)
- **Forma de conversión**: 0 (todos los documentos)
- **Forma local**: 0 (todos los documentos)

## Análisis de Impuestos

### Base Gravable

| Rango | Cantidad | Observación |
|-------|----------|-------------|
| **0.00** | ~85 | Sin base gravable |
| **> 0** | ~15 | Principalmente BQE y NC1 |

### Indicador de Impuesto Asumido

| Valor | Cantidad | Significado |
|-------|----------|-------------|
| **2** | 100 | Todos los documentos tienen impuesto asumido = 2 |

## Análisis de Indicadores CFD

### Distribución de CFD

| Valor | Cantidad | Tipo Doc | Significado |
|-------|----------|----------|-------------|
| **0** | ~95 | Varios | Sin CFD |
| **3** | ~5 | BQE, NC1 | CFD tipo 3 (facturas electrónicas) |
| **5** | 1 | BQE | CFD tipo 5 |

## Patrones Especiales Detectados

### 1. Pares BQE-RMV
- Cada factura BQE tiene su remisión RMV correspondiente
- Se crean casi simultáneamente (milisegundos de diferencia)
- Mismo tercero, misma fecha, mismo periodo
- Valores similares pero no idénticos (RMV generalmente menor)

### 2. Cierres de Mes
- Concentración masiva de documentos el 31 de diciembre 2025
- Usuario principal: jhernandez
- Notas: "CIERRE DE MES"
- Referencias: COT-XXXXX

### 3. Recibos de Caja (RC)
- Valores variables: desde 100.00 hasta 6,626,214.00
- Notas frecuentes: "BQE XXXXX" (pago de facturas)
- Usuario principal: lcastillo
- Clase de documento: 13

### 4. Transferencias de Caja (TC)
- Valores altos: promedio ~8,000,000
- Notas: "CRUCE 1380 XX DIC BOGOTA", "TC XX DIC BANCOLOMBIA"
- Usuario: ycervantes
- Relacionadas con conciliación bancaria

### 5. Traslados Internos (TRI)
- No tienen tercero (NULL)
- Valores variables
- Notas descriptivas de origen/destino
- Usuario: jhernandez

## Documento Especial: RCC 68433 (Nuestro Recibo de Prueba)

```
RowID: 904857
Tipo: RCC
Consecutivo: 68433
Fecha: 2026-01-06
Periodo: 202601
Tercero: 34580 (EL BUFETE KYRIOS SAS)
Valor: 100.00
Estado: 1 (Activo)
Usuario: "Sin usuario" (creado por API)
Sesión: NULL
```

### Características Únicas
- ✅ Único documento con usuario "Sin usuario"
- ✅ Único documento sin sesión (NULL)
- ✅ Valor mínimo (100.00)
- ✅ Clase de documento: 1 (diferente a RC estándar que usa 13)
- ✅ Prefijo: "RCC" (mientras RC estándar tiene prefijo vacío)

## Recomendaciones para el API

### 1. Valores por Defecto Recomendados
- **Clase de documento**: 13 para RC, 1 para RCC
- **Estado**: 1 (activo)
- **Transmit**: 0 (no transmitido)
- **Impresión**: 0 o 1 según necesidad
- **Indicador CFD**: 0 (sin CFD) o 3 (con CFD según tipo)
- **Impuesto asumido**: 2

### 2. Validaciones Importantes
- Verificar que la fecha existe en `t053_mm_fechas`
- Verificar que el periodo existe en `t024_mm_periodos` (si aplica)
- Verificar que el tercero existe en `t200_mm_terceros`
- Verificar que el consecutivo no existe para la combinación `id_cia + id_co + id_tipo_docto`

### 3. Patrones a Seguir
- Los RC que pagan facturas deben tener nota con referencia "BQE XXXXX"
- Los valores deben mantener balance (total_db = total_cr)
- Las fechas y periodos deben ser consistentes
- Usar sesión si está disponible (aunque no es obligatorio)

### 4. Diferencias RC vs RCC
- **RC**: Clase 13, prefijo vacío, valores más altos
- **RCC**: Clase 1, prefijo "RCC", valores variables, más flexible

## Conclusiones

1. **Centro 001 es muy activo**: ~100 documentos en pocos días
2. **Cierres de mes son masivos**: Concentración de documentos el 31 de diciembre
3. **Facturación es el proceso principal**: BQE y RMV dominan el volumen
4. **Recibos de caja son menos frecuentes**: Solo ~8-9 RC en 100 documentos
5. **Usuarios tienen roles definidos**: jhernandez (facturación), lcastillo (caja), ycervantes (bancos)
6. **Todos los documentos mantienen balance contable**: Principio de partida doble respetado
7. **Moneda única**: Todos los documentos en COP
8. **Periodos y fechas generalmente coinciden**: Pocas anomalías

