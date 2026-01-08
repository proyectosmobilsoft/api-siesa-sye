# Análisis de Documentos - Centro de Operación 003

## Resumen Ejecutivo
Análisis de 100 registros del centro de operación "003" de la tabla `t350_co_docto_contable`. Este centro muestra características diferentes a los centros 001 y 002, especialmente relacionadas con facturación de proveedores, notas de pedido, y operaciones logísticas.

## Distribución por Tipo de Documento

### Tipos de Documentos Encontrados

| Tipo | Cantidad | Descripción | Uso Principal |
|------|----------|-------------|---------------|
| **NP** | ~50 | Notas de Pedido | Documentos de pedido a proveedores |
| **FPE** | ~20 | Facturas de Proveedores | Facturas de proveedores |
| **RMC** | ~20 | Remisiones de Compra | Remisiones asociadas a FPE |
| **FAP** | ~3 | Facturas de Apertura | Facturas de apertura de periodo |
| **TRI** | ~4 | Traslados Internos | Movimientos de inventario entre ubicaciones |
| **DVV** | 1 | Devoluciones de Venta | Devoluciones de productos vendidos |
| **NC3** | 1 | Notas Crédito 3 | Notas crédito tipo 3 |

### Observaciones Clave
- **FPE y RMC** aparecen siempre en pares (cada factura de proveedor tiene su remisión)
- **NP** es el tipo más frecuente (~50% de los documentos)
- Todos los documentos FPE/RMC tienen nota: "CIERRE DE MES"
- Usuario principal: **dmoreno** (para NP), **hlopez** (para FPE/RMC), **davendaño** (para FAP)
- Fechas concentradas en abril-mayo 2022
- Valores muy variables: desde 85,617 hasta 123,105,305

---

## Análisis de Valores Monetarios

### Rangos de Valores

| Rango | Cantidad | Ejemplos |
|-------|----------|----------|
| **Bajos (< 1,000,000)** | ~30 | 85,617.00, 114,324.00, 225,972.00 |
| **Medios (1,000,000 - 10,000,000)** | ~40 | 1,545,120.00, 4,631,545.00, 9,190,665.00 |
| **Altos (10,000,000 - 50,000,000)** | ~20 | 15,678,953.00, 34,086,732.00, 42,238,717.00 |
| **Muy Altos (> 50,000,000)** | ~10 | 76,593,762.00, 123,105,305.00 |

### Valores Promedio por Tipo

- **FAP**: Promedio ~50,000,000 (rango: 9,635,365 - 123,105,305)
- **FPE**: Promedio ~5,000,000 (rango: 437,407 - 15,146,932)
- **RMC**: Promedio ~3,000,000 (rango: 237,116 - 8,699,715)
- **NP**: Promedio ~5,000,000 (rango: 85,617 - 42,238,717)
- **TRI**: Promedio ~10,000,000 (rango: 214,772 - 25,202,352)

### Balance Contable
✅ **Todos los documentos mantienen balance**: `total_db = total_cr` (principio de partida doble)

---

## Análisis de Fechas y Periodos

### Distribución de Fechas

| Fecha | Cantidad | Observación |
|-------|----------|-------------|
| **2022-05-12** | ~40 | Operaciones del día (principalmente NP) |
| **2022-04-29** | ~30 | Cierre de mes (FPE/RMC) |
| **2022-05-04** | ~5 | Operaciones de mayo |
| **2022-05-10** | ~5 | Operaciones de mayo |
| **2022-05-11** | ~3 | Operaciones de mayo |
| **2022-05-16** | ~3 | Operaciones de mayo |
| **2022-05-17** | ~3 | Operaciones de mayo |
| **2022-04-19** | ~2 | Operaciones de abril |
| **2022-04-21** | ~2 | Operaciones de abril |
| **2022-04-30** | ~1 | Operaciones de abril |

### Distribución de Periodos

| Periodo | Cantidad | Observación |
|---------|----------|-------------|
| **202205** | ~60 | Periodo de mayo 2022 |
| **202204** | ~40 | Periodo de abril 2022 |

---

## Análisis de Usuarios

### Usuarios Principales

| Usuario | Cantidad Docs | Tipos Principales | Observación |
|---------|---------------|-------------------|-------------|
| **dmoreno** | ~50 | NP | Usuario más activo, maneja notas de pedido |
| **hlopez** | ~40 | FPE, RMC, TRI, DVV, NC3 | Maneja facturas de proveedores y cierres |
| **davendaño** | ~3 | FAP | Maneja facturas de apertura |
| **carias** | ~4 | TRI | Maneja traslados internos |
| **kmolina** | ~2 | FPE | Maneja facturas de proveedores |
| **arudas** | 1 | FPE | Maneja facturas de proveedores |

