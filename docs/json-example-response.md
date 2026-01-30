# Ejemplo de Respuesta del Endpoint /api/pedidos/preview

## Request del Frontend
```json
POST /api/pedidos/preview
{
  "f_rowid": 257792
}
```

---

## Response Completa (para mostrar en modal)

```json
{
  "success": true,
  "data": {
    "pedidoOriginal": {
      "rowid": 257792,
      "numero": 57650,
      "fecha": "2026-01-06T00:00:00.000Z",
      "co": "001",
      "tipo_docto": "PV",
      "estado": "Cumplido",
      "contacto": "PERTUZ PINEDA ALEJO ALFONSO",
      "direccion1": "CR 14B # 17-61",
      "direccion2": null,
      "telefono": 0,
      "celular": null,
      "email": "ALEJROPERTIUZ@HOTMAIL.COM",
      "rowid_tercero_desp": 35763,
      "id_desp": 35763,
      "razon_social_desp": "PERTUZ PINEDA ALEJO ALFONSO",
      "id_depto": "08",
      "id_ciudad": "660",
      "cod_postal": null
    },
    "pedidoTransformado": {
      "orderNumber": "257792",
      "customerName": "PERTUZ PINEDA ALEJO ALFONSO",
      "address": "CR 14B # 17-61",
      "externalClientId": "35763",
      "managementType": 1,
      "email": "ALEJROPERTIUZ@HOTMAIL.COM",
      "priority": 0,
      "dispensaryId": 0,
      "latitude": 0,
      "longitude": 0,
      "deliveryPlannedDate": "2026-01-06T00:00:00.000Z",
      "dispensary": {
        "id": 0,
        "externalClientId": 0,
        "municipalityId": 0,
        "name": "PERTUZ PINEDA ALEJO ALFONSO",
        "code": "35763",
        "location": {
          "countryCode": "CO",
          "departmentCode": "08",
          "cityCode": "660",
          "address": "CR 14B # 17-61",
          "lat": 0,
          "lng": 0
        }
      },
      "products": []
    },
    "validacion": {
      "isValid": true,
      "errors": []
    }
  }
}
```

---

## JSON que se Enviaría al Endpoint Externo

**Este es el JSON que debes mostrar en el modal al usuario:**

```json
{
  "orderNumber": "257792",
  "customerName": "PERTUZ PINEDA ALEJO ALFONSO",
  "address": "CR 14B # 17-61",
  "externalClientId": "35763",
  "managementType": 1,
  "email": "ALEJROPERTIUZ@HOTMAIL.COM",
  "priority": 0,
  "dispensaryId": 0,
  "latitude": 0,
  "longitude": 0,
  "deliveryPlannedDate": "2026-01-06T00:00:00.000Z",
  "dispensary": {
    "id": 0,
    "externalClientId": 0,
    "municipalityId": 0,
    "name": "PERTUZ PINEDA ALEJO ALFONSO",
    "code": "35763",
    "location": {
      "countryCode": "CO",
      "departmentCode": "08",
      "cityCode": "660",
      "address": "CR 14B # 17-61",
      "lat": 0,
      "lng": 0
    }
  },
  "products": []
}
```

---

## Código Frontend para Mostrar en Modal

```javascript
async function previewPedido(f_rowid) {
  try {
    const response = await fetch('http://localhost:3010/api/pedidos/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ f_rowid })
    });

    const result = await response.json();

    if (result.success) {
      // Este es el JSON que se mostraría en el modal
      const jsonParaEnviar = result.data.pedidoTransformado;
      
      // Mostrar en modal
      mostrarModal(jsonParaEnviar, result.data.validacion);
    } else {
      alert('Error al generar preview');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

function mostrarModal(json, validacion) {
  // Formatear JSON bonito
  const jsonFormateado = JSON.stringify(json, null, 2);
  
  // Crear modal
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
      <div style="position: relative; margin: 50px auto; width: 80%; max-width: 800px; background: white; padding: 20px; border-radius: 8px; max-height: 80vh; overflow-y: auto;">
        <h2>Preview del Pedido</h2>
        
        ${!validacion.isValid ? `
          <div style="background: #fee; border: 1px solid #f00; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
            <strong>⚠️ Advertencias:</strong>
            <ul>
              ${validacion.errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <strong>JSON que se enviará:</strong>
          <pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${jsonFormateado}</pre>
        </div>
        
        <div style="text-align: right;">
          <button onclick="this.closest('div').parentElement.remove()" style="padding: 10px 20px; margin-right: 10px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
          <button onclick="enviarPedido(${json.orderNumber})" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ✅ Enviar Pedido
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function enviarPedido(f_rowid) {
  try {
    const response = await fetch('http://localhost:3010/api/pedidos/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ f_rowid })
    });

    const result = await response.json();

    if (result.success) {
      alert('✅ Pedido enviado exitosamente');
      // Cerrar modal
      document.querySelector('[style*="position: fixed"]').remove();
    } else {
      alert('❌ Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
}
```

---

## Resumen

**El frontend debe:**

1. **Llamar a `/api/pedidos/preview`** con el `f_rowid`
2. **Recibir el JSON transformado** en `data.pedidoTransformado`
3. **Mostrar ese JSON en un modal** para que el usuario lo revise
4. **Si el usuario confirma**, llamar a `/api/pedidos/send` con el mismo `f_rowid`

**Campos que NO se envían** (porque están vacíos):
- ❌ `phone` - telefono es 0
- ❌ `cellphone` - celular es null
- ❌ `addressAdd` - direccion2 es null
- ❌ `comments` - notas está vacío
- ❌ `fromHour` - no existe
- ❌ `toHour` - no existe

Estos campos se omiten automáticamente del JSON si están vacíos.
