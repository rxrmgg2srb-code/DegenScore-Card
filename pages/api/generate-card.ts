import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { isValidSolanaAddress } from '../../lib/services/helius';
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

// Configuración de tier basada en el score
function getTierConfig(score: number) {
  if (score >= 90) {
    return {
      name: 'LEGENDARY',
      emoji: '👑',
      colors: ['#ca8a04', '#fbbf24', '#fef08a'],
      borderColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.6)',
    };
  }
  if (score >= 80) {
    return {
      name: 'MASTER',
      emoji: '💎',
      colors: ['#db2777', '#a855f7', '#ec4899'],
      borderColor: '#ec4899',
      glowColor: 'rgba(236, 72, 153, 0.6)',
    };
  }
  if (score >= 70) {
    return {
      name: 'DIAMOND',
      emoji: '💠',
      colors: ['#2563eb', '#06b6d4', '#3b82f6'],
      borderColor: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.6)',
    };
  }
  if (score >= 60) {
    return {
      name: 'PLATINUM',
      emoji: '⚡',
      colors: ['#9ca3af', '#d1d5db', '#e5e7eb'],
      borderColor: '#9ca3af',
      glowColor: 'rgba(156, 163, 175, 0.6)',
    };
  }
  if (score >= 50) {
    return {
      name: 'GOLD',
      emoji: '🌟',
      colors: ['#ca8a04', '#eab308', '#facc15'],
      borderColor: '#eab308',
      glowColor: 'rgba(234, 179, 8, 0.4)',
    };
  }
  return {
    name: 'DEGEN',
    emoji: '🎮',
    colors: ['#059669', '#10b981', '#34d399'],
    borderColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  };
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
    console.log(`💎 Premium status: ${card.isPaid ? 'PREMIUM' : 'BASIC'}`);

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
  console.log('🎨 generateCardImage called with isPaid:', metrics.isPaid);
  
  // Si está pagado, usar estilo premium del leaderboard
  if (metrics.isPaid) {
    console.log('✅ Generating PREMIUM card...');
    try {
      const premiumBuffer = await generatePremiumCardImage(walletAddress, metrics);
      console.log('✅ Premium card generated successfully');
      return premiumBuffer;
    } catch (error) {
      console.error('❌ Error generating premium card:', error);
      console.log('⚠️ Falling back to basic card');
      return generateBasicCardImage(walletAddress, metrics);
    }
  }
  
  // Si NO está pagado, usar el estilo básico original
  console.log('📝 Generating BASIC card...');
  return generateBasicCardImage(walletAddress, metrics);
}

