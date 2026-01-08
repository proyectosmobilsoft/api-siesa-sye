# Tipos de Documentos en t350_co_docto_contable

## Descripción General
La tabla `t350_co_docto_contable` es la **tabla maestra de documentos contables** del sistema SYE. Almacena **TODOS** los documentos contables del sistema, no solo recibos de caja.

---

## Tipos de Documentos Encontrados (Basado en Análisis Real)

### 1. Documentos de Venta

#### BQE - Boletas de Venta / Facturas
- **Descripción**: Facturas de venta a clientes
- **Clase de documento**: 523
- **Frecuencia**: Muy alta (35% del volumen)
- **Características**:
  - Siempre aparecen en pares con RMV
  - Valores altos (promedio ~15,000,000)
  - Tienen base gravable (impuestos)
  - Generalmente impresos (`ind_impresion = 1`)
  - Pueden tener CFD (`ind_cfd = 3`)
- **Ejemplo de nota**: "CIERRE DE MES", "POR SOLICITUD DEL CLIENTE SE FACTURA CON FECHA DE ENERO"
- **Referencias**: COT-XXXXX (órdenes de compra)

#### RMV - Remisiones de Venta
- **Descripción**: Remisiones asociadas a facturas BQE
- **Clase de documento**: 513
- **Frecuencia**: Muy alta (35% del volumen)
- **Características**:
  - Siempre aparecen en pares con BQE
  - Se crean casi simultáneamente (milisegundos de diferencia)
  - Valores similares pero generalmente menores que BQE
  - Mismo tercero, fecha y periodo que su BQE correspondiente
  - Generalmente NO impresos (`ind_impresion = 0`)
- **Relación**: Cada BQE tiene su RMV correspondiente

#### NC1 - Notas Crédito
- **Descripción**: Correcciones y ajustes a facturas
- **Clase de documento**: 526
- **Frecuencia**: Media (~4% del volumen)
- **Características**:
  - Corrigen facturas BQE anteriores
  - Valores negativos (reducción de facturación)
  - Tienen base gravable
  - Generalmente impresos
  - Pueden tener CFD (`ind_cfd = 3`)
- **Ejemplo de nota**: "CIERRE DE MES(ERROR EN UNIDAD DE MEDIDA)", "CIERRE DE MES(CLIENTE DESISTIO DEL PEDIDO)"
- **Referencias**: BQE-XXXXX (factura que corrige)

#### DVV - Devoluciones de Venta
- **Descripción**: Devoluciones de productos vendidos
- **Clase de documento**: 518
- **Frecuencia**: Baja (~3% del volumen)
- **Características**:
  - Valores altos (promedio ~6,000,000)
  - Generalmente NO impresos
  - Relacionadas con facturas BQE
- **Ejemplo de nota**: "CIERRE DE MES(CLIENTE DESISTIO DEL PEDIDO)", "CIERRE DE MES(CLIENTE SOLICITA CAMBIO DE FECHA)"
- **Referencias**: BQE-XXXXX (factura relacionada)

---

### 2. Documentos de Caja y Bancos

#### RC - Recibo de Caja
- **Descripción**: Recibos de caja estándar
- **Clase de documento**: 13
- **Frecuencia**: Media (~8% del volumen)
- **Características**:
  - Valores variables (100 - 6,626,214)
  - Generalmente impresos
  - Prefijo: "RC" o vacío
  - Usuario típico: lcastillo
- **Ejemplo de nota**: "BQE 30149_30150_30151", "PAGO DE FACTURA3 FM-2635"
- **Relación**: Pagan facturas BQE

#### RCC - Recibo de Caja Complementario
- **Descripción**: Recibos de caja complementarios/flexibles
- **Clase de documento**: 1
- **Frecuencia**: Muy baja (~1% del volumen)
- **Características**:
  - Más flexible que RC
  - Prefijo: "RCC"
  - Valores variables
  - Puede crearse sin usuario (vía API)
- **Uso**: Recibos que no cumplen con el formato estándar RC

