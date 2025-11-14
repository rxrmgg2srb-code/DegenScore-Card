import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { isValidSolanaAddress } from '../../lib/helius';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para formatear SOL
function formatSOL(amount: number, decimals: number = 2): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(decimals)}B`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(decimals)}M`;
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(decimals)}K`;
  return `${amount.toFixed(decimals)}`;
}

// 🔥 FRASES FOMO ÉPICAS
function getFOMOPhrase(score: number): string {
  if (score >= 95) return "🔥 GOD MODE - They Bow to You";
  if (score >= 90) return "👑 APEX PREDATOR - Pure Domination";
  if (score >= 85) return "💎 GENERATIONAL WEALTH - GG EZ";
  if (score >= 80) return "⚡ MAIN CHARACTER - Eating Good";
  if (score >= 75) return "🚀 MOON MISSION - Keep Stacking";
  if (score >= 70) return "🔥 KILLING IT - Above Average Chad";
  if (score >= 65) return "💪 SOLID - You'll Make It Anon";
  if (score >= 60) return "📈 MID CURVE - Touch Grass King";
  if (score >= 55) return "🎯 SLIGHTLY MID - Do Better";
  if (score >= 50) return "😬 NGMI VIBES - Yikes";
  if (score >= 40) return "📉 EXIT LIQUIDITY - That's You";
  if (score >= 30) return "💀 ABSOLUTELY COOKED - RIP";
  if (score >= 20) return "🤡 CIRCUS CLOWN - Everyone's Laughing";
  if (score >= 10) return "⚰️ DELETE APP - Uninstall Now";
  return "🪦 QUIT FOREVER - It's Over Bro";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Solana wallet address' });
    }

    console.log(`🎨 Generating card image for: ${walletAddress}`);

    const card = await prisma.degenCard.findUnique({
      where: { walletAddress },
    });

    if (!card) {
      return res.status(404).json({
        error: 'Card not found. Please generate metrics first via /api/save-card'
      });
    }

    console.log(`✅ Found card in database with score: ${card.degenScore}`);

    const imageBuffer = await generateCardImage(walletAddress, {
      degenScore: card.degenScore,
      totalTrades: card.totalTrades,
      totalVolume: card.totalVolume,
      profitLoss: card.profitLoss,
      winRate: card.winRate,
      bestTrade: card.bestTrade,
      worstTrade: card.worstTrade,
      avgTradeSize: card.avgTradeSize,
      tradingDays: card.tradingDays,
      isMinted: card.isMinted,
      displayName: card.displayName,
      twitter: card.twitter,
      telegram: card.telegram,
      profileImage: card.profileImage,
      isPaid: card.isPaid,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('❌ Error generating card:', error);
    res.status(500).json({
      error: 'Failed to generate card',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateCardImage(
  walletAddress: string,
  metrics: any
): Promise<Buffer> {
  const width = 600;
  const height = 950; // Aumentado para más espacio
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // FONDO DEGRADADO
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0a0e1a');
  gradient.addColorStop(0.5, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // BORDER
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // BADGE PREMIUM
  if (metrics.isPaid) {
    const badgeX = width - 150;
    const badgeY = 35;
    
    const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX + 120, badgeY + 40);
    badgeGradient.addColorStop(0, '#00d4ff');
    badgeGradient.addColorStop(1, '#0099cc');
    ctx.fillStyle = badgeGradient;
    
    // Rounded rectangle
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(badgeX + radius, badgeY);
    ctx.lineTo(badgeX + 120 - radius, badgeY);
    ctx.quadraticCurveTo(badgeX + 120, badgeY, badgeX + 120, badgeY + radius);
    ctx.lineTo(badgeX + 120, badgeY + 40 - radius);
    ctx.quadraticCurveTo(badgeX + 120, badgeY + 40, badgeX + 120 - radius, badgeY + 40);
    ctx.lineTo(badgeX + radius, badgeY + 40);
    ctx.quadraticCurveTo(badgeX, badgeY + 40, badgeX, badgeY + 40 - radius);
    ctx.lineTo(badgeX, badgeY + radius);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ PREMIUM', badgeX + 60, badgeY + 20);
  }

  let currentY = 90;

  // FOTO DE PERFIL
  const hasProfile = metrics.isPaid && (metrics.profileImage || metrics.displayName);
  let profileImageLoaded = false;

  if (metrics.isPaid && metrics.profileImage) {
    try {
      let imageUrl = metrics.profileImage;
      
      if (!imageUrl.startsWith('http')) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        imageUrl = `${baseUrl}${imageUrl}`;
      }
      
      console.log('📸 Loading profile image from:', imageUrl);
      const profileImg = await loadImage(imageUrl);
      
      const imgSize = 140;
      const imgX = width / 2;

      ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
      ctx.shadowBlur = 25;

      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, imgX - imgSize / 2, currentY - imgSize / 2, imgSize, imgSize);
      ctx.restore();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      profileImageLoaded = true;
      console.log('✅ Profile image loaded');
      
      currentY += imgSize / 2 + 20;
      
    } catch (error) {
      console.error('⚠️ Error loading profile image:', error);
    }
  }

  // PLACEHOLDER si falla la imagen
  if (metrics.isPaid && !profileImageLoaded && hasProfile) {
    const imgSize = 140;
    const imgX = width / 2;
    
    ctx.fillStyle = '#2a2a3e';
    ctx.beginPath();
    ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', imgX, currentY);
    
    currentY += imgSize / 2 + 20;
  }

  if (!hasProfile) {
    currentY = 60;
  }

  // NOMBRE O TITULO
  if (metrics.isPaid && metrics.displayName) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(metrics.displayName, width / 2, currentY);
    currentY += 50;
  } else {
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEGEN CARD', width / 2, currentY);
    currentY += 55;
  }

  // WALLET ADDRESS
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`;
  ctx.fillText(shortAddress, width / 2, currentY);
  currentY += 35;

  // REDES SOCIALES
  if (metrics.isPaid && (metrics.twitter || metrics.telegram)) {
    ctx.font = '15px Arial';
    ctx.fillStyle = '#00d4ff';
    
    const socials = [];
    if (metrics.twitter) socials.push(`🐦 @${metrics.twitter}`);
    if (metrics.telegram) socials.push(`✈️ @${metrics.telegram}`);
    
    ctx.fillText(socials.join('  •  '), width / 2, currentY);
    currentY += 50;
  } else {
    currentY += 25;
  }

  // DEGEN SCORE - MÁS GRANDE Y DESTACADO
  const scoreColor = getScoreColor(metrics.degenScore);
  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 110px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Sombra al score
  ctx.shadowColor = scoreColor;
  ctx.shadowBlur = 30;
  ctx.fillText(metrics.degenScore.toString(), width / 2, currentY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  currentY += 75;

  ctx.fillStyle = '#aaaaaa';
  ctx.font = 'bold 20px Arial';
  ctx.letterSpacing = '2px';
  ctx.fillText('DEGEN SCORE', width / 2, currentY);
  currentY += 40;

  // 🔥 FRASE FOMO - MÁS DESTACADA
  const fomoPhrase = getFOMOPhrase(metrics.degenScore);
  
  // Background para la frase
  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
  const textWidth = ctx.measureText(fomoPhrase).width;
  ctx.fillRect(width / 2 - textWidth / 2 - 20, currentY - 18, textWidth + 40, 36);
  
  // Texto de la frase
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 17px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(fomoPhrase, width / 2, currentY);
  currentY += 50;

  // LINEA DIVISORIA
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, currentY);
  ctx.lineTo(width - 60, currentY);
  ctx.stroke();
  currentY += 40;

  // METRICAS - MÁS ESPACIADAS
  const rowHeight = 85;
  const leftX = 140;
  const rightX = width - 140;

  ctx.textAlign = 'left';

  drawMetric(ctx, 'TOTAL TRADES', metrics.totalTrades.toString(), leftX, currentY, true);
  drawMetric(ctx, 'WIN RATE', `${metrics.winRate.toFixed(1)}%`, rightX, currentY, false);
  currentY += rowHeight;

  drawMetric(ctx, 'VOLUME', `${formatSOL(metrics.totalVolume, 1)} SOL`, leftX, currentY, true);
  const pnlColor = metrics.profitLoss >= 0 ? '#00ff88' : '#ff4444';
  drawMetric(ctx, 'P&L', `${formatSOL(metrics.profitLoss, 2)} SOL`, rightX, currentY, false, pnlColor);
  currentY += rowHeight;

  drawMetric(ctx, 'BEST TRADE', `${formatSOL(metrics.bestTrade, 2)} SOL`, leftX, currentY, true);
  drawMetric(ctx, 'WORST TRADE', `${formatSOL(metrics.worstTrade, 2)} SOL`, rightX, currentY, false);
  currentY += rowHeight;

  drawMetric(ctx, 'AVG TRADE', `${formatSOL(metrics.avgTradeSize, 2)} SOL`, leftX, currentY, true);
  drawMetric(ctx, 'ACTIVE DAYS', metrics.tradingDays.toString(), rightX, currentY, false);
  currentY += 60;

  // LINEA DIVISORIA
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, currentY);
  ctx.lineTo(width - 60, currentY);
  ctx.stroke();
  currentY += 50;

  // FOOTER - RATING
  const rating = getRating(metrics.degenScore);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(rating, width / 2, currentY);
  currentY += 50;

  ctx.fillStyle = '#777777';
  ctx.font = '15px Arial';
  ctx.fillText('Powered by Helius × Solana', width / 2, currentY);

  return canvas.toBuffer('image/png');
}

