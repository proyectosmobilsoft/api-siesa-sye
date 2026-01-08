# Criterios para Determinar Centro de Operación y Módulos

## Problema a Resolver
**¿Cómo saber si un documento debe ir al centro 001, 002, 003, etc.?**
**¿Por qué algunos documentos aparecen en "Recibo de Caja" y otros no?**

---

## ¿Qué es un Centro de Operación?

Un **centro de operación** (`f350_id_co`) es una **unidad de negocio o división contable** dentro de la misma compañía. Cada centro:

1. **Tiene sus propios consecutivos** (un RC-001 puede existir en centro 001 y otro RC-001 en centro 002)
2. **Tiene sus propios procesos** (diferentes flujos de trabajo)
3. **Tiene sus propios usuarios** (diferentes personas operan cada centro)
4. **Tiene sus propias configuraciones** (diferentes reglas de negocio)

---

## Criterios para Determinar el Centro

### 1. Por Tipo de Operación

#### Centro 001 - Operaciones Administrativas Normales
**Usar cuando:**
- ✅ Facturación manual de ventas
- ✅ Recibos de caja manuales (pagos de clientes)
- ✅ Traslados internos entre bodegas
- ✅ Cierres de mes contables
- ✅ Operaciones administrativas normales
- ✅ Facturas tipo BQE (boletas de venta estándar)
- ✅ Transferencias de caja entre bancos
- ✅ Comprobantes de egreso manuales

**Tipos de documentos típicos:**
- BQE, RMV, RC, RCC, TC, TRI, CE, EA, NC1, DVV

**Usuarios típicos:**
- jhernandez (facturación)
- lcastillo (recibos de caja)
- ycervantes (transferencias bancarias)

#### Centro 002 - POS y Procesos Automatizados
**Usar cuando:**
- ✅ Operaciones de POS (Point of Sale)
- ✅ Acumulaciones automáticas del sistema
- ✅ Facturas tipo FCE (facturas electrónicas)
- ✅ Movimientos masivos de punto de venta
- ✅ Documentos transmitidos automáticamente
- ✅ Recibos POS (R01) de valores muy altos
- ✅ Procesos batch o automatizados

**Tipos de documentos típicos:**
- R01, M01, C01, FCE, RMV, D01, N01, EAP, EAI

**Usuarios típicos:**
- hpertuz (POS)
- tpolo (facturación electrónica)
- jcassiani (inventario)

#### Centro 003 - Compras y Logística
**Usar cuando:**
- ✅ Notas de pedido a proveedores (NP)
- ✅ Facturas de proveedores (FPE/RMC)
- ✅ Facturas de apertura de periodos (FAP)
- ✅ Operaciones de compra y logística
- ✅ Traslados logísticos (TRI) con vehículos
- ✅ Operaciones de almacén relacionadas con compras

**Tipos de documentos típicos:**
- NP, FPE, RMC, FAP, TRI, NC3, DVV

**Usuarios típicos:**
- dmoreno (notas de pedido)
- hlopez (facturas de proveedores)
- davendaño (facturas de apertura)
- carias (traslados logísticos)

---

### 2. Por Características del Documento

| Característica | Centro 001 | Centro 002 | Centro 003 |
|----------------|------------|------------|------------|
| **Valores** | Variables (100 - 741M) | Muy altos en R01 (17M+) | Variables (85K - 123M) |
| **Volumen** | Individual o grupos pequeños | Masivo (acumulaciones) | Masivo (NP, FPE/RMC) |
| **Transmisión** | Generalmente no (0) | Frecuentemente sí (1) | Ocasionalmente sí (1) |
| **Notas** | "CIERRE DE MES", "BQE XXXXX" | "ACUMULACION POS" | "CIERRE DE MES", "FACTURACION DEL..." |
| **Sesión** | 364000, 364218, 364216 | 364204, 364182 | 225531, 224199, 224189 |
| **Usuario** | jhernandez, lcastillo | hpertuz, tpolo | dmoreno, hlopez, davendaño |

---

### 3. Por Tipo de Documento Específico

