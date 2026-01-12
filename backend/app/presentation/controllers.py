from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, time

from app.infrastructure.database import get_db
from app.infrastructure.task_repository import SQLAlchemyTaskRepository
from app.usecases.task_usecases import (
    GetTasksUseCase,
    GetTaskUseCase,
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    UpdateTaskOrderUseCase,
)
from app.presentation.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskOrderUpdate,
)
from app.domain.entities import Task


router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


def get_repository(db: Session = Depends(get_db)) -> SQLAlchemyTaskRepository:
    """リポジトリを取得"""
    return SQLAlchemyTaskRepository(db)


def parse_time(time_str: Optional[str]) -> Optional[time]:
    """文字列をtimeオブジェクトに変換"""
    if time_str is None:
        return None
    parts = time_str.split(":")
    if len(parts) == 2:
        return time(int(parts[0]), int(parts[1]))
    elif len(parts) == 3:
        return time(int(parts[0]), int(parts[1]), int(parts[2]))
    return None


def task_to_response(task: Task) -> TaskResponse:
    """エンティティをレスポンススキーマに変換"""
    return TaskResponse(
        id=task.id,
        date=task.date,
        title=task.title,
        memo=task.memo,
        deadline=str(task.deadline) if task.deadline else None,
        completed=task.completed,
        order_index=task.order_index,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.get("", response_model=TaskListResponse)
def get_tasks(
    task_date: date = Query(..., alias="date"),
    show_completed: bool = Query(True, alias="show_completed"),
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """日付別タスク一覧取得"""
    usecase = GetTasksUseCase(repository)
    tasks = usecase.execute(task_date, show_completed)
    return TaskListResponse(tasks=[task_to_response(task) for task in tasks])


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """タスク詳細取得"""
    usecase = GetTaskUseCase(repository)
    task = usecase.execute(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_to_response(task)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task: TaskCreate,
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """タスク作成"""
    usecase = CreateTaskUseCase(repository)
    deadline_time = parse_time(task.deadline)
    created_task = usecase.execute(
        date=task.date,
        title=task.title,
        memo=task.memo,
        deadline=deadline_time,
        completed=task.completed,
        order_index=task.order_index,
    )
    return task_to_response(created_task)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """タスク更新"""
    usecase = UpdateTaskUseCase(repository)
    deadline_time = parse_time(task_update.deadline) if task_update.deadline else None
    
    try:
        updated_task = usecase.execute(
            task_id=task_id,
            title=task_update.title,
            memo=task_update.memo,
            deadline=deadline_time,
            completed=task_update.completed,
            order_index=task_update.order_index,
        )
        return task_to_response(updated_task)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """タスク削除"""
    usecase = DeleteTaskUseCase(repository)
    try:
        usecase.execute(task_id)
        return {"message": "Task deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{task_id}/order", response_model=TaskResponse)
def update_task_order(
    task_id: int,
    order_update: TaskOrderUpdate,
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """タスク順序更新"""
    usecase = UpdateTaskOrderUseCase(repository)
    try:
        updated_task = usecase.execute(task_id, order_update.order_index)
        return task_to_response(updated_task)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/dummy-data", status_code=201)
def create_dummy_data(
    task_date: date = Query(..., alias="date"),
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """ダミーデータ作成（テスト用）"""
    import random
    from app.infrastructure.models import TaskModel
    from app.infrastructure.database import SessionLocal
    
    # 既存のタスクを削除（同じ日付のもの）
    db = SessionLocal()
    try:
        db.query(TaskModel).filter(TaskModel.date == task_date).delete()
        db.commit()
        
        # ダミータスクのタイトル
        task_titles = [
            "プロジェクト計画を立てる",
            "会議資料を作成する",
            "コードレビューを行う",
            "テストケースを書く",
            "ドキュメントを更新する",
            "バグ修正を行う",
            "機能追加を実装する",
            "パフォーマンス最適化",
        ]
        
        created_tasks = []
        
        # 5-8個のタスクを作成
        num_tasks = random.randint(5, 8)
        for i in range(num_tasks):
            task_model = TaskModel(
                date=task_date,
                title=task_titles[i % len(task_titles)],
                memo=None,
                deadline=None,
                completed=random.choice([True, False]),
                order_index=i
            )
            db.add(task_model)
            db.flush()
            created_tasks.append(task_model)
        
        db.commit()
        
        return {
            "message": f"Dummy data created for {task_date}",
            "count": len(created_tasks)
        }
    finally:
        db.close()
