import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  type: 'card-generated' | 'premium-unlock' | 'achievement' | 'rank-up' | 'legendary';
  score?: number;
}

export function Celebration({ type, score }: CelebrationProps) {
  useEffect(() => {
    const triggerCelebration = () => {
      switch (type) {
        case 'legendary':
          // Epic celebration for LEGENDARY tier (90+)
          const duration = 3000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 7,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.6 },
              colors: ['#FFD700', '#FFA500', '#FF6347'],
            });
            confetti({
              particleCount: 7,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.6 },
              colors: ['#FFD700', '#FFA500', '#FF6347'],
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
          break;

        case 'card-generated':
          // Celebration based on score
          const tier = score
            ? score >= 90
              ? 'legendary'
              : score >= 80
              ? 'master'
              : score >= 70
              ? 'diamond'
              : 'default'
            : 'default';

          const colors: Record<string, string[]> = {
            legendary: ['#FFD700', '#FFA500', '#FF6347'],
            master: ['#F472B6', '#EC4899', '#DB2777'],
            diamond: ['#06B6D4', '#0891B2', '#0E7490'],
            default: ['#10B981', '#059669', '#047857'],
          };

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: colors[tier],
          });

          // Second burst
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors[tier],
            });
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors[tier],
            });
          }, 200);
          break;

        case 'premium-unlock':
          // Premium unlock celebration
          const count = 200;
          const defaults = {
            origin: { y: 0.7 },
            colors: ['#F472B6', '#EC4899', '#DB2777', '#A855F7', '#9333EA'],
          };

          const fire = (particleRatio: number, opts: any) => {
            confetti({
              ...defaults,
              ...opts,
              particleCount: Math.floor(count * particleRatio),
            });
          };

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

        case 'achievement':
          // Achievement unlock
          confetti({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.6 },
            colors: ['#10B981', '#059669', '#047857', '#34D399', '#6EE7B7'],
          });
          break;

        case 'rank-up':
          // Rank up celebration
          const colors_rank = ['#FFD700', '#FFA500', '#FBBF24', '#F59E0B'];
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: colors_rank,
            shapes: ['star'],
            scalar: 1.2,
          });
          break;
      }
    };

    triggerCelebration();
  }, [type, score]);

  return null;
}

// Utility function to trigger celebrations programmatically
export const celebrate = {
  cardGenerated: (score: number) => {
    const event = new CustomEvent('celebration', {
      detail: { type: 'card-generated', score },
    });
    window.dispatchEvent(event);
  },
  premiumUnlock: () => {
    const event = new CustomEvent('celebration', {
      detail: { type: 'premium-unlock' },
    });
    window.dispatchEvent(event);
  },
  achievement: () => {
    const event = new CustomEvent('celebration', {
      detail: { type: 'achievement' },
    });
    window.dispatchEvent(event);
  },
  rankUp: () => {
    const event = new CustomEvent('celebration', {
      detail: { type: 'rank-up' },
    });
    window.dispatchEvent(event);
  },
  legendary: () => {
    const event = new CustomEvent('celebration', {
      detail: { type: 'legendary' },
    });
    window.dispatchEvent(event);
  },
};
