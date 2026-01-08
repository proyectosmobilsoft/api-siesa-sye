# Guía Práctica: Campos para Crear Recibos de Caja (RC/RCC)

## Objetivo
Esta guía te dice **exactamente qué campos enviar**, **qué valores usar** y **qué hace cada campo**, basado en el análisis de documentos reales del centro 001.

---

## Campos OBLIGATORIOS (Deben enviarse siempre)

### 1. Identificación Básica

```json
{
  "id_cia": 1,                    // ID de la compañía (siempre 1 en tu caso)
  "id_co": "001",                 // Centro de operación (001, 002, 003, etc.)
  "id_tipo_docto": "RC",          // Tipo: "RC" (estándar) o "RCC" (complementario)
  "consec_docto": 68437,          // Número consecutivo (debe ser único por centro+tipo)
  "prefijo": "RC",                // Prefijo: "RC" para RC, "RCC" para RCC, o "" (vacío)
  "fecha": "2026-01-06T00:00:00Z" // Fecha del documento (debe existir en t053_mm_fechas)
}
```

**¿Qué hace cada uno?**
- `id_cia`: Identifica la compañía en el sistema
- `id_co`: Identifica el centro de operación (cada centro tiene sus propios consecutivos)
- `id_tipo_docto`: "RC" = Recibo estándar, "RCC" = Recibo complementario
- `consec_docto`: Número único del documento (debe ser el siguiente disponible)
- `prefijo`: Aparece en el documento impreso (puede ser vacío para RC)
- `fecha`: Fecha del recibo (debe existir en la tabla de fechas válidas)

### 2. Periodo y Tercero

```json
{
  "periodo": 202601,              // Periodo contable en formato YYYYMM (202601 = enero 2026)
  "rowid_tercero": 34580,         // ID del tercero (cliente) - debe existir en t200_mm_terceros
  "sucursal": "001",              // ID de sucursal (puede ser "001" o vacío)
  "id_sucursal": "001"            // ID de sucursal para sp_rel_med_pag_insertar
}
```

**¿Qué hace cada uno?**
- `periodo`: Periodo contable (debe existir en t024_mm_periodos si la tabla existe)
- `rowid_tercero`: ID del cliente que paga (debe existir en la base de datos)
- `sucursal`: Sucursal del documento (usado en sp_docto_insertar y sp_mov_docto_insertar)
- `id_sucursal`: Sucursal para medios de pago (usado en sp_rel_med_pag_insertar)

### 3. Valores Monetarios (OBLIGATORIO: deben balancearse)

```json
{
  "total_db": 1000000.00,         // Total débito (DEBE ser igual a total_cr)
  "total_cr": 1000000.00,         // Total crédito (DEBE ser igual a total_db)
  "total_db2": 1000000.00,        // Total débito moneda 2 (generalmente igual a total_db)
  "total_cr2": 1000000.00,        // Total crédito moneda 2 (generalmente igual a total_cr)
  "total_db3": 1000000.00,        // Total débito moneda 3 (generalmente igual a total_db)
  "total_cr3": 1000000.00,        // Total crédito moneda 3 (generalmente igual a total_cr)
  "total_base_gravable": 0.00     // Base gravable para impuestos (generalmente 0 para RC)
}
```

**⚠️ REGLA CRÍTICA**: `total_db` DEBE ser igual a `total_cr` (principio de partida doble contable)

**¿Qué hace cada uno?**
- `total_db` y `total_cr`: Valores principales del documento (deben ser iguales)
- `total_db2/cr2` y `total_db3/cr3`: Valores en monedas alternativas (generalmente iguales a los principales)
- `total_base_gravable`: Base para calcular impuestos (0 para recibos de caja normales)

### 4. Estados y Control

```json
{
  "ind_origen": 1,                // Origen del documento (1 = manual, otros valores según sistema)
  "ind_estado": 1,                // Estado: 1=Activo, 0=Inactivo, 2=Anulado
  "ind_transmit": 0,               // Transmisión: 0=No transmitido, 1=Transmitido
  "p_estado": 1                   // Estado para actualizar (1=Activo)
}
```

