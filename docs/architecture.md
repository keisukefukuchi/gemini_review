# アーキテクチャ設計書

## 概要

日々のタスク管理を行うElectronアプリケーション。バックエンドはPython（FastAPI）、フロントエンドはReact + TypeScriptで構築。

## システム構成

```
┌─────────────────────────────────────┐
│      Electron Application           │
│  ┌───────────────────────────────┐  │
│  │   Renderer Process (React)    │  │
│  │   - UI Components              │  │
│  │   - State Management           │  │
│  └───────────┬────────────────────┘  │
│              │ IPC                    │
│  ┌───────────▼────────────────────┐  │
│  │   Main Process (Node.js)       │  │
│  │   - Python Backend Spawn      │  │
│  │   - IPC Bridge                 │  │
│  └───────────┬────────────────────┘  │
└──────────────┼───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│   Python Backend (FastAPI)          │
│   - REST API                        │
│   - Business Logic                 │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│   MySQL Database                    │
│   - Task Data                      │
│   - Hierarchical Structure          │
└──────────────────────────────────────┘
```

## 技術スタック

### フロントエンド
- **Electron**: デスクトップアプリケーションフレームワーク
- **React**: UIライブラリ
- **TypeScript**: 型安全性
- **React DnD / dnd-kit**: ドラッグ&ドロップ機能
- **Date-fns**: 日付操作

### バックエンド
- **Python 3.11+**: プログラミング言語
- **FastAPI**: Webフレームワーク
- **SQLAlchemy**: ORM
- **Pydantic**: データバリデーション

### データベース
- **MySQL 8.0**: リレーショナルデータベース

### インフラ
- **Docker**: コンテナ化
- **Docker Compose**: マルチコンテナ管理

## 通信方式

ElectronのメインプロセスがPythonバックエンドプロセスを起動し、ローカルHTTPサーバー（localhost）として動作。
レンダラープロセス（React）からは通常のHTTPリクエストでバックエンドAPIにアクセス。

## ディレクトリ構造

```
task/
├── docs/                    # 設計ドキュメント
│   ├── architecture.md
│   ├── database.md
│   └── api.md
├── backend/                 # Pythonバックエンド
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPIアプリケーション
│   │   ├── models.py        # データベースモデル
│   │   ├── schemas.py       # Pydanticスキーマ
│   │   ├── database.py      # データベース接続
│   │   └── routers/          # APIルーター
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # React + Electron
│   ├── src/
│   │   ├── components/      # Reactコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── services/        # API通信
│   │   ├── types/           # TypeScript型定義
│   │   └── App.tsx
│   ├── public/
│   ├── electron/            # Electron設定
│   │   ├── main.js          # メインプロセス
│   │   └── preload.js       # プリロードスクリプト
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml       # Docker Compose設定
└── README.md
```

## データフロー

1. ユーザーがUIで操作
2. ReactコンポーネントがAPIサービスを呼び出し
3. HTTPリクエストがPythonバックエンドに送信
4. FastAPIがリクエストを処理し、MySQLにアクセス
5. レスポンスがReactに返され、UIが更新

## セキュリティ考慮事項

- ローカル環境のみで動作（外部アクセスなし）
- 認証機能なし（単一ユーザー想定）
- SQLインジェクション対策（SQLAlchemy ORM使用）
