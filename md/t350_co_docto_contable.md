# Análisis de la Tabla `t350_co_docto_contable`

## Descripción General
Tabla principal de documentos contables del sistema SYE. Almacena todos los documentos contables (recibos de caja, facturas, notas crédito, etc.) con sus estados, valores, fechas y relaciones.

## Estructura de la Tabla

### Campos Principales

#### Identificación
- `f350_id_cia` (smallint, NOT NULL): ID de la compañía
- `f350_rowid` (int, IDENTITY): ID único autoincremental del documento
- `f350_id_co` (char(3), NOT NULL): **ID del centro de operación** - Identifica la unidad de negocio o centro contable donde se genera el documento. Ejemplos comunes: "001", "002". Cada centro de operación puede tener sus propios consecutivos y configuraciones.
- `f350_id_tipo_docto` (char(3), NOT NULL): Tipo de documento (RC, RCC, BQE, TRI, RMV, M01, C01, R01)
- `f350_consec_docto` (int, NOT NULL): Número consecutivo del documento (único por combinación de id_cia + id_co + id_tipo_docto)
- `f350_prefijo` (char(4), NULL): Prefijo del documento

#### Fechas y Periodos
- `f350_fecha` (datetime, NOT NULL): Fecha del documento
- `f350_id_periodo` (int, NOT NULL): Periodo contable en formato YYYYMM (ej: 202512, 202601)
- `f350_fecha_ts_creacion` (datetime, NOT NULL): Timestamp de creación
- `f350_fecha_ts_actualizacion` (datetime, NOT NULL): Timestamp de actualización
- `f350_fecha_ts_aprobacion` (datetime, NULL): Timestamp de aprobación
- `f350_fecha_ts_anulacion` (datetime, NULL): Timestamp de anulación
- `f350_fecha_ts_habilita_imp` (datetime, NULL): Timestamp de habilitación de impresión
- `f350_fecha_ts_impresion` (datetime, NULL): Timestamp de impresión
- `f350_fecha_ts_envio_correo` (datetime, NULL): Timestamp de envío de correo

#### Terceros y Ubicaciones
- `f350_rowid_tercero` (int, NULL): ID del tercero (cliente/proveedor)
- `f350_id_sucursal` (char(3), NULL): ID de la sucursal

#### Valores Monetarios
- `f350_total_db` (money, NOT NULL, DEFAULT 0): Total débito
- `f350_total_cr` (money, NOT NULL, DEFAULT 0): Total crédito
- `f350_total_db2` (money, NOT NULL, DEFAULT 0): Total débito moneda 2
- `f350_total_cr2` (money, NOT NULL, DEFAULT 0): Total crédito moneda 2
- `f350_total_db3` (money, NOT NULL, DEFAULT 0): Total débito moneda 3
- `f350_total_cr3` (money, NOT NULL, DEFAULT 0): Total crédito moneda 3
- `f350_total_base_gravable` (money, NOT NULL, DEFAULT 0): Base gravable para impuestos

#### Estados y Control
- `f350_id_clase_docto` (smallint, NOT NULL, DEFAULT 0): Clase de documento (523, 513, 67, 1202, 1260, 1249)
- `f350_ind_estado` (smallint, NOT NULL, DEFAULT 0): Estado del documento (0=Inactivo, 1=Activo, 2=Anulado)
- `f350_ind_transmit` (smallint, NOT NULL, DEFAULT 0): Indicador de transmisión (0=No transmitido, 1=Transmitido)
- `f350_ind_impresion` (smallint, NOT NULL, DEFAULT 0): Indicador de impresión (0=No impreso, 1=Impreso)
- `f350_nro_impresiones` (smallint, NOT NULL, DEFAULT 0): Número de impresiones
- `f350_ind_cfd` (smallint, NOT NULL, DEFAULT 0): Indicador CFD (0-9)
- `f350_ind_impto_asumido` (smallint, NOT NULL, DEFAULT 0): Indicador de impuesto asumido (0, 1, 2)
- `f350_ind_tipo_origen` (smallint, NOT NULL, DEFAULT 0): Tipo de origen (0, 1, 2)
- `f350_ind_clase_origen` (smallint, NOT NULL, DEFAULT 0): Clase de origen (0, 1)
- `f350_ind_dif_cambio_forma` (smallint, NOT NULL, DEFAULT 0): Diferencia de cambio forma (0, 1)
- `f350_ind_envio_correo` (smallint, NOT NULL, DEFAULT 0): Indicador de envío de correo (0, 1)

#### Monedas y Conversiones
- `f350_id_moneda_docto` (char(3), NULL): Moneda del documento (ej: COP)
- `f350_id_moneda_conv` (char(3), NULL): Moneda de conversión
- `f350_ind_forma_conv` (smallint, NOT NULL, DEFAULT 0): Forma de conversión (0, 1)
- `f350_tasa_conv` (decimal(28,4), NOT NULL, DEFAULT 0): Tasa de conversión
- `f350_id_moneda_local` (char(3), NULL): Moneda local
- `f350_ind_forma_local` (smallint, NOT NULL, DEFAULT 0): Forma local (0, 1)
- `f350_tasa_local` (decimal(28,4), NOT NULL, DEFAULT 0): Tasa local
- `f350_id_tipo_cambio` (char(3), NULL): ID del tipo de cambio (ej: "001")

