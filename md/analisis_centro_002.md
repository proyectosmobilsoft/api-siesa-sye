# Análisis de Documentos - Centro de Operación 002

## Resumen Ejecutivo
Análisis de 100 registros del centro de operación "002" de la tabla `t350_co_docto_contable`. Este centro muestra características diferentes al centro 001, especialmente relacionadas con POS (Point of Sale) y procesos automatizados.

## Distribución por Tipo de Documento

### Tipos de Documentos Encontrados

| Tipo | Cantidad | Descripción | Uso Principal |
|------|----------|-------------|---------------|
| **R01** | 1 | Recibos POS | Recibos de punto de venta (valores muy altos) |
| **M01** | ~35 | Movimientos POS | Movimientos contables de punto de venta |
| **C01** | ~35 | Comprobantes POS | Comprobantes de punto de venta |
| **FCE** | ~15 | Facturas Centro 002 | Facturas electrónicas del centro 002 |
| **RMV** | ~15 | Remisiones de Venta | Remisiones asociadas a FCE |
| **RC** | 1 | Recibo de Caja | Recibos de caja estándar |
| **D01** | ~3 | Documentos D01 | Documentos tipo D01 |
| **N01** | ~3 | Notas N01 | Notas tipo N01 |
| **EAP** | ~3 | Entradas Almacén P | Entradas de almacén tipo P |
| **EAI** | 1 | Entradas Almacén I | Entradas de almacén tipo I |
| **TRI** | 1 | Traslados Internos | Traslados entre ubicaciones |
| **FM** | 2 | Facturas Manuales | Facturas manuales |
| **MKI** | 1 | Movimientos MKI | Movimientos tipo MKI |
| **DVV** | 1 | Devoluciones | Devoluciones de venta |
| **NC2** | 1 | Notas Crédito 2 | Notas crédito tipo 2 |

### Observaciones Clave
- **M01 y C01** aparecen siempre en pares (cada movimiento tiene su comprobante)
- **FCE y RMV** aparecen siempre en pares (cada factura tiene su remisión)
- **R01** es único y tiene valores muy altos (17,770,562.00)
- Todos los documentos POS tienen nota: "ACUMULACION POS"
- Usuario principal: **hpertuz** (para documentos POS)
- Usuario **tpolo** (para facturas FCE)
- Usuario **lhernandez** (para recibos RC)

---

## Análisis de Valores Monetarios

### Rangos de Valores

| Rango | Cantidad | Ejemplos |
|-------|----------|----------|
| **Muy Bajos (< 1,000)** | 5 | 299.30, 450.00, 99.00 |
| **Bajos (1,000 - 100,000)** | ~25 | 1,527.66, 64,139.10, 106,800.00 |
| **Medios (100,000 - 1,000,000)** | ~40 | 162,759.45, 231,899.00, 605,849.06 |
| **Altos (1,000,000 - 10,000,000)** | ~25 | 1,590,659.03, 5,960,590.00, 7,660,970.00 |
| **Muy Altos (> 10,000,000)** | 5 | 17,770,562.00 (R01) |

### Valores Promedio por Tipo

- **R01**: 17,770,562.00 (valor único, muy alto)
- **M01**: Promedio ~500,000 (rango: 189.83 - 4,140,379.80)
- **C01**: Promedio ~700,000 (rango: 350.00 - 5,960,590.00)
- **FCE**: Promedio ~1,200,000 (rango: 111,774.00 - 4,480,000.00)
- **RMV**: Promedio ~900,000 (rango: 72,944.68 - 3,849,263.50)
- **RC**: 504,680.00 (único recibo encontrado)

---

## Análisis de Fechas y Periodos

### Distribución de Fechas

| Fecha | Cantidad | Observación |
|-------|----------|-------------|
| **2026-01-06** | ~90 | Operaciones del día (principalmente POS) |
| **2025-12-30** | ~5 | Operaciones previas |
| **2025-12-31** | ~5 | Cierre de mes |

### Distribución de Periodos

| Periodo | Cantidad | Observación |
|---------|----------|-------------|
| **202601** | ~90 | Periodo de enero 2026 |
| **202512** | ~10 | Periodo de diciembre 2025 |

---

## Análisis de Usuarios

### Usuarios Principales

