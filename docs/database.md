# データベース設計書

## 概要

MySQLを使用したタスク管理システムのデータベース設計。

## ER図

```
┌─────────────┐
│   tasks     │
├─────────────┤
│ id (PK)     │
│ date        │  (DATE: タスクの日付)
│ title       │  (VARCHAR: タスクタイトル)
│ memo        │  (TEXT: メモ)
│ deadline    │  (TIME: 期限時刻)
│ completed   │  (BOOLEAN: 完了フラグ)
│ order_index │  (INT: 表示順序)
│ parent_id   │  (FK -> tasks.id: 親タスク)
│ created_at  │  (DATETIME)
│ updated_at  │  (DATETIME)
└─────────────┘
```

## テーブル定義

### tasks テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | タスクID |
| date | DATE | NOT NULL | タスクの日付 |
| title | VARCHAR(255) | NOT NULL | タスクタイトル |
| memo | TEXT | NULL | メモ |
| deadline | TIME | NULL | 期限時刻（HH:MM:SS形式） |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 完了フラグ |
| order_index | INT | NOT NULL, DEFAULT 0 | 表示順序（ドラッグ&ドロップ用） |
| parent_id | INT | NULL, FOREIGN KEY | 親タスクID（NULLの場合はルートタスク） |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新日時 |

## インデックス

- `idx_date`: `date` カラムにインデックス（日付検索の高速化）
- `idx_parent_id`: `parent_id` カラムにインデックス（階層構造のクエリ高速化）
- `idx_date_order`: `date`, `order_index` の複合インデックス（日付と順序でのソート高速化）

## 階層構造の実装

自己参照外部キー（`parent_id`）を使用してタスクの階層構造を実現。

- `parent_id` が `NULL` の場合: ルートタスク（最上位）
- `parent_id` が設定されている場合: サブタスク

例:
```
タスクA (parent_id: NULL)
  └─ タスクA-1 (parent_id: タスクAのID)
      └─ タスクA-1-1 (parent_id: タスクA-1のID)
タスクB (parent_id: NULL)
```

## 制約

1. **循環参照の防止**: アプリケーションレベルで、タスクが自身の子孫を親に設定できないように制御
2. **日付の整合性**: サブタスクの日付は親タスクと同じ日付に制限（オプション）

## クエリ例

### 特定日のルートタスクを順序で取得
```sql
SELECT * FROM tasks 
WHERE date = '2024-01-01' 
  AND parent_id IS NULL 
ORDER BY order_index ASC;
```

### 特定タスクの子タスクを取得
```sql
SELECT * FROM tasks 
WHERE parent_id = ? 
ORDER BY order_index ASC;
```

### タスクの階層構造を再帰的に取得（MySQL 8.0のCTE使用）
```sql
WITH RECURSIVE task_tree AS (
  SELECT id, title, parent_id, 0 as level
  FROM tasks
  WHERE id = ?
  UNION ALL
  SELECT t.id, t.title, t.parent_id, tt.level + 1
  FROM tasks t
  INNER JOIN task_tree tt ON t.parent_id = tt.id
)
SELECT * FROM task_tree;
```
