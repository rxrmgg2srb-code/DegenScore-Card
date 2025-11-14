import confetti from 'canvas-confetti';

/**
 * Triggers a confetti explosion
 */
export function triggerConfetti(type: 'default' | 'premium' | 'legendary' = 'default') {
  switch (type) {
    case 'premium':
      // Premium unlock - fancy confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#a855f7', '#ec4899', '#06b6d4'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#a855f7', '#ec4899', '#06b6d4'],
        });
      }, 250);
      break;

    case 'legendary':
      // Legendary score - extreme confetti
      const count = 200;
      const defaults2 = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults2,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
          colors: ['#fbbf24', '#f59e0b', '#ff6b6b', '#4ecdc4'],
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
      break;

    default:
      // Default confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#ec4899'],
        zIndex: 9999,
      });
  }
}

/**
 * Triggers confetti for referral success
 */
export function triggerReferralConfetti() {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#10b981', '#34d399', '#6ee7b7'],
    zIndex: 9999,
  });

  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#10b981', '#34d399', '#6ee7b7'],
    zIndex: 9999,
  });
}
