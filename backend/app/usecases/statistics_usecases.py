from typing import Dict, List, Tuple, Any
from datetime import date, timedelta
from app.domain.repositories import TaskRepository


class GetStatisticsUseCase:
    """統計情報取得ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(
        self, start_date: date, end_date: date, group_by: str = "day"
    ) -> Dict[str, Any]:
        """統計情報を取得"""
        # サマリー情報を取得
        summary = self.repository.get_statistics(start_date, end_date)

        # group_by に応じて必要な統計データのみ取得
        daily_stats = []
        weekly_stats = []
        monthly_stats = []

        if group_by == "day":
            daily_stats = self.repository.get_daily_stats(start_date, end_date)
        elif group_by == "week":
            weekly_stats = self.repository.get_weekly_stats(start_date, end_date)
        elif group_by == "month":
            monthly_stats = self.repository.get_monthly_stats(start_date, end_date)
        else:
            # デフォルトまたは "all" の場合はすべて取得
            daily_stats = self.repository.get_daily_stats(start_date, end_date)
            weekly_stats = self.repository.get_weekly_stats(start_date, end_date)
            monthly_stats = self.repository.get_monthly_stats(start_date, end_date)

        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
            },
            "summary": summary,
            "daily_stats": [
                {
                    "date": stat_date,
                    "total_tasks": total,
                    "completed_tasks": completed,
                    "completion_rate": completion_rate,
                }
                for stat_date, total, completed, completion_rate in daily_stats
            ],
            "weekly_stats": [
                {
                    "week_start": week_start,
                    "week_end": week_end,
                    "total_tasks": total,
                    "completed_tasks": completed,
                    "completion_rate": completion_rate,
                }
                for week_start, week_end, total, completed, completion_rate in weekly_stats
            ],
            "monthly_stats": [
                {
                    "month": month,
                    "total_tasks": total,
                    "completed_tasks": completed,
                    "completion_rate": completion_rate,
                }
                for month, total, completed, completion_rate in monthly_stats
            ],
        }


class GetStatisticsSummaryUseCase:
    """統計サマリー取得ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(self, period: str = "all") -> Dict[str, Any]:
        """統計サマリーを取得"""
        today = date.today()

        if period == "today":
            start_date = today
            end_date = today
        elif period == "week":
            # 今週の月曜日から今日まで
            days_since_monday = today.weekday()
            start_date = today - timedelta(days=days_since_monday)
            end_date = today
        elif period == "month":
            # 今月の1日から今日まで
            start_date = date(today.year, today.month, 1)
            end_date = today
        else:  # "all"
            # 過去1年分を取得（コメントと実装を一致させる）
            start_date = date(today.year - 1, 1, 1)
            end_date = today

        # daily_stats からサマリー情報を計算（1回のDBアクセスで済む）
        daily_stats = self.repository.get_daily_stats(start_date, end_date)
        
        if daily_stats:
            # daily_stats からサマリー情報を計算
            total_tasks = sum(total for _, total, _, _ in daily_stats)
            completed_tasks = sum(completed for _, _, completed, _ in daily_stats)
            incomplete_tasks = total_tasks - completed_tasks
            completion_rate = (
                completed_tasks / total_tasks if total_tasks > 0 else 0.0
            )
            
            # 平均値を計算
            total_days = len(daily_stats)
            average_daily_tasks = sum(total for _, total, _, _ in daily_stats) / total_days
            average_daily_completion_rate = (
                sum(completion_rate for _, _, _, completion_rate in daily_stats)
                / total_days
            )
        else:
            total_tasks = 0
            completed_tasks = 0
            incomplete_tasks = 0
            completion_rate = 0.0
            average_daily_tasks = 0.0
            average_daily_completion_rate = 0.0

        return {
            "period": period,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "incomplete_tasks": incomplete_tasks,
            "completion_rate": completion_rate,
            "average_daily_tasks": average_daily_tasks,
            "average_daily_completion_rate": average_daily_completion_rate,
        }
