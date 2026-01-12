from typing import List, Optional
from datetime import date, time
from sqlalchemy.orm import Session
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