#### Usuarios
- `f350_usuario_creacion` (varchar(30), NOT NULL): Usuario que creó el documento
- `f350_usuario_actualizacion` (varchar(30), NOT NULL): Usuario que actualizó
- `f350_usuario_aprobacion` (varchar(30), NULL): Usuario que aprobó
- `f350_usuario_anulacion` (varchar(30), NULL): Usuario que anuló
- `f350_usuario_habilita_imp` (varchar(30), NULL): Usuario que habilitó impresión
- `f350_usuario_impresion` (varchar(30), NULL): Usuario que imprimió
- `f350_usuario_envio_correo` (varchar(30), NULL): Usuario que envió correo

#### Referencias y Relaciones
- `f350_notas` (varchar(255), NULL): Notas del documento
- `f350_referencia` (varchar(20), NOT NULL, DEFAULT ''): Referencia del documento
- `f350_rowid_docto_base` (int, NULL): ID del documento base (self-reference)
- `f350_rowid_docto_rp` (int, NULL): ID del documento relacionado RP
- `f350_id_mandato` (char(15), NULL): ID del mandato
- `f350_rowid_movto_entidad` (int, NULL): ID del movimiento de entidad
- `f350_id_motivo_otros` (varchar(20), NULL): ID del motivo otros
- `f350_id_proyecto` (char(15), NULL): ID del proyecto
- `f350_rowid_sesion` (int, NULL): ID de la sesión
- `f350_rowid_te_plantilla` (int, NULL): ID de la plantilla

## Análisis de Datos de Ejemplo

### Tipos de Documentos Observados
1. **BQE** (Boletas de Venta): Documentos de venta
2. **RMV** (Remisiones de Venta): Remisiones
3. **TRI** (Traslados Internos): Traslados entre ubicaciones
4. **R01** (Recibos): Recibos de caja
5. **M01** (Movimientos): Movimientos contables
6. **C01** (Comprobantes): Comprobantes contables
7. **RC** (Recibo de Caja): Recibos de caja estándar
8. **RCC** (Recibo de Caja Complementario): Recibos complementarios

### Patrones Observados

#### Valores Monetarios
- Los documentos siempre tienen `f350_total_db = f350_total_cr` (balance contable)
- Los valores en moneda 2 y 3 también se mantienen balanceados
- Ejemplos de valores: 1,533,940.00; 1,129,534.74; 4,496,623.25; 8,529,256.44

#### Estados
- `f350_ind_estado = 1`: Documentos activos
- `f350_ind_transmit = 0`: La mayoría no están transmitidos
- `f350_ind_transmit = 1`: Algunos documentos R01 están transmitidos

#### Fechas
- Los documentos se crean con timestamps muy cercanos (milisegundos de diferencia)
- La fecha del documento puede ser diferente a la fecha de creación
- Ejemplo: Documento con fecha `2025-12-31` pero creado el `2026-01-06`

#### Periodos
- Formato: YYYYMM (ej: 202512 = Diciembre 2025, 202601 = Enero 2026)
- Los documentos pueden tener fechas de un mes pero periodos de otro

#### Clases de Documento
- **523**: Para documentos BQE
- **513**: Para documentos RMV
- **67**: Para documentos TRI
- **1202**: Para documentos R01
- **1260**: Para documentos M01
- **1249**: Para documentos C01

#### Referencias
- Muchos documentos tienen `f350_referencia = ''` (vacío)
- Algunos tienen referencias como "COT-99262"
- Las notas pueden contener información importante como "CIERRE DE MES", "ACUMULACION POS", etc.

## Foreign Keys (Relaciones)

### Relaciones Principales
1. **t010_mm_companias**: `f350_id_cia` → `f010_id`
2. **t021_mm_tipos_documentos**: `f350_id_cia, f350_id_tipo_docto` → `f021_id_cia, f021_id`
3. **t024_mm_periodos**: `f350_id_cia, f350_id_periodo` → `f024_id_cia, f024_id` ⚠️ **IMPORTANTE**
4. **t028_mm_clases_documento**: `f350_id_clase_docto` → `f028_id`
5. **t053_mm_fechas**: `f350_id_cia, f350_fecha` → `f053_id_cia, f053_id` ⚠️ **IMPORTANTE**
6. **t200_mm_terceros**: `f350_rowid_tercero` → `f200_rowid`
7. **t285_co_centro_op**: `f350_id_cia, f350_id_co` → `f285_id_cia, f285_id`
8. **t350_co_docto_contable** (self-reference): `f350_rowid_docto_base` → `f350_rowid`