| Usuario | Cantidad Docs | Tipos Principales | Observación |
|---------|---------------|-------------------|-------------|
| **hpertuz** | ~70 | M01, C01, R01, D01, N01 | Usuario de POS, maneja acumulaciones |
| **tpolo** | ~15 | FCE, RMV | Maneja facturación del centro 002 |
| **lhernandez** | 1 | RC | Recibos de caja |
| **jcassiani** | ~5 | TRI, EAP, EAI, DVV, NC2 | Maneja inventario y devoluciones |
| **lpizarro** | ~2 | EAP | Entradas de almacén |
| **jdelarans** | 1 | FM, RMV | Facturas manuales |
| **jcperez** | 1 | FM | Facturas manuales |

---

## Análisis de Clases de Documento

| Clase | Cantidad | Tipo Doc Asociado | Descripción |
|-------|----------|-------------------|-------------|
| **1202** | 1 | R01 | Recibos POS |
| **1260** | ~35 | M01 | Movimientos POS |
| **1249** | ~35 | C01 | Comprobantes POS |
| **523** | ~17 | FCE, FM | Facturas |
| **513** | ~15 | RMV | Remisiones |
| **13** | 1 | RC | Recibos de caja estándar |
| **1270** | ~3 | D01 | Documentos D01 |
| **1250** | ~3 | N01 | Notas N01 |
| **61** | ~4 | EAP, EAI | Entradas de almacén |
| **67** | 1 | TRI | Traslados internos |
| **70** | 1 | MKI | Movimientos MKI |
| **518** | 1 | DVV | Devoluciones |
| **526** | 1 | NC2 | Notas crédito |

---

## Análisis de Estados

### Distribución de Estados

| Estado | Cantidad | Significado |
|--------|----------|-------------|
| **1** (Activo) | 100 | Todos los documentos están activos |

### Indicadores de Transmisión

| Transmit | Cantidad | Significado |
|----------|----------|-------------|
| **0** (No transmitido) | ~95 | La mayoría no transmitidos |
| **1** (Transmitido) | ~5 | Principalmente R01 y algunos FCE |

### Indicadores de Impresión

| Impreso | Cantidad | Observación |
|---------|----------|-------------|
| **0** (No impreso) | ~50 | Principalmente M01, RMV, EAP, EAI |
| **1** (Impreso) | ~50 | Principalmente C01, FCE, FM, RC |

---

## Análisis de Notas y Referencias

### Patrones en Notas

1. **"ACUMULACION POS"**: Aparece en ~70 documentos
   - Principalmente en M01, C01, R01, D01, N01
   - Indica que son documentos generados por el sistema POS
   - Se crean en secuencia muy rápida (milisegundos)

2. **Referencias a COT**: Aparece en ~15 documentos
   - Formato: "COT-XXXXX" (ej: COT-99449, COT-99448)
   - Principalmente en FCE y RMV
   - Órdenes de compra o cotizaciones

3. **Referencias Vacías**: ~15 documentos
   - Principalmente FCE y RMV tienen notas vacías
   - Solo tienen referencia COT

4. **Referencias a VENTAS**: Aparece en documentos EAP
   - "VENTA SHARON", "VENTAS JHON", "PARA VENTA"
   - Indica entradas de almacén para venta

5. **Referencias a DEVOLUCIONES**: Aparece en DVV y NC2
   - "DEVOLUCION PORQUE NO SE FACTURO LA OFERTA"
   - Relacionadas con facturas FCE

---

## Análisis de Terceros

### Terceros Más Frecuentes

| RowID Tercero | Cantidad | Observación |
|---------------|----------|-------------|
| **4490** | ~15 | Cliente más frecuente en POS (M01/C01) |
| **36270** | 1 | Cliente del R01 (valor muy alto) |
| **35677** | 1 | Cliente con M01/C01 |
| **2269** | 1 | Cliente con M01/C01 |
| **1221** | 3 | Cliente con M01/C01, D01, N01 |
| **29822, 38778, 33858, etc.** | ~15 | Varios clientes de facturas FCE |
| **NULL** | ~5 | Principalmente EAP, EAI, TRI (sin tercero) |

---

## Análisis de Sesiones

### Sesiones Identificadas

| RowID Sesión | Cantidad | Observación |
|--------------|----------|-------------|
| **364204** | ~70 | Sesión principal de POS (M01, C01, R01, D01, N01) |
| **364182** | ~15 | Sesión de facturación (FCE, RMV) |
| **364165** | ~5 | Sesión de inventario (TRI, EAP, EAI) |
| **364170** | ~2 | Sesión de entradas de almacén |
| **364169** | 1 | Sesión de facturación manual |
| **364011** | 1 | Sesión de factura manual |
| **364063** | 1 | Sesión de recibo de caja |

