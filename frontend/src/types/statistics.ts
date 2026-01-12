export interface DailyStat {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface WeeklyStat {
  week_start: string;
  week_end: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface MonthlyStat {
  month: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface Period {
  start_date: string;
  end_date: string;
}

export interface Summary {
  total_tasks: number;
  completed_tasks: number;
  incomplete_tasks: number;
  completion_rate: number;
}

export interface Statistics {
  period: Period;
  summary: Summary;
  daily_stats: DailyStat[];
  weekly_stats: WeeklyStat[];
  monthly_stats: MonthlyStat[];
}

export interface StatisticsSummary {
  period: string;
  total_tasks: number;
  completed_tasks: number;
  incomplete_tasks: number;
  completion_rate: number;
  average_daily_tasks: number | null;
  average_daily_completion_rate: number | null;
}
