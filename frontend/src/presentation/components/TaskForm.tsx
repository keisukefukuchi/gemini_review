import React, { useState } from 'react';
import './TaskForm.css';

interface TaskFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="タスクタイトル *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input title-input"
          autoFocus
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          追加
        </button>
        <button type="button" onClick={onCancel} className="cancel-button">
          キャンセル
        </button>
      </div>
    </form>
  );
};
