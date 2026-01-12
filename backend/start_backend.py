#!/usr/bin/env python3
"""
Electronアプリケーションから起動されるPythonバックエンドサーバー
"""
import uvicorn
import os

if __name__ == "__main__":
    # データベースURL（環境変数から取得、デフォルト値あり）
    database_url = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://taskuser:taskpassword@localhost:3306/taskdb"
    )
    
    # サーバーを起動
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,  # 本番環境ではreloadを無効化
        log_level="info"
    )
