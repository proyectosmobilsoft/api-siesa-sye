# Análisis Completo de Stored Procedures - Recibo de Caja

## Resumen Ejecutivo

Este documento desmenuza **todos los stored procedures (SP)** que se ejecutan al procesar un recibo de caja a través del endpoint `/api/recibo-caja/procesar`.

**Total de SP ejecutados: 5** (4 obligatorios + 1 condicional)

---

## Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────────┐
│  INICIO: Transacción SQL                                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  1. sp_docto_insertar                                       │
│     → Crea el documento contable en t350_co_docto_contable  │
│     → Retorna: p_rowid (ID del documento creado)            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. sp_mov_docto_insertar                                   │
│     → Crea el movimiento contable en t351_co_mov_docto     │
│     → Usa: p_rowid del SP anterior                          │
│     → Retorna: RowId (ID del movimiento creado)              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. sp_rel_med_pag_insertar                                 │
│     → Crea la relación de medio de pago                     │
│     → Usa: p_rowid del SP 1 y RowId del SP 2               │
│     → Retorna: p_rowid (ID de la relación creada)            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────┴─────────────────┐
        │ ¿p_rowid_docto_letra > 0?         │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼ SÍ                                ▼ NO
┌─────────────────────────────┐   ┌─────────────────────────────┐
│  4. sp_let_movto_adicionar  │   │  4. (OMITIDO)               │
│     → Maneja letras de cambio│   │     No se ejecuta           │
│     → Retorna: p_error       │   │                             │
└─────────────────────────────┘   └─────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. sp_docto_actualizar_estado                               │
│     → Actualiza el estado final del documento               │
│     → Usa: p_rowid del SP 1                                 │
│     → Retorna: p_error, datos del documento                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  COMMIT: Transacción completada exitosamente                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. sp_docto_insertar

### Propósito
Crea el registro principal del documento contable en la tabla `t350_co_docto_contable`. Este es el **primer paso** y es **obligatorio**.

### Tablas Afectadas
- **`t350_co_docto_contable`**: Inserta un nuevo registro

### Parámetros de Entrada (Obligatorios)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `id_cia` | SmallInt | ID de la compañía | `1` |
| `id_co` | Char(3) | Centro de operación | `"001"` |
| `id_tipo_docto` | Char(3) | Tipo de documento | `"RC"` o `"RCC"` |
| `consec_docto` | Int | Número consecutivo del documento | `12348` |
| `fecha` | DateTime | Fecha del documento | `"2026-01-06T00:00:00Z"` |
| `periodo` | Int | Periodo contable (YYYYMM) | `202601` |
| `rowid_tercero` | Int | ID del tercero (cliente) | `34580` |
| `sucursal` | Char(3) | ID de sucursal | `"001"` |
| `total_db` | Money | Total débito | `100.00` |
| `total_cr` | Money | Total crédito | `100.00` |
| `ind_origen` | SmallInt | Origen del documento (1=manual) | `1` |
| `ind_estado` | SmallInt | Estado (1=activo) | `1` |
| `ind_transmit` | SmallInt | Transmitido (0=no, 1=sí) | `0` |
| `fecha_creacion` | DateTime | Fecha de creación | `"2026-01-06T10:00:00Z"` |
| `fecha_actualiza` | DateTime | Fecha de actualización | `"2026-01-06T10:00:00Z"` |
| `fecha_afectado` | DateTime | Fecha de afectación contable | `"2026-01-06T10:00:00Z"` |
| `notas` | VarChar(255) | Notas del documento | `"PAGO DE FACTURA BQE 30149"` |

### Parámetros de Entrada (Opcionales)