| Tipo Documento | Centro Típico | Observación |
|----------------|---------------|-------------|
| **RC, RCC** | 001 | Recibos de caja manuales |
| **R01** | 002 | Recibos POS (valores muy altos) |
| **BQE** | 001 | Facturas estándar |
| **FCE** | 002 | Facturas electrónicas |
| **M01, C01** | 002 | Movimientos y comprobantes POS |
| **TC** | 001 | Transferencias de caja |
| **NP** | 003 | Notas de pedido a proveedores |
| **FPE, RMC** | 003 | Facturas y remisiones de proveedores |
| **FAP** | 003 | Facturas de apertura (valores muy altos) |
| **TRI** | 001, 002 o 003 | Traslados (depende de ubicación) |

---

## Criterios para Listar en "Recibo de Caja"

### Filtro Principal

Los documentos aparecen en el módulo "Recibo de Caja" cuando:

```sql
SELECT * FROM t350_co_docto_contable
WHERE f350_id_tipo_docto IN ('RC', 'RCC', 'RC1')  -- Tipo de documento
  AND f350_ind_estado = 1                          -- Estado activo
  AND f350_fecha_ts_anulacion IS NULL              -- No anulado
ORDER BY f350_fecha DESC
```

### Criterios Específicos

1. **Tipo de Documento**: Debe ser `'RC'`, `'RCC'`, o `'RC1'`
2. **Estado**: Debe ser `1` (activo)
3. **No Anulado**: `f350_fecha_ts_anulacion IS NULL`
4. **Tiene Tercero**: Generalmente tiene `rowid_tercero` (cliente que paga)
5. **Notas**: Frecuentemente contiene "BQE XXXXX" (pago de facturas)

### ¿Por qué R01 NO aparece en "Recibo de Caja"?

**R01** es un "Recibo" pero:
- Tipo diferente: `'R01'` (no `'RC'`, `'RCC'`, `'RC1'`)
- Clase diferente: `1202` (no `13`, `1`, `14`)
- Proceso diferente: POS automatizado
- Aparece en módulo "POS" o "Acumulaciones"

---

## Cómo Identificar el Centro Correcto para tu Caso

### Preguntas Clave

1. **¿Es un recibo de caja manual?**
   - ✅ Sí → Centro **001**, Tipo **RC** o **RCC**

2. **¿Es una operación de POS (punto de venta)?**
   - ✅ Sí → Centro **002**, Tipo **R01** (si es recibo POS)

3. **¿Es una factura normal?**
   - ✅ Sí → Centro **001**, Tipo **BQE**

4. **¿Es una factura electrónica del centro 002?**
   - ✅ Sí → Centro **002**, Tipo **FCE**

5. **¿Es una acumulación automática?**
   - ✅ Sí → Centro **002**, Tipo **M01/C01**

6. **¿Es una nota de pedido a proveedor?**
   - ✅ Sí → Centro **003**, Tipo **NP**

7. **¿Es una factura de proveedor?**
   - ✅ Sí → Centro **003**, Tipo **FPE**

8. **¿Es una factura de apertura de periodo?**
   - ✅ Sí → Centro **003**, Tipo **FAP**

### Flujo de Decisión

```
¿Qué tipo de documento quieres crear?
│
├─ Recibo de Caja
│  ├─ ¿Es manual? → Centro 001, Tipo RC/RCC
│  └─ ¿Es POS? → Centro 002, Tipo R01
│
├─ Factura
│  ├─ ¿Es estándar? → Centro 001, Tipo BQE
│  ├─ ¿Es electrónica centro 002? → Centro 002, Tipo FCE
│  └─ ¿Es de proveedor? → Centro 003, Tipo FPE
│
├─ Compra/Proveedor
│  ├─ ¿Es nota de pedido? → Centro 003, Tipo NP
│  ├─ ¿Es factura de proveedor? → Centro 003, Tipo FPE
│  └─ ¿Es remisión de compra? → Centro 003, Tipo RMC
│
└─ Otro documento
   └─ Consultar tabla de tipos por centro
```

---

## Consultas SQL Útiles

### 1. Ver qué centros existen y sus tipos de documentos

```sql
SELECT 
    f350_id_co AS centro,
    f350_id_tipo_docto AS tipo_documento,
    COUNT(*) AS cantidad,
    MIN(f350_fecha) AS fecha_min,
    MAX(f350_fecha) AS fecha_max
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
GROUP BY f350_id_co, f350_id_tipo_docto
ORDER BY f350_id_co, cantidad DESC
```

### 2. Ver recibos de caja por centro