**¿Qué hace cada uno?**
- `ind_origen`: Indica cómo se creó el documento (1 es el valor más común)
- `ind_estado`: Estado del documento (1 = activo y válido)
- `ind_transmit`: Si se transmitió a sistemas externos (0 = no transmitido)
- `p_estado`: Estado final después de procesar (1 = activo)

### 5. Fechas de Control

```json
{
  "fecha_creacion": "2026-01-06T10:00:00Z",    // Fecha/hora de creación
  "fecha_actualiza": "2026-01-06T10:00:00Z",   // Fecha/hora de actualización
  "fecha_afectado": "2026-01-06T10:00:00Z"     // Fecha de afectación contable
}
```

**¿Qué hace cada uno?**
- `fecha_creacion`: Timestamp cuando se crea el documento
- `fecha_actualiza`: Timestamp cuando se actualiza (puede ser igual a creación)
- `fecha_afectado`: Fecha en que afecta contablemente (puede ser igual a fecha del documento)

### 6. Notas y Referencias

```json
{
  "notas": "PAGO DE FACTURA BQE 30149_30150_30151",  // Notas del documento (máx 255 caracteres)
  "referencia": ""                                   // Referencia externa (puede ser vacío)
}
```

**¿Qué hace cada uno?**
- `notas`: Descripción del recibo (ej: "PAGO DE FACTURA BQE 30149", "CIERRE DE MES")
- `referencia`: Referencia externa (generalmente vacío para RC)

---

## Campos para Movimiento de Documento (sp_mov_docto_insertar)

### OBLIGATORIOS

```json
{
  "id_un": "99",                  // Unidad de negocio (debe existir en t281_co_unidades_negocio)
  "rowid_auxiliar": 1,            // Auxiliar contable (debe existir en t253_co_auxiliares)
  "rowid_ccosto": 1,              // Centro de costo (debe existir en t256_co_centros_costo)
  "rowid_fe": 1,                  // Fuente (debe existir en t258_co_fuentes)
  "id_co_mov": "001",             // Centro de operación del movimiento (generalmente igual a id_co)
  "valor_db": 1000000.00,         // Valor débito del movimiento (debe ser igual a total_db)
  "valor_cr": 1000000.00,         // Valor crédito del movimiento (debe ser igual a total_cr)
  "docto_banco": "01",            // Tipo de documento bancario (ej: "01")
  "nro_docto_banco": 12345        // Número de documento bancario
}
```

**¿Qué hace cada uno?**
- `id_un`: Unidad de negocio donde se registra el movimiento
- `rowid_auxiliar`: Cuenta contable auxiliar
- `rowid_ccosto`: Centro de costo asociado
- `rowid_fe`: Fuente del movimiento
- `id_co_mov`: Centro de operación (generalmente igual a `id_co`)
- `valor_db` y `valor_cr`: Valores del movimiento (deben coincidir con totales del documento)

---

## Campos para Medio de Pago (sp_rel_med_pag_insertar)

### OBLIGATORIOS

```json
{
  "id_medios_pago": "EF",         // Medio de pago: "EF"=Efectivo, "27"=Transferencia, etc.
  "valor": 1000000.00,            // Valor del medio de pago (debe ser igual a total_cr)
  "valor_alterna": 0,             // Valor en moneda alternativa (generalmente 0)
  "id_banco": "BANCO001",         // ID del banco (puede ser genérico)
  "nro_cheque": 0,                // Número de cheque (0 si no aplica)
  "nro_cuenta": "123456789",      // Número de cuenta
  "cod_seguridad": "123",         // Código de seguridad (máximo 3 caracteres)
  "nro_autorizacion": "AUTH001",  // Número de autorización (máximo 10 caracteres)
  "fecha_vcto": "20260106",       // Fecha de vencimiento en formato YYYYMMDD (8 caracteres)
  "id_cuentas_bancarias": "001",  // ID de cuenta bancaria
  "fecha_consignacion": "2026-01-06T00:00:00Z",  // Fecha de consignación
  "rowid_docto_consignacion": 0,  // ID de documento de consignación (0 si no aplica)
  "rowid_mov_docto_consignacion": 0,  // ID de movimiento de consignación (0 si no aplica)
  "id_causales_devolucion": ""    // Causal de devolución (puede ser vacío)
}
```