### Patrones de Uso
- **dmoreno**: Principalmente notas de pedido (NP) - operaciones logísticas
- **hlopez**: Facturas de proveedores (FPE/RMC) y cierres de mes
- **davendaño**: Facturas de apertura (FAP) - facturación masiva de periodos
- **carias**: Traslados internos (TRI) - movimientos de inventario

---

## Análisis de Clases de Documento

| Clase | Cantidad | Tipo Doc Asociado | Descripción |
|-------|----------|-------------------|-------------|
| **413** | ~45 | NP | Notas de pedido |
| **420** | ~3 | NP | Notas de pedido (valores muy altos) |
| **523** | ~20 | FPE | Facturas de proveedores |
| **513** | ~20 | RMC | Remisiones de compra |
| **418** | ~3 | FAP | Facturas de apertura |
| **67** | ~4 | TRI | Traslados internos |
| **518** | 1 | DVV | Devoluciones |
| **526** | 1 | NC3 | Notas crédito |

---

## Análisis de Estados

### Distribución de Estados

| Estado | Cantidad | Significado |
|--------|----------|-------------|
| **1** (Activo) | ~98 | Documentos activos y válidos |
| **2** (Anulado/Procesado) | ~2 | Documentos anulados o procesados |

### Indicadores de Transmisión

| Transmit | Cantidad | Significado |
|----------|----------|-------------|
| **0** (No transmitido) | ~95 | La mayoría no transmitidos |
| **1** (Transmitido) | ~5 | Principalmente FAP y algunos FPE |

### Indicadores de Impresión

| Impreso | Cantidad | Observación |
|---------|----------|-------------|
| **0** (No impreso) | ~30 | Principalmente RMC, algunos NP |
| **1** (Impreso) | ~70 | Principalmente FPE, FAP, NP |

---

## Análisis de Notas y Referencias

### Patrones en Notas

1. **"CIERRE DE MES"**: Aparece en ~40 documentos
   - Principalmente en FPE y RMC
   - Asociado a cierres contables de abril 2022
   - Siempre en pares FPE/RMC

2. **"FACTURACION DEL..."**: Aparece en ~3 documentos FAP
   - "FACTURACION DEL 30 ABRIL AL 10 DE MAYO 2022"
   - "FACTURACION DEL 18 AL 29 ABRIL 2022"
   - "FACTURACION DEL 31 DE MARZO AL 17 DE ABRIL 2022"
   - Facturas de apertura masivas por periodos

3. **"SALIDA DE PROVEEDOR"**: Aparece en ~3 documentos NP
   - "SALIDA DE PROVEEDOR"
   - "SALIDA DE PROVEERDOR" (typo)
   - Indica salidas de mercancía de proveedores

4. **Referencias a COT**: Aparece en ~20 documentos
   - Formato: "COT-XXXXX" (ej: COT-40755, COT-39237)
   - Principalmente en FPE y RMC
   - Órdenes de compra o cotizaciones

5. **Referencias a WPW**: Aparece en ~5 documentos
   - "WPW 723 CAMBIO A CLIENTE"
   - "WPW722"
   - "WPW 722 CRISTIAN BALDOVINO 07:30 0.3 CARGUE LOCAL"
   - Probablemente códigos de vehículos o transportes

6. **Referencias a Vehículos**: Aparece en documentos TRI
   - "SZK 967 RETIRO EN CORPACERO"
   - "TTW 588 14:10 RETIRO EN BODEGA"
   - "WPW 722 CRISTIAN BALDOVINO..."
   - Códigos de vehículos para traslados

7. **Referencias a Regiones**: Aparece en documentos TRI
   - "CARGA REGIONAL CORDOBA"
   - "CARGUE REGIONAL MAGDALENA"
   - Traslados a regiones

8. **Referencias Vacías**: ~30 documentos NP
   - Muchos NP tienen notas vacías
   - Solo tienen referencia en campo `f350_referencia`

9. **Referencias a Números**: Aparece en documentos NP
   - "10676", "10633", "0800773", "0010654"
   - Probablemente números de pedido o guías

---

## Análisis de Terceros

### Terceros Más Frecuentes

