import React from "react";

type Tier = "legend" | "icon" | "diamond" | "gold" | "silver" | "bronze";

interface Stat {
  label: string;
  value: number;
}

interface Props {
  rank?: number;
  username: string;
  avatarUrl?: string;
  overall: number;
  tier: Tier;
  stats: Stat[];
  smallText?: string;
  width?: number;
}

export default function DegenCard({
  rank = 1,
  username,
  avatarUrl,
  overall,
  tier,
  stats,
  smallText,
  width = 320
}: Props) {
  const tierLabel = {
    legend: "Legend",
    icon: "Icon",
    diamond: "Diamond",
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze"
  }[tier];

  // color per tier for small accents
  const accent = {
    legend: "from-pink-500 to-yellow-400",
    icon: "from-purple-600 to-pink-500",
    diamond: "from-cyan-400 to-indigo-500",
    gold: "from-yellow-400 to-orange-400",
    silver: "from-slate-300 to-gray-400",
    bronze: "from-amber-600 to-rose-500"
  }[tier];

  return (
    <div className="card-stack" style={{ width }}>
      {/* layered stack effect */}
      <div className="relative" aria-hidden>
        <div className="absolute -left-3 -top-3 w-full" style={{ transform: "scale(0.98)", zIndex: 0 }}>
          <div className="card-gradient-border" style={{ borderRadius: 20, padding: 6 }}>
            <div className="card-inner" style={{ opacity: 0.06 }} />
          </div>
        </div>
        <div className="absolute -left-6 -top-6 w-full" style={{ transform: "scale(0.96)", zIndex: 0 }}>
          <div className="card-gradient-border" style={{ borderRadius: 20, padding: 6 }}>
            <div className="card-inner" style={{ opacity: 0.03 }} />
          </div>
        </div>
      </div>

      {/* main card */}
      <div className="card-gradient-border card-frame" style={{ borderRadius: 20 }}>
        <div className="card-inner">
          {/* top row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">{overall}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full bg-white/6`}>{tierLabel}</div>
              </div>
              <div className="small-muted text-xs">Overall Rating</div>
            </div>

            <div className="text-right">
              <div className="w-20 h-20 rounded-full bg-white/6 overflow-hidden border border-white/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* handle */}
          <div className="mb-4">
            <div className="font-semibold">{username}</div>
            <div className="small-muted text-xs">0x...{String(Math.random()).slice(2,8)}</div>
          </div>

          {/* stats */}
          <div className="space-y-4 mb-6">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs small-muted">{s.label}</div>
                  <div className="text-xs font-semibold">{s.value}</div>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{ width: `${Math.max(6, s.value)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between mt-auto">
            <div className="small-muted text-xs">{smallText}</div>
            <div className="flex items-center gap-2">
              <div className={`rank-badge bg-gradient-to-br ${accent} text-black`}>#{rank}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}