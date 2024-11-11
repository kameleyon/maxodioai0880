import { BarChart3, RefreshCw } from 'lucide-react';
import { useUsageStats } from '../../hooks/useUsageStats';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function TokenUsagePanel() {
  const { stats, isLoading, error, refreshStats } = useUsageStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-white/5 rounded-lg border border-white/10">
        <p className="text-red-400">Failed to load usage statistics</p>
        <button
          onClick={refreshStats}
          className="mt-4 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Usage */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Token Usage Overview</h2>
          <button
            onClick={refreshStats}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Refresh stats"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Monthly Characters Used</p>
              <p className="text-3xl font-bold">
                {stats.raw.current.charactersUsed.toLocaleString()}
              </p>
            </div>
            <p className="text-white/60">
              of {stats.raw.limits.charactersPerMonth.toLocaleString()} characters
            </p>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${stats.percentages.characters}%` }}
            />
          </div>
        </div>
      </div>

      {/* Usage History Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Usage History</h2>
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorCharacters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#63248d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#63248d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  dataKey="date"
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60' }}
                />
                <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff60' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Characters"
                  stroke="#63248d"
                  fillOpacity={1}
                  fill="url(#colorCharacters)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Usage by Category */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Usage by Category</h2>
        <div className="space-y-4">
          {stats.categories.map((category) => (
            <div
              key={category.name}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <span>{category.used.toLocaleString()} / {category.total.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-white/40 text-right">
        Last updated: {stats.lastUpdated}
      </div>
    </div>
  );
}
