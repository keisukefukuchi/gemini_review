from dataclasses import dataclass
from datetime import date, time, datetime
from typing import Optional


@dataclass
class Task:
    """タスクエンティティ（ドメインモデル）"""
    id: int
    date: date
    title: str
    memo: Optional[str]
    deadline: Optional[time]
    completed: bool
    order_index: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    def __post_init__(self):
        """バリデーション"""
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if len(self.title) > 255:
            raise ValueError("Title cannot exceed 255 characters")
