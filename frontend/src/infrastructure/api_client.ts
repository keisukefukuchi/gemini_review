import axios, { AxiosInstance } from 'axios';
import { Task } from '../domain/entities';
import { TaskRepository } from '../domain/repositories';

/**
 * APIクライアント実装（Infrastructure層）
 */
export class ApiTaskRepository implements TaskRepository {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getTasks(date: string, showCompleted: boolean = true): Promise<Task[]> {
    const response = await this.api.get('/api/v1/tasks', {
      params: { date, show_completed: showCompleted },
    });
    return response.data.tasks;
  }

  async getTask(taskId: number): Promise<Task> {
    const response = await this.api.get(`/api/v1/tasks/${taskId}`);
    return response.data;
  }

  async createTask(task: {
    date: string;
    title: string;
    memo?: string | null;
    deadline?: string | null;
    order_index?: number;
  }): Promise<Task> {
    const response = await this.api.post('/api/v1/tasks', task);
    return response.data;
  }

  async updateTask(
    taskId: number,
    updates: {
      title?: string;
      memo?: string | null;
      deadline?: string | null;
      completed?: boolean;
      order_index?: number;
    }
  ): Promise<Task> {
    const response = await this.api.put(`/api/v1/tasks/${taskId}`, updates);
    return response.data;
  }

  async deleteTask(taskId: number): Promise<void> {
    await this.api.delete(`/api/v1/tasks/${taskId}`);
  }

  async updateTaskOrder(taskId: number, orderIndex: number): Promise<Task> {
    const response = await this.api.put(`/api/v1/tasks/${taskId}/order`, {
      order_index: orderIndex,
    });
    return response.data;
  }
}
