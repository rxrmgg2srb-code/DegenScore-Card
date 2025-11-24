import { motion, Variants } from 'framer-motion';

interface RankChangeIndicatorProps {
  change: number; // Positive = up, negative = down
}

export const RankChangeIndicator = ({ change }: RankChangeIndicatorProps) => {
  if (change === 0) {
    return null;
  }

  const isUp = change > 0;
  const absChange = Math.abs(change);

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 120 as any,
        damping: 12 as any,
      },
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate={['show', 'pulse']}
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 ${
        isUp
          ? 'bg-green-500/20 border-green-500 text-green-400'
          : 'bg-red-500/20 border-red-500 text-red-400'
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        {isUp ? '↑' : '↓'}
        <span className="text-xs font-black leading-none">{absChange}</span>
      </div>
    </motion.div>
  );
};
