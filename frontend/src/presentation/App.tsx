import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Task } from '../domain/entities';
import { ApiTaskRepository } from '../infrastructure/api_client';
import {
  GetTasksUseCase,
  CreateTaskUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  UpdateTaskOrderUseCase,
} from '../usecases/task_usecases';
import { TaskList } from '../presentation/components/TaskList';
import { TaskForm } from '../presentation/components/TaskForm';
import { TaskEditModal } from '../presentation/components/TaskEditModal';
import { StatisticsDashboard } from '../presentation/components/StatisticsDashboard';
import '../presentation/App.css';

// 依存性の注入
const repository = new ApiTaskRepository();
const getTasksUseCase = new GetTasksUseCase(repository);
const createTaskUseCase = new CreateTaskUseCase(repository);
const updateTaskUseCase = new UpdateTaskUseCase(repository);
const deleteTaskUseCase = new DeleteTaskUseCase(repository);
const updateTaskOrderUseCase = new UpdateTaskOrderUseCase(repository);

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [scrollToNextIncomplete, setScrollToNextIncomplete] = useState<number | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);

  // タスク一覧を取得
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getTasksUseCase.execute(selectedDate, showCompleted);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      alert('タスクの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, showCompleted]);

  // タスク作成
  const handleCreateTask = async (title: string) => {
    try {
      await createTaskUseCase.execute({
        date: selectedDate,
        title,
        memo: null,
        deadline: null,
        order_index: tasks.length,
      });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('タスクの作成に失敗しました');
    }
  };

  // タスク更新
  const handleUpdateTask = async (
    task: Task,
    updates: {
      title?: string;
      completed?: boolean;
    }
  ) => {
    try {
      const wasIncomplete = !task.completed;
      const willBeCompleted = updates.completed === true;

      await updateTaskUseCase.execute(task.id, updates);
      
      // 未完了タスクを完了にした場合、次の未完了タスクまでスクロール
      if (wasIncomplete && willBeCompleted) {
        setScrollToNextIncomplete(task.id);
      } else {
        setScrollToNextIncomplete(null);
      }

      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  // タスク削除
  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTaskUseCase.execute(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('タスクの削除に失敗しました');
    }
  };

  // タスク移動（順序変更）
  const handleMoveTask = async (
    taskId: number,
    newOrderIndex: number
  ) => {
    // バックエンドと同期（非同期で実行）
    try {
      await updateTaskOrderUseCase.execute(taskId, newOrderIndex);
    } catch (error) {
      console.error('Failed to move task:', error);
      // エラー時は元の状態に戻すために再取得
      fetchTasks();
      alert('タスクの移動に失敗しました');
    }
  };

  // タスク編集
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // 日付変更
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setShowForm(false);
    setEditingTask(null);
  };

  // 前日/翌日移動
  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const currentDate = parseISO(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    handleDateChange(format(newDate, 'yyyy-MM-dd'));
  };


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">タスク管理</h1>
          <div className="header-controls">
            <button
              className="nav-button"
              onClick={() => handleDateNavigation('prev')}
              title="前日"
            >
              <FaChevronLeft />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="date-input"
            />
            <button
              className="nav-button"
              onClick={() => handleDateNavigation('next')}
              title="翌日"
            >
              <FaChevronRight />
            </button>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="toggle-input"
              />
              <span>完了済みを表示</span>
            </label>
            {!showForm && (
              <>
                <button
                  className="statistics-button"
                  onClick={() => setShowStatistics(true)}
                  title="統計・分析ダッシュボード"
                >
                  📊 統計
                </button>
                <button
                  className="add-task-button"
                  onClick={() => setShowForm(true)}
                >
                  + タスクを追加
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="task-container">
          {showForm && (
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => {
                setShowForm(false);
              }}
            />
          )}

          {loading ? (
            <div className="loading">読み込み中...</div>
          ) : (
            <TaskList
              tasks={tasks}
              onToggleComplete={(taskId, completed) => {
                const task = tasks.find((t) => t.id === taskId);
                if (task) {
                  handleUpdateTask(task, { completed });
                } else {
                  console.error('Task not found:', taskId);
                }
              }}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onMoveTask={handleMoveTask}
              onTasksUpdate={setTasks}
              showCompleted={showCompleted}
              scrollToNextIncomplete={scrollToNextIncomplete}
              onScrollComplete={() => setScrollToNextIncomplete(null)}
            />
          )}
        </div>
      </main>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {showStatistics && (
        <div className="modal-overlay" onClick={() => setShowStatistics(false)}>
          <div className="modal-content statistics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>統計・分析ダッシュボード</h2>
              <button
                className="modal-close-button"
                onClick={() => setShowStatistics(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <StatisticsDashboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