// 🔥 NUEVO: PREMIUM CARD ESTILO LEADERBOARD
async function generatePremiumCardImage(
  walletAddress: string,
  metrics: any
): Promise<Buffer> {
  const width = 600;
  const height = 1000; // ✅ Aumentado para más espacio
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const tier = getTierConfig(metrics.degenScore);

  // FONDO OSCURO
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, width, height);

  // PATRÓN DE FONDO CON GRADIENTE DEL TIER
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, tier.colors[0] + '20');
  bgGradient.addColorStop(0.5, tier.colors[1] + '10');
  bgGradient.addColorStop(1, tier.colors[2] + '20');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // BORDER CON GLOW
  ctx.shadowColor = tier.glowColor;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = tier.borderColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  let currentY = 80; // ✅ Empezar más arriba

  // FOTO DE PERFIL
  if (metrics.profileImage) {
    try {
      let imageUrl = metrics.profileImage;
      
      if (!imageUrl.startsWith('http')) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        imageUrl = `${baseUrl}${imageUrl}`;
      }
      
      const profileImg = await loadImage(imageUrl);
      
      const imgSize = 140;
      const imgX = width / 2;

      ctx.shadowColor = tier.glowColor;
      ctx.shadowBlur = 40;

      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, imgX - imgSize / 2, currentY - imgSize / 2, imgSize, imgSize);
      ctx.restore();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      ctx.strokeStyle = tier.borderColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      currentY += imgSize / 2 + 25;
      
    } catch (error) {
      console.error('⚠️ Error loading profile image:', error);
      const imgSize = 140;
      const imgX = width / 2;
      
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = tier.borderColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = tier.borderColor;
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', imgX, currentY);
      
      currentY += imgSize / 2 + 25;
    }
  } else {
    const imgSize = 140;
    const imgX = width / 2;
    
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = tier.borderColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(imgX, currentY, imgSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = tier.borderColor;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', imgX, currentY);
    
    currentY += imgSize / 2 + 25;
  }

  // NOMBRE
  if (metrics.displayName) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(metrics.displayName, width / 2, currentY);
    currentY += 40;
  }

  // WALLET ADDRESS
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`;
  ctx.fillText(shortAddress, width / 2, currentY);
  currentY += 35;

  // REDES SOCIALES
  if (metrics.twitter || metrics.telegram) {
    ctx.font = '14px Arial';
    ctx.fillStyle = tier.borderColor;
    
    const socials = [];
    if (metrics.twitter) socials.push(`🐦 @${metrics.twitter}`);
    if (metrics.telegram) socials.push(`✈️ @${metrics.telegram}`);
    
    ctx.fillText(socials.join('  •  '), width / 2, currentY);
    currentY += 45;
  } else {
    currentY += 20;
  }

  // DEGEN SCORE - GRANDE CON GRADIENTE
  const scoreGradient = ctx.createLinearGradient(
    width / 2 - 150,
    currentY,
    width / 2 + 150,
    currentY
  );
  scoreGradient.addColorStop(0, tier.colors[0]);
  scoreGradient.addColorStop(0.5, tier.colors[1]);
  scoreGradient.addColorStop(1, tier.colors[2]);
  
  ctx.fillStyle = scoreGradient;
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.shadowColor = tier.glowColor;
  ctx.shadowBlur = 40;
  ctx.fillText(metrics.degenScore.toString(), width / 2, currentY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  currentY += 65;

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 16px Arial';
  ctx.letterSpacing = '3px';
  ctx.fillText('DEGEN SCORE', width / 2, currentY);
  currentY += 35;

  // 🔥 FRASE FOMO
  const fomoPhrase = getFOMOPhrase(metrics.degenScore);
  
  const fomoBgGradient = ctx.createLinearGradient(0, currentY - 20, width, currentY + 20);
  fomoBgGradient.addColorStop(0, 'rgba(234, 179, 8, 0.1)');
  fomoBgGradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.2)');
  fomoBgGradient.addColorStop(1, 'rgba(234, 179, 8, 0.1)');
  ctx.fillStyle = fomoBgGradient;
  
  ctx.font = 'bold 13px Arial';
  const fomoTextWidth = ctx.measureText(fomoPhrase).width;
  ctx.fillRect(width / 2 - fomoTextWidth / 2 - 20, currentY - 18, fomoTextWidth + 40, 36);
  
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(width / 2 - fomoTextWidth / 2 - 20, currentY - 18, fomoTextWidth + 40, 36);
  
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(fomoPhrase, width / 2, currentY);
  currentY += 40;

  // TIER BADGE
  const badgeGradient = ctx.createLinearGradient(
    width / 2 - 100,
    currentY,
    width / 2 + 100,
    currentY
  );
  badgeGradient.addColorStop(0, tier.colors[0]);
  badgeGradient.addColorStop(0.5, tier.colors[1]);
  badgeGradient.addColorStop(1, tier.colors[2]);
  
  ctx.fillStyle = badgeGradient;
  const badgeWidth = 200;
  const badgeHeight = 40;
  const badgeX = width / 2 - badgeWidth / 2;
  const badgeY = currentY - badgeHeight / 2;
  const radius = 20;
  
  ctx.beginPath();
  ctx.moveTo(badgeX + radius, badgeY);
  ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
  ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
  ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight);
  ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
  ctx.lineTo(badgeX, badgeY + radius);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${tier.emoji} ${tier.name}`, width / 2, currentY);
  currentY += 50;

  // LÍNEA DIVISORIA
  const lineGradient = ctx.createLinearGradient(60, currentY, width - 60, currentY);
  lineGradient.addColorStop(0, 'transparent');
  lineGradient.addColorStop(0.5, tier.borderColor);
  lineGradient.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, currentY);
  ctx.lineTo(width - 60, currentY);
  ctx.stroke();
  currentY += 40;

  // MÉTRICAS - 2x2 GRID con más espacio
  const rowHeight = 75;
  const leftX = 120;
  const rightX = width - 120;

  drawPremiumMetric(ctx, 'TRADES', metrics.totalTrades.toString(), leftX, currentY, true, tier.borderColor);
  drawPremiumMetric(ctx, 'WIN RATE', `${metrics.winRate.toFixed(1)}%`, rightX, currentY, false, tier.borderColor);
  currentY += rowHeight;

  drawPremiumMetric(ctx, 'VOLUME', `${formatSOL(metrics.totalVolume, 1)} SOL`, leftX, currentY, true, tier.borderColor);
  const pnlColor = metrics.profitLoss >= 0 ? '#10b981' : '#ef4444';
  drawPremiumMetric(ctx, 'P&L', `${formatSOL(metrics.profitLoss, 2)} SOL`, rightX, currentY, false, pnlColor);
  currentY += rowHeight;

  drawPremiumMetric(ctx, 'BEST TRADE', `${formatSOL(metrics.bestTrade, 2)} SOL`, leftX, currentY, true, tier.borderColor);
  drawPremiumMetric(ctx, 'WORST TRADE', `${formatSOL(metrics.worstTrade, 2)} SOL`, rightX, currentY, false, tier.borderColor);
  currentY += rowHeight;

  drawPremiumMetric(ctx, 'AVG TRADE', `${formatSOL(metrics.avgTradeSize, 2)} SOL`, leftX, currentY, true, tier.borderColor);
  drawPremiumMetric(ctx, 'ACTIVE DAYS', metrics.tradingDays.toString(), rightX, currentY, false, tier.borderColor);
  currentY += 60;

  // FOOTER
  ctx.fillStyle = '#6b7280';
  ctx.font = '13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Powered by Helius × Solana', width / 2, currentY);

  return canvas.toBuffer('image/png');
}

