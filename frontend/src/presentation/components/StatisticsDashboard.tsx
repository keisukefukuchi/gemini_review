import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { statisticsApi } from '../../services/api';
import { Statistics } from '../../types/statistics';
import { SummaryCards } from './SummaryCards';
import { PeriodSelector } from './PeriodSelector';
import { CompletionRateChart } from './CompletionRateChart';
import { TaskCountChart } from './TaskCountChart';
import './StatisticsDashboard.css';

type ViewMode = 'day' | 'week' | 'month';

export const StatisticsDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statisticsApi.getStatistics(startDate, endDate, viewMode);
      setStatistics(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setError('統計情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, viewMode]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <div className="statistics-dashboard">
      <h2 className="dashboard-title">統計・分析ダッシュボード</h2>

      <PeriodSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="view-mode-selector">
        <button
          className={`view-mode-button ${viewMode === 'day' ? 'active' : ''}`}
          onClick={() => setViewMode('day')}
        >
          日別
        </button>
        <button
          className={`view-mode-button ${viewMode === 'week' ? 'active' : ''}`}
          onClick={() => setViewMode('week')}
        >
          週別
        </button>
        <button
          className={`view-mode-button ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => setViewMode('month')}
        >
          月別
        </button>
      </div>

      {loading && <div className="loading">読み込み中...</div>}

      {error && <div className="error">{error}</div>}

      {statistics && !loading && (
        <>
          <SummaryCards summary={statistics.summary} />

          <CompletionRateChart
            dailyStats={statistics.daily_stats}
            weeklyStats={statistics.weekly_stats}
            monthlyStats={statistics.monthly_stats}
            viewMode={viewMode}
          />

          <TaskCountChart
            dailyStats={statistics.daily_stats}
            weeklyStats={statistics.weekly_stats}
            monthlyStats={statistics.monthly_stats}
            viewMode={viewMode}
          />
        </>
      )}

      {!statistics && !loading && !error && (
        <div className="empty-state">
          <p>データがありません</p>
        </div>
      )}
    </div>
  );
};