#### TC - Transferencias de Caja
- **Descripción**: Transferencias entre cuentas bancarias
- **Clase de documento**: 0
- **Frecuencia**: Media (~8% del volumen)
- **Características**:
  - Valores altos (promedio ~8,000,000)
  - Relacionadas con conciliación bancaria
  - Usuario típico: ycervantes
  - Generalmente impresos
- **Ejemplo de nota**: "CRUCE 1380 29 DIC BOGOTA", "TC 30DIC BOGOTA", "TC 30 DIC BANCOLOMBIA"
- **Terceros**: Generalmente tercero 82 (banco)

#### DC - Documentos de Caja
- **Descripción**: Documentos de caja menores
- **Clase de documento**: 1
- **Frecuencia**: Muy baja (~2% del volumen)
- **Características**:
  - Valores medios
  - Generalmente NO impresos
- **Ejemplo de nota**: "ADICIONAL FERRETERIA", "ADICIONAL SUBDISTRIBUCION"

---

### 3. Documentos de Inventario

#### TRI - Traslados Internos
- **Descripción**: Movimientos de inventario entre ubicaciones/bodegas
- **Clase de documento**: 67
- **Frecuencia**: Media (~6% del volumen)
- **Características**:
  - **NO tienen tercero** (`rowid_tercero = NULL`)
  - Valores variables (promedio ~2,500,000)
  - Generalmente impresos
  - Usuario típico: jhernandez
- **Ejemplo de nota**: "TURBO LOCAL, MULTIMATERIALES LA 19, NO ENTREGAR HASTA NUEVA ORDEN", "SENCILLO LOCAL, GRUFFER CIERRE DE MES", "TURBO CALAMAR CIERRE DE MES"
- **Referencias**: Generalmente vacías

#### NTR - Notas de Traslado
- **Descripción**: Notas de traslado de inventario
- **Clase de documento**: 0
- **Frecuencia**: Muy baja (~1% del volumen)
- **Características**:
  - Valores bajos
  - Generalmente NO impresos
- **Ejemplo de nota**: "CORRECION CUENTA CONSIGNACION EN DAVIVIENDA"

---

### 4. Documentos de Egresos y Pagos

#### CE - Comprobantes de Egreso
- **Descripción**: Pagos y egresos
- **Clase de documento**: 0
- **Frecuencia**: Baja (~3% del volumen)
- **Características**:
  - Valores altos (promedio ~10,000,000)
  - Generalmente impresos
  - Usuario típico: ycervantes
- **Ejemplo de nota**: "GASTOS PL 30 DIC", "GASTOS MOSTRADOR"
- **Estados especiales**: Pueden estar anulados (`ind_estado = 2`)

#### EA - Entradas de Almacén
- **Descripción**: Ingresos de inventario/provisiones
- **Clase de documento**: 408
- **Frecuencia**: Baja (~3% del volumen)
- **Características**:
  - Valores altos (promedio ~15,000,000)
  - Generalmente impresos
  - Usuario típico: jhernandez
- **Ejemplo de nota**: "INGRESO PROVISIONAL P7 CIERRE DE MES", "INGRESO PROVISION KNAUF 1/2 CIERRE DE MES DIC 2025"
- **Referencias**: "INGPROVDIC", "INGRPROVDIC"

---

### 5. Documentos del Centro 002 (Mencionados en Análisis Inicial)

#### R01 - Recibos
- **Descripción**: Recibos del centro 002
- **Clase de documento**: 1202
- **Frecuencia**: Media (solo en centro 002)
- **Características**:
  - Valores muy altos (promedio ~17,000,000)
  - Generalmente transmitidos (`ind_transmit = 1`)
  - Relacionados con POS (Point of Sale)
- **Ejemplo de nota**: "ACUMULACION POS"

#### M01 - Movimientos
- **Descripción**: Movimientos contables del centro 002
- **Clase de documento**: 1260
- **Frecuencia**: Media (solo en centro 002)
- **Características**:
  - Valores variables
  - Relacionados con POS
- **Ejemplo de nota**: "ACUMULACION POS"

#### C01 - Comprobantes
- **Descripción**: Comprobantes contables del centro 002
- **Clase de documento**: 1249
- **Frecuencia**: Media (solo en centro 002)
- **Características**:
  - Valores variables
  - Tienen base gravable
  - Relacionados con POS