| RowID Tercero | Cantidad | Observación |
|---------------|----------|-------------|
| **4438** | ~5 | Proveedor frecuente (FAP, algunos NP) |
| **31397** | ~3 | Cliente/proveedor (FPE, RMC, NC3, DVV) |
| **35664** | ~2 | Cliente (FPE, RMC) |
| **926** | ~2 | Cliente (FPE, RMC) |
| **33619** | ~2 | Cliente (FPE, RMC) |
| **31084** | ~2 | Cliente (FPE, RMC) |
| **34733** | ~2 | Cliente (FPE, RMC) |
| **31190** | ~2 | Cliente (FPE, RMC) |
| **10243** | ~3 | Cliente (FPE, RMC) |
| **31115** | ~3 | Cliente (FPE, RMC) |
| **34903** | ~3 | Cliente (FPE, RMC) |
| **35394** | ~2 | Cliente (FPE, RMC) |
| **786** | ~2 | Cliente (FPE, RMC) |
| **34817** | ~2 | Cliente (FPE, RMC) |
| **744** | ~2 | Cliente (FPE, RMC) |
| **35552** | ~2 | Cliente (FPE, RMC) |
| **35591** | ~2 | Cliente (FPE, RMC) |
| **476** | ~2 | Cliente (FPE, RMC) |
| **31113** | ~2 | Cliente (FPE, RMC) |
| **29622** | ~2 | Cliente (FPE, RMC) |
| **35657** | ~2 | Cliente (FPE, RMC) |
| **NULL** | ~4 | Principalmente TRI (traslados internos no tienen tercero) |

---

## Análisis de Sesiones

### Sesiones Identificadas

| RowID Sesión | Cantidad | Observación |
|--------------|----------|-------------|
| **225531** | ~40 | Sesión principal de NP (mayo 2022) |
| **224199** | ~30 | Sesión principal de FPE/RMC (abril 2022) |
| **224189** | ~3 | Sesión de TRI (traslados) |
| **224823** | ~2 | Sesión de NC3/DVV |
| **224735** | ~2 | Sesión de FPE/RMC |
| **224713** | ~1 | Sesión de FAP |
| **225274** | ~2 | Sesión de NP |
| **224971** | ~1 | Sesión de TRI |
| **224753** | ~1 | Sesión de TRI |
| **223977** | ~1 | Sesión de FAP |
| **223270** | ~2 | Sesión de FPE/RMC |

---

## Patrones Especiales Detectados

### 1. Pares FPE-RMC (Facturas de Proveedores)
- Cada factura FPE tiene su remisión RMC correspondiente
- Se crean casi simultáneamente (milisegundos de diferencia)
- Mismo tercero, misma fecha, mismo periodo
- Valores similares pero RMC generalmente menor
- Nota: "CIERRE DE MES"
- Referencia: COT-XXXXX
- Sesión: 224199 (abril 2022)

### 2. Notas de Pedido (NP)
- Tipo más frecuente (~50% de los documentos)
- Valores muy variables: desde 85,617 hasta 42,238,717
- Usuario principal: dmoreno
- Clase: 413 (mayoría) o 420 (valores muy altos)
- Notas frecuentes: "SALIDA DE PROVEEDOR", vacías, o números
- Referencias: números de pedido o guías
- Sesión: 225531 (mayo 2022)

### 3. Facturas de Apertura (FAP)
- Valores muy altos: 9,635,365 - 123,105,305
- Notas: "FACTURACION DEL [FECHA] AL [FECHA] [AÑO]"
- Usuario: davendaño
- Clase: 418
- Periodos: 202204, 202205
- Parecen ser facturaciones masivas de periodos anteriores

### 4. Traslados Internos (TRI)
- NO tienen tercero (NULL)
- Valores variables: 214,772 - 25,202,352
- Notas descriptivas de vehículos y destinos
- Usuario: carias, hlopez
- Clase: 67
- Referencias a vehículos: "WPW 722", "SZK 967", "TTW 588"
- Referencias a regiones: "CORDOBA", "MAGDALENA"

### 5. Cierres de Mes (FPE/RMC)
- Concentración el 29 de abril 2022
- Usuario principal: hlopez
- Notas: "CIERRE DE MES"
- Referencias: COT-XXXXX
- Valores variables: 411,000 - 15,146,932

---

## Diferencias Clave: Centro 001 vs Centro 002 vs Centro 003

### Centro 001 (Operaciones Normales)
- **Tipos principales**: BQE, RMV, RC, TC, TRI
- **Proceso**: Facturación manual, recibos de caja manuales
- **Usuario principal**: jhernandez (facturación), lcastillo (caja)
- **Características**:
  - Facturas de venta (BQE) con valores altos
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

### Centro 003 (Proveedores y Logística)
- **Tipos principales**: NP, FPE, RMC, FAP, TRI
- **Proceso**: Compras, facturas de proveedores, logística
- **Usuario principal**: dmoreno (NP), hlopez (FPE/RMC), davendaño (FAP)
- **Características**:
  - Notas de pedido masivas (NP)
  - Facturas de proveedores (FPE/RMC)
  - Facturas de apertura (FAP) - valores muy altos
  - Traslados logísticos (TRI)
  - Operaciones de compra y logística

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