### Campos Adicionales (Opcionales pero recomendados)

```json
{
  "p_id_caja": "001",             // ID de caja (puede ser null o "001")
  "p_id_moneda": "COP",           // Moneda (puede ser null o "COP")
  "p_ind_tipo_medio": 0,          // Tipo de medio (puede ser null o 0)
  "p_referencia_otros": "REF001", // Referencia otros (puede ser null)
  "p_valor_cr": 0,                // Valor crédito adicional (generalmente 0)
  "p_valor_cr_alt": 0,            // Valor crédito alternativo (generalmente 0)
  "p_ind_cambio": 0,              // Indicador de cambio (0 = sin cambio)
  "p_NroAltDoctoBanco": "",       // Número alternativo documento banco (puede ser vacío)
  "p_ind_aux_orden": 0,          // Indicador auxiliar orden (0)
  "p_id_cta_bancaria_cg": null,  // Cuenta bancaria CG (null)
  "p_referencia_cg": null,        // Referencia CG (null)
  "p_rowid_ccosto_cg": null,      // Centro de costo CG (null)
  "p_fecha_cg_cg": null,          // Fecha CG (null)
  "p_nro_docto_alterno_cg": null, // Número documento alterno CG (null)
  "p_ind_liquida_tarjeta": 0,     // Indicador liquidación tarjeta (0)
  "p_vlr_impto_tarjeta": 0,       // Valor impuesto tarjeta (0)
  "p_vlr_impto_tarjeta_alt": 0,   // Valor impuesto tarjeta alternativo (0)
  "p_fecha_elab_cheq_postf": null, // Fecha elaboración cheque postfechado (null)
  "p_docto_banco": null           // Documento banco (null)
}
```

**⚠️ IMPORTANTE**: Aunque estos campos son opcionales, el stored procedure `sp_rel_med_pag_insertar` los requiere. El código del API los envía con valores por defecto si no los proporcionas.

**¿Qué hace cada uno?**
- `id_medios_pago`: Tipo de medio de pago (EF=Efectivo, 27=Transferencia, etc.)
- `valor`: Monto del pago (debe coincidir con total_cr)
- `fecha_vcto`: Formato YYYYMMDD (ej: "20260106" para 6 de enero de 2026)
- `cod_seguridad`: Máximo 3 caracteres (no más)

---

## Campos para Letras (sp_let_movto_adicionar)

### OBLIGATORIOS (pero solo si hay letras)

```json
{
  "p_rowid_docto_letra": 0,       // ID de documento letra (0 = no hay letras, omitir SP)
  "p_id_ubicacion_origen": "001", // Ubicación origen (requerido pero puede ser "001")
  "p_id_ubicacion_destino": "001", // Ubicación destino (requerido pero puede ser "001")
  "p_rowid_sa_origen": 0,         // ID almacén origen (0 si no aplica)
  "p_rowid_sa_destino": 0,        // ID almacén destino (0 si no aplica)
  "p_id_cuenta_bancaria": "001"   // ID cuenta bancaria (requerido)
}
```

**⚠️ IMPORTANTE**: Si `p_rowid_docto_letra` es 0 o null, el stored procedure `sp_let_movto_adicionar` se omite automáticamente.

**¿Qué hace cada uno?**
- `p_rowid_docto_letra`: Si es 0, no se procesan letras
- `p_id_ubicacion_origen/destino`: Ubicaciones para traslados (pueden ser iguales)
- `p_id_cuenta_bancaria`: Cuenta bancaria asociada

---

## Campos Opcionales (Pueden omitirse o usar valores por defecto)

