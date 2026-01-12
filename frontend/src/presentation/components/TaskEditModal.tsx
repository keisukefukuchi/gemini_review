import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Task } from '../../domain/entities';
import './TaskEditModal.css';

interface TaskEditModalProps {
  task: Task;
  onSave: (task: Task, updates: {
    title?: string;
  }) => void;
  onClose: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(task.title);

  useEffect(() => {
    setTitle(task.title);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task, {
      title: title.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>タスクを編集</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-button">
              保存
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
