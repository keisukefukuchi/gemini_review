import React from 'react';
import {
  BarChart,
  Bar,
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

interface TaskCountChartProps {
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  monthlyStats: MonthlyStat[];
  viewMode: 'day' | 'week' | 'month';
}

export const TaskCountChart: React.FC<TaskCountChartProps> = ({
  dailyStats,
  weeklyStats,
  monthlyStats,
  viewMode,
}) => {
  const data = useChartData({ dailyStats, weeklyStats, monthlyStats, viewMode });

  return (
    <div className="chart-container">
      <h3 className="chart-title">タスク数の推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'タスク数', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#10b981" name="完了" />
          <Bar dataKey="incomplete" fill="#ef4444" name="未完了" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