---

## Patrones Especiales Detectados

### 1. Pares M01-C01 (POS)
- Cada movimiento M01 tiene su comprobante C01 correspondiente
- Se crean casi simultáneamente (milisegundos de diferencia)
- Mismo tercero, misma fecha, mismo periodo
- Valores similares pero C01 generalmente mayor
- Nota: "ACUMULACION POS"
- Sesión: 364204

### 2. Pares FCE-RMV (Facturación)
- Cada factura FCE tiene su remisión RMV correspondiente
- Similar a BQE-RMV del centro 001
- Referencias: COT-XXXXX
- Usuario: tpolo
- Sesión: 364182

### 3. Documento R01 (Recibo POS)
- Valor muy alto: 17,770,562.00
- Transmitido (`ind_transmit = 1`)
- Nota: "ACUMULACION POS"
- Clase: 1202
- Sesión: 364204

### 4. Documentos D01-N01
- Aparecen en pares
- Valores bajos
- Nota: "ACUMULACION POS"
- Relacionados con POS

### 5. Entradas de Almacén (EAP, EAI)
- NO tienen tercero (NULL)
- Notas: "VENTA SHARON", "VENTAS JHON", "PARA VENTA", "PARA VENTA GENERAL"
- Valores variables
- Usuario: jcassiani, lpizarro

---

## Diferencias Clave: Centro 001 vs Centro 002

### Centro 001 (Operaciones Normales)
- **Tipos principales**: BQE, RMV, RC, TC, TRI
- **Proceso**: Facturación manual, recibos de caja manuales
- **Usuario principal**: jhernandez (facturación), lcastillo (caja)
- **Características**:
  - Facturas grandes (BQE) con valores altos
  - Cierres de mes masivos
  - Recibos de caja esporádicos
  - Traslados internos frecuentes

### Centro 002 (POS y Automatización)
- **Tipos principales**: M01, C01, R01, FCE, RMV
- **Proceso**: POS automatizado, acumulaciones
- **Usuario principal**: hpertuz (POS), tpolo (facturación)
- **Características**:
  - Documentos POS masivos (M01/C01)
  - Recibo POS único y muy alto (R01)
  - Facturas FCE (diferentes a BQE)
  - Acumulaciones automáticas
  - Muchos documentos transmitidos

---

## Criterios para Determinar el Centro de Operación

### Centro 001 - Usar cuando:
1. **Facturación manual** de ventas normales
2. **Recibos de caja manuales** (pagos de clientes)
3. **Traslados internos** entre bodegas
4. **Cierres de mes** contables
5. **Operaciones administrativas** normales
6. **Facturas tipo BQE** (boletas de venta estándar)

### Centro 002 - Usar cuando:
1. **Operaciones de POS** (Point of Sale)
2. **Acumulaciones automáticas** del sistema
3. **Facturas tipo FCE** (facturas electrónicas del centro 002)
4. **Movimientos masivos** de punto de venta
5. **Documentos transmitidos** automáticamente
6. **Recibos POS** (R01) de valores muy altos

### Centro 003 - (Por analizar)
- Probablemente otro tipo de operaciones o ubicación

---

## Criterios para Listar en "Recibo de Caja" vs Otros Módulos

### Documentos que Aparecen en Módulo "Recibo de Caja"

**Criterio Principal**: `f350_id_tipo_docto IN ('RC', 'RCC', 'RC1')`

```sql
SELECT * FROM t350_co_docto_contable
WHERE f350_id_tipo_docto IN ('RC', 'RCC', 'RC1')
  AND f350_ind_estado = 1
  AND f350_fecha_ts_anulacion IS NULL
```

**Características**:
- Tipo de documento: RC, RCC, o RC1
- Clase de documento: 13 (RC), 1 (RCC), 14 (RC1)
- Estado: 1 (activo)
- No anulados
- Generalmente tienen tercero (cliente que paga)
- Notas frecuentes: "BQE XXXXX" (pago de facturas)

### Documentos que NO Aparecen en "Recibo de Caja"

**Otros módulos según tipo**:

1. **Módulo "Facturas"**: `f350_id_tipo_docto IN ('BQE', 'FCE', 'FM')`
2. **Módulo "Remisiones"**: `f350_id_tipo_docto IN ('RMV')`
3. **Módulo "POS"**: `f350_id_tipo_docto IN ('R01', 'M01', 'C01')` y nota = "ACUMULACION POS"
4. **Módulo "Inventario"**: `f350_id_tipo_docto IN ('TRI', 'EAP', 'EAI')`
5. **Módulo "Egresos"**: `f350_id_tipo_docto IN ('CE', 'TC')`
6. **Módulo "Notas Crédito"**: `f350_id_tipo_docto IN ('NC1', 'NC2')`
7. **Módulo "Devoluciones"**: `f350_id_tipo_docto IN ('DVV')`