| Parámetro | Tipo | Descripción | Valor por Defecto |
|-----------|------|-------------|-------------------|
| `prefijo` | Char(4) | Prefijo del documento (siempre vacío para RC/RCC) | `""` (vacío) |
| `usuariocreacion` | VarChar(30) | Usuario que crea | `NULL` |
| `p_rowid_docto_base` | Int | ID del documento base | `NULL` |
| `p_referencia` | VarChar(20) | Referencia externa | `NULL` |
| `p_id_mandato` | Char(15) | ID de mandato | `NULL` |
| `p_rowid_movto_entidad` | Int | ID de movimiento de entidad | `NULL` |
| `p_id_tipo_cambio` | Char(3) | Tipo de cambio | `NULL` |
| `p_tasa_conv` | Decimal(28,4) | Tasa de conversión | `NULL` |
| `p_tasa_local` | Decimal(28,4) | Tasa local | `NULL` |
| `p_id_moneda_docto` | Char(3) | Moneda del documento | `NULL` |
| `p_id_moneda_conv` | Char(3) | Moneda de conversión | `NULL` |
| `p_ind_forma_conv` | SmallInt | Forma de conversión | `NULL` |
| `p_id_moneda_local` | Char(3) | Moneda local | `NULL` |
| `p_ind_forma_local` | SmallInt | Forma local | `NULL` |
| `p_rowid_te_plantilla` | Int | ID de plantilla | `NULL` |
| `p_rowid_sesion` | Int | ID de sesión | `NULL` |
| `p_ind_tipo_origen` | SmallInt | Tipo de origen | `NULL` |
| `p_rowid_docto_rp` | Int | ID de documento RP | `NULL` |
| `p_id_proyecto` | Char(15) | ID de proyecto | `NULL` |
| `p_ind_dif_cambio_forma` | SmallInt | Indicador diferencia cambio | `NULL` |
| `p_ind_clase_origen` | SmallInt | Clase de origen | `NULL` |

