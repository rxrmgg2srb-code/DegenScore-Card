# 🚀 Deployment Guide - DegenScore Card

**Tiempo estimado:** 5-10 minutos para primer deploy
**Costo:** $0/mes para MVP (hasta ~100 usuarios/día)

---

## 📋 Quick Start - Deploy en 5 Minutos

### 1. Configurar Base de Datos (Supabase)

```bash
# Ya tienes la DB configurada, solo verifica:
# 1. Ir a Supabase Dashboard → Settings → Database
# 2. Copiar "Connection String" (URI format)
# 3. ⚠️ IMPORTANTE: Debe terminar en :5432 (NO :6543)
```

**Ejemplo de DATABASE_URL correcto:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
                                                          ^^^^^
                                                          Debe ser 5432
```

### 2. Configurar Variables en Vercel

```bash
# En Vercel Dashboard → tu proyecto → Settings → Environment Variables

# 🔴 REQUERIDAS (la app NO funciona sin estas):
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=[genera con: openssl rand -base64 32]
NEXTAUTH_URL=https://tu-dominio.vercel.app

# 🟡 OPCIONALES (mejoran performance, no críticas):
UPSTASH_REDIS_REST_URL=https://[endpoint].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
HELIUS_RPC_URL=https://[api-key].helius-rpc.com/?api-key=[key]

# 🟢 RECOMENDADAS (para producción):
NEXT_PUBLIC_SENTRY_DSN=[tu-dsn]
SENTRY_AUTH_TOKEN=[token] # Solo para source maps
```

### 3. Deploy

```bash
git push origin claude/fix-redis-rate-limiting-01B4c7mAnTZcHaLf7V37tRZw

# Vercel auto-detecta el push y hace deploy automático
# ⏱️ Tiempo de build: 2-4 minutos
```

### 4. Verificar Deploy

```bash
# Opción A: Healthcheck manual
curl https://tu-dominio.vercel.app/api/health

# Opción B: Abrir en navegador
open https://tu-dominio.vercel.app
```

---

## 🔧 Configuración Detallada

### Supabase (Database)

1. **Crear cuenta en Supabase** (si no tienes):
   - https://supabase.com
   - New Project → Elige región cercana a tus usuarios

2. **Obtener credenciales**:
   ```
   Dashboard → Settings → Database → Connection String (URI)
   ```

3. **⚠️ CRÍTICO - Usar puerto correcto**:
   ```bash
   # ✅ CORRECTO (conexión directa):
   postgresql://postgres:pass@db.project.supabase.co:5432/postgres

   # ❌ INCORRECTO (connection pooler):
   postgresql://postgres:pass@db.project.supabase.co:6543/postgres
   ```

   **Por qué 5432 y no 6543:**
   - Puerto 5432: Conexión directa, permite transacciones largas
   - Puerto 6543: Pooler de conexiones, para conexiones cortas
   - Nuestra app necesita 5432 para Prisma migrations

4. **Verificar schema**:
   ```bash
   # Las migraciones se aplican automáticamente en build
   # Pero puedes verificar manualmente:
   npx prisma migrate deploy
   ```

### Upstash Redis (Rate Limiting)

**¿Es necesario?** No para MVP, sí para producción.

Sin Redis:
- ✅ La app funciona perfecto
- ⚠️ Rate limiting usa memoria (se reinicia en cada deploy)

Con Redis:
- ✅ Rate limiting persistente entre deploys
- ✅ Mejor performance para usuarios concurrentes
- ✅ Compartido entre todas las instancias serverless

**Setup:**

1. Crear cuenta: https://upstash.com (FREE tier: 10k requests/día)

2. Create Database → Elige región cercana a Vercel

3. Copiar credenciales:
   ```bash
   UPSTASH_REDIS_REST_URL=https://[endpoint].upstash.io
   UPSTASH_REDIS_REST_TOKEN=[token]
   ```

4. Agregar a Vercel Environment Variables

### Helius RPC (Solana)

**¿Es necesario?** No, pero mejora velocidad.

Sin Helius:
- ✅ Usa endpoint público de Solana
- ⚠️ Más lento (1-2 segundos por request)
- ⚠️ Puede tener rate limits

Con Helius:
- ✅ 5-10x más rápido
- ✅ 100k requests/mes gratis
- ✅ Soporte para NFTs, tokens, etc.

**Setup:**

1. Crear cuenta: https://helius.dev

2. Create API Key → Mainnet

3. Copiar URL:
   ```bash
   HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=[tu-api-key]
   ```

4. Agregar a Vercel Environment Variables

### NextAuth (Autenticación)

**Requerido:** Sí

```bash
# 1. Generar secret:
openssl rand -base64 32

