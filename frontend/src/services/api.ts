import axios from 'axios';
import { Task, TaskCreate, TaskUpdate } from '../types/task';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  // 日付別タスク一覧取得
  getTasks: async (date: string, showCompleted: boolean = true): Promise<Task[]> => {
    const response = await api.get('/api/v1/tasks', {
      params: { date, show_completed: showCompleted },
    });
    return response.data.tasks;
  },

  // タスク詳細取得
  getTask: async (taskId: number): Promise<Task> => {
    const response = await api.get(`/api/v1/tasks/${taskId}`);
    return response.data;
  },

  // タスク作成
  createTask: async (task: TaskCreate): Promise<Task> => {
    const response = await api.post('/api/v1/tasks', task);
    return response.data;
  },

  // タスク更新
  updateTask: async (taskId: number, task: TaskUpdate): Promise<Task> => {
    const response = await api.put(`/api/v1/tasks/${taskId}`, task);
    return response.data;
  },

  // タスク削除
  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/api/v1/tasks/${taskId}`);
  },

  // タスク順序更新
  updateTaskOrder: async (
    taskId: number,
    orderIndex: number
  ): Promise<Task> => {
    const response = await api.put(`/api/v1/tasks/${taskId}/order`, {
      order_index: orderIndex,
    });
    return response.data;
  },

  // ダミーデータ作成
  createDummyData: async (date: string): Promise<void> => {
    await api.post('/api/v1/tasks/dummy-data', null, {
      params: { date },
    });
  },
};