### Parámetros de Salida

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_rowid` | Int | **ID único del documento creado** (usado por los siguientes SP) |
| `p_timestamp` | DateTime | Timestamp de creación |

### Validaciones Internas
- Verifica que la fecha existe en `t053_mm_fechas`
- Verifica que el periodo existe (si aplica)
- Verifica que el tercero existe en `t200_mm_terceros`
- Verifica que el consecutivo no existe (unique: `id_cia + id_co + id_tipo_docto + consec_docto`)
- Verifica que `total_db = total_cr` (balance contable)

### Errores Comunes
- **Duplicate key**: El consecutivo ya existe
- **Foreign key constraint**: La fecha, periodo o tercero no existen
- **Balance**: `total_db` no es igual a `total_cr`

### Ejemplo de Uso
```javascript
const result = await request.execute('sp_docto_insertar');
const rowid_docto = result.output.p_rowid; // Usar en siguientes SP
```

---

## 2. sp_mov_docto_insertar

### Propósito
Crea el movimiento contable asociado al documento. Este movimiento representa la **partida contable** (débito/crédito) del recibo de caja.

### Tablas Afectadas
- **`t351_co_mov_docto`**: Inserta un nuevo movimiento

### Dependencias
- **Requiere**: `p_rowid` del `sp_docto_insertar` (pasado como `rowid_docto`)

### Parámetros de Entrada (Obligatorios)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `id_cia` | SmallInt | ID de la compañía | `1` |
| `rowid_docto` | Int | **ID del documento** (del SP anterior) | `904857` |
| `id_un` | VarChar(20) | Unidad de negocio | `"99"` |
| `rowid_auxiliar` | Int | ID del auxiliar contable | `1` |
| `rowid_tercero` | Int | ID del tercero | `34580` |
| `sucursal` | Char(3) | ID de sucursal | `"001"` |
| `rowid_ccosto` | Int | ID del centro de costo | `1` |
| `rowid_fe` | Int | ID de la fuente | `1` |
| `id_co_mov` | Char(3) | Centro de operación del movimiento | `"001"` |
| `fecha` | DateTime | Fecha del movimiento | `"2026-01-06T00:00:00Z"` |
| `periodo` | Int | Periodo contable | `202601` |
| `ind_estado` | SmallInt | Estado (1=activo) | `1` |
| `valor_db` | Money | Valor débito | `100.00` |
| `valor_cr` | Money | Valor crédito | `100.00` |
| `docto_banco` | Char(2) | Tipo de documento bancario | `"01"` |
| `nro_docto_banco` | Int | Número de documento bancario | `12345` |

### Parámetros de Entrada (Opcionales con Valores por Defecto)

| Parámetro | Tipo | Valor por Defecto | Descripción |
|-----------|------|-------------------|-------------|
| `valor_db_alt` | Money | `0` | Valor débito alternativo |
| `valor_cr_alt` | Money | `0` | Valor crédito alternativo |
| `base_gravable` | Money | `0` | Base gravable para impuestos |
| `ind_mov_sa` | SmallInt | `0` | Indicador movimiento SA |
| `ind_mov_diferido` | SmallInt | `0` | Indicador movimiento diferido |
| `IndAutomatico` | SmallInt | `0` | Indicador automático |
| `ind_mov_caja` | SmallInt | `0` | Indicador movimiento caja |

### Parámetros de Entrada (Opcionales - Muchos)

El SP tiene **más de 30 parámetros opcionales** relacionados con:
- Monedas alternativas (valor_db2, valor_cr2, valor_db3, valor_cr3)
- Impuestos asumidos (p_impto_asum, p_impto_asum2, p_impto_asum3)
- Movimientos RX (p_generar_rx, p_valor_db_rx, p_valor_cr_rx)
- Tasas de cambio (p_tasa_rx, p_tasa_libro1, p_tasa_libro2, p_tasa_libro3)
- Conceptos de tesorería (p_rowid_cpto_tesoreria)
- Movimientos de activos fijos (p_ind_mov_af, p_rowid_rubro)
- Distribuciones (p_rowid_mov_distribucion)
- Inventario (p_ind_mov_invent)

### Parámetros de Salida

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `RowId` | Int | **ID único del movimiento creado** (usado por `sp_rel_med_pag_insertar`) |

### Validaciones Internas
- Verifica que `rowid_docto` existe en `t350_co_docto_contable`
- Verifica que `id_un` existe en `t281_co_unidades_negocio`
- Verifica que `rowid_auxiliar` existe en `t253_co_auxiliares`
- Verifica que `rowid_ccosto` existe en `t256_co_centros_costo`
- Verifica que `rowid_fe` existe en `t258_co_fuentes`
- Verifica que `valor_db = valor_cr` (balance contable)

### Errores Comunes
- **Foreign key constraint**: Alguna de las claves foráneas no existe
- **Balance**: `valor_db` no es igual a `valor_cr`
- **Documento no existe**: `rowid_docto` no existe

### Ejemplo de Uso
```javascript
request.input('rowid_docto', sql.Int, rowid_docto); // Del SP anterior
const result = await request.execute('sp_mov_docto_insertar');
const rowid_mov_docto = result.output.RowId; // Usar en siguiente SP
```

---

## 3. sp_rel_med_pag_insertar

### Propósito
Crea la relación de medio de pago asociada al documento. Este SP registra **cómo se pagó** el recibo de caja (efectivo, transferencia, cheque, tarjeta, etc.).

### Tablas Afectadas
- **`t3508_rel_medios_pago`** (o similar): Inserta la relación de medio de pago

### Dependencias
- **Requiere**: `p_rowid` del `sp_docto_insertar` (pasado como `rowid_docto`)
- **Requiere**: `RowId` del `sp_mov_docto_insertar` (pasado como `rowid_mov_docto`)

### Parámetros de Entrada (Obligatorios)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `id_cia` | SmallInt | ID de la compañía | `1` |
| `rowid_docto` | Int | **ID del documento** (del SP 1) | `904857` |
| `rowid_mov_docto` | Int | **ID del movimiento** (del SP 2) | `1234567` |
| `rowid_auxiliar` | Int | ID del auxiliar contable | `1` |
| `rowid_ccosto` | Int | ID del centro de costo | `1` |
| `rowid_fe` | Int | ID de la fuente | `1` |
| `id_co` | Char(3) | Centro de operación | `"001"` |
| `id_un` | VarChar(20) | Unidad de negocio | `"99"` |
| `id_medios_pago` | Char(3) | Medio de pago | `"EF"` (efectivo) |
| `ind_estado` | SmallInt | Estado (1=activo) | `1` |
| `valor` | Money | Valor del pago | `100.00` |
| `rowid_tercero` | Int | ID del tercero | `34580` |
| `id_sucursal` | Char(3) | ID de sucursal | `"001"` |

### Parámetros de Entrada (Requeridos por el SP, pero pueden ser NULL)

| Parámetro | Tipo | Descripción | Valor Recomendado |
|-----------|------|-------------|-------------------|
| `p_id_caja` | Char(3) | ID de caja | `NULL` |
| `p_id_moneda` | Char(3) | ID de moneda | `NULL` |
| `p_ind_tipo_medio` | SmallInt | Tipo de medio | `NULL` |
| `p_referencia_otros` | VarChar(30) | Referencia otros | `NULL` |
| `p_valor_cr` | Money | Valor crédito | `0` |
| `p_valor_cr_alt` | Money | Valor crédito alternativo | `0` |

### Parámetros de Entrada (Opcionales)

| Parámetro | Tipo | Descripción | Valor por Defecto |
|-----------|------|-------------|-------------------|
| `valor_alterna` | Money | Valor alternativo | `0` |
| `id_banco` | Char(10) | ID del banco | `""` (vacío) |
| `nro_cheque` | Int | Número de cheque | `0` |
| `nro_cuenta` | VarChar(25) | Número de cuenta | `""` (vacío) |
| `cod_seguridad` | Char(3) | Código de seguridad | `""` (vacío) |
| `nro_autorizacion` | VarChar(10) | Número de autorización | `""` (vacío) |
| `fecha_vcto` | Char(8) | Fecha de vencimiento | `NULL` |
| `notas` | VarChar(255) | Notas | `""` (vacío) |
| `id_cuentas_bancarias` | Char(3) | ID de cuenta bancaria | `""` (vacío) |
| `fecha_consignacion` | DateTime | Fecha de consignación | `NULL` |
| `rowid_docto_consignacion` | Int | ID de documento de consignación | `0` |
| `rowid_mov_docto_consignacion` | Int | ID de movimiento de consignación | `0` |
| `id_causales_devolucion` | Char(3) | ID de causal de devolución | `""` (vacío) |
| `p_ind_cambio` | SmallInt | Indicador cambio | `0` |
| `p_NroAltDoctoBanco` | VarChar(30) | Número alternativo documento banco | `""` (vacío) |
| `p_ind_aux_orden` | SmallInt | Indicador auxiliar orden | `0` |
| `p_id_cta_bancaria_cg` | Char(3) | ID cuenta bancaria CG | `NULL` |
| `p_referencia_cg` | VarChar(30) | Referencia CG | `NULL` |
| `p_rowid_ccosto_cg` | Int | ID centro de costo CG | `NULL` |
| `p_fecha_cg_cg` | DateTime | Fecha CG | `NULL` |
| `p_nro_docto_alterno_cg` | VarChar(30) | Número documento alterno CG | `NULL` |
| `p_ind_liquida_tarjeta` | SmallInt | Indicador liquida tarjeta | `0` |
| `p_vlr_impto_tarjeta` | Money | Valor impuesto tarjeta | `0` |
| `p_vlr_impto_tarjeta_alt` | Money | Valor impuesto tarjeta alternativo | `0` |
| `p_fecha_elab_cheq_postf` | DateTime | Fecha elaboración cheque postfechado | `NULL` |
| `p_docto_banco` | VarChar(2) | Tipo documento banco | `NULL` |

### Parámetros de Salida

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_rowid` | Int | **ID único de la relación de medio de pago creada** |