### Centro 003 - Usar cuando:
1. **Notas de pedido** a proveedores (NP)
2. **Facturas de proveedores** (FPE/RMC)
3. **Facturas de apertura** de periodos (FAP)
4. **Operaciones de compra** y logística
5. **Traslados logísticos** (TRI) con vehículos
6. **Operaciones de almacén** relacionadas con compras

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

1. **Módulo "Facturas"**: `f350_id_tipo_docto IN ('BQE', 'FCE', 'FM', 'FPE', 'FAP')`
2. **Módulo "Remisiones"**: `f350_id_tipo_docto IN ('RMV', 'RMC')`
3. **Módulo "POS"**: `f350_id_tipo_docto IN ('R01', 'M01', 'C01')` y nota = "ACUMULACION POS"
4. **Módulo "Inventario"**: `f350_id_tipo_docto IN ('TRI', 'EAP', 'EAI')`
5. **Módulo "Compras"**: `f350_id_tipo_docto IN ('NP', 'FPE', 'RMC')`
6. **Módulo "Egresos"**: `f350_id_tipo_docto IN ('CE', 'TC')`
7. **Módulo "Notas Crédito"**: `f350_id_tipo_docto IN ('NC1', 'NC2', 'NC3')`
8. **Módulo "Devoluciones"**: `f350_id_tipo_docto IN ('DVV')`

---

## Cómo Identificar el Centro Correcto

### 1. Por Tipo de Operación

| Operación | Centro Recomendado | Tipo Documento |
|-----------|-------------------|-----------------|
| Recibo de caja manual | 001 | RC o RCC |
| Facturación manual | 001 | BQE |
| Operación POS | 002 | R01, M01, C01 |
| Facturación electrónica | 002 | FCE |
| Nota de pedido | 003 | NP |
| Factura de proveedor | 003 | FPE |
| Remisión de compra | 003 | RMC |
| Factura de apertura | 003 | FAP |
| Traslado de inventario | 001, 002 o 003 | TRI |
| Entrada de almacén | 001 o 002 | EAP, EAI |

### 2. Por Usuario/Proceso

| Usuario/Proceso | Centro | Tipos |
|-----------------|--------|-------|
| jhernandez (facturación) | 001 | BQE, RMV |
| lcastillo (caja) | 001 | RC, RCC |
| hpertuz (POS) | 002 | M01, C01, R01 |
| tpolo (facturación) | 002 | FCE, RMV |
| dmoreno (compras) | 003 | NP |
| hlopez (proveedores) | 003 | FPE, RMC |
| davendaño (apertura) | 003 | FAP |
| carias (logística) | 003 | TRI |

### 3. Por Valor y Volumen

| Característica | Centro |
|----------------|--------|
| Valores muy altos (> 10M) | 002 (R01) o 003 (FAP) |
| Volumen masivo de documentos | 002 (POS) o 003 (NP) |
| Documentos individuales | 001 |
| Acumulaciones automáticas | 002 |
| Facturas de apertura | 003 |

### 4. Por Transmisión

| Transmitido | Centro | Observación |
|-------------|--------|-------------|
| Sí (1) | 002 o 003 | Principalmente R01, FAP, algunos FPE |
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
- **Si es nota de pedido**: Centro 003
- **Si es factura de proveedor**: Centro 003
- **Si es traslado de inventario**: Depende de la ubicación (001, 002, o 003)

---

## Conclusión

El **centro de operación 003** se caracteriza por:

1. **Operaciones de compra y logística**: NP, FPE, RMC
2. **Facturas de apertura**: FAP (valores muy altos)
3. **Traslados logísticos**: TRI con referencias a vehículos y regiones
4. **Usuarios especializados**: dmoreno (compras), hlopez (proveedores), davendaño (apertura)
5. **Periodos históricos**: Fechas de abril-mayo 2022

**Para recibos de caja**:
- **Centro 001**: Recibos manuales normales (RC, RCC)
- **Centro 002**: Recibos POS (R01) - valores muy altos, automatizados
- **Centro 003**: NO tiene recibos de caja (solo NP, FPE, RMC, FAP, TRI)

**Criterio para listar en "Recibo de Caja"**:
- Tipo de documento: RC, RCC, o RC1
- Estado: Activo (1)
- No anulado
- Generalmente tiene tercero (cliente)
- **Centro 003 NO tiene documentos que aparezcan en "Recibo de Caja"**

