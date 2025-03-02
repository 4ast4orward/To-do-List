import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isFuture, differenceInDays, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, isSameMonth } from 'date-fns';
import { Todo as TodoType, Category, TodoStatus, UserStats, DEFAULT_CATEGORIES } from '../types/Todo';
import { calculateTaskPoints, checkAchievements } from '../utils/gameRules';
import ResetMenu from './ResetMenu';
import Toast from './Toast';
import SwipeableTodoItem from './SwipeableTodoItem';
import TodoItem from './Todo';

const COMMON_EMOJIS = ['💼', '👤', '🛒', '❤️', '📌', '🎮', '📚', '✈️', '🎵', '🎨', '🏃', '🍳', '🎬', '💻', '🎓'];

interface TodoActionMenuProps {
  todo: TodoType;
  onClose: () => void;
  onStatusChange: (status: TodoStatus) => void;
  onReschedule: (date: Date) => void;
}

const TodoActionMenu: React.FC<TodoActionMenuProps> = ({ todo, onClose, onStatusChange, onReschedule }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(todo.dueDate || new Date());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="todo-action-menu" ref={menuRef}>
      <button onClick={() => onStatusChange('completed')}>
        ✓ Mark as Complete
      </button>
      <button onClick={() => onStatusChange('skipped')}>
        ⤵️ Skip Task
      </button>
      <button onClick={() => setShowCalendar(!showCalendar)}>
        📅 Reschedule
      </button>
      {showCalendar && (
        <div className="calendar-popup">
          <input
            type="datetime-local"
            value={format(selectedDate, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                setSelectedDate(newDate);
                onReschedule(newDate);
                onClose();
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

interface TodoListProps {
  todos: TodoType[];
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAddTodo: (todo: TodoType) => void;
  onUpdateTodos: (todos: TodoType[]) => void;
  onDeleteTodo: (todoId: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  userStats, 
  setUserStats, 
  onAddTodo, 
  onUpdateTodos, 
  onDeleteTodo 
}) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📌');
  const [newCategoryColor, setNewCategoryColor] = useState('#95a5a6');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Add new state for archived todos
  const [archivedTodos, setArchivedTodos] = useState<TodoType[]>(() => {
    const saved = localStorage.getItem('archivedTodos');
    return saved ? JSON.parse(saved) : [];
  });

  // Check for monthly reset
  useEffect(() => {
    const now = new Date();
    const lastResetDate = localStorage.getItem('lastResetDate');
    
    if (!lastResetDate || !isSameMonth(new Date(lastResetDate), now)) {
      const currentTodos = todos.filter(todo => 
        todo.status === 'pending' || 
        (todo.completedAt && isSameMonth(todo.completedAt, now)) ||
        (todo.skippedAt && isSameMonth(todo.skippedAt, now))
      );
      
      const tasksToArchive = todos.filter(todo => 
        (todo.status !== 'pending' && !isSameMonth(todo.createdAt, now)) ||
        (todo.completedAt && !isSameMonth(todo.completedAt, now)) ||
        (todo.skippedAt && !isSameMonth(todo.skippedAt, now))
      );

      if (tasksToArchive.length > 0) {
        setArchivedTodos(prev => [...prev, ...tasksToArchive]);
        onUpdateTodos(currentTodos);
        
        const notification = `${tasksToArchive.length} tasks from ${format(new Date(lastResetDate || ''), 'MMMM')} have been archived.`;
        alert(notification);
      }
      
      localStorage.setItem('lastResetDate', now.toISOString());
    }
  }, []);

  // Save archived todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('archivedTodos', JSON.stringify(archivedTodos));
  }, [archivedTodos]);

  useEffect(() => {
    onUpdateTodos(todos);
  }, [todos, onUpdateTodos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo: TodoType = {
      id: crypto.randomUUID(),
      title: newTodoTitle.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: newTodoDueDate || new Date().toISOString(),
      category: selectedCategory?.name || 'Other',
      categoryId: selectedCategory?.id || 'other',
      priority: 'medium'
    };

    onAddTodo(newTodo);
    setNewTodoTitle('');
    setNewTodoDueDate('');
    setSelectedCategory(null);
  };

  const handleStatusUpdate = (todoId: string, newStatus: TodoStatus) => {
    onUpdateTodos(todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          skippedAt: newStatus === 'skipped' ? new Date().toISOString() : undefined
        };
      }
      return todo;
    }));
  };

  const handleDeleteTodo = (todoId: string) => {
    onUpdateTodos(todos.filter(todo => todo.id !== todoId));
  };

  const handleEditTodo = (updatedTodo: TodoType) => {
    onUpdateTodos(todos.map(todo => 
      todo.id === updatedTodo.id ? { ...updatedTodo, updatedAt: new Date().toISOString() } : todo
    ));
  };

  const filteredTodos = todos.filter(todo => 
    filterCategoryId === 'all' || todo.categoryId === filterCategoryId
  );

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: newCategoryColor,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryIcon('📌');
    setNewCategoryColor('#95a5a6');
    setShowNewCategoryForm(false);
  };

  const deleteCategory = (categoryId: string) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter(cat => cat.id !== categoryId));
    const updatedTodos = todos.map(todo => 
      todo.categoryId === categoryId 
        ? { ...todo, categoryId: 'other', category: 'Other' } 
        : todo
    );
    onUpdateTodos(updatedTodos);
    if (selectedCategory?.id === categoryId) setSelectedCategory(null);
    if (filterCategoryId === categoryId) setFilterCategoryId('all');
  };

  const getDueStatus = (todo: TodoType) => {
    if (todo.status !== 'pending') return '';
    
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    
    if (isNaN(dueDate.getTime())) return '';
    
    const daysUntilDue = differenceInDays(dueDate, today);
    
    if (!isFuture(dueDate) && !isToday(dueDate)) {
      return 'overdue';
    }
    if (isToday(dueDate)) {
      return 'due-today';
    }
    if (daysUntilDue <= 3) {
      return 'due-soon';
    }
    return '';
  };

  const getDueStatusText = (todo: TodoType) => {
    if (todo.status !== 'pending') return '';
    
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    
    if (isNaN(dueDate.getTime())) return '';
    
    const daysUntilDue = differenceInDays(dueDate, today);
    
    if (!isFuture(dueDate) && !isToday(dueDate)) {
      return '⚠️ Overdue';
    }
    if (isToday(dueDate)) {
      return '⏰ Due Today';
    }
    if (daysUntilDue <= 3) {
      return `🕒 Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
    }
    return '';
  };

  const getStatusBadge = (todo: TodoType) => {
    switch (todo.status) {
      case 'completed':
        return <span className="status-badge completed">✓ Completed</span>;
      case 'skipped':
        return <span className="status-badge skipped">⤵️ Skipped</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (todo: TodoType) => {
    if (todo.status === 'completed') return '✅';
    if (todo.status === 'skipped') return '⏭️';
    
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    
    if (isNaN(dueDate.getTime())) return '📝';
    
    const daysUntilDue = differenceInDays(dueDate, today);
    
    if (!isFuture(dueDate) && !isToday(dueDate)) {
      return '⚠️';  // Overdue
    }
    if (isToday(dueDate)) {
      return '⏰';  // Due Today
    }
    if (daysUntilDue <= 3) {
      return '🕒';  // Due Soon
    }
    return '📝';  // Regular task
  };

  const getCategory = (categoryId: string | null): Category => {
    if (!categoryId) return { id: 'uncategorized', name: 'Uncategorized', color: '#95a5a6', icon: '📌' };
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId) || 
           { id: 'uncategorized', name: 'Uncategorized', color: '#95a5a6', icon: '📌' };
  };

  const filteredAndSortedTodos = [...filteredTodos]
    .sort((a, b) => {
      // First, sort by status (pending first)
      if (a.status !== b.status) {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
      }
      
      // Then by due date
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      
      if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
      if (isNaN(aDate.getTime())) return 1;
      if (isNaN(bDate.getTime())) return -1;
      
      return aDate.getTime() - bDate.getTime();
    });

  const calculateWeeklyCompletions = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    return todos.filter(todo => 
      todo.status === 'completed' && 
      isWithinInterval(todo.updatedAt, { start: weekStart, end: weekEnd })
    ).length;
  };

  useEffect(() => {
    const weeklyCompletions = calculateWeeklyCompletions();
    document.body.className = '';
    if (weeklyCompletions >= 20) {
      document.body.classList.add('achievement-background');
    } else if (weeklyCompletions >= 15) {
      document.body.classList.add('productive-background');
    } else if (weeklyCompletions >= 10) {
      document.body.classList.add('progress-background');
    } else if (weeklyCompletions >= 5) {
      document.body.classList.add('starter-background');
    } else {
      document.body.classList.add('basic-background');
    }
  }, [todos]);

  const handleClearCompleted = () => {
    const remainingTodos = todos.filter(todo => todo.status !== 'completed');
    onUpdateTodos(remainingTodos);
    setShowToast({
      message: `Cleared ${todos.length - remainingTodos.length} completed tasks`,
      type: 'success'
    });
  };

  const handleClearAll = () => {
    const taskCount = todos.length;
    onUpdateTodos([]);
    setShowToast({
      message: `Cleared all ${taskCount} tasks`,
      type: 'success'
    });
  };

  const handleReset = () => {
    onUpdateTodos([]);
    setCategories(DEFAULT_CATEGORIES);
    setShowToast({
      message: 'App reset to default state',
      type: 'info'
    });
  };

  const closeToast = () => setShowToast(null);

  // Monthly stats
  const getMonthlyStats = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    
    const completedThisMonth = todos.filter(todo => 
      todo.status === 'completed' && 
      todo.completedAt && 
      isWithinInterval(new Date(todo.completedAt), {
        start: monthStart,
        end: now
      })
    ).length;

    const pendingCount = todos.filter(todo => todo.status === 'pending').length;

    return {
      completed: completedThisMonth,
      pending: pendingCount
    };
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="todo-list">
      <h1>To Do or To Done List</h1>
      
      {/* Monthly stats */}
      <div className="monthly-stats">
        <p>This Month's Progress:</p>
        <div className="stats-row">
          <span>Completed: {monthlyStats.completed}</span>
          <span>Pending: {monthlyStats.pending}</span>
        </div>
      </div>

      {/* Reset Menu */}
      <ResetMenu
        todos={todos}
        onClearCompleted={handleClearCompleted}
        onClearAll={handleClearAll}
        onReset={handleReset}
      />

      {/* Toast notification */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={closeToast}
        />
      )}

      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} className="todo-form">
        <div className="form-row">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a new task..."
            required
          />
          <input
            type="date"
            value={newTodoDueDate}
            onChange={(e) => setNewTodoDueDate(e.target.value)}
            required
          />
          <select
            value={selectedCategory?.id || ''}
            onChange={(e) => {
              const category = categories.find(c => c.id === e.target.value);
              setSelectedCategory(category || null);
            }}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          <button type="submit">Add Task</button>
        </div>
      </form>

      {/* Category management */}
      <div className="category-management">
        <button 
          className="add-category-btn"
          onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
        >
          {showNewCategoryForm ? '✕ Cancel' : '+ New Category'}
        </button>

        {showNewCategoryForm && (
          <form onSubmit={addCategory} className="category-form">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              required
            />
            <div className="emoji-picker">
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="emoji-trigger"
              >
                {newCategoryIcon}
              </button>
              {showEmojiPicker && (
                <div className="emoji-list">
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewCategoryIcon(emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              title="Choose category color"
            />
            <button type="submit">Add Category</button>
          </form>
        )}
      </div>

      {/* Category filter */}
      <div className="category-filter">
        <button
          className={`filter-btn ${filterCategoryId === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategoryId('all')}
        >
          All
        </button>
        {categories.map((category) => (
          <div key={category.id} className="category-filter-item">
            <button
              className={`filter-btn ${filterCategoryId === category.id ? 'active' : ''}`}
              onClick={() => setFilterCategoryId(category.id)}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              {category.icon} {category.name}
            </button>
            {category.id !== 'other' && (
              <button
                className="delete-category-btn"
                onClick={() => deleteCategory(category.id)}
                title="Delete category"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Todo list */}
      <div className="todos">
        {filteredAndSortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={(newStatus: TodoStatus) => handleStatusUpdate(todo.id, newStatus)}
            onDelete={() => handleDeleteTodo(todo.id)}
            onEdit={handleEditTodo}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;