### Relaciones Opcionales
- **t017_mm_monedas**: Para monedas del documento, conversión y local
- **t0171_mm_tipos_cambio**: Para tipos de cambio
- **t070_mm_mandatos**: Para mandatos
- **t107_mc_proyectos**: Para proyectos
- **t1461_mc_motivos_otros**: Para motivos
- **t540_lg_sesiones**: Para sesiones
- **t790_te_plantillas**: Para plantillas

## Constraints y Validaciones

### Check Constraints
- `CK_f350_ind_cfd`: Valores permitidos: 0, 1, 2, 3, 4, 5, 8, 9
- `CK_f350_ind_clase_origen`: Valores permitidos: 0, 1
- `CK_f350_ind_dif_cambio_forma`: Valores permitidos: 0, 1
- `CK_f350_ind_forma_conv`: Valores permitidos: 0, 1
- `CK_f350_ind_forma_local`: Valores permitidos: 0, 1
- `CK_f350_ind_impto_asumido`: Valores permitidos: 0, 1, 2
- `CK_f350_ind_tipo_origen`: Valores permitidos: 0, 1, 2
- `CK_t350`: `f350_ind_estado` (0, 1, 2) y `f350_ind_transmit` (0, 1)

## Problemas Comunes y Soluciones

### 1. Error: Foreign Key `FK_t350_t053_1`
**Problema**: La fecha del documento no existe en `t053_mm_fechas`
**Solución**: 
- Verificar que la fecha existe en `t053_mm_fechas` para la compañía
- Usar fechas que estén dentro del rango de fechas disponibles
- Ejemplo: Si solo existen fechas del 13-31 de diciembre, no usar fechas del 1-12

### 2. Error: Foreign Key `FK_t350_t024`
**Problema**: El periodo no existe en `t024_mm_periodos`
**Solución**:
- Verificar que el periodo existe en `t024_mm_periodos`
- Formato correcto: YYYYMM (ej: 202512, 202601)
- Si la tabla no existe, puede ser que el sistema use otra validación

### 3. Error: Duplicate Key `IX_t350_1`
**Problema**: Ya existe un documento con la misma combinación de `id_cia`, `id_co`, `id_tipo_docto`, `consec_docto`
**Solución**:
- Consultar el máximo consecutivo: `SELECT MAX(f350_consec_docto) + 1 FROM t350_co_docto_contable WHERE f350_id_cia = X AND f350_id_co = 'XXX' AND f350_id_tipo_docto = 'XXX'`
- Usar un consecutivo mayor al máximo existente

### 4. Error: Invalid Data Length para `cod_seguridad`
**Problema**: El campo está definido como `Char(3)` pero se envía más de 3 caracteres
**Solución**: Limitar `cod_seguridad` a máximo 3 caracteres

## Recomendaciones para el API

### Validaciones Previas
1. **Verificar fecha en t053_mm_fechas**:
   ```sql
   SELECT COUNT(*) FROM t053_mm_fechas 
   WHERE f053_id_cia = @id_cia AND f053_id = @fecha
   ```

2. **Verificar periodo en t024_mm_periodos**:
   ```sql
   SELECT COUNT(*) FROM t024_mm_periodos 
   WHERE f024_id_cia = @id_cia AND f024_id = @periodo
   ```

3. **Obtener siguiente consecutivo**:
   ```sql
   SELECT ISNULL(MAX(f350_consec_docto), 0) + 1 
   FROM t350_co_docto_contable 
   WHERE f350_id_cia = @id_cia 
     AND f350_id_co = @id_co 
     AND f350_id_tipo_docto = @id_tipo_docto
   ```

### Campos Críticos para Recibos de Caja (RC/RCC)
- `f350_id_cia`: Siempre requerido
- `f350_id_co`: Centro de operación (ej: "001", "002")
- `f350_id_tipo_docto`: "RC" o "RCC"
- `f350_consec_docto`: Debe ser único por compañía/centro/tipo
- `f350_fecha`: Debe existir en `t053_mm_fechas`
- `f350_id_periodo`: Debe existir en `t024_mm_periodos` (si la tabla existe)
- `f350_rowid_tercero`: Debe existir en `t200_mm_terceros`
- `f350_total_db` y `f350_total_cr`: Deben ser iguales (balance contable)
- `f350_id_clase_docto`: Clase de documento válida
- `f350_ind_estado`: 1 para activo, 0 para inactivo, 2 para anulado

## Notas Importantes

1. **Balance Contable**: Siempre `total_db = total_cr` (principio de partida doble)
2. **Timestamps**: Los documentos se crean con timestamps muy precisos (milisegundos)
3. **Periodos vs Fechas**: El periodo puede ser diferente al mes de la fecha del documento
4. **Self-Reference**: Los documentos pueden referenciar otros documentos de la misma tabla
5. **Estados**: El estado 1 es activo, pero el estado 2 puede ser anulado o procesado
6. **Transmisión**: Los documentos pueden estar transmitidos (1) o no (0)

