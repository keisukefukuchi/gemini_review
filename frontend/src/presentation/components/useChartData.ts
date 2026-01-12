import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { DailyStat, WeeklyStat, MonthlyStat } from '../../types/statistics';

type ViewMode = 'day' | 'week' | 'month';

interface UseChartDataProps {
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  monthlyStats: MonthlyStat[];
  viewMode: ViewMode;
}

const formatDate = (dateStr: string, mode: string): string => {
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

export const useChartData = ({
  dailyStats,
  weeklyStats,
  monthlyStats,
  viewMode,
}: UseChartDataProps) => {
  const data = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return dailyStats.map((stat) => ({
          date: formatDate(stat.date, 'day'),
          total: stat.total_tasks,
          completed: stat.completed_tasks,
          incomplete: stat.total_tasks - stat.completed_tasks,
          completionRate: stat.completion_rate * 100,
        }));
      case 'week':
        return weeklyStats.map((stat) => ({
          date: formatDate(stat.week_start, 'week'),
          total: stat.total_tasks,
          completed: stat.completed_tasks,
          incomplete: stat.total_tasks - stat.completed_tasks,
          completionRate: stat.completion_rate * 100,
        }));
      case 'month':
        return monthlyStats.map((stat) => ({
          date: stat.month,
          total: stat.total_tasks,
          completed: stat.completed_tasks,
          incomplete: stat.total_tasks - stat.completed_tasks,
          completionRate: stat.completion_rate * 100,
        }));
      default:
        return [];
    }
  }, [dailyStats, weeklyStats, monthlyStats, viewMode]);

  return data;
};