### Medios de Pago Comunes

| Código | Descripción |
|--------|-------------|
| `"EF"` | Efectivo |
| `"27"` | Transferencia |
| `"CH"` | Cheque |
| `"TC"` | Tarjeta de crédito |
| `"TD"` | Tarjeta de débito |

### Validaciones Internas
- Verifica que `rowid_docto` existe
- Verifica que `rowid_mov_docto` existe
- Verifica que `id_medios_pago` existe en la tabla de medios de pago
- Verifica que `cod_seguridad` no exceda 3 caracteres

### Errores Comunes
- **Foreign key constraint**: `rowid_docto` o `rowid_mov_docto` no existen
- **Invalid data length**: `cod_seguridad` excede 3 caracteres
- **Missing parameter**: Faltan parámetros requeridos (aunque sean NULL)

### Ejemplo de Uso
```javascript
request.input('rowid_docto', sql.Int, rowid_docto); // Del SP 1
request.input('rowid_mov_docto', sql.Int, rowid_mov_docto); // Del SP 2
request.input('p_id_caja', sql.Char(3), null); // Requerido pero puede ser NULL
const result = await request.execute('sp_rel_med_pag_insertar');
const rowid_rel_med_pag = result.output.p_rowid;
```

---

## 4. sp_let_movto_adicionar (CONDICIONAL)

