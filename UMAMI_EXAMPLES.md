# 🎯 Ejemplos de Umami Tracking

Cómo usar Umami para trackear eventos importantes en DegenScore.

---

## 📊 Eventos Recomendados para Trackear

### 1. Conexión de Wallet

```typescript
// components/WalletConnectionButton.tsx
import { useUmami } from '@/components/UmamiAnalytics';
import { useWallet } from '@solana/wallet-adapter-react';

export function WalletConnectionButton() {
  const { track } = useUmami();
  const { connect, publicKey } = useWallet();

  const handleConnect = async () => {
    await connect();

    // Track wallet connection
    track('wallet_connected', {
      wallet: wallet?.adapter.name || 'unknown'
    });
  };

  return <button onClick={handleConnect}>Connect Wallet</button>;
}
```

---

### 2. Generación de Card

```typescript
// components/DegenCard.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function DegenCard() {
  const { track } = useUmami();

  const handleGenerateCard = async () => {
    const result = await generateCard(walletAddress);

    // Track card generation
    track('card_generated', {
      score: result.degenScore,
      tier: result.isPaid ? 'premium' : 'basic',
      trades: result.totalTrades
    });
  };

  return <button onClick={handleGenerateCard}>Generate Card</button>;
}
```

---

### 3. Payment / Upgrade

```typescript
// components/PaymentButton.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function PaymentButton() {
  const { track } = useUmami();

  const handlePayment = async () => {
    const result = await processPayment(amount);

    if (result.success) {
      // Track successful payment
      track('payment_success', {
        amount: amount,
        tier: 'PRO',
        currency: 'SOL'
      });
    } else {
      // Track failed payment
      track('payment_failed', {
        reason: result.error,
        amount: amount
      });
    }
  };

  return <button onClick={handlePayment}>Upgrade to PRO</button>;
}
```

---

### 4. Daily Check-in

```typescript
// components/DailyCheckIn.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function DailyCheckIn() {
  const { track } = useUmami();

  const handleCheckIn = async () => {
    const result = await checkIn(walletAddress);

    // Track check-in
    track('daily_checkin', {
      streak: result.streakDays,
      xp_earned: result.xpEarned
    });
  };

  return <button onClick={handleCheckIn}>Check In</button>;
}
```

---

### 5. Referral Share

```typescript
// components/ReferralDashboard.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function ReferralDashboard() {
  const { track } = useUmami();

  const handleShareReferral = (platform: string) => {
    // Track referral share
    track('referral_shared', {
      platform: platform, // 'twitter', 'telegram', 'discord'
      referrer: walletAddress
    });

    // Open share dialog...
  };

  return (
    <div>
      <button onClick={() => handleShareReferral('twitter')}>
        Share on Twitter
      </button>
    </div>
  );
}
```

---

### 6. Challenge Completion

```typescript
// components/WeeklyChallengeCard.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function WeeklyChallengeCard() {
  const { track } = useUmami();

  const handleCompleteChallenge = async (challengeId: string) => {
    const result = await completeChallenge(challengeId);

    if (result.completed) {
      // Track challenge completion
      track('challenge_completed', {
        challenge_id: challengeId,
        reward: result.reward,
        rank: result.rank
      });
    }
  };

  return <button onClick={() => handleCompleteChallenge(id)}>Complete</button>;
}
```

---

### 7. AI Coach Usage

```typescript
// components/AITradingCoach.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function AITradingCoach() {
  const { track } = useUmami();

  const handleRequestAnalysis = async () => {
    const result = await getAIAnalysis(walletAddress);

    // Track AI usage
    track('ai_coach_used', {
      wallet: walletAddress,
      isPremium: user.isPaid
    });
  };

  return <button onClick={handleRequestAnalysis}>Get AI Analysis</button>;
}
```

---

### 8. Token Security Scan

```typescript
// components/TokenSecurityScanner.tsx
import { useUmami } from '@/components/UmamiAnalytics';

export function TokenSecurityScanner() {
  const { track } = useUmami();

  const handleScan = async (tokenMint: string) => {
    const result = await scanToken(tokenMint);

    // Track token scan
    track('token_scanned', {
      security_score: result.securityScore,
      is_safe: result.securityScore >= 70,
      token: tokenMint
    });
  };

  return <button onClick={() => handleScan(mint)}>Scan Token</button>;
}
```

---

### 9. Leaderboard View

```typescript
// pages/leaderboard.tsx
import { useUmami } from '@/components/UmamiAnalytics';
import { useEffect } from 'react';

export default function LeaderboardPage() {
  const { track } = useUmami();

  useEffect(() => {
    // Track leaderboard view
    track('leaderboard_viewed', {
      sort_by: sortBy, // 'score', 'volume', 'winrate'
      page: currentPage
    });
  }, [sortBy, currentPage]);

  return <div>Leaderboard content...</div>;
}
```

---

### 10. Achievement Unlock

```typescript
// lib/achievements.ts
import { useUmami } from '@/components/UmamiAnalytics';

export async function unlockAchievement(
  walletAddress: string,
  achievementId: string
) {
  // ... unlock logic ...

  // Track achievement
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track('achievement_unlocked', {
      achievement: achievementId,
      wallet: walletAddress,
      rarity: achievement.rarity
    });
  }

  return result;
}
```

---

## 📈 Métricas Clave a Monitorear

### Funnel de Conversión
1. `wallet_connected` → Cuántos conectan wallet
2. `card_generated` → Cuántos generan card
3. `upgrade_modal_viewed` → Cuántos ven el modal de upgrade
4. `payment_success` → Cuántos pagan

**Conversion Rate = payment_success / wallet_connected**

### Engagement
1. `daily_checkin` → Usuarios activos diarios
2. `challenge_completed` → Engagement con gamification
3. `leaderboard_viewed` → Interés en competición
4. `referral_shared` → Viralidad

### Features Premium
1. `ai_coach_used` → Uso de AI (premium feature)
2. `token_scanned` → Uso de scanner (premium feature)
3. `nft_minted` → Minteo de NFTs (premium)

---

## 🎯 Goals & Funnels en Umami

En el dashboard de Umami, puedes configurar "Goals" para trackear conversiones:

1. **Goal: Payment**
   - Track event: `payment_success`
   - Value: amount en SOL

2. **Goal: Sign Up**
   - Track event: `wallet_connected`

3. **Goal: Engagement**
   - Track event: `daily_checkin`

---

## 🔍 Debugging

Para ver si Umami está funcionando:

```typescript
// En DevTools Console
console.log(window.umami); // Debe existir

// Manual test
window.umami.track('test_event', { test: true });
```

Luego ve a tu dashboard de Umami y busca el evento "test_event".

---

## 💡 Best Practices

1. **Nombres consistentes:** Usa snake_case (ej: `wallet_connected`, no `Wallet Connected`)
2. **Datos útiles:** Solo incluye datos que necesitas analizar
3. **No PII:** No envíes información personal identificable
4. **Async safe:** Verifica que `window.umami` existe antes de usar
5. **No bloquees UI:** Tracking no debe afectar UX

---

## 🚀 Próximos Pasos

1. Implementa tracking en eventos clave (wallet connect, card gen, payment)
2. Monitorea el dashboard de Umami diariamente
3. Identifica cuellos de botella en el funnel
4. Optimiza basado en datos reales

---

**Dashboard:** https://tu-umami.vercel.app
**Docs:** https://umami.is/docs
