from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date, time

from app.database import get_db
from app.models import Task
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskOrderUpdate
)

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


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


@router.get("", response_model=TaskListResponse)
def get_tasks(
    task_date: date = Query(..., alias="date"),
    show_completed: bool = Query(True, alias="show_completed"),
    db: Session = Depends(get_db)
):
    """日付別タスク一覧取得"""
    query = db.query(Task).filter(Task.date == task_date)

    if not show_completed:
        query = query.filter(Task.completed == False)

    # order_index順でソート
    tasks = query.order_by(Task.order_index).all()

    return TaskListResponse(
        tasks=[
            TaskResponse(
                id=t.id,
                date=t.date,
                title=t.title,
                memo=t.memo,
                deadline=str(t.deadline) if t.deadline else None,
                completed=t.completed,
                order_index=t.order_index,
                created_at=t.created_at,
                updated_at=t.updated_at
            )
            for t in tasks
        ]
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """タスク詳細取得"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskResponse(
        id=task.id,
        date=task.date,
        title=task.title,
        memo=task.memo,
        deadline=str(task.deadline) if task.deadline else None,
        completed=task.completed,
        order_index=task.order_index,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """タスク作成"""
    deadline_time = parse_time(task.deadline)

    # 同じ日付のタスク数を取得してorder_indexを設定
    existing_count = db.query(Task).filter(Task.date == task.date).count()
    
    db_task = Task(
        date=task.date,
        title=task.title,
        memo=task.memo,
        deadline=deadline_time,
        completed=task.completed,
        order_index=task.order_index if task.order_index is not None else existing_count
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return TaskResponse(
        id=db_task.id,
        date=db_task.date,
        title=db_task.title,
        memo=db_task.memo,
        deadline=str(db_task.deadline) if db_task.deadline else None,
        completed=db_task.completed,
        order_index=db_task.order_index,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """タスク更新"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 更新
    update_data = task_update.dict(exclude_unset=True)
    if "deadline" in update_data and update_data["deadline"]:
        update_data["deadline"] = parse_time(update_data["deadline"])

    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    return TaskResponse(
        id=db_task.id,
        date=db_task.date,
        title=db_task.title,
        memo=db_task.memo,
        deadline=str(db_task.deadline) if db_task.deadline else None,
        completed=db_task.completed,
        order_index=db_task.order_index,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """タスク削除"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()

    return {"message": "Task deleted successfully"}


@router.put("/{task_id}/order", response_model=TaskResponse)
def update_task_order(task_id: int, order_update: TaskOrderUpdate, db: Session = Depends(get_db)):
    """タスク順序更新"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.order_index = order_update.order_index

    db.commit()
    db.refresh(db_task)

    return TaskResponse(
        id=db_task.id,
        date=db_task.date,
        title=db_task.title,
        memo=db_task.memo,
        deadline=str(db_task.deadline) if db_task.deadline else None,
        completed=db_task.completed,
        order_index=db_task.order_index,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )


@router.post("/dummy-data", status_code=201)
def create_dummy_data(
    task_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db)
):
    """ダミーデータ作成（テスト用）"""
    import random
    
    # 既存のタスクを削除（同じ日付のもの）
    db.query(Task).filter(Task.date == task_date).delete()
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
        task = Task(
            date=task_date,
            title=task_titles[i % len(task_titles)],
            memo=None,
            deadline=None,
            completed=random.choice([True, False]),
            order_index=i
        )
        db.add(task)
        db.flush()
        created_tasks.append(task)
    
    db.commit()
    
    return {
        "message": f"Dummy data created for {task_date}",
        "count": len(created_tasks)
    }