### Propósito
Maneja movimientos relacionados con **letras de cambio** o documentos por cobrar. Este SP solo se ejecuta si `p_rowid_docto_letra` es un valor válido (diferente de 0 o NULL).

### Tablas Afectadas
- **`t3508_rel_medios_pago`** (o similar): Relaciona letras con documentos
- Posiblemente otras tablas relacionadas con letras

### Dependencias
- **Requiere**: `p_rowid` del `sp_docto_insertar` (pasado como `p_rowid_docto_planilla`)
- **Condición**: `p_rowid_docto_letra > 0` y no NULL

### Parámetros de Entrada (Obligatorios)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `p_id_cia` | SmallInt | ID de la compañía | `1` |
| `p_rowid_docto_planilla` | Int | **ID del documento** (del SP 1) | `904857` |
| `p_rowid_docto_letra` | Int | **ID del documento de letra** | `123456` (debe ser > 0) |
| `p_id_ubicacion_origen` | VarChar(3) | ID de ubicación origen | `""` (vacío) |
| `p_id_ubicacion_destino` | VarChar(3) | ID de ubicación destino | `""` (vacío) |
| `p_rowid_sa_origen` | Int | ID de SA origen | `0` |
| `p_rowid_sa_destino` | Int | ID de SA destino | `0` |
| `p_id_cuenta_bancaria` | Char(3) | ID de cuenta bancaria | `""` (vacío) |

### Parámetros de Entrada (Opcionales)

| Parámetro | Tipo | Descripción | Valor por Defecto |
|-----------|------|-------------|-------------------|
| `p_leer_origenes` | SmallInt | Leer orígenes | `0` |
| `p_id_banco` | Char(10) | ID del banco | `NULL` |

### Parámetros de Salida

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_error` | Int | **Código de error** (0 = éxito, >0 = error) |
| `p_des_error` | VarChar(100) | **Descripción del error** |
| `p_des_error2` | VarChar(100) | **Descripción adicional del error** |

### Validaciones Internas
- Verifica que `p_rowid_docto_planilla` existe
- Verifica que `p_rowid_docto_letra` existe y es válido
- Verifica relaciones entre documentos y letras

### Errores Comunes
- **Foreign key constraint**: `p_rowid_docto_letra` no existe en `t350_co_docto_contable`
- **Invalid document**: El documento de letra no es válido para este tipo de operación
- **p_error > 0**: Error específico del SP (ver `p_des_error` y `p_des_error2`)

### Cuándo Ejecutarse
```javascript
// Solo se ejecuta si:
const tieneLetras = params.p_rowid_docto_letra && 
                    params.p_rowid_docto_letra !== 0 && 
                    params.p_rowid_docto_letra !== null;

