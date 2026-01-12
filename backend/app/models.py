from sqlalchemy import Column, Integer, String, Text, Boolean, Date, Time, DateTime, Index
from sqlalchemy.sql import func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    memo = Column(Text, nullable=True)
    deadline = Column(Time, nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # インデックス
    __table_args__ = (
        Index("idx_date_order", "date", "order_index"),
    )