function drawMetric(
  ctx: any,
  label: string,
  value: string,
  x: number,
  y: number,
  alignLeft: boolean = true,
  valueColor: string = '#ffffff'
) {
  const alignment = alignLeft ? 'left' : 'right';

  ctx.textAlign = alignment;
  ctx.fillStyle = '#999999';
  ctx.font = 'bold 13px Arial';
  ctx.letterSpacing = '1px';
  ctx.fillText(label, x, y);

  ctx.fillStyle = valueColor;
  ctx.font = 'bold 26px Arial';
  ctx.fillText(value, x, y + 32);
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#FFD700'; // Dorado
  if (score >= 80) return '#00ff88'; // Verde brillante
  if (score >= 60) return '#00d4ff'; // Cyan
  if (score >= 40) return '#ffaa00'; // Naranja
  if (score >= 20) return '#ff6600'; // Naranja oscuro
  return '#ff4444'; // Rojo
}

function getRating(score: number): string {
  if (score >= 90) return '🔥 LEGENDARY DEGEN 🔥';
  if (score >= 75) return '⭐ MASTER DEGEN ⭐';
  if (score >= 60) return '💎 DIAMOND HANDS 💎';
  if (score >= 45) return '📈 DEGEN IN TRAINING 📈';
  if (score >= 30) return '🎲 CASUAL GAMBLER 🎲';
  if (score >= 15) return '🐟 SMALL FRY 🐟';
  return '😅 NGMI 😅';
}