// Función para dibujar métricas premium
function drawPremiumMetric(
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
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 10px Arial';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(label, x, y);

  ctx.fillStyle = valueColor;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(value, x, y + 30);
}

// ✅ ORIGINAL: BASIC CARD (SIN PAGAR)
async function generateBasicCardImage(
  walletAddress: string,
  metrics: any
): Promise<Buffer> {
  const width = 600;
  const height = 950;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // FONDO DEGRADADO BÁSICO
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0a0e1a');
  gradient.addColorStop(0.5, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // BORDER BÁSICO
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  let currentY = 90;

  // TÍTULO
  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DEGEN CARD', width / 2, currentY);
  currentY += 55;

  // WALLET ADDRESS
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`;
  ctx.fillText(shortAddress, width / 2, currentY);
  currentY += 60;

  // DEGEN SCORE
  const scoreColor = getScoreColor(metrics.degenScore);
  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 110px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
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

  // FRASE FOMO
  const fomoPhrase = getFOMOPhrase(metrics.degenScore);
  
  ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
  const textWidth = ctx.measureText(fomoPhrase).width;
  ctx.fillRect(width / 2 - textWidth / 2 - 20, currentY - 18, textWidth + 40, 36);
  
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

  // METRICAS
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

  // FOOTER
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
  if (score >= 90) return '#FFD700';
  if (score >= 80) return '#00ff88';
  if (score >= 60) return '#00d4ff';
  if (score >= 40) return '#ffaa00';
  if (score >= 20) return '#ff6600';
  return '#ff4444';
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