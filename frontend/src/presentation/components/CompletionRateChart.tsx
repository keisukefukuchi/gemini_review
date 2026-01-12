import React from 'react';
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
import { format, parseISO } from 'date-fns';
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
  const formatDate = (dateStr: string, mode: string) => {
    const date = parseISO(dateStr);
    switch (mode) {
      case 'day':
        return format(date, 'M/d');
      case 'week':
        return format(date, 'M/d');
      case 'month':
        return dateStr; // YYYY-MM形式
      default:
        return dateStr;
    }
  };

  const getData = () => {
    switch (viewMode) {
      case 'day':
        return dailyStats.map((stat) => ({
          date: formatDate(stat.date, 'day'),
          completionRate: (stat.completion_rate * 100).toFixed(1),
        }));
      case 'week':
        return weeklyStats.map((stat) => ({
          date: formatDate(stat.week_start, 'week'),
          completionRate: (stat.completion_rate * 100).toFixed(1),
        }));
      case 'month':
        return monthlyStats.map((stat) => ({
          date: stat.month,
          completionRate: (stat.completion_rate * 100).toFixed(1),
        }));
      default:
        return [];
    }
  };

  const data = getData();

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
            formatter={(value: string) => [`${value}%`, '完了率']}
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
