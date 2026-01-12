import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DailyStat, WeeklyStat, MonthlyStat } from '../../types/statistics';
import { useChartData } from './useChartData';
import './ChartContainer.css';

interface CompletionRateChartProps {
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  monthlyStats: MonthlyStat[];
  viewMode: 'day' | 'week' | 'month';
}

export const CompletionRateChart: React.FC<CompletionRateChartProps> = ({
  dailyStats,
  weeklyStats,
  monthlyStats,
  viewMode,
}) => {
  const chartData = useChartData({ dailyStats, weeklyStats, monthlyStats, viewMode });
  
  const data = useMemo(() => chartData.map((item) => ({
    date: item.date,
    completionRate: item.completionRate,
  })), [chartData]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">完了率の推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            domain={[0, 100]}
            label={{ value: '完了率 (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, '完了率']}
            labelFormatter={(label) => `期間: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="completionRate"
            stroke="#667eea"
            strokeWidth={2}
            name="完了率"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
