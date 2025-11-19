# 🔍 DIAGNÓSTICO PROFUNDO - Tarjetas sin datos en Vercel

## 🎯 PASOS A SEGUIR (Hacer AHORA):

### **Paso 1: Hacer merge del PR**
```
https://github.com/rxrmgg2srb-code/DegenScore-Card/compare/main...claude/fix-free-card-data-015vYzKo8k53rJ1QGgMB3c7g
```

### **Paso 2: Esperar deploy de Vercel** (~2 minutos)

### **Paso 3: Probar endpoint de test simple**

Abre en el navegador:
```
https://TU-APP.vercel.app/api/test-canvas
```

#### ✅ **Si ves una imagen con texto:**
- Significa que `@napi-rs/canvas` **SÍ funciona** en Vercel
- El problema está en otra parte (datos, caché, lógica)
- Continúa al **Paso 4A**

#### ❌ **Si NO ves texto (imagen vacía o error):**
- Significa que `@napi-rs/canvas` **NO funciona** en Vercel
- Necesitamos cambiar a otra solución de renderizado
- Continúa al **Paso 4B**

---

## **Paso 4A: Si test-canvas FUNCIONA**

### 4A.1 - Limpiar caché
```
https://TU-APP.vercel.app/api/clear-card-cache
```

### 4A.2 - Ver logs de Vercel

Ve a: `https://vercel.com/TU-PROYECTO/logs`

Busca por `generate-card` y deberías ver:

```
🎨 Creating canvas: { width: 600, height: 950 }
✅ Background gradient drawn
✅ Border drawn
🔤 Drawing title with font: 700 44px sans-serif
✅ Title drawn at y: 90
🔤 Drawing wallet address: ABC123...XYZ789
✅ Wallet address drawn at y: 145
🔢 Drawing SCORE: { score: "75", color: "#00ff88", ... }
✅ Score drawn
📊 Metric label drawn: TOTAL TRADES
📊 Metric value drawn: 150
...
✅ BASIC card buffer generated: { bufferSize: 45231 }
```

### 4A.3 - Regenerar tarjeta sin caché
```bash
POST https://TU-APP.vercel.app/api/generate-card?nocache=true
Body: {"walletAddress":"TU_WALLET"}
```

### 4A.4 - Verificar resultado

**Si AHORA muestra texto:**
- ✅ **¡PROBLEMA RESUELTO!** Era solo caché viejo
- Las fonts `sans-serif` funcionan perfectamente
- Todo está operativo

**Si TODAVÍA no muestra texto:**
- Revisa los logs de Vercel punto por punto
- Busca errores o warnings
- Comparte los logs conmigo para análisis profundo

---

## **Paso 4B: Si test-canvas NO FUNCIONA**

Esto significa que `@napi-rs/canvas` tiene problemas en Vercel serverless.

### Soluciones alternativas:

#### **Opción 1: Usar Plaiceholder + Sharp**
```bash
npm install sharp plaiceholder
```
Sharp es más ligero y funciona mejor en serverless.

#### **Opción 2: Usar Vercel OG Image**
```typescript
import { ImageResponse } from '@vercel/og'
```
Solución nativa de Vercel específica para generar imágenes.

#### **Opción 3: Mover generación a API externa**
- Usar servicio como Cloudinary, Imgix o similar
- Generar imágenes server-side con más recursos

---

## 📊 **Qué buscar en los logs:**

### ✅ **LOGS BUENOS (significa que funciona):**
```
✅ Canvas created
✅ Background gradient drawn
✅ Border drawn
✅ Title drawn
✅ Score drawn
📊 Metric label drawn: TOTAL TRADES
📊 Metric value drawn: 150
✅ BASIC card buffer generated
```

### ❌ **LOGS MALOS (significa que hay error):**
```
❌ TEST CANVAS - FAILED
Error: ...
Cannot find module '@napi-rs/canvas'
TypeError: ...
```

---

## 🔧 **Si nada funciona:**

### Último recurso - Cambiar a Vercel OG

Crear nuevo endpoint `generate-card-og.ts`:

```typescript
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(to bottom, #0a0e1a, #16213e)',
        width: '600px',
        height: '950px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 60
      }}>
        <div>SCORE: {score}</div>
        <div>Trades: {trades}</div>
        ...
      </div>
    ),
    {
      width: 600,
      height: 950,
    },
  );
}
```

**Ventajas:**
- ✅ Nativo de Vercel
- ✅ Edge runtime (más rápido)
- ✅ NO necesita canvas
- ✅ Usa React/JSX/CSS

**Desventajas:**
- ❌ Menos control sobre diseño
- ❌ No soporta todos los CSS avanzados

---

## 📝 **Checklist de debugging:**

- [ ] Hacer merge del PR
- [ ] Esperar deploy
- [ ] Probar `/api/test-canvas`
- [ ] Limpiar caché
- [ ] Ver logs de Vercel
- [ ] Regenerar tarjeta sin caché
- [ ] Compartir logs si persiste el problema

---

## 🚨 **Comparte EXACTAMENTE esto:**

Si después de todo sigue sin funcionar, necesito:

1. **Screenshot de `/api/test-canvas`**
2. **Logs completos de Vercel** al llamar `/api/generate-card`
3. **Response de `/api/clear-card-cache`**
4. **¿Hay errores en la consola del navegador?**

Con esa información sabré exactamente qué está fallando y cómo arreglarlo.
