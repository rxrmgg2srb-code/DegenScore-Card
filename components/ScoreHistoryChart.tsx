import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { logger } from '../lib/logger';

interface ScoreHistoryData {
  timestamp: string;
  score: number;
  rank: number | null;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  badges: number;
}

interface ScoreHistoryResponse {
  walletAddress: string;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  dataPoints: number;
  history: ScoreHistoryData[];
  statistics: {
    current: number;
    max: number;
    min: number;
    average: number;
    change: number;
    changePercent: number;
    bestRank: number | null;
  };
}

interface ScoreHistoryChartProps {
  walletAddress: string;
  className?: string;
}

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function ScoreHistoryChart({ walletAddress, className = '' }: ScoreHistoryChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [data, setData] = useState<ScoreHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [walletAddress, selectedPeriod]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/score-history?walletAddress=${walletAddress}&days=${selectedPeriod}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch history');
      }

      setData(json);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Error fetching score history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Format data for recharts
  const chartData = data?.history.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    }),
    score: point.score,
    rank: point.rank,
    volume: point.totalVolume,
    winRate: point.winRate,
  })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-purple-500 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold mb-1">{data.date}</p>
          <p className="text-purple-400">Score: {data.score}</p>
          {data.rank && <p className="text-blue-400">Rank: #{data.rank}</p>}
          <p className="text-green-400">Win Rate: {data.winRate}%</p>
          <p className="text-yellow-400">Volume: ${data.volume.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-yellow-500 text-5xl mb-3">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">Sin Historial Disponible</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <p className="text-gray-500 text-xs">
            El historial se genera cada 6 horas para usuarios premium.
            <br />
            Intenta de nuevo más tarde.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { statistics } = data;
  const isPositiveChange = statistics.change >= 0;

  return (
    <div className={`bg-gray-800/50 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">📈 Evolución de Score</h3>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold gradient-text-gold">
              {statistics.current.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
              {isPositiveChange ? '↑' : '↓'}
              {Math.abs(statistics.change).toLocaleString()}
              <span className="text-xs">({statistics.changePercent > 0 ? '+' : ''}{statistics.changePercent}%)</span>
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          {PERIODS.map((period) => (
            <button
              key={period.days}
              onClick={() => setSelectedPeriod(period.days)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedPeriod === period.days
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Máximo</div>
          <div className="text-lg font-bold text-green-400">{statistics.max.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Mínimo</div>
          <div className="text-lg font-bold text-red-400">{statistics.min.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Promedio</div>
          <div className="text-lg font-bold text-blue-400">{statistics.average.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Mejor Rank</div>
          <div className="text-lg font-bold text-yellow-400">
            {statistics.bestRank ? `#${statistics.bestRank}` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900/30 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9945FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#9945FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Data points info */}
      <div className="mt-4 text-center text-xs text-gray-500">
        {data.dataPoints} puntos de datos • Actualizado cada 6 horas
      </div>
    </div>
  );
}
