import { Task } from './entities';

/**
 * タスクリポジトリインターフェース
 */
export interface TaskRepository {
  getTasks(date: string, showCompleted: boolean): Promise<Task[]>;
  getTask(taskId: number): Promise<Task>;
  createTask(task: {
    date: string;
    title: string;
    memo?: string | null;
    deadline?: string | null;
    order_index?: number;
  }): Promise<Task>;
  updateTask(taskId: number, updates: {
    title?: string;
    memo?: string | null;
    deadline?: string | null;
    completed?: boolean;
    order_index?: number;
  }): Promise<Task>;
  deleteTask(taskId: number): Promise<void>;
  updateTaskOrder(taskId: number, orderIndex: number): Promise<Task>;
}