---

## Cómo Identificar el Centro Correcto

### 1. Por Tipo de Operación

| Operación | Centro Recomendado | Tipo Documento |
|-----------|-------------------|-----------------|
| Recibo de caja manual | 001 | RC o RCC |
| Facturación manual | 001 | BQE |
| Operación POS | 002 | R01, M01, C01 |
| Facturación electrónica | 002 | FCE |
| Traslado de inventario | 001 o 002 | TRI |
| Entrada de almacén | 001 o 002 | EAP, EAI |

### 2. Por Usuario/Proceso

| Usuario/Proceso | Centro | Tipos |
|-----------------|--------|-------|
| jhernandez (facturación) | 001 | BQE, RMV |
| lcastillo (caja) | 001 | RC, RCC |
| hpertuz (POS) | 002 | M01, C01, R01 |
| tpolo (facturación) | 002 | FCE, RMV |
| ycervantes (bancos) | 001 | TC, CE |

### 3. Por Valor y Volumen

| Característica | Centro |
|----------------|--------|
| Valores muy altos (> 10M) | 002 (R01) |
| Volumen masivo de documentos | 002 (POS) |
| Documentos individuales | 001 |
| Acumulaciones automáticas | 002 |

### 4. Por Transmisión

| Transmitido | Centro | Observación |
|-------------|--------|-------------|
| Sí (1) | 002 | Principalmente R01 y algunos FCE |
| No (0) | 001 | La mayoría de documentos |

---

## Consultas SQL para Identificar Centro

### Ver qué centros existen
```sql
SELECT DISTINCT f350_id_co, COUNT(*) AS cantidad
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
GROUP BY f350_id_co
ORDER BY f350_id_co
```

### Ver tipos de documentos por centro
```sql
SELECT 
    f350_id_co,
    f350_id_tipo_docto,
    COUNT(*) AS cantidad,
    AVG(f350_total_cr) AS promedio_valor
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
GROUP BY f350_id_co, f350_id_tipo_docto
ORDER BY f350_id_co, cantidad DESC
```

### Ver recibos de caja por centro
```sql
SELECT 
    f350_id_co,
    COUNT(*) AS cantidad_rc,
    MIN(f350_fecha) AS fecha_min,
    MAX(f350_fecha) AS fecha_max,
    AVG(f350_total_cr) AS promedio_valor
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
  AND f350_id_tipo_docto IN ('RC', 'RCC', 'RC1')
GROUP BY f350_id_co
ORDER BY f350_id_co
```

---

## Recomendaciones para el API

### 1. Validar Centro Antes de Crear Documento

```sql
-- Verificar si el centro existe y es válido
SELECT f285_id, f285_descripcion
FROM t285_co_centro_op
WHERE f285_id_cia = @id_cia
  AND f285_id = @id_co
```

### 2. Obtener Consecutivo por Centro

```sql
-- El consecutivo es único por: id_cia + id_co + id_tipo_docto
SELECT ISNULL(MAX(f350_consec_docto), 0) + 1 AS siguiente
FROM t350_co_docto_contable 
WHERE f350_id_cia = @id_cia
  AND f350_id_co = @id_co
  AND f350_id_tipo_docto = @id_tipo_docto
```

### 3. Determinar Centro por Contexto

- **Si es recibo de caja manual**: Centro 001
- **Si es operación POS**: Centro 002
- **Si es facturación normal**: Centro 001
- **Si es facturación electrónica**: Centro 002
- **Si es traslado de inventario**: Depende de la ubicación

---

## Conclusión

El **centro de operación** determina:
1. **Qué procesos** se ejecutan
2. **Qué usuarios** pueden crear documentos
3. **Qué consecutivos** se usan
4. **En qué módulo** aparece el documento

**Para recibos de caja**:
- **Centro 001**: Recibos manuales normales (RC, RCC)
- **Centro 002**: Recibos POS (R01) - valores muy altos, automatizados

**Criterio para listar en "Recibo de Caja"**:
- Tipo de documento: RC, RCC, o RC1
- Estado: Activo (1)
- No anulado
- Generalmente tiene tercero (cliente)