- **Ejemplo de nota**: "ACUMULACION POS"

---

## Resumen por Categoría

### Documentos de Venta (70% del volumen)
- **BQE**: Facturas de venta
- **RMV**: Remisiones de venta
- **NC1**: Notas crédito
- **DVV**: Devoluciones

### Documentos de Caja (15% del volumen)
- **RC**: Recibos de caja estándar
- **RCC**: Recibos de caja complementarios
- **TC**: Transferencias de caja
- **DC**: Documentos de caja

### Documentos de Inventario (7% del volumen)
- **TRI**: Traslados internos
- **NTR**: Notas de traslado

### Documentos de Egresos (6% del volumen)
- **CE**: Comprobantes de egreso
- **EA**: Entradas de almacén

### Documentos Especiales (2% del volumen)
- **R01, M01, C01**: Documentos del centro 002 (POS)

---

## Clases de Documento por Tipo

| Tipo Doc | Clase | Descripción |
|----------|-------|-------------|
| BQE | 523 | Boletas de venta |
| RMV | 513 | Remisiones de venta |
| RC | 13 | Recibos de caja estándar |
| RCC | 1 | Recibos de caja complementarios |
| RC1 | 14 | Recibos tipo 1 |
| TC | 0 | Transferencias de caja |
| TRI | 67 | Traslados internos |
| NC1 | 526 | Notas crédito |
| DVV | 518 | Devoluciones de venta |
| CE | 0 | Comprobantes de egreso |
| EA | 408 | Entradas de almacén |
| DC | 1 | Documentos de caja |
| NTR | 0 | Notas de traslado |
| R01 | 1202 | Recibos centro 002 |
| M01 | 1260 | Movimientos centro 002 |
| C01 | 1249 | Comprobantes centro 002 |

---

## Patrones de Uso por Tipo

### Documentos que Aparecen en Pares
- **BQE + RMV**: Cada factura tiene su remisión
- Se crean casi simultáneamente (milisegundos de diferencia)
- Mismo tercero, fecha y periodo

### Documentos que NO Tienen Tercero
- **TRI** (Traslados Internos): Son movimientos internos entre bodegas
- **Algunos EA**: Entradas de almacén pueden no tener tercero

### Documentos Relacionados con Cierres de Mes
- **BQE, RMV, NC1, DVV**: Aparecen masivamente el último día del mes
- Nota común: "CIERRE DE MES"
- Referencias: COT-XXXXX

### Documentos Relacionados con POS
- **R01, M01, C01**: Solo en centro 002
- Nota común: "ACUMULACION POS"
- Generalmente transmitidos

---

## Implicaciones para el API

### Si Quieres Crear Otros Tipos de Documentos

1. **Facturas (BQE)**:
   - Requiere clase de documento: 523
   - Debe tener base gravable
   - Generalmente requiere RMV asociado
   - Puede requerir CFD

2. **Remisiones (RMV)**:
   - Requiere clase de documento: 513
   - Debe estar asociada a un BQE
   - Generalmente no se imprime

3. **Notas Crédito (NC1)**:
   - Requiere clase de documento: 526
   - Debe referenciar un BQE anterior
   - Requiere base gravable

4. **Traslados Internos (TRI)**:
   - Requiere clase de documento: 67
   - NO requiere tercero (NULL)
   - Requiere ubicaciones origen/destino

5. **Transferencias de Caja (TC)**:
   - Requiere clase de documento: 0
   - Relacionada con bancos
   - Valores generalmente altos

---

## Conclusión

La tabla `t350_co_docto_contable` es el **corazón del sistema contable**. Almacena:

1. **Documentos de venta** (facturas, remisiones, notas crédito, devoluciones)
2. **Documentos de caja** (recibos, transferencias)
3. **Documentos de inventario** (traslados, entradas)
4. **Documentos de egresos** (comprobantes, pagos)
5. **Documentos especiales** (POS, acumulaciones)

**Los recibos de caja (RC/RCC) representan solo ~9% del volumen total de documentos**, siendo las facturas (BQE) y remisiones (RMV) los documentos más frecuentes con ~70% del volumen.

