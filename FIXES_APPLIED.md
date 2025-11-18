# Fixes Aplicados - DegenScore Card

## Fecha: 2025-11-18

### Problemas Resueltos

#### 1. ✅ Leaderboard mantiene cards eliminadas
**Solución**: Implementado sistema de Soft Delete

- **Agregado campo `deletedAt`** al modelo `DegenCard` en Prisma schema
- **Actualizado API de leaderboard** (`/api/leaderboard`) para excluir cards eliminadas
- **Creado nuevo endpoint** `/api/delete-card` para eliminar/restaurar cards

**Cambios en base de datos**:
```sql
ALTER TABLE "DegenCard" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "DegenCard_deletedAt_idx" ON "DegenCard"("deletedAt");
```

**Cómo usar**:
```bash
# Para eliminar (ocultar) una card del leaderboard:
POST /api/delete-card
{
  "walletAddress": "ABC...XYZ"
}

# Para restaurar una card eliminada:
POST /api/delete-card
{
  "walletAddress": "ABC...XYZ",
  "restore": true
}
```

#### 2. ✅ Cards básicas (gratuitas) muestran todas las estadísticas
**Status**: Verificado

El código de generación de imágenes basic (`generateBasicCardImage`) **YA muestra correctamente** todas las estadísticas:
- ✅ Total Trades
- ✅ Win Rate
- ✅ Volume (SOL)
- ✅ P&L (Profit & Loss)
- ✅ Best Trade
- ✅ Worst Trade
- ✅ Average Trade Size
- ✅ Active Days

**Flujo de datos correcto**:
1. `/api/analyze` → Analiza la wallet y obtiene métricas
2. `/api/save-card` → Guarda los datos en la base de datos
3. `/api/generate-card` → Genera la imagen con TODOS los datos guardados

**Si una card no muestra estadísticas, las posibles causas son**:
- La wallet NO tiene actividad de trading (totalTrades = 0)
- Los datos no se guardaron correctamente (verificar logs de save-card)
- Cache desactualizado (usar `?nocache=true` en la URL de la imagen)

#### 3. ✅ Leaderboard optimizado
**Mejoras de performance**:
- Agregados índices compuestos para queries más rápidas
- Cache de 5 minutos para resultados del leaderboard
- Filtros optimizados con `isPaid: true` y `deletedAt: null`

### Archivos Modificados

1. **prisma/schema.prisma**
   - Agregado campo `deletedAt DateTime?`
   - Agregados índices para performance

2. **pages/api/leaderboard.ts**
   - Agregado filtro `deletedAt: null`
   - Actualizado stats para excluir cards eliminadas

3. **pages/api/delete-card.ts** (NUEVO)
   - Endpoint para soft delete de cards
   - Soporta restore de cards eliminadas
   - Invalida cache automáticamente

4. **prisma/migrations/20251118015447_add_soft_delete/**
   - Migración SQL para aplicar cambios en base de datos

### Instrucciones de Despliegue

#### 1. Aplicar Migración de Base de Datos

**Opción A: Usando Prisma CLI** (Recomendado)
```bash
# Asegúrate de tener DATABASE_URL configurado en .env
npx prisma migrate deploy
```

**Opción B: SQL Manual**
```bash
# Si no puedes usar Prisma, ejecuta manualmente:
psql $DATABASE_URL -f prisma/migrations/20251118015447_add_soft_delete/migration.sql
```

#### 2. Verificar el Deployment

```bash
# 1. Regenerar cliente de Prisma
npx prisma generate

# 2. Reiniciar la aplicación
npm run build
npm run start
```

#### 3. Limpiar Cache (Opcional)

Si tienes Redis configurado, limpia el cache del leaderboard:
```bash
# Usar el endpoint
POST /api/clear-cache
{
  "keys": ["leaderboard:*"]
}
```

### Verificación de Funcionamiento

#### Test 1: Verificar que las cards básicas muestran datos
```bash
# 1. Analizar una wallet con actividad
POST /api/analyze
{ "walletAddress": "WALLET_WITH_TRADES" }

# 2. Generar la card
POST /api/generate-card
{ "walletAddress": "WALLET_WITH_TRADES" }

# 3. Verificar que la imagen muestra:
# - Total Trades > 0
# - Volume > 0
# - P&L con valor real
# - Win Rate calculado
```

#### Test 2: Verificar soft delete
```bash
# 1. Ver card en leaderboard
GET /api/leaderboard

# 2. Eliminar una card
POST /api/delete-card
{ "walletAddress": "ABC...XYZ" }

# 3. Verificar que ya no aparece en leaderboard
GET /api/leaderboard

# 4. Restaurar card
POST /api/delete-card
{ "walletAddress": "ABC...XYZ", "restore": true }

# 5. Verificar que vuelve a aparecer
GET /api/leaderboard
```

### Notas Importantes

⚠️ **Leaderboard solo muestra cards premium (`isPaid: true`)**
- Las cards gratuitas (basic) NO aparecen en el leaderboard por diseño
- Solo se muestran en el endpoint de generación de imagen
- Para que aparezcan en el leaderboard, el usuario debe pagar/descargar la card

⚠️ **Soft Delete es reversible**
- Las cards eliminadas NO se borran de la base de datos
- Se pueden restaurar en cualquier momento
- El campo `deletedAt` marca cuándo se eliminó

⚠️ **Cache del Leaderboard**
- Los cambios en el leaderboard pueden tardar hasta 5 minutos en reflejarse
- Usa `/api/clear-cache` para forzar actualización inmediata

### Soporte

Si encuentras problemas:
1. Verifica los logs del servidor con `logger.info` y `logger.error`
2. Revisa que la migración se aplicó correctamente: `npx prisma studio`
3. Limpia el cache: `POST /api/clear-cache`
4. Verifica que los datos se guardan correctamente en `/api/save-card`

---

**Resumen**: Todos los problemas principales han sido resueltos. Las cards básicas YA mostraban las estadísticas correctamente, el problema era que no aparecían en el leaderboard (por diseño). El soft delete ahora permite ocultar cards no deseadas del leaderboard.
