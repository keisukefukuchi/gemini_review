from typing import List, Optional, Dict, Tuple, Any
from datetime import date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, Integer, extract
from app.domain.entities import Task
from app.domain.repositories import TaskRepository
from app.infrastructure.models import TaskModel


class SQLAlchemyTaskRepository(TaskRepository):
    """SQLAlchemyを使用したタスクリポジトリ実装"""

    def __init__(self, db: Session):
        self.db = db

    def _to_entity(self, model: TaskModel) -> Task:
        """データベースモデルをエンティティに変換"""
        return Task(
            id=model.id,
            date=model.date,
            title=model.title,
            memo=model.memo,
            deadline=model.deadline,
            completed=model.completed,
            order_index=model.order_index,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Task) -> TaskModel:
        """エンティティをデータベースモデルに変換"""
        if entity.id == 0:
            # 新規作成
            return TaskModel(
                date=entity.date,
                title=entity.title,
                memo=entity.memo,
                deadline=entity.deadline,
                completed=entity.completed,
                order_index=entity.order_index,
            )
        else:
            # 更新
            model = self.db.query(TaskModel).filter(TaskModel.id == entity.id).first()
            if model:
                model.date = entity.date
                model.title = entity.title
                model.memo = entity.memo
                model.deadline = entity.deadline
                model.completed = entity.completed
                model.order_index = entity.order_index
            return model

    def get_by_date(self, task_date: date, show_completed: bool = True) -> List[Task]:
        """日付でタスクを取得"""
        query = self.db.query(TaskModel).filter(TaskModel.date == task_date)
        if not show_completed:
            query = query.filter(TaskModel.completed == False)
        tasks = query.order_by(TaskModel.order_index).all()
        return [self._to_entity(task) for task in tasks]

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """IDでタスクを取得"""
        task = self.db.query(TaskModel).filter(TaskModel.id == task_id).first()
        return self._to_entity(task) if task else None

    def create(self, task: Task) -> Task:
        """タスクを作成"""
        model = self._to_model(task)
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        entity = self._to_entity(model)
        # created_atとupdated_atを設定
        entity.created_at = model.created_at
        entity.updated_at = model.updated_at
        return entity

    def update(self, task: Task) -> Task:
        """タスクを更新"""
        model = self._to_model(task)
        self.db.commit()
        self.db.refresh(model)
        entity = self._to_entity(model)
        # updated_atを更新
        entity.updated_at = model.updated_at
        return entity

    def delete(self, task_id: int) -> None:
        """タスクを削除"""
        task = self.db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if task:
            self.db.delete(task)
            self.db.commit()

    def update_order(self, task_id: int, order_index: int) -> Task:
        """タスクの順序を更新"""
        task = self.db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if not task:
            raise ValueError(f"Task with id {task_id} not found")
        task.order_index = order_index
        self.db.commit()
        self.db.refresh(task)
        return self._to_entity(task)

    def get_statistics(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """期間内の統計情報を取得"""
        # 総タスク数、完了タスク数、未完了タスク数を取得
        total_tasks = (
            self.db.query(TaskModel)
            .filter(and_(TaskModel.date >= start_date, TaskModel.date <= end_date))
            .count()
        )
        completed_tasks = (
            self.db.query(TaskModel)
            .filter(
                and_(
                    TaskModel.date >= start_date,
                    TaskModel.date <= end_date,
                    TaskModel.completed == True,
                )
            )
            .count()
        )
        incomplete_tasks = total_tasks - completed_tasks
        completion_rate = (
            completed_tasks / total_tasks if total_tasks > 0 else 0.0
        )

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "incomplete_tasks": incomplete_tasks,
            "completion_rate": completion_rate,
        }

    def get_daily_stats(
        self, start_date: date, end_date: date
    ) -> List[Tuple[date, int, int, float]]:
        """日別統計を取得"""
        stats = (
            self.db.query(
                TaskModel.date,
                func.count(TaskModel.id).label("total_tasks"),
                func.sum(func.cast(TaskModel.completed, Integer)).label(
                    "completed_tasks"
                ),
            )
            .filter(and_(TaskModel.date >= start_date, TaskModel.date <= end_date))
            .group_by(TaskModel.date)
            .order_by(TaskModel.date)
            .all()
        )

        result = []
        for stat_date, total, completed in stats:
            completed_count = completed if completed is not None else 0
            completion_rate = (completed_count / total) if total > 0 else 0.0
            result.append((stat_date, total, completed_count, completion_rate))

        return result

    def get_weekly_stats(
        self, start_date: date, end_date: date
    ) -> List[Tuple[date, date, int, int, float]]:
        """週別統計を取得"""

        # 週の開始日を計算（月曜日を週の開始とする）
        stats = (
            self.db.query(
                TaskModel.date,
                func.count(TaskModel.id).label("total_tasks"),
                func.sum(func.cast(TaskModel.completed, Integer)).label(
                    "completed_tasks"
                ),
            )
            .filter(and_(TaskModel.date >= start_date, TaskModel.date <= end_date))
            .group_by(TaskModel.date)
            .order_by(TaskModel.date)
            .all()
        )

        # 週ごとに集計
        weekly_data: Dict[Tuple[int, int], Dict[str, Any]] = {}
        for stat_date, total, completed in stats:
            # ISO週番号を取得
            iso_year, iso_week, _ = stat_date.isocalendar()
            week_key = (iso_year, iso_week)

            if week_key not in weekly_data:
                # 週の開始日（月曜日）を計算
                days_since_monday = stat_date.weekday()
                week_start = stat_date - timedelta(days=days_since_monday)
                week_end = week_start + timedelta(days=6)
                weekly_data[week_key] = {
                    "week_start": week_start,
                    "week_end": week_end,
                    "total_tasks": 0,
                    "completed_tasks": 0,
                }

            weekly_data[week_key]["total_tasks"] += total
            weekly_data[week_key]["completed_tasks"] += completed

        result = []
        for week_key in sorted(weekly_data.keys()):
            data = weekly_data[week_key]
            completion_rate = (
                (data["completed_tasks"] / data["total_tasks"])
                if data["total_tasks"] > 0
                else 0.0
            )
            result.append(
                (
                    data["week_start"],
                    data["week_end"],
                    data["total_tasks"],
                    data["completed_tasks"],
                    completion_rate,
                )
            )

        return result

    def get_monthly_stats(
        self, start_date: date, end_date: date
    ) -> List[Tuple[str, int, int, float]]:
        """月別統計を取得"""

        stats = (
            self.db.query(
                extract("year", TaskModel.date).label("year"),
                extract("month", TaskModel.date).label("month"),
                func.count(TaskModel.id).label("total_tasks"),
                func.sum(func.cast(TaskModel.completed, Integer)).label(
                    "completed_tasks"
                ),
            )
            .filter(and_(TaskModel.date >= start_date, TaskModel.date <= end_date))
            .group_by(
                extract("year", TaskModel.date), extract("month", TaskModel.date)
            )
            .order_by(
                extract("year", TaskModel.date), extract("month", TaskModel.date)
            )
            .all()
        )

        result = []
        for year, month, total, completed in stats:
            month_str = f"{int(year)}-{int(month):02d}"
            completed_count = completed if completed is not None else 0
            completion_rate = (completed_count / total) if total > 0 else 0.0
            result.append((month_str, total, completed_count, completion_rate))

        return result