```json
{
  "id_clase_docto": 13,            // Clase de documento: 13 para RC, 1 para RCC
  "ind_impresion": 0,              // Impresión: 0=No impreso, 1=Impreso
  "nro_impresiones": 0,            // Número de impresiones
  "usuario_creacion": "lcastillo", // Usuario que crea (opcional)
  "usuario_actualizacion": "lcastillo", // Usuario que actualiza (opcional)
  "usuario_aprobacion": null,      // Usuario que aprueba (null)
  "id_moneda_docto": "COP",       // Moneda del documento (COP)
  "id_moneda_conv": "COP",        // Moneda de conversión (COP)
  "ind_forma_conv": 0,            // Forma de conversión (0)
  "tasa_conv": 1.0000,            // Tasa de conversión (1.0)
  "id_moneda_local": "COP",       // Moneda local (COP)
  "ind_forma_local": 0,           // Forma local (0)
  "tasa_local": 1.0000,           // Tasa local (1.0)
  "id_tipo_cambio": "001",        // Tipo de cambio (001)
  "ind_cfd": 0,                   // Indicador CFD (0=sin CFD, 3=con CFD)
  "total_db2": 0,                 // Total débito 2 (puede ser 0)
  "total_cr2": 0,                 // Total crédito 2 (puede ser 0)
  "total_db3": 0,                 // Total débito 3 (puede ser 0)
  "total_cr3": 0,                 // Total crédito 3 (puede ser 0)
  "ind_impto_asumido": 2,         // Impuesto asumido (2 es el valor más común)
  "ind_tipo_origen": 0,           // Tipo de origen (0)
  "ind_clase_origen": 0,          // Clase de origen (0)
  "ind_envio_correo": 0           // Envío de correo (0)
}
```

---

## JSON Completo de Ejemplo (Mínimo Funcional)

```json
{
  "id_cia": 1,
  "id_co": "001",
  "id_tipo_docto": "RC",
  "consec_docto": 68437,
  "prefijo": "RC",
  "fecha": "2026-01-06T00:00:00Z",
  "periodo": 202601,
  "rowid_tercero": 34580,
  "sucursal": "001",
  "id_sucursal": "001",
  "total_db": 1000000.00,
  "total_cr": 1000000.00,
  "ind_origen": 1,
  "ind_estado": 1,
  "ind_transmit": 0,
  "fecha_creacion": "2026-01-06T10:00:00Z",
  "fecha_actualiza": "2026-01-06T10:00:00Z",
  "fecha_afectado": "2026-01-06T10:00:00Z",
  "notas": "PAGO DE FACTURA BQE 30149",
  "p_estado": 1,
  "id_un": "99",
  "rowid_auxiliar": 1,
  "rowid_ccosto": 1,
  "rowid_fe": 1,
  "id_co_mov": "001",
  "valor_db": 1000000.00,
  "valor_cr": 1000000.00,
  "docto_banco": "01",
  "nro_docto_banco": 12345,
  "id_medios_pago": "EF",
  "valor": 1000000.00,
  "valor_alterna": 0,
  "id_banco": "BANCO001",
  "nro_cheque": 0,
  "nro_cuenta": "123456789",
  "cod_seguridad": "123",
  "nro_autorizacion": "AUTH001",
  "fecha_vcto": "20260106",
  "id_cuentas_bancarias": "001",
  "fecha_consignacion": "2026-01-06T00:00:00Z",
  "rowid_docto_consignacion": 0,
  "rowid_mov_docto_consignacion": 0,
  "id_causales_devolucion": "",
  "p_rowid_docto_letra": 0,
  "p_id_ubicacion_origen": "001",
  "p_id_ubicacion_destino": "001",
  "p_rowid_sa_origen": 0,
  "p_rowid_sa_destino": 0,
  "p_id_cuenta_bancaria": "001"
}
```

---

## Valores Comunes Basados en Análisis Real

### Clases de Documento
- **RC estándar**: `id_clase_docto: 13`
- **RCC complementario**: `id_clase_docto: 1`

### Medios de Pago
- **Efectivo**: `id_medios_pago: "EF"`
- **Transferencia**: `id_medios_pago: "27"`
- Otros según configuración del sistema

### Unidades de Negocio
- **Más común**: `id_un: "99"` (verificado en datos reales)
- Debe existir en `t281_co_unidades_negocio`

