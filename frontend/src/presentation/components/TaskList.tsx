import React, { useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../domain/entities';
import { TaskItem } from './TaskItem';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onMoveTask: (taskId: number, newOrderIndex: number) => void;
  onTasksUpdate?: (updatedTasks: Task[]) => void;
  showCompleted: boolean;
  scrollToNextIncomplete?: number | null;
  onScrollComplete?: () => void;
}

interface SortableTaskItemProps {
  task: Task;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
  showCompleted: boolean;
  isLast?: boolean;
  taskRef?: (node: HTMLDivElement | null) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  showCompleted,
  isLast,
  taskRef,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ドラッグハンドルをタスクタイトル部分に限定
  const dragHandleProps = {
    ...attributes,
    ...listeners,
    style: { cursor: 'grab' } as React.CSSProperties,
  };

  // refを結合
  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (taskRef) {
      taskRef(node);
    }
  };

  return (
    <div 
      ref={combinedRef} 
      style={style} 
      className={`sortable-task-item ${isLast ? 'last-task' : ''}`}
    >
      <TaskItem
        task={task}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEdit={onEdit}
        showCompleted={showCompleted}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onMoveTask,
  onTasksUpdate,
  showCompleted,
  scrollToNextIncomplete,
  onScrollComplete,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const taskRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 次の未完了タスクまでスクロール
  useEffect(() => {
    if (scrollToNextIncomplete && listRef.current) {
      setTimeout(() => {
        const completedIndex = tasks.findIndex(
          (task) => task.id === scrollToNextIncomplete
        );
        
        let nextIncompleteIndex = -1;
        if (completedIndex !== -1) {
          for (let i = completedIndex + 1; i < tasks.length; i++) {
            if (!tasks[i].completed) {
              nextIncompleteIndex = i;
              break;
            }
          }
        }
        
        if (nextIncompleteIndex === -1) {
          nextIncompleteIndex = tasks.findIndex((task) => !task.completed);
        }

        if (nextIncompleteIndex !== -1) {
          const nextTask = tasks[nextIncompleteIndex];
          const taskElement = taskRefs.current.get(nextTask.id);
          if (taskElement && listRef.current) {
            const containerTop = listRef.current.getBoundingClientRect().top;
            const elementTop = taskElement.getBoundingClientRect().top;
            const scrollOffset = elementTop - containerTop;
            
            listRef.current.scrollBy({
              top: scrollOffset,
              behavior: 'smooth',
            });
          }
        }
        
        if (onScrollComplete) {
          onScrollComplete();
        }
      }, 300);
    }
  }, [scrollToNextIncomplete, tasks, onScrollComplete]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const draggedTaskId = parseInt(active.id.toString());
    const overTaskId = parseInt(over.id.toString());

    if (draggedTaskId === overTaskId) {
      return;
    }

    const draggedTask = tasks.find((t) => t.id === draggedTaskId);
    const overTask = tasks.find((t) => t.id === overTaskId);

    if (!draggedTask || !overTask) {
      return;
    }

    // 同じ日付かチェック
    if (draggedTask.date !== overTask.date) {
      alert('異なる日付のタスク間では移動できません');
      return;
    }

    const filteredTasks = tasks.filter((task) => showCompleted || !task.completed);
    const oldIndex = filteredTasks.findIndex((t) => t.id === draggedTaskId);
    const newIndex = filteredTasks.findIndex((t) => t.id === overTaskId);

    if (oldIndex !== -1 && newIndex !== -1) {
      // 即座にローカル状態を更新
      if (onTasksUpdate) {
        const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex);
        // すべてのタスクの順序を更新（フィルタリング前の全タスク）
        const allTasks = [...tasks];
        reorderedTasks.forEach((task, index) => {
          const taskIndex = allTasks.findIndex((t) => t.id === task.id);
          if (taskIndex !== -1) {
            allTasks[taskIndex] = { ...allTasks[taskIndex], order_index: index };
          }
        });
        // 順序を保持してソート
        allTasks.sort((a, b) => {
          const aIndex = reorderedTasks.findIndex((t) => t.id === a.id);
          const bIndex = reorderedTasks.findIndex((t) => t.id === b.id);
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.order_index - b.order_index;
        });
        onTasksUpdate(allTasks);
      }
      
      // バックエンドと同期（非同期）
      const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex);
      reorderedTasks.forEach((task, index) => {
        onMoveTask(task.id, index);
      });
    }
  };

  const filteredTasks = tasks.filter((task) => showCompleted || !task.completed);

  return (
    <div className="task-list" ref={listRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTasks.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>タスクがありません</p>
              <p className="empty-hint">「+ タスクを追加」ボタンから追加してください</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                showCompleted={showCompleted}
                isLast={index === filteredTasks.length - 1}
                taskRef={(node) => {
                  if (node) {
                    taskRefs.current.set(task.id, node);
                  } else {
                    taskRefs.current.delete(task.id);
                  }
                }}
              />
            ))
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};
