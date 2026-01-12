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
import { format, parseISO } from 'date-fns';
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
          total: stat.total_tasks,
          completed: stat.completed_tasks,
          incomplete: stat.total_tasks - stat.completed_tasks,
        }));
      case 'week':
        return weeklyStats.map((stat) => ({
          date: formatDate(stat.week_start, 'week'),
          total: stat.total_tasks,
          completed: stat.completed_tasks,
          incomplete: stat.total_tasks - stat.completed_tasks,
        }));
      case 'month':
        return monthlyStats.map((stat) => ({
          date: stat.month,
          total: stat.total_tasks,
          completed: stat.completed_tasks,
          incomplete: stat.total_tasks - stat.completed_tasks,
        }));
      default:
        return [];
    }
  };

  const data = getData();

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
