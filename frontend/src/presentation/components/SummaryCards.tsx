import React from 'react';
import { Summary } from '../../types/statistics';
import './SummaryCards.css';

interface SummaryCardsProps {
  summary: Summary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const completionRatePercent = (summary.completion_rate * 100).toFixed(1);

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="summary-card-label">総タスク数</div>
        <div className="summary-card-value">{summary.total_tasks}</div>
      </div>
      <div className="summary-card">
        <div className="summary-card-label">完了タスク数</div>
        <div className="summary-card-value completed">
          {summary.completed_tasks}
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-card-label">未完了タスク数</div>
        <div className="summary-card-value incomplete">
          {summary.incomplete_tasks}
        </div>
      </div>
      <div className="summary-card highlight">
        <div className="summary-card-label">完了率</div>
        <div className="summary-card-value completion-rate">
          {completionRatePercent}%
        </div>
      </div>
    </div>
  );
};