# 2. Agregar a Vercel:
NEXTAUTH_SECRET=[el secret generado]
NEXTAUTH_URL=https://tu-dominio.vercel.app

# ⚠️ IMPORTANTE: NEXTAUTH_URL debe ser tu dominio de producción
```

### Sentry (Opcional - Error Tracking)

**¿Es necesario?** No para MVP, muy útil para producción.

**Setup:**

1. Crear cuenta: https://sentry.io

2. Create Project → Next.js

3. Copiar DSN:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://[hash]@[project].ingest.sentry.io/[id]
   SENTRY_AUTH_TOKEN=[token] # Solo para subir source maps
   ```

---

## 🔄 Re-Deploy (Actualizar Producción)

### Deploy de Cambios

```bash
# 1. Hacer tus cambios y commitear
git add .
git commit -m "Feature: descripción del cambio"

# 2. Push a la rama de deploy
git push origin claude/fix-redis-rate-limiting-01B4c7mAnTZcHaLf7V37tRZw

# 3. Vercel detecta el push y hace auto-deploy (2-4 min)
```

### Rollback (Volver a Versión Anterior)

```bash
# Opción A: Desde Vercel Dashboard
# 1. Deployments → Ver deploy anterior → "Promote to Production"

# Opción B: Desde git
git revert HEAD
git push origin claude/fix-redis-rate-limiting-01B4c7mAnTZcHaLf7V37tRZw
```

### Actualizar Variables de Entorno

```bash
# 1. Vercel Dashboard → Settings → Environment Variables
# 2. Editar la variable
# 3. ⚠️ IMPORTANTE: Hacer re-deploy para aplicar
# 4. Deployments → Latest → "Redeploy"
```

---

## 🐛 Troubleshooting

### Build Falla con Error de Database

**Síntoma:**
```
Error: P1001: Can't reach database server
```

**Solución:**
✅ **NO HACER NADA** - el build está diseñado para continuar aunque la DB no esté disponible.

Si el build realmente falla:

1. Verificar que usas puerto 5432 (no 6543)
2. Verificar que DATABASE_URL está en Vercel Environment Variables
3. Ver logs completos: Vercel Dashboard → Deployments → [tu deploy] → Building

**El build NUNCA debe fallar por la database.** Si falla, es un bug - avísame.

### App Funciona Pero No Guarda Cards

**Síntoma:**
Usuario genera card, pero al recargar no aparece.

**Diagnóstico:**

1. Verificar DATABASE_URL en producción:
   ```bash
   # Vercel Dashboard → Settings → Environment Variables
   # DATABASE_URL debe estar configurada
   ```

2. Verificar conexión a DB:
   ```bash
   # Ejecutar localmente:
   DATABASE_URL=[tu-url-de-produccion] npx prisma db execute --stdin <<< "SELECT 1;"
   ```

3. Ver logs de API:
   ```bash
   # Vercel Dashboard → Logs (real-time)
   # Buscar errores de Prisma
   ```

**Soluciones:**

- Si DATABASE_URL no está: Agregarla y re-deploy
- Si puerto es 6543: Cambiar a 5432 y re-deploy
- Si DB no responde: Verificar que Supabase project esté activo

### Rate Limiting No Funciona

**Síntoma:**
Usuarios pueden hacer 1000 requests seguidos sin ser bloqueados.