if (tieneLetras) {
  // Ejecutar sp_let_movto_adicionar
} else {
  // Omitir
}
```

### Ejemplo de Uso
```javascript
if (params.p_rowid_docto_letra > 0) {
  request.input('p_rowid_docto_planilla', sql.Int, rowid_docto); // Del SP 1
  request.input('p_rowid_docto_letra', sql.Int, params.p_rowid_docto_letra);
  const result = await request.execute('sp_let_movto_adicionar');
  
  if (result.output.p_error !== 0) {
    throw new Error(`Error: ${result.output.p_des_error}`);
  }
}
```

---

## 5. sp_docto_actualizar_estado

### Propósito
Actualiza el estado final del documento contable. Este es el **último paso** y es **obligatorio**. Marca el documento como procesado y actualiza su estado.

### Tablas Afectadas
- **`t350_co_docto_contable`**: Actualiza el estado del documento

### Dependencias
- **Requiere**: `p_rowid` del `sp_docto_insertar` (pasado como `p_rowid_docto`)

### Parámetros de Entrada (Obligatorios)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `p_rowid_docto` | Int | **ID del documento** (del SP 1) | `904857` |
| `p_estado` | SmallInt | Estado final (1=activo) | `1` |

### Parámetros de Entrada (Opcionales)

| Parámetro | Tipo | Descripción | Valor por Defecto |
|-----------|------|-------------|-------------------|
| `p_usuario` | VarChar(30) | Usuario que actualiza | `NULL` |
| `p_id_motivo_otros` | VarChar(20) | ID de motivo otros | `NULL` |

### Parámetros de Salida

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_error` | Int | **Código de error** (0 = éxito, >0 = error) |
| `p_des_error` | VarChar(255) | **Descripción del error** |
| `p_id_cia` | SmallInt | ID de la compañía |
| `p_id_co` | Char(3) | Centro de operación |
| `p_id_tipo_docto` | Char(3) | Tipo de documento |
| `p_numero_docto` | Int | Número del documento |
| `p_ind_cfdi` | SmallInt | Indicador CFDI |

### Validaciones Internas
- Verifica que `p_rowid_docto` existe
- Verifica que el estado es válido
- Actualiza timestamps de actualización

### Errores Comunes
- **Document not found**: `p_rowid_docto` no existe
- **Invalid state**: El estado no es válido
- **p_error > 0**: Error específico del SP (ver `p_des_error`)

### Ejemplo de Uso
```javascript
request.input('p_rowid_docto', sql.Int, rowid_docto); // Del SP 1
request.input('p_estado', sql.SmallInt, 1);
const result = await request.execute('sp_docto_actualizar_estado');

if (result.output.p_error !== 0) {
  throw new Error(`Error: ${result.output.p_des_error}`);
}

// El documento ahora está en estado final
console.log('Documento:', {
  id_cia: result.output.p_id_cia,
  id_co: result.output.p_id_co,
  tipo: result.output.p_id_tipo_docto,
  numero: result.output.p_numero_docto
});
```

---

## Resumen de Dependencias

```
sp_docto_insertar
  └─> p_rowid (usado por todos los demás SP)
       │
       ├─> sp_mov_docto_insertar
       │    └─> RowId (usado por sp_rel_med_pag_insertar)
       │
       ├─> sp_rel_med_pag_insertar
       │    └─> Usa: p_rowid + RowId
       │
       ├─> sp_let_movto_adicionar (condicional)
       │    └─> Usa: p_rowid
       │
       └─> sp_docto_actualizar_estado
            └─> Usa: p_rowid
```

---

## Orden de Ejecución (Resumen)

1. **sp_docto_insertar** → Crea documento → Retorna `p_rowid`
2. **sp_mov_docto_insertar** → Crea movimiento → Usa `p_rowid`, retorna `RowId`
3. **sp_rel_med_pag_insertar** → Crea medio de pago → Usa `p_rowid` + `RowId`
4. **sp_let_movto_adicionar** → (Opcional) Maneja letras → Usa `p_rowid`
5. **sp_docto_actualizar_estado** → Actualiza estado → Usa `p_rowid`

