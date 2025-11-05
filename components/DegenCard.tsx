import React from "react";

type Tier = "legend" | "icon" | "diamond" | "gold" | "silver" | "bronze";

interface Stat {
  label: string;
  value: number; // 0-100
}

interface DegenCardProps {
  rank?: number;
  username: string;
  handle?: string;
  avatarUrl?: string;
  overall: number; // 0-99
  tier: Tier;
  stats: Stat[]; // e.g. Trading, Diamond Hands, Risk, Strategy, Luck, Safety
  smallText?: string;
  width?: number; // px
  height?: number; // px
}

const TIER_GRADIENTS: Record<Tier, string> = {
  legend: "bg-gradient-to-br from-pink-500 via-yellow-400 to-green-400",
  icon: "bg-gradient-to-br from-purple-700 via-indigo-500 to-pink-500",
  diamond: "bg-gradient-to-br from-cyan-400 via-sky-600 to-indigo-700",
  gold: "bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600",
  silver: "bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500",
  bronze: "bg-gradient-to-br from-amber-700 via-orange-600 to-rose-600",
};

export default function DegenCard({
  rank = 1,
  username,
  handle,
  avatarUrl,
  overall,
  tier,
  stats,
  smallText,
  width = 360,
  height = 520,
}: DegenCardProps) {
  const tierLabel = {
    legend: "Legend",
    icon: "Icon",
    diamond: "Diamond",
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze",
  }[tier];

  return (
    <div
      className={`relative rounded-2xl shadow-2xl text-white p-5`}
      style={{ width, height }}
    >
      <div
        className={`absolute inset-0 rounded-2xl blur-sm opacity-50 ${TIER_GRADIENTS[tier]}`}
        style={{ transform: "scale(1.03)" }}
        aria-hidden
      />
      <div className="absolute inset-0 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm" />

      <div className="absolute -top-5 left-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
            #{rank}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold">{overall}</div>
            <div className="text-sm px-2 py-0.5 rounded-full bg-white/10">{tierLabel}</div>
          </div>
          <div className="text-xs text-white/70">Overall Rating</div>
        </div>

        <div className="flex flex-col items-end">
          <div
            className="w-20 h-20 rounded-full bg-white/10 overflow-hidden border border-white/20"
            title={username}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-2 text-right">
            <div className="font-semibold">{username}</div>
            {handle && <div className="text-xs text-white/60">{handle}</div>}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-28 text-xs text-white/70">{s.label}</div>
            <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${Math.max(2, s.value)}%`,
                  background: "linear-gradient(90deg,#34d399,#60a5fa)",
                }}
              />
            </div>
            <div className="w-8 text-right text-xs">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
        <div className="text-xs text-white/60">{smallText}</div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs">🏆</div>
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs">💎</div>
        </div>
      </div>
    </div>
  );
}
