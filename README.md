# タスク管理アプリケーション

日々のタスクを管理するElectronアプリケーションです。

## 技術スタック

- **フロントエンド**: React + TypeScript + Electron
- **バックエンド**: Python (FastAPI)
- **データベース**: MySQL 8.0
- **インフラ**: Docker + Docker Compose

## 機能

- ✅ 日付ごとのタスク管理
- ✅ タスクの完了/未完了切り替え
- ✅ ドラッグ&ドロップで並び替え
- ✅ 完了済みタスクの表示/非表示
- ✅ レスポンシブ対応

## セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+ (Electronアプリ内でバックエンドを起動する場合)

### 1. データベースとバックエンドの起動

```bash
# Docker ComposeでMySQLとバックエンドを起動
docker-compose up -d

# バックエンドのログを確認
docker-compose logs -f backend
```

### 2. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install
```

### 3. 開発環境での起動

**重要**: Electronアプリを起動する前に、Docker Composeでバックエンドを起動しておいてください。

#### オプション1: Electronアプリとして起動

```bash
# バックエンドがDockerで起動していることを確認
docker-compose ps

# Electronアプリを起動（Dockerバックエンドを使用）
cd frontend
USE_DOCKER=true npm run electron:dev
```

#### オプション2: ブラウザで確認（開発用）

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

### 4. 本番ビルド

```bash
cd frontend
npm run build
npm run electron:pack
```

## ディレクトリ構造

```
task/
├── docs/              # 設計ドキュメント
├── backend/           # Pythonバックエンド
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── routers/
│   └── requirements.txt
├── frontend/          # React + Electron
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── electron/
│   └── package.json
└── docker-compose.yml
```

## API エンドポイント

- `GET /api/v1/tasks?date=YYYY-MM-DD` - タスク一覧取得
- `GET /api/v1/tasks/{id}` - タスク詳細取得
- `POST /api/v1/tasks` - タスク作成
- `PUT /api/v1/tasks/{id}` - タスク更新
- `DELETE /api/v1/tasks/{id}` - タスク削除
- `PUT /api/v1/tasks/{id}/order` - タスク順序更新

詳細は `docs/api.md` を参照してください。

## データベース

MySQLを使用しています。Docker Composeで自動的にデータベースが作成されます。

接続情報:
- Host: localhost
- Port: 3306
- Database: taskdb
- User: taskuser
- Password: taskpassword

## ダミーデータの作成

テスト用のダミーデータを作成するには、以下のコマンドを実行します：

```bash
# 今日の日付でダミーデータを作成
cd backend
python create_dummy_data.py

# 特定の日付でダミーデータを作成
python create_dummy_data.py 2024-01-01
```

**注意**: 指定した日付の既存タスクは削除されます。

## データベースのリセット

データベースをリセットして、新しいスキーマで再作成するには：

```bash
# データベースリセットスクリプトを実行
./reset_database.sh
```

または手動で：

```bash
# Dockerコンテナを停止
docker-compose down

# MySQLのボリュームを削除
docker volume rm task_mysql_data

# コンテナを再起動
docker-compose up -d
```

**注意**: この操作により、すべてのデータが削除されます。

## トラブルシューティング

### バックエンドに接続できない

1. Docker Composeが起動しているか確認
   ```bash
   docker-compose ps
   ```

2. バックエンドのログを確認
   ```bash
   docker-compose logs backend
   ```

3. データベースの接続を確認
   ```bash
   docker-compose exec mysql mysql -u taskuser -ptaskpassword taskdb
   ```

### Electronアプリが起動しない

1. Node.jsのバージョンを確認（18以上が必要）
2. 依存関係を再インストール
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

## ライセンス

MIT
# gemini_review
