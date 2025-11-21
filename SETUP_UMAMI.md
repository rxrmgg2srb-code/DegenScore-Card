# 🎯 Setup Umami Analytics (100% FREE)

Umami es una alternativa GRATIS a Google Analytics, self-hosted en Vercel.

---

## 📋 Paso 1: Deploy Umami en Vercel (10 minutos)

### Opción A: Deploy con 1-Click (MÁS FÁCIL)

1. **Ve a:** https://umami.is/docs/running-on-vercel

2. **Click en "Deploy to Vercel"** (botón azul)

3. **Vercel te pedirá:**
   - Nombre del proyecto: `degenscore-analytics` (o el que quieras)
   - Repository: Se creará automáticamente en tu GitHub

4. **Configurar Database:**
   - Umami te pedirá conectar una base de datos PostgreSQL
   - **IMPORTANTE:** Usa tu Supabase existente para NO pagar nada extra

   En Vercel Environment Variables, añade:
   ```
   DATABASE_URL=postgresql://tu-supabase-connection-string
   ```

   **Obtén tu connection string de Supabase:**
   - Ir a Supabase Dashboard
   - Settings > Database
   - Connection String (Session mode)
   - Copiar el string completo

5. **Deploy!** Vercel deployará Umami automáticamente

---

### Opción B: Manual (Si necesitas más control)

```bash
# 1. Fork el repo
git clone https://github.com/umami-software/umami.git
cd umami

# 2. Deploy a Vercel
vercel --prod

# 3. Cuando te pregunte por env vars, añadir:
DATABASE_URL=postgresql://tu-supabase-connection-string
```

---

## 📊 Paso 2: Configurar Umami (5 minutos)

1. **Abre tu Umami:** `https://degenscore-analytics.vercel.app`

2. **Login por primera vez:**
   - Usuario: `admin`
   - Password: `umami`
   - **⚠️ CAMBIAR PASSWORD INMEDIATAMENTE**

3. **Crear Website:**
   - Click en "+ Add Website"
   - Name: `DegenScore Card`
   - Domain: `tu-dominio.com` (o `localhost:3000` para desarrollo)
   - Click "Save"

4. **Copiar Tracking Code:**
   - Click en el website que creaste
   - Click en "Edit"
   - Verás un "Website ID" → **Cópialo**

   Ejemplo: `a1b2c3d4-5678-90ab-cdef-1234567890ab`

---

## 🔧 Paso 3: Añadir Tracking a DegenScore (2 minutos)

### Actualizar .env.local

Añade estas variables:

```bash
# Umami Analytics
NEXT_PUBLIC_UMAMI_WEBSITE_ID="a1b2c3d4-5678-90ab-cdef-1234567890ab"
NEXT_PUBLIC_UMAMI_URL="https://degenscore-analytics.vercel.app"
```

### Actualizar _app.tsx

Ya está casi listo, solo necesitas añadir el script. Archivo ya creado abajo.

---

## ✅ Verificar que Funciona

1. **Corre tu app:**
   ```bash
   npm run dev
   ```

2. **Abre:** http://localhost:3000

3. **Vuelve a Umami:** https://degenscore-analytics.vercel.app
   - Deberías ver tu visita en el dashboard en tiempo real

---

## 📈 Features de Umami (GRATIS)

- ✅ Visitas en tiempo real
- ✅ Pageviews
- ✅ Usuarios únicos
- ✅ Eventos personalizados
- ✅ Referrers (de dónde vienen usuarios)
- ✅ Dispositivos (mobile/desktop)
- ✅ Países
- ✅ Páginas más visitadas
- ✅ 100% Privacy-focused (sin cookies)
- ✅ Cumple con GDPR

---

## 🎯 Track Eventos Personalizados

Ejemplo de cómo trackear eventos:

```typescript
// Trackear cuando alguien conecta wallet
window.umami?.track('wallet_connected', {
  wallet: 'Phantom'
});

// Trackear cuando alguien genera card
window.umami?.track('card_generated', {
  score: 85,
  isPremium: true
});

// Trackear cuando alguien paga
window.umami?.track('payment', {
  amount: 1.0,
  tier: 'PRO'
});
```

---

## 💰 Costo Total: $0/mes

- Vercel hosting: GRATIS
- Supabase PostgreSQL: Ya lo tienes (FREE tier)
- Umami software: Open source GRATIS

---

## 🚨 Troubleshooting

### "Can't connect to database"
- Verifica que el DATABASE_URL esté correcto en Vercel env vars
- Asegúrate de usar la connection string de Supabase (session mode, NO pooler)

### "No veo mis visitas"
- Verifica que NEXT_PUBLIC_UMAMI_WEBSITE_ID esté en .env.local
- Refresca la página de Umami (puede tomar 5-10 segundos)
- Abre DevTools > Network > Busca "script.js" (debe cargar de tu Umami URL)

### "Script blocked by CSP"
- Si re-habilitaste CSP, añade tu Umami URL:
  ```javascript
  script-src 'self' https://degenscore-analytics.vercel.app;
  ```

---

## 🎉 ¡Listo!

Ahora tienes analytics profesional 100% GRATIS sin depender de Google.
