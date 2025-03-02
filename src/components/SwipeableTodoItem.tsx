import React, { useState, useRef } from 'react';
import { Todo } from '../types/Todo';

interface SwipeableTodoItemProps {
  todo: Todo;
  onStatusUpdate: (status: 'pending' | 'completed' | 'skipped') => void;
  onDelete: () => void;
}

const SwipeableTodoItem: React.FC<SwipeableTodoItemProps> = ({
  todo,
  onStatusUpdate,
  onDelete
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [initialX, setInitialX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartTime = useRef<number>(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80; // Minimum distance to trigger action
  const MAX_SWIPE = 100; // Maximum swipe distance
  const SWIPE_TIME_THRESHOLD = 300; // Maximum time for a swipe in ms

  const handleTouchStart = (e: React.TouchEvent) => {
    setInitialX(e.touches[0].clientX);
    touchStartTime.current = Date.now();
    setIsAnimating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - initialX;
    
    // Limit the swipe distance
    const newOffset = Math.min(Math.max(diff, -MAX_SWIPE), MAX_SWIPE);
    setSwipeOffset(newOffset);

    // Add resistance to the swipe
    if (Math.abs(diff) > MAX_SWIPE) {
      setSwipeOffset(newOffset * 0.2);
    }
  };

  const handleTouchEnd = () => {
    const swipeTime = Date.now() - touchStartTime.current;
    const isQuickSwipe = swipeTime < SWIPE_TIME_THRESHOLD;

    if (Math.abs(swipeOffset) >= SWIPE_THRESHOLD || (isQuickSwipe && Math.abs(swipeOffset) > 30)) {
      setIsAnimating(true);
      if (swipeOffset > 0) {
        // Swipe right - complete
        setSwipeOffset(MAX_SWIPE);
        setTimeout(() => {
          onStatusUpdate('completed');
          resetSwipe();
        }, 200);
      } else {
        // Swipe left - skip/delete
        setSwipeOffset(-MAX_SWIPE);
        setTimeout(() => {
          if (todo.status === 'completed') {
            onDelete();
          } else {
            onStatusUpdate('skipped');
          }
          resetSwipe();
        }, 200);
      }
    } else {
      resetSwipe();
    }
  };

  const resetSwipe = () => {
    setIsAnimating(true);
    setSwipeOffset(0);
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  };

  const getSwipeHintOpacity = () => {
    return Math.min(Math.abs(swipeOffset) / SWIPE_THRESHOLD, 1);
  };

  return (
    <div 
      className="swipeable-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={itemRef}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: isAnimating ? 'transform 0.2s ease' : 'none'
      }}
    >
      {/* Swipe hints */}
      <div 
        className="swipe-hint swipe-hint-left"
        style={{ opacity: swipeOffset < 0 ? getSwipeHintOpacity() : 0 }}
      >
        {todo.status === 'completed' ? '🗑️ Delete' : '⏭️ Skip'}
      </div>
      <div 
        className="swipe-hint swipe-hint-right"
        style={{ opacity: swipeOffset > 0 ? getSwipeHintOpacity() : 0 }}
      >
        ✓ Complete
      </div>

      <div className="todo-item">
        <div className="todo-content">
          <h3>{todo.title}</h3>
          {todo.dueDate && (
            <span className="due-date">
              Due: {todo.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="todo-status">
          {todo.status === 'completed' && <span className="status-badge completed">✓</span>}
          {todo.status === 'skipped' && <span className="status-badge skipped">⨯</span>}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTodoItem; 