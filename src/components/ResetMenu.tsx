import React from 'react';
import { Todo as TodoType } from '../types/Todo';

interface ResetMenuProps {
  todos: TodoType[];
  onClearCompleted: () => void;
  onClearAll: () => void;
  onReset: () => void;
}

const ResetMenu: React.FC<ResetMenuProps> = ({
  todos,
  onClearCompleted,
  onClearAll,
  onReset
}) => {
  const hasCompletedTasks = todos.some(todo => todo.status === 'completed');
  const hasTasks = todos.length > 0;

  return (
    <div className="reset-menu">
      <button
        className="reset-button clear-completed"
        onClick={onClearCompleted}
        disabled={!hasCompletedTasks}
      >
        Clear Completed
      </button>
      <button
        className="reset-button clear-all"
        onClick={onClearAll}
        disabled={!hasTasks}
      >
        Clear All
      </button>
      <button
        className="reset-button reset"
        onClick={onReset}
      >
        Reset App
      </button>
    </div>
  );
};

export default ResetMenu; 