**Diagnóstico:**

```bash
# Verificar si Redis está configurado:
# Vercel Dashboard → Settings → Environment Variables
# Buscar: UPSTASH_REDIS_REST_URL
```

**Soluciones:**

- Si no está configurado: Es normal, rate limiting usa memoria (se reinicia en cada deploy)
- Si quieres rate limiting persistente: Configurar Upstash Redis
- Si Redis está configurado pero no funciona: Verificar token y URL

### Cards Se Generan Lentas

**Síntoma:**
Tarda 5-10 segundos en generar una card.

**Diagnóstico:**

1. ¿Helius configurado?
   ```bash
   # Vercel Dashboard → Settings → Environment Variables
   # HELIUS_RPC_URL debe estar configurada
   ```

2. Ver logs de tiempo:
   ```bash
   # Vercel Dashboard → Logs
   # Buscar: "Token analysis took"
   ```

**Soluciones:**

- Sin Helius: 2-3 seg es normal (usar endpoint público)
- Con Helius: Debe ser <1 seg
- Si con Helius sigue lento: Verificar API key válida

### Memory/Timeout en Build

**Síntoma:**
```
Error: Command "npm run build" exited with 137 (out of memory)
```

**Solución:**

Ya configurado en `next.config.js`:
```javascript
experimental: {
  workerThreads: false,
  cpus: 1,
}
```

Si persiste:
1. Vercel Dashboard → Settings → General
2. Node.js Version → Verificar que sea 18.x o superior
3. Considerar upgrade a Vercel Pro (más memoria)

---

## 💰 Costos Estimados

### MVP (0-100 usuarios/día)

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| Vercel | Hobby | **$0** | 100 GB bandwidth/mes |
| Supabase | Free | **$0** | 500 MB DB, 1 GB bandwidth |
| Upstash Redis | Free | **$0** | 10k requests/día |
| Helius | Free | **$0** | 100k requests/mes |
| **TOTAL** | | **$0/mes** | |

### Producción (1000 usuarios/día)

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| Vercel | Pro | **$20** | 1 TB bandwidth/mes |
| Supabase | Pro | **$25** | 8 GB DB, 50 GB bandwidth |
| Upstash Redis | Pay as you go | **~$2** | 100k requests/día |
| Helius | Developer | **$49** | 1M requests/mes |
| **TOTAL** | | **~$96/mes** | |

### Scale (10k usuarios/día)

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Pro | **$20** |
| Supabase | Pro | **$25-50** (depende de DB size) |
| Upstash Redis | **~$10** |
| Helius | Professional | **$149** |
| **TOTAL** | | **~$204-229/mes** |

---

## ✅ Production Launch Checklist

### Pre-Launch (1 hora antes)

- [ ] Ejecutar healthcheck:
  ```bash
  bash scripts/production-healthcheck.sh
  ```

- [ ] Verificar todas las variables de entorno en Vercel

- [ ] Hacer test end-to-end:
  - [ ] Conectar wallet
  - [ ] Generar card
  - [ ] Guardar card
  - [ ] Ver en dashboard
  - [ ] Compartir en Twitter

- [ ] Verificar Sentry configurado (opcional pero recomendado)

- [ ] Backup de base de datos:
  ```bash
  # Supabase Dashboard → Database → Backups → Create Backup
  ```

### Durante Launch

- [ ] Monitorear logs en tiempo real:
  ```bash
  # Vercel Dashboard → Logs (mantener abierto)
  ```

- [ ] Tener plan de rollback listo:
  ```bash
  # En caso de problemas críticos:
  # Vercel → Deployments → [versión anterior] → Promote to Production
  ```

- [ ] Monitorear métricas:
  - Response times (debe ser <2 seg)
  - Error rate (debe ser <1%)
  - Database connections

### Post-Launch (primeras 24h)

- [ ] Revisar Sentry para errores inesperados

- [ ] Verificar que rate limiting funcione:
  ```bash
  # Intentar generar 20 cards seguidas
  # Debe bloquearse después de 10
  ```

