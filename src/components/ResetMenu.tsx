import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types/Todo';

interface ResetMenuProps {
  onClearCompleted: () => void;
  onClearAll: () => void;
  onReset: () => void;
  todos: Todo[];
}

const ResetMenu: React.FC<ResetMenuProps> = ({
  onClearCompleted,
  onClearAll,
  onReset,
  todos
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState<'completed' | 'all' | 'reset' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const completedCount = todos.filter(todo => todo.status === 'completed').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: 'completed' | 'all' | 'reset') => {
    if (showConfirm === action) {
      switch (action) {
        case 'completed':
          onClearCompleted();
          break;
        case 'all':
          onClearAll();
          break;
        case 'reset':
          onReset();
          break;
      }
      setShowConfirm(null);
      setIsOpen(false);
    } else {
      setShowConfirm(action);
    }
  };

  return (
    <div className="reset-menu" ref={menuRef}>
      <button 
        className="reset-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⚙️ Reset Options
      </button>
      
      {isOpen && (
        <div className="reset-dropdown">
          <button 
            className={`reset-option ${showConfirm === 'completed' ? 'confirm' : ''}`}
            onClick={() => handleAction('completed')}
            disabled={completedCount === 0}
          >
            {showConfirm === 'completed' ? 'Click to confirm' : `Clear ${completedCount} completed tasks`}
          </button>
          
          <button 
            className={`reset-option warning ${showConfirm === 'all' ? 'confirm' : ''}`}
            onClick={() => handleAction('all')}
            disabled={todos.length === 0}
          >
            {showConfirm === 'all' ? 'Click to confirm' : `Clear all ${todos.length} tasks`}
          </button>
          
          <button 
            className={`reset-option danger ${showConfirm === 'reset' ? 'confirm' : ''}`}
            onClick={() => handleAction('reset')}
          >
            {showConfirm === 'reset' ? 'Click to confirm' : 'Reset to default state'}
          </button>

          {showConfirm && (
            <div className="reset-warning">
              ⚠️ This action cannot be undone
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResetMenu; 