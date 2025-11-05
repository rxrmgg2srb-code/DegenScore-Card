```markdown
# DegenCard MVP

Este repo contiene un MVP mínimo para generar cartas tipo "DegenCard" (Solana trader cards).

Incluye:
- components/DegenCard.tsx — Componente React (Next.js + Tailwind) para mostrar cards en la UI.
- pages/api/generate-card.ts — API server-side que devuelve una PNG generada dinámicamente (usa @napi-rs/canvas).
- scripts/generateCardCanvas.js — Script standalone para generar card.png localmente.
- styles/globals.css, config de Tailwind, package.json.

Cómo arrancar (local):
1. Clona el repo y entra en la carpeta.
2. npm install
3. npm run dev
4. Abre http://localhost:3000 y prueba el botón "Mint" (hace request a /api/generate-card).

Notas importantes:
- @napi-rs/canvas se usa para evitar dependencias de sistema que node-canvas requiere en algunos entornos.
- La parte de análisis de wallets (Helius / precios históricos) está como stub — puedo integrarla en la siguiente iteración si me das la API key o acceso a secrets.

Siguientes pasos recomendados:
- Integrar Helius para extraer transacciones y calcular P&L por trade.
- Implementar smart contract de mint (Anchor + Metaplex) y el flujo de pago de mint.
- Añadir leaderboard con filtro is_minted = TRUE y página de perfil.
```# DegenScore-Card
