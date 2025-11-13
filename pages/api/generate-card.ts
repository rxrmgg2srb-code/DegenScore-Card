import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas } from '@napi-rs/canvas';
import { isValidSolanaAddress } from '../../lib/helius';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para formatear SOL
function formatSOL(amount: number, decimals: number = 2): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(decimals)}B SOL`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(decimals)}M SOL`;
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(decimals)}K SOL`;
  return `${amount.toFixed(decimals)} SOL`;
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

    // Validación
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Solana wallet address' });
    }

    console.log(`🎨 Generating card image for: ${walletAddress}`);

    // Obtener métricas de la base de datos (ya calculadas)
    const card = await prisma.degenCard.findUnique({
      where: { walletAddress },
    });

    if (!card) {
      return res.status(404).json({
        error: 'Card not found. Please generate metrics first via /api/save-card'
      });
    }

    console.log(`✅ Found card in database with score: ${card.degenScore}`);

    // Generar imagen de la card con los datos de la BD
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
      isMinted: card.isMinted, // NUEVO: para controlar la marca de agua
    });

    // Retornar como PNG
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

/**
 * Genera la imagen de la card con los datos reales
 */
async function generateCardImage(
  walletAddress: string,
  metrics: any
): Promise<Buffer> {
  const width = 600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo degradado
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Título
  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DEGEN CARD', width / 2, 60);

  // Wallet address (truncada)
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`;
  ctx.fillText(shortAddress, width / 2, 100);

  // Degen Score - Grande y destacado
  const scoreColor = getScoreColor(metrics.degenScore);
  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 80px Arial';
  ctx.fillText(metrics.degenScore.toString(), width / 2, 190);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '20px Arial';
  ctx.fillText('DEGEN SCORE', width / 2, 220);

  // Línea divisoria
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 250);
  ctx.lineTo(width - 50, 250);
  ctx.stroke();

  // Métricas - Grid layout
  const startY = 290;
  const rowHeight = 70;
  const leftX = 120;
  const rightX = width - 120;

  ctx.textAlign = 'left';

  // Row 1: Total Trades | Win Rate
  drawMetric(ctx, 'TOTAL TRADES', metrics.totalTrades.toString(), leftX, startY, true);
  drawMetric(ctx, 'WIN RATE', `${metrics.winRate.toFixed(1)}%`, rightX, startY, false);

  // Row 2: Total Volume | P&L
  drawMetric(ctx, 'VOLUME', formatSOL(metrics.totalVolume, 1), leftX, startY + rowHeight, true);
  const pnlColor = metrics.profitLoss >= 0 ? '#00ff88' : '#ff4444';
  drawMetric(ctx, 'P&L', formatSOL(metrics.profitLoss, 2), rightX, startY + rowHeight, false, pnlColor);

  // Row 3: Best Trade | Worst Trade
  drawMetric(ctx, 'BEST TRADE', formatSOL(metrics.bestTrade, 2), leftX, startY + rowHeight * 2, true);
  drawMetric(ctx, 'WORST TRADE', formatSOL(metrics.worstTrade, 2), rightX, startY + rowHeight * 2, false);

  // Row 4: Avg Trade | Trading Days
  drawMetric(ctx, 'AVG TRADE', formatSOL(metrics.avgTradeSize, 2), leftX, startY + rowHeight * 3, true);
  drawMetric(ctx, 'ACTIVE DAYS', metrics.tradingDays.toString(), rightX, startY + rowHeight * 3, false);

  // Línea divisoria
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, startY + rowHeight * 4 + 20);
  ctx.lineTo(width - 50, startY + rowHeight * 4 + 20);
  ctx.stroke();

  // Footer - Rating
  const rating = getRating(metrics.degenScore);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(rating, width / 2, height - 80);

  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.fillText('Powered by Helius × Solana', width / 2, height - 40);

  // ============================================
  // MARCA DE AGUA (solo si NO está minteada)
  // ============================================
  if (!metrics.isMinted) {
    // Overlay semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Marca de agua diagonal
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6); // -30 grados

    // Sombra para el texto
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Texto de marca de agua principal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PREVIEW', 0, -20);

    ctx.font = 'bold 40px Arial';
    ctx.fillText('NOT MINTED', 0, 40);

    ctx.restore();

    // Badge "PREVIEW" en esquina superior derecha
    ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
    ctx.fillRect(width - 150, 30, 120, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PREVIEW', width - 90, 56);

    // Mensaje "Mint to remove watermark"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 Mint to remove watermark', width / 2, height - 15);
  } else {
    // Badge "MINTED" en esquina superior derecha (opcional)
    ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
    ctx.fillRect(width - 150, 30, 120, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓ MINTED', width - 90, 56);
  }

  return canvas.toBuffer('image/png');
}

/**
 * Dibuja una métrica individual
 */
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
  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.fillText(label, x, y);

  ctx.fillStyle = valueColor;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(value, x, y + 28);
}

/**
 * Obtiene color según el score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#00ff88';
  if (score >= 60) return '#00d4ff';
  if (score >= 40) return '#ffaa00';
  if (score >= 20) return '#ff6600';
  return '#ff4444';
}

/**
 * Obtiene rating basado en score
 */
function getRating(score: number): string {
  if (score >= 90) return '🔥 LEGENDARY DEGEN 🔥';
  if (score >= 75) return '⭐ MASTER DEGEN ⭐';
  if (score >= 60) return '💎 DIAMOND HANDS 💎';
  if (score >= 45) return '📈 DEGEN IN TRAINING 📈';
  if (score >= 30) return '🎲 CASUAL GAMBLER 🎲';
  if (score >= 15) return '🐟 SMALL FRY 🐟';
  return '😅 NGMI 😅';
}