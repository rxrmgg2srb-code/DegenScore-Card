#!/bin/bash
# Production Health Check Script
# Verifica que todos los servicios críticos estén funcionando

set +e  # No exit on error - queremos ver todos los problemas

echo "========================================="
echo "🏥 Production Health Check"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check 1: Database Connection
echo "🗄️  [1/7] Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL not set${NC}"
  ((ERRORS++))
else
  # Try to connect with timeout
  timeout 10 npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connected${NC}"
  else
    echo -e "${YELLOW}⚠️  Database connection slow or unreachable${NC}"
    echo "   (App will work, but card generation may be slower)"
    ((WARNINGS++))
  fi
fi
echo ""

# Check 2: Redis Connection
echo "⚡ [2/7] Checking Redis connection..."
if [ -z "$UPSTASH_REDIS_REST_URL" ]; then
  echo -e "${YELLOW}⚠️  Redis not configured - using in-memory fallback${NC}"
  echo "   (This is OK for MVP, but consider adding Redis for production)"
  ((WARNINGS++))
else
  echo -e "${GREEN}✅ Redis configured${NC}"
fi
echo ""

# Check 3: Helius RPC
echo "🌐 [3/7] Checking Helius RPC..."
if [ -z "$HELIUS_RPC_URL" ]; then
  echo -e "${YELLOW}⚠️  HELIUS_RPC_URL not set - using public endpoint${NC}"
  echo "   (Works, but may be slower. Consider getting API key)"
  ((WARNINGS++))
else
  echo -e "${GREEN}✅ Helius RPC configured${NC}"
fi
echo ""

# Check 4: Prisma Client
echo "🔧 [4/7] Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
  echo -e "${GREEN}✅ Prisma Client installed${NC}"
else
  echo -e "${RED}❌ Prisma Client not found${NC}"
  echo "   Run: npx prisma generate"
  ((ERRORS++))
fi
echo ""

# Check 5: Environment
echo "🌍 [5/7] Checking environment..."
if [ "$NODE_ENV" = "production" ]; then
  echo -e "${GREEN}✅ NODE_ENV=production${NC}"
else
  echo -e "${YELLOW}⚠️  NODE_ENV=$NODE_ENV (expected: production)${NC}"
  ((WARNINGS++))
fi
echo ""

# Check 6: Next.js Build
echo "🏗️  [6/7] Checking Next.js build..."
if [ -d ".next" ]; then
  echo -e "${GREEN}✅ Next.js build exists${NC}"
else
  echo -e "${RED}❌ Next.js build not found${NC}"
  echo "   Run: npm run build"
  ((ERRORS++))
fi
echo ""

# Check 7: Memory Available
echo "💾 [7/7] Checking memory..."
if command -v free &> /dev/null; then
  AVAILABLE_MB=$(free -m | awk 'NR==2{print $7}')
  if [ "$AVAILABLE_MB" -gt 512 ]; then
    echo -e "${GREEN}✅ Memory available: ${AVAILABLE_MB}MB${NC}"
  else
    echo -e "${YELLOW}⚠️  Low memory: ${AVAILABLE_MB}MB${NC}"
    echo "   (May cause issues under high load)"
    ((WARNINGS++))
  fi
else
  echo -e "${YELLOW}⚠️  Cannot check memory (not on Linux)${NC}"
  ((WARNINGS++))
fi
echo ""

# Summary
echo "========================================="
echo "📊 Health Check Summary"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Ready for production.${NC}"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
  echo -e "${GREEN}✅ Errors: 0${NC}"
  echo ""
  echo "App will work, but consider fixing warnings for optimal performance."
  echo ""
  exit 0
else
  echo -e "${RED}❌ Errors: $ERRORS${NC}"
  echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
  echo ""
  echo "Please fix errors before deploying to production."
  echo ""
  exit 1
fi
