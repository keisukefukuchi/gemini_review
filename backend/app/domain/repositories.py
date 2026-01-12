from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Tuple
from datetime import date
from app.domain.entities import Task


class TaskRepository(ABC):
    """タスクリポジトリインターフェース"""

    @abstractmethod
    def get_by_date(self, task_date: date, show_completed: bool = True) -> List[Task]:
        """日付でタスクを取得"""
        pass

    @abstractmethod
    def get_by_id(self, task_id: int) -> Optional[Task]:
        """IDでタスクを取得"""
        pass

    @abstractmethod
    def create(self, task: Task) -> Task:
        """タスクを作成"""
        pass

    @abstractmethod
    def update(self, task: Task) -> Task:
        """タスクを更新"""
        pass

    @abstractmethod
    def delete(self, task_id: int) -> None:
        """タスクを削除"""
        pass

    @abstractmethod
    def update_order(self, task_id: int, order_index: int) -> Task:
        """タスクの順序を更新"""
        pass

    @abstractmethod
    def get_statistics(
        self, start_date: date, end_date: date
    ) -> Dict[str, any]:
        """期間内の統計情報を取得"""
        pass

    @abstractmethod
    def get_daily_stats(
        self, start_date: date, end_date: date
    ) -> List[Tuple[date, int, int, float]]:
        """日別統計を取得 (date, total_tasks, completed_tasks, completion_rate)"""
        pass

    @abstractmethod
    def get_weekly_stats(
        self, start_date: date, end_date: date
    ) -> List[Tuple[date, date, int, int, float]]:
        """週別統計を取得 (week_start, week_end, total_tasks, completed_tasks, completion_rate)"""
        pass

    @abstractmethod
    def get_monthly_stats(
        self, start_date: date, end_date: date
    ) -> List[Tuple[str, int, int, float]]:
        """月別統計を取得 (month, total_tasks, completed_tasks, completion_rate)"""
        pass
