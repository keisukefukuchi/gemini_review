import React from 'react';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import './PeriodSelector.css';

interface PeriodSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let newStartDate: Date;
    let newEndDate: Date = today;

    switch (preset) {
      case 'today':
        newStartDate = today;
        newEndDate = today;
        break;
      case 'week':
        newStartDate = startOfWeek(today, { weekStartsOn: 1 }); // 月曜日開始
        newEndDate = today;
        break;
      case 'month':
        newStartDate = startOfMonth(today);
        newEndDate = today;
        break;
      case 'last30days':
        newStartDate = subDays(today, 30);
        newEndDate = today;
        break;
      case 'last90days':
        newStartDate = subDays(today, 90);
        newEndDate = today;
        break;
      default:
        return;
    }

    onStartDateChange(format(newStartDate, 'yyyy-MM-dd'));
    onEndDateChange(format(newEndDate, 'yyyy-MM-dd'));
  };

  return (
    <div className="period-selector">
      <div className="period-presets">
        <button
          className="preset-button"
          onClick={() => handlePresetClick('today')}
        >
          今日
        </button>
        <button
          className="preset-button"
          onClick={() => handlePresetClick('week')}
        >
          今週
        </button>
        <button
          className="preset-button"
          onClick={() => handlePresetClick('month')}
        >
          今月
        </button>
        <button
          className="preset-button"
          onClick={() => handlePresetClick('last30days')}
        >
          過去30日
        </button>
        <button
          className="preset-button"
          onClick={() => handlePresetClick('last90days')}
        >
          過去90日
        </button>
      </div>
      <div className="period-dates">
        <div className="date-input-group">
          <label htmlFor="start-date">開始日</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="date-input"
          />
        </div>
        <span className="date-separator">〜</span>
        <div className="date-input-group">
          <label htmlFor="end-date">終了日</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="date-input"
          />
        </div>
      </div>
    </div>
  );
};
