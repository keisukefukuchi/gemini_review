import React from 'react';
import { Task } from '../../domain/entities';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
  showCompleted: boolean;
  dragHandleProps?: any;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  showCompleted,
  dragHandleProps,
}) => {
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id, !task.completed);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('このタスクを削除しますか？')) {
      onDelete(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <div className="task-item">
      <div className={`task-content ${task.completed ? 'completed' : ''}`}>
        <div className="task-main">
          <button
            className="task-checkbox"
            onClick={handleToggleComplete}
            aria-label={task.completed ? '未完了にする' : '完了にする'}
          >
            {task.completed && <FaCheck />}
          </button>

          <div className="task-info" {...dragHandleProps}>
            <span className="task-title">{task.title}</span>
          </div>

          <div className="task-actions">
            <button
              className="action-button edit"
              onClick={handleEdit}
              title="編集"
            >
              <FaEdit />
            </button>
            <button
              className="action-button delete"
              onClick={handleDelete}
              title="削除"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