- [ ] Verificar que cards se guarden correctamente

- [ ] Revisar feedback de primeros usuarios

- [ ] Monitorear costos en dashboards

---

## 🆘 Contactos de Emergencia

### Si la App Cae en Producción

1. **Rollback inmediato:**
   - Vercel Dashboard → Deployments → [última versión estable] → Promote to Production
   - Tiempo: <1 minuto

2. **Verificar servicios externos:**
   - Supabase: https://status.supabase.com
   - Vercel: https://www.vercel-status.com
   - Upstash: https://status.upstash.com

3. **Ver logs:**
   - Vercel Dashboard → Logs (real-time)
   - Buscar stack traces de errores

4. **Desactivar feature problemática:**
   - Si sabes qué feature causa el problema
   - Hacer commit revirtiendo solo esa feature
   - Push y esperar re-deploy (2-4 min)

### Soporte de Servicios

- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
- Upstash: hello@upstash.com
- Helius: support@helius.dev

---

## 📊 Monitoring

### Métricas Clave a Monitorear

1. **Response Time**
   - Meta: <2 segundos
   - Crítico: >5 segundos
   - Vercel Dashboard → Analytics → Performance

2. **Error Rate**
   - Meta: <1%
   - Crítico: >5%
   - Sentry Dashboard (si configurado)

3. **Database Connections**
   - Supabase Dashboard → Database → Connections
   - Meta: <20 conexiones activas
   - Crítico: >80 conexiones (límite es 100)

4. **API Usage**
   - Helius Dashboard → Usage
   - Monitorear para no exceder plan gratuito

### Logs a Revisar Diariamente

```bash
# Vercel Dashboard → Logs
# Buscar estos patrones:

# ❌ Errores críticos:
"Error:"
"Failed to"
"Timeout"

# ⚠️ Warnings:
"Rate limit exceeded"
"Slow query"
"High memory usage"

# ✅ Métricas normales:
"Card generated in"
"Database connected"
"Cache hit"
```

---

## 🎯 Next Steps After Deploy

1. **Configurar dominio custom** (opcional):
   - Vercel Dashboard → Settings → Domains
   - Agregar: degenscore.app (ejemplo)

2. **Configurar alertas** (recomendado):
   - Sentry → Alerts → New Alert Rule
   - Trigger: Error rate > 5%

3. **Optimizar SEO**:
   - Verificar meta tags en `pages/_app.tsx`
   - Agregar `robots.txt` y `sitemap.xml`

4. **Analytics** (opcional):
   - Google Analytics o Plausible
   - Agregar tracking de conversión

---

## 📝 Notas Importantes

### Build vs Runtime

El build de Vercel está diseñado para **NUNCA fallar** por problemas de base de datos:

- ✅ Build usa DATABASE_URL placeholder
- ✅ Migraciones son best-effort (continúa aunque fallen)
- ✅ Runtime usa DATABASE_URL real de environment variables

**Esto significa:**
- Puedes cambiar DATABASE_URL sin re-build
- Puedes cambiar puerto de 5432 a 6543 (aunque no recomendado)
- Puedes cambiar de Supabase a Neon sin problemas

### Port 5432 vs 6543

**Recomendación:** Siempre usar **5432** en producción.

**Por qué:**
- 5432: Conexión directa, soporta transacciones largas (Prisma migrations)
- 6543: Connection pooler, solo para queries rápidos (<30 seg)

**Cuándo usar 6543:**
- Si tienes >100 conexiones concurrentes
- Si usas Prisma Data Proxy (no nuestro caso)
- Si Supabase recomienda explícitamente

**Para cambiar:**
```bash
# 1. Actualizar variable en Vercel
DATABASE_URL=postgresql://...:[puerto]/postgres

# 2. Re-deploy (no rebuild necesario)
# Vercel → Deployments → Redeploy
```

---

**¿Preguntas?** Revisa `PRODUCTION-CHECKLIST.md` para más detalles sobre cada sistema.
