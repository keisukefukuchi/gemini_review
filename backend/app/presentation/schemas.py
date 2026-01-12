from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, time, datetime


class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    memo: Optional[str] = None
    deadline: Optional[str] = None
    completed: bool = False
    order_index: int = 0

    @validator("deadline")
    def validate_deadline(cls, v):
        if v is not None:
            try:
                parts = v.split(":")
                if len(parts) not in [2, 3]:
                    raise ValueError("Deadline must be in HH:MM or HH:MM:SS format")
                hour = int(parts[0])
                minute = int(parts[1])
                if hour < 0 or hour > 23 or minute < 0 or minute > 59:
                    raise ValueError("Invalid time values")
            except (ValueError, IndexError):
                raise ValueError("Deadline must be in HH:MM or HH:MM:SS format")
        return v


class TaskCreate(TaskBase):
    date: date


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    memo: Optional[str] = None
    deadline: Optional[str] = None
    completed: Optional[bool] = None
    order_index: Optional[int] = None

    @validator("deadline")
    def validate_deadline(cls, v):
        if v is not None:
            try:
                parts = v.split(":")
                if len(parts) not in [2, 3]:
                    raise ValueError("Deadline must be in HH:MM or HH:MM:SS format")
                hour = int(parts[0])
                minute = int(parts[1])
                if hour < 0 or hour > 23 or minute < 0 or minute > 59:
                    raise ValueError("Invalid time values")
            except (ValueError, IndexError):
                raise ValueError("Deadline must be in HH:MM or HH:MM:SS format")
        return v


class TaskOrderUpdate(BaseModel):
    order_index: int


class TaskResponse(TaskBase):
    id: int
    date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
