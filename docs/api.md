# API設計書

## 概要

Python FastAPIで実装するRESTful APIの設計仕様。

## ベースURL

- 開発環境: `http://localhost:8000`
- APIプレフィックス: `/api/v1`

## エンドポイント一覧

### タスク管理

#### 1. 日付別タスク一覧取得

**GET** `/api/v1/tasks`

特定日のタスク一覧を取得（ルートタスクのみ、階層構造は別途取得）。

**クエリパラメータ:**
- `date` (required): 日付 (YYYY-MM-DD形式)

**レスポンス:**
```json
{
  "tasks": [
    {
      "id": 1,
      "date": "2024-01-01",
      "title": "タスクA",
      "memo": "メモ内容",
      "deadline": "14:00:00",
      "completed": false,
      "order_index": 0,
      "parent_id": null,
      "created_at": "2024-01-01T10:00:00",
      "updated_at": "2024-01-01T10:00:00"
    }
  ]
}
```

#### 2. タスク詳細取得

**GET** `/api/v1/tasks/{task_id}`

特定タスクの詳細情報を取得（子タスクも含む）。

**パスパラメータ:**
- `task_id` (required): タスクID

**レスポンス:**
```json
{
  "id": 1,
  "date": "2024-01-01",
  "title": "タスクA",
  "memo": "メモ内容",
  "deadline": "14:00:00",
  "completed": false,
  "order_index": 0,
  "parent_id": null,
  "children": [
    {
      "id": 2,
      "title": "サブタスクA-1",
      "completed": false,
      "order_index": 0,
      "children": []
    }
  ],
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

#### 3. タスク作成

**POST** `/api/v1/tasks`

新しいタスクを作成。

**リクエストボディ:**
```json
{
  "date": "2024-01-01",
  "title": "新しいタスク",
  "memo": "メモ内容（オプション）",
  "deadline": "14:00:00",
  "parent_id": null,
  "order_index": 0
}
```

**レスポンス:**
```json
{
  "id": 1,
  "date": "2024-01-01",
  "title": "新しいタスク",
  "memo": "メモ内容",
  "deadline": "14:00:00",
  "completed": false,
  "order_index": 0,
  "parent_id": null,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

#### 4. タスク更新

**PUT** `/api/v1/tasks/{task_id}`

タスク情報を更新。

**パスパラメータ:**
- `task_id` (required): タスクID

**リクエストボディ:**
```json
{
  "title": "更新されたタスク",
  "memo": "更新されたメモ",
  "deadline": "15:00:00",
  "completed": true
}
```

**レスポンス:**
```json
{
  "id": 1,
  "date": "2024-01-01",
  "title": "更新されたタスク",
  "memo": "更新されたメモ",
  "deadline": "15:00:00",
  "completed": true,
  "order_index": 0,
  "parent_id": null,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T11:00:00"
}
```

#### 5. タスク削除

**DELETE** `/api/v1/tasks/{task_id}`

タスクを削除（子タスクも含めて削除）。

**パスパラメータ:**
- `task_id` (required): タスクID

**レスポンス:**
```json
{
  "message": "Task deleted successfully"
}
```

#### 6. タスク順序更新

**PUT** `/api/v1/tasks/{task_id}/order`

タスクの表示順序を更新（ドラッグ&ドロップ用）。

**パスパラメータ:**
- `task_id` (required): タスクID

**リクエストボディ:**
```json
{
  "order_index": 2,
  "parent_id": null
}
```

**レスポンス:**
```json
{
  "id": 1,
  "order_index": 2,
  "parent_id": null
}
```

#### 7. 子タスク一覧取得

**GET** `/api/v1/tasks/{task_id}/children`

特定タスクの子タスク一覧を取得。

**パスパラメータ:**
- `task_id` (required): タスクID

**レスポンス:**
```json
{
  "children": [
    {
      "id": 2,
      "title": "サブタスクA-1",
      "completed": false,
      "order_index": 0,
      "children": []
    }
  ]
}
```

## エラーレスポンス

### 400 Bad Request
```json
{
  "detail": "Invalid date format"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## データ型定義

### Task Schema
- `id`: integer
- `date`: string (date format: YYYY-MM-DD)
- `title`: string (max 255 characters)
- `memo`: string (nullable)
- `deadline`: string (time format: HH:MM:SS, nullable)
- `completed`: boolean
- `order_index`: integer
- `parent_id`: integer (nullable)
- `created_at`: string (datetime ISO format)
- `updated_at`: string (datetime ISO format)

## CORS設定

Electronアプリケーションからのアクセスのみ許可（開発環境では `http://localhost:*` を許可）。
