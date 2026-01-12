from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.infrastructure.database import get_db
from app.infrastructure.task_repository import SQLAlchemyTaskRepository
from app.usecases.statistics_usecases import (
    GetStatisticsUseCase,
    GetStatisticsSummaryUseCase,
)
from app.presentation.schemas import (
    StatisticsResponse,
    StatisticsSummaryResponse,
)


router = APIRouter(prefix="/api/v1/statistics", tags=["statistics"])


def get_repository(db: Session = Depends(get_db)) -> SQLAlchemyTaskRepository:
    """リポジトリを取得"""
    return SQLAlchemyTaskRepository(db)


@router.get("", response_model=StatisticsResponse)
def get_statistics(
    start_date: date = Query(..., alias="start_date"),
    end_date: date = Query(..., alias="end_date"),
    group_by: str = Query("day", alias="group_by"),
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """統計情報取得"""
    usecase = GetStatisticsUseCase(repository)
    return usecase.execute(start_date, end_date, group_by)


@router.get("/summary", response_model=StatisticsSummaryResponse)
def get_statistics_summary(
    period: str = Query("all", alias="period"),
    repository: SQLAlchemyTaskRepository = Depends(get_repository),
):
    """統計サマリー取得"""
    usecase = GetStatisticsSummaryUseCase(repository)
    return usecase.execute(period)
