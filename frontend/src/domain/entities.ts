/**
 * タスクエンティティ（ドメインモデル）
 */
export interface Task {
  id: number;
  date: string;
  title: string;
  memo: string | null;
  deadline: string | null;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}