### Indicadores
- **Estado activo**: `ind_estado: 1`
- **No transmitido**: `ind_transmit: 0`
- **Impuesto asumido**: `ind_impto_asumido: 2` (más común)
- **Sin CFD**: `ind_cfd: 0`
- **Con CFD**: `ind_cfd: 3` (para facturas electrónicas)

---

## Validaciones Críticas ANTES de Enviar

### 1. Verificar Fecha Existe
```sql
SELECT COUNT(*) FROM t053_mm_fechas 
WHERE f053_id_cia = 1 AND f053_id = '2026-01-06'
```
**Debe retornar > 0**

### 2. Verificar Periodo Existe (si aplica)
```sql
SELECT COUNT(*) FROM t024_mm_periodos 
WHERE f024_id_cia = 1 AND f024_id = 202601
```
**Si la tabla existe, debe retornar > 0**

### 3. Verificar Tercero Existe
```sql
SELECT f200_rowid FROM t200_mm_terceros 
WHERE f200_rowid = 34580
```
**Debe retornar el rowid**

### 4. Obtener Siguiente Consecutivo
```sql
SELECT ISNULL(MAX(f350_consec_docto), 0) + 1 AS siguiente
FROM t350_co_docto_contable 
WHERE f350_id_cia = 1 
  AND f350_id_co = '001' 
  AND f350_id_tipo_docto = 'RC'
```
**Usar este valor para `consec_docto`**

### 5. Verificar Unidad de Negocio
```sql
SELECT f281_id FROM t281_co_unidades_negocio 
WHERE f281_id_cia = 1 AND f281_id = '99'
```
**Debe retornar el id**

---

## Errores Comunes y Soluciones

### Error: "Duplicate key"
**Causa**: El `consec_docto` ya existe para esa combinación de `id_cia + id_co + id_tipo_docto`
**Solución**: Consultar el máximo consecutivo y usar +1

### Error: "FK_t350_t053_1"
**Causa**: La fecha no existe en `t053_mm_fechas`
**Solución**: Verificar que la fecha existe antes de enviar

### Error: "FK_t350_t024"
**Causa**: El periodo no existe en `t024_mm_periodos`
**Solución**: Verificar que el periodo existe (si la tabla existe)

### Error: "Invalid data length cod_seguridad"
**Causa**: `cod_seguridad` tiene más de 3 caracteres
**Solución**: Limitar a máximo 3 caracteres

### Error: "FK_t350_t200"
**Causa**: El `rowid_tercero` no existe
**Solución**: Verificar que el tercero existe en `t200_mm_terceros`

---

## Diferencias RC vs RCC

| Campo | RC (Estándar) | RCC (Complementario) |
|-------|---------------|----------------------|
| `id_tipo_docto` | "RC" | "RCC" |
| `prefijo` | "" (vacío) o "RC" | "RCC" |
| `id_clase_docto` | 13 | 1 |
| Uso | Recibos normales | Recibos complementarios/flexibles |

---

## Resumen: Qué Enviar Mínimamente

### Mínimo Absoluto (Funciona pero puede tener valores por defecto)
- Todos los campos de la sección "Campos OBLIGATORIOS"
- Todos los campos de "Movimiento de Documento"
- Todos los campos de "Medio de Pago"
- Campos de "Letras" (pueden ser 0/null si no hay letras)

### Recomendado (Basado en datos reales)
- Incluir todos los campos opcionales con valores por defecto
- Usar `id_clase_docto: 13` para RC
- Usar `id_clase_docto: 1` para RCC
- Incluir `usuario_creacion` y `usuario_actualizacion`
- Incluir todos los campos `p_*` con valores por defecto

---

## Notas Finales

1. **Balance Contable**: SIEMPRE `total_db = total_cr` y `valor_db = valor_cr = total_db`
2. **Fechas**: Usar formato ISO 8601 con Z (ej: "2026-01-06T00:00:00Z")
3. **Fecha Vencimiento**: Formato YYYYMMDD sin guiones (ej: "20260106")
4. **Códigos**: Respetar longitudes máximas (cod_seguridad = 3, nro_autorizacion = 10)
5. **Validaciones**: Siempre verificar que las foreign keys existan antes de enviar

