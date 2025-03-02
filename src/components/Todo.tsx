import React from 'react';
import { Todo, TodoStatus } from '../types/Todo';
import { format } from 'date-fns';

interface TodoProps {
  todo: Todo;
  onToggle: (status: TodoStatus) => void;
  onDelete: () => void;
  onEdit: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onToggle(e.target.value as TodoStatus);
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className={`todo-item ${todo.status}`}>
      <div className="todo-content">
        <h3>{todo.title}</h3>
        {todo.description && <p>{todo.description}</p>}
        <div className="todo-details">
          <span className="category">{todo.category}</span>
          <span className="priority">{todo.priority}</span>
          <span className="due-date">Due: {formatDate(todo.dueDate)}</span>
        </div>
      </div>
      <div className="todo-actions">
        <select value={todo.status} onChange={handleStatusChange}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>
        <button onClick={onDelete} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem; 