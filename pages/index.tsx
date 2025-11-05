import Head from "next/head";
import DegenCard from "../components/DegenCard";

export default function Home() {
  const samples = [
    { username: "@CryptoGod_01", overall: 98, tier: "legend", smallText: "Rugs Survived: +$20M" },
    { username: "@SolanaWhaleHunter", overall: 96, tier: "icon", smallText: "Rugs Survived: +$630M" },
    { username: "@Diamond_HODL", overall: 94, tier: "diamond", smallText: "Total P&L: +$20M" },
  ];

  return (
    <div className="min-h-screen p-12">
      <Head>
        <title>DegenCard Leaderboard</title>
      </Head>

      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold">🏆 DegenCard Leaderboard Global - NFT Holders Only! ✨</h1>
        <p className="text-white/70 mt-2">The most elite Solana traders, immortalated on-chain.</p>
        <div className="mt-6">
          <a
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full text-black font-semibold"
            href="/api/generate-card?username=CryptoGod_01&overall=98&tier=legend"
          >
            Mint Your DegenCard Now & Appear Here! →
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {samples.map((s, i) => (
          <div key={i} className="flex justify-center">
            <DegenCard
              rank={i + 1}
              username={s.username}
              handle={s.username}
              overall={s.overall}
              tier={(s.tier as any)}
              stats={[
                { label: "Trading", value: 99 - i * 2 },
                { label: "Diamond H", value: 97 - i * 3 },
                { label: "Risk", value: 88 - i * 4 },
              ]}
              smallText={s.smallText}
              width={320}
              height={460}
            />
          </div>
        ))}
      </main>

      <footer className="max-w-4xl mx-auto text-center mt-12 text-white/60">
        Built quick — server-side PNG generator + React component. Run npm install && npm run dev
      </footer>
    </div>
  );
}