---

## Tablas Principales Afectadas

| Tabla | SP que la Afecta | Operación |
|-------|------------------|-----------|
| `t350_co_docto_contable` | `sp_docto_insertar` | INSERT |
| `t350_co_docto_contable` | `sp_docto_actualizar_estado` | UPDATE |
| `t351_co_mov_docto` | `sp_mov_docto_insertar` | INSERT |
| `t3508_rel_medios_pago` | `sp_rel_med_pag_insertar` | INSERT |
| Tablas de letras | `sp_let_movto_adicionar` | INSERT/UPDATE |

### Tablas NO Afectadas por Nuestros SP

| Tabla | Observación |
|-------|-------------|
| **`t352_co_docto_cruce`** | ❌ **NO es modificada** por ninguno de los 5 SP que ejecutamos. Esta tabla probablemente se usa para cruces de documentos (conciliaciones bancarias, cruces contables) y se modifica por otros procesos del sistema SIESA, no por el proceso de recibo de caja. |

---

## Validaciones Críticas

### Antes de Ejecutar los SP

1. **Consecutivo único**: Verificar que no existe
   ```sql
   SELECT COUNT(*) FROM t350_co_docto_contable
   WHERE f350_id_cia = @id_cia
     AND f350_id_co = @id_co
     AND f350_id_tipo_docto = @id_tipo_docto
     AND f350_consec_docto = @consec_docto
   ```

2. **Fecha válida**: Verificar que existe en `t053_mm_fechas`
   ```sql
   SELECT COUNT(*) FROM t053_mm_fechas
   WHERE f053_fecha = @fecha
   ```

3. **Tercero válido**: Verificar que existe
   ```sql
   SELECT COUNT(*) FROM t200_mm_terceros
   WHERE f200_rowid = @rowid_tercero
   ```

4. **Balance contable**: `total_db === total_cr` y `valor_db === valor_cr`

5. **Claves foráneas**: Verificar que existen
   - `id_un` en `t281_co_unidades_negocio`
   - `rowid_auxiliar` en `t253_co_auxiliares`
   - `rowid_ccosto` en `t256_co_centros_costo`
   - `rowid_fe` en `t258_co_fuentes`

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `Duplicate key` | Consecutivo ya existe | Usar siguiente consecutivo disponible |
| `Foreign key constraint FK_t350_t053_1` | Fecha no existe | Verificar fecha en `t053_mm_fechas` |
| `Foreign key constraint FK_t350_t024` | Periodo no existe | Verificar periodo (si tabla existe) |
| `Foreign key constraint FK_t351_t281` | Unidad de negocio no existe | Verificar `id_un` en `t281_co_unidades_negocio` |
| `Invalid data length` | `cod_seguridad` > 3 chars | Reducir a máximo 3 caracteres |
| `Missing parameter` | Falta parámetro requerido | Enviar todos los parámetros (aunque sean NULL) |
| `p_error > 0` | Error en SP | Revisar `p_des_error` y `p_des_error2` |

---

## Conclusión

El proceso de creación de un recibo de caja ejecuta **5 stored procedures** en secuencia dentro de una **transacción SQL**:

1. ✅ **sp_docto_insertar** (obligatorio)
2. ✅ **sp_mov_docto_insertar** (obligatorio)
3. ✅ **sp_rel_med_pag_insertar** (obligatorio)
4. ⚠️ **sp_let_movto_adicionar** (condicional - solo si hay letras)
5. ✅ **sp_docto_actualizar_estado** (obligatorio)

Si **cualquier SP falla**, toda la transacción se revierte (ROLLBACK) y no se crea ningún registro.

Si **todos los SP son exitosos**, se hace COMMIT y el recibo de caja queda creado y procesado.

