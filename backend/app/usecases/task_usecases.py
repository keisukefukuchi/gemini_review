from typing import List, Optional
from datetime import date, time
from app.domain.entities import Task
from app.domain.repositories import TaskRepository


class GetTasksUseCase:
    """タスク一覧取得ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(self, task_date: date, show_completed: bool = True) -> List[Task]:
        """タスク一覧を取得"""
        return self.repository.get_by_date(task_date, show_completed)


class GetTaskUseCase:
    """タスク取得ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(self, task_id: int) -> Optional[Task]:
        """タスクを取得"""
        return self.repository.get_by_id(task_id)


class CreateTaskUseCase:
    """タスク作成ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(
        self,
        date: date,
        title: str,
        memo: Optional[str] = None,
        deadline: Optional[time] = None,
        completed: bool = False,
        order_index: Optional[int] = None,
    ) -> Task:
        """タスクを作成"""
        # 同じ日付のタスク数を取得してorder_indexを設定
        existing_tasks = self.repository.get_by_date(date, show_completed=True)
        if order_index is None:
            order_index = len(existing_tasks)

        task = Task(
            id=0,  # 新規作成時は0（リポジトリでIDが割り当てられる）
            date=date,
            title=title,
            memo=memo,
            deadline=deadline,
            completed=completed,
            order_index=order_index,
            created_at=None,  # リポジトリで設定
            updated_at=None,  # リポジトリで設定
        )

        return self.repository.create(task)


class UpdateTaskUseCase:
    """タスク更新ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(
        self,
        task_id: int,
        title: Optional[str] = None,
        memo: Optional[str] = None,
        deadline: Optional[time] = None,
        completed: Optional[bool] = None,
        order_index: Optional[int] = None,
    ) -> Task:
        """タスクを更新"""
        task = self.repository.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task with id {task_id} not found")

        # 更新するフィールドのみ変更
        if title is not None:
            task.title = title
        if memo is not None:
            task.memo = memo
        if deadline is not None:
            task.deadline = deadline
        if completed is not None:
            task.completed = completed
        if order_index is not None:
            task.order_index = order_index

        return self.repository.update(task)


class DeleteTaskUseCase:
    """タスク削除ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(self, task_id: int) -> None:
        """タスクを削除"""
        task = self.repository.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task with id {task_id} not found")
        self.repository.delete(task_id)


class UpdateTaskOrderUseCase:
    """タスク順序更新ユースケース"""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(self, task_id: int, order_index: int) -> Task:
        """タスクの順序を更新"""
        task = self.repository.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task with id {task_id} not found")
        return self.repository.update_order(task_id, order_index)