```sql
SELECT 
    f350_id_co AS centro,
    f350_id_tipo_docto AS tipo,
    COUNT(*) AS cantidad,
    AVG(f350_total_cr) AS promedio_valor,
    MIN(f350_total_cr) AS valor_min,
    MAX(f350_total_cr) AS valor_max
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
  AND f350_id_tipo_docto IN ('RC', 'RCC', 'RC1', 'R01')
GROUP BY f350_id_co, f350_id_tipo_docto
ORDER BY f350_id_co, f350_id_tipo_docto
```

### 3. Ver diferencias entre RC (001) y R01 (002)

```sql
SELECT 
    f350_id_co,
    f350_id_tipo_docto,
    f350_id_clase_docto,
    COUNT(*) AS cantidad,
    AVG(f350_total_cr) AS promedio,
    MAX(f350_total_cr) AS maximo,
    MIN(f350_total_cr) AS minimo
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
  AND f350_id_tipo_docto IN ('RC', 'RCC', 'R01')
GROUP BY f350_id_co, f350_id_tipo_docto, f350_id_clase_docto
```

### 4. Ver usuarios por centro y tipo

```sql
SELECT 
    f350_id_co AS centro,
    f350_id_tipo_docto AS tipo,
    f350_usuario_creacion AS usuario,
    COUNT(*) AS cantidad
FROM t350_co_docto_contable
WHERE f350_id_cia = 1
GROUP BY f350_id_co, f350_id_tipo_docto, f350_usuario_creacion
ORDER BY f350_id_co, cantidad DESC
```

---

## Resumen: Cuándo Usar Cada Centro

### Centro 001 - Operaciones Normales
- ✅ Recibos de caja manuales (RC, RCC)
- ✅ Facturas estándar (BQE)
- ✅ Remisiones normales (RMV)
- ✅ Transferencias de caja (TC)
- ✅ Traslados internos (TRI)
- ✅ Comprobantes de egreso (CE)
- ✅ Entradas de almacén normales (EA)
- ✅ Notas crédito (NC1)
- ✅ Devoluciones (DVV)

### Centro 002 - POS y Automatización
- ✅ Recibos POS (R01)
- ✅ Movimientos POS (M01)
- ✅ Comprobantes POS (C01)
- ✅ Facturas electrónicas (FCE)
- ✅ Remisiones FCE (RMV)
- ✅ Documentos D01, N01
- ✅ Entradas de almacén POS (EAP, EAI)
- ✅ Notas crédito tipo 2 (NC2)

### Centro 003 - Compras y Logística
- ✅ Notas de pedido (NP)
- ✅ Facturas de proveedores (FPE)
- ✅ Remisiones de compra (RMC)
- ✅ Facturas de apertura (FAP)
- ✅ Traslados logísticos (TRI)
- ✅ Notas crédito tipo 3 (NC3)
- ✅ Devoluciones (DVV)

---

## Respuesta Directa a tu Pregunta

### ¿Por qué las facturas aparecen en un módulo y el contable quiere que aparezcan en "Recibo de Caja"?

**Respuesta**: Las facturas (BQE, FCE) **NO son recibos de caja**. Son documentos diferentes:

1. **Facturas (BQE, FCE)**: Documentan la venta (cuenta por cobrar)
2. **Recibos de Caja (RC, RCC)**: Documentan el pago (abono a la cuenta por cobrar)

**El módulo "Recibo de Caja" solo muestra documentos tipo RC, RCC, RC1** porque:
- Son documentos de **pago/abono**
- Tienen clase de documento: 13, 1, o 14
- Generalmente tienen nota "BQE XXXXX" (pago de factura)

**Si el contable quiere ver facturas en "Recibo de Caja"**, probablemente:
- Quiere ver los **recibos que pagaron esas facturas** (RC con nota "BQE XXXXX")
- O hay un **módulo diferente** que muestra facturas relacionadas con recibos

---

## Recomendación Final

Para crear un **recibo de caja** que aparezca en el módulo "Recibo de Caja":

1. **Centro**: 001 (para recibos manuales normales)
2. **Tipo**: RC o RCC
3. **Clase**: 13 (para RC) o 1 (para RCC)
4. **Nota**: Incluir referencia a factura si aplica (ej: "BQE 30149")
5. **Tercero**: Cliente que paga
6. **Estado**: 1 (activo)

**NO uses**:
- ❌ Centro 002 con tipo R01 (aparece en módulo POS)
- ❌ Tipo BQE o FCE (son facturas, no recibos)
- ❌ Tipo M01 o C01 (son movimientos POS)

