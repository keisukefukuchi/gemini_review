import { Task } from '../domain/entities';
import { TaskRepository } from '../domain/repositories';

/**
 * タスク一覧取得ユースケース
 */
export class GetTasksUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(date: string, showCompleted: boolean = true): Promise<Task[]> {
    return this.repository.getTasks(date, showCompleted);
  }
}

/**
 * タスク取得ユースケース
 */
export class GetTaskUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(taskId: number): Promise<Task> {
    return this.repository.getTask(taskId);
  }
}

/**
 * タスク作成ユースケース
 */
export class CreateTaskUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(params: {
    date: string;
    title: string;
    memo?: string | null;
    deadline?: string | null;
    order_index?: number;
  }): Promise<Task> {
    return this.repository.createTask(params);
  }
}

/**
 * タスク更新ユースケース
 */
export class UpdateTaskUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(
    taskId: number,
    updates: {
      title?: string;
      memo?: string | null;
      deadline?: string | null;
      completed?: boolean;
      order_index?: number;
    }
  ): Promise<Task> {
    return this.repository.updateTask(taskId, updates);
  }
}

/**
 * タスク削除ユースケース
 */
export class DeleteTaskUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(taskId: number): Promise<void> {
    return this.repository.deleteTask(taskId);
  }
}

/**
 * タスク順序更新ユースケース
 */
export class UpdateTaskOrderUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(taskId: number, orderIndex: number): Promise<Task> {
    return this.repository.updateTaskOrder(taskId, orderIndex);
  }
}
