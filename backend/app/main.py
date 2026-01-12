from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import engine
from app.infrastructure.models import TaskModel
from app.infrastructure.database import Base

# データベーステーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management API",
    description="日々のタスク管理API",
    version="1.0.0"
)

# CORS設定（Electronアプリからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Electronアプリなので全て許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
from app.presentation import controllers
from app.routers import statistics
app.include_router(controllers.router)
app.include_router(statistics.router)


@app.get("/")
def root():
    return {"message": "Task Management API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
