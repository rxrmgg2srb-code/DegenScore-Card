import Head from "next/head";
import HeroButton from "../components/HeroButton";
import DegenCard from "../components/DegenCard";

export default function Home() {
  const samples = [
    { username: "@CryptoGod_01", overall: 98, tier: "legend", smallText: "Rugs Survived: +$20M" },
    { username: "@SolanaWhaleHunter", overall: 96, tier: "icon", smallText: "Rugs Survived: +$630M" },
    { username: "@Diamond_HODL", overall: 94, tier: "diamond", smallText: "Total P&L: +$20M" },
    { username: "@PaperHands", overall: 72, tier: "bronze", smallText: "Total P&L: -$1.2M" }
  ];

  return (
    <div className="min-h-screen pb-20">
      <Head>
        <title>DegenCard Leaderboard</title>
      </Head>

      <div className="max-w-6xl mx-auto px-6 pt-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold flex items-center justify-center gap-3">
            <span role="img" aria-label="trophy">🏆</span>
            DegenCard Leaderboard Global - NFT Holders Only! ✨
          </h1>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">The most elite Solana traders, immortalated on the blockchain.</p>
          <div className="mt-8">
            <HeroButton href="/api/generate-card" />
          </div>
        </header>

        <div className="relative">
          <div className="neon-streak" />
          <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* place first two large cards top-left and top-center like in the image */}
            <div className="col-span-1 flex justify-center">
              <DegenCard rank={1} username={samples[0].username} overall={samples[0].overall} tier="legend" stats={[{label:"Trading",value:99},{label:"Diamond H",value:97},{label:"Risk",value:88}]} smallText={samples[0].smallText} />
            </div>
            <div className="col-span-1 flex justify-center">
              <DegenCard rank={2} username={samples[1].username} overall={samples[1].overall} tier="icon" stats={[{label:"Trading",value:95},{label:"Diamond H",value:94},{label:"Risk",value:85}]} smallText={samples[1].smallText} />
            </div>
            <div className="col-span-1 flex justify-center">
              <DegenCard rank={3} username={samples[2].username} overall={samples[2].overall} tier="diamond" stats={[{label:"Trading",value:93},{label:"Diamond H",value:90},{label:"Risk",value:80}]} smallText={samples[2].smallText} />
            </div>

            {/* second row smaller / repeated */}
            <div className="col-span-1 flex justify-center">
              <DegenCard rank={4} username={samples[3].username} overall={samples[3].overall} tier="bronze" stats={[{label:"Trading",value:72},{label:"Diamond H",value:60},{label:"Risk",value:70}]} smallText={samples[3].smallText} />
            </div>
            <div className="col-span-2" />
          </main>
        </div>
      </div>
    </div>
  );
}