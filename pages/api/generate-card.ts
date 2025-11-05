import { NextApiRequest, NextApiResponse } from "next";
import { createCanvas } from "@napi-rs/canvas";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = req.query;
    const username = String(query.username || "DegenUser");
    const overall = Math.max(0, Math.min(99, Number(query.overall ?? 78)));
    const tier = String(query.tier || "diamond");
    const smallText = String(query.smallText || "Rugs Survived: +$0");

    const WIDTH = 1024;
    const HEIGHT = 1536;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Background
    const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bg.addColorStop(0, "#060612");
    bg.addColorStop(1, "#071226");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Card
    const cardW = 760;
    const cardH = 1100;
    const cardX = (WIDTH - cardW) / 2;
    const cardY = (HEIGHT - cardH) / 2;

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    // Glow by tier
    let g0 = "#34d399";
    if (tier === "legend") g0 = "#ff5fd6";
    if (tier === "icon") g0 = "#8b5cf6";
    if (tier === "gold") g0 = "#f59e0b";

    ctx.save();
    ctx.shadowColor = g0;
    ctx.shadowBlur = 80;
    ctx.fillStyle = g0;
    roundRect(cardX - 6, cardY - 6, cardW + 12, cardH + 12, 36);
    ctx.restore();

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundRect(cardX, cardY, cardW, cardH, 28);

    // Rank box
    ctx.fillStyle = "#ffd166";
    roundRect(cardX + 24, cardY - 30, 96, 60, 20);
    ctx.fillStyle = "#000";
    ctx.font = "bold 38px Sans";
    ctx.fillText("#1", cardX + 48, cardY + 10);

    // Overall & tier
    ctx.fillStyle = "#fff";
    ctx.font = "bold 72px Sans";
    ctx.fillText(String(overall), cardX + 40, cardY + 120);
    ctx.font = "20px Sans";
    ctx.fillText(String(tier).toUpperCase(), cardX + 40, cardY + 150);

    // Avatar circle
    const avatarX = cardX + cardW - 160;
    const avatarY = cardY + 40;
    const avatarSize = 120;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#222";
    ctx.fill();

    // Sample stats
    const statStartY = cardY + 260;
    const statLabels = ["Trading", "Diamond H", "Total P&L", "Risk"];
    ctx.font = "18px Sans";
    statLabels.forEach((label, i) => {
      const y = statStartY + i * 60;
      ctx.fillStyle = "#ffffffcc";
      ctx.fillText(label, cardX + 40, y);
      ctx.fillStyle = "#ffffff22";
      ctx.fillRect(cardX + 200, y - 18, 420, 18);
      ctx.fillStyle = "#34d399";
      ctx.fillRect(cardX + 200, y - 18, Math.round(420 * (0.6 + i * 0.05)), 18);
    });

    ctx.fillStyle = "#ffffff88";
    ctx.font = "16px Sans";
    ctx.fillText(smallText, cardX + 40, cardY + cardH - 60);

    const buffer = canvas.toBuffer("image/png");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to generate" });
  }
}
