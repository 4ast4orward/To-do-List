import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isFuture, differenceInDays, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, isSameMonth } from 'date-fns';
import { Todo, Category, TodoStatus, UserStats, DEFAULT_CATEGORIES } from '../types/Todo';
import { calculateTaskPoints, checkAchievements } from '../utils/gameRules';
import ResetMenu from './ResetMenu';
import Toast from './Toast';
import SwipeableTodoItem from './SwipeableTodoItem';

const COMMON_EMOJIS = ['💼', '👤', '🛒', '❤️', '📌', '🎮', '📚', '✈️', '🎵', '🎨', '🏃', '🍳', '🎬', '💻', '🎓'];

interface TodoActionMenuProps {
  todo: Todo;
  onClose: () => void;
  onStatusChange: (status: TodoStatus) => void;
  onReschedule: (date: Date) => void;
}

const TodoActionMenu: React.FC<TodoActionMenuProps> = ({ todo, onClose, onStatusChange, onReschedule }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todo.dueDate);
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
              setSelectedDate(newDate);
              onReschedule(newDate);
              onClose();
            }}
          />
        </div>
      )}
    </div>
  );
};

interface TodoListProps {
  todos: Todo[];
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onAddTodo: (todo: Todo) => void;
  onUpdateTodo: (todo: Todo) => void;
  onDeleteTodo: (todoId: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  userStats,
  setUserStats,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo
}) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📌');
  const [newCategoryColor, setNewCategoryColor] = useState('#95a5a6');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Add new state for archived todos
  const [archivedTodos, setArchivedTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('archivedTodos');
    return saved ? JSON.parse(saved) : [];
  });

  // Check for monthly reset
  useEffect(() => {
    const now = new Date();
    const lastResetDate = localStorage.getItem('lastResetDate');
    
    if (!lastResetDate || !isSameMonth(new Date(lastResetDate), now)) {
      // Archive completed and skipped tasks from previous month
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
        onUpdateTodo(currentTodos);
        
        // Show notification about archived tasks
        const notification = `${tasksToArchive.length} tasks from ${format(new Date(lastResetDate || ''), 'MMMM')} have been archived.`;
        alert(notification);
      }
      
      // Update last reset date
      localStorage.setItem('lastResetDate', now.toISOString());
    }
  }, []);

  // Save archived todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('archivedTodos', JSON.stringify(archivedTodos));
  }, [archivedTodos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: newTodoTitle.trim(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: newTodoDueDate ? new Date(newTodoDueDate) : null,
      categoryId: selectedCategory?.id || null
    };

    onAddTodo(newTodo);
    setNewTodoTitle('');
    setNewTodoDueDate('');
    setSelectedCategory(null);

    // Update user stats
    setUserStats(prev => ({
      ...prev,
      totalTasks: prev.totalTasks + 1,
      tasksByCategory: {
        ...prev.tasksByCategory,
        [selectedCategory?.id || 'uncategorized']: (prev.tasksByCategory[selectedCategory?.id || 'uncategorized'] || 0) + 1
      }
    }));
  };

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
    if (categories.length <= 1) return; // Prevent deleting all categories
    setCategories(categories.filter(cat => cat.id !== categoryId));
    onUpdateTodo(todos.map(todo => 
      todo.categoryId === categoryId 
        ? { ...todo, categoryId: 'other' } 
        : todo
    ));
    if (selectedCategory?.id === categoryId) setSelectedCategory(null);
    if (filterCategoryId === categoryId) setFilterCategoryId('all');
  };

  const handleStatusUpdate = (todo: Todo, newStatus: 'pending' | 'completed' | 'skipped') => {
    const updatedTodo = {
      ...todo,
      status: newStatus,
      updatedAt: new Date()
    };
    onUpdateTodo(updatedTodo);

    // Update user stats
    setUserStats(prev => {
      const stats = { ...prev };
      if (newStatus === 'completed') {
        stats.completedTasks++;
        stats.currentStreak = (stats.currentStreak || 0) + 1;
        stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
      } else if (newStatus === 'skipped') {
        stats.skippedTasks++;
        stats.currentStreak = 0;
      }
      stats.lastActive = new Date();
      return stats;
    });
  };

  const getDueStatus = (todo: Todo) => {
    if (todo.status !== 'pending') return '';
    
    const today = new Date();
    const daysUntilDue = differenceInDays(todo.dueDate, today);
    
    if (!isFuture(todo.dueDate) && !isToday(todo.dueDate)) {
      return 'overdue';
    }
    if (isToday(todo.dueDate)) {
      return 'due-today';
    }
    if (daysUntilDue <= 3) {
      return 'due-soon';
    }
    return '';
  };

  const getDueStatusText = (todo: Todo) => {
    if (todo.status !== 'pending') return '';
    
    const today = new Date();
    const daysUntilDue = differenceInDays(todo.dueDate, today);
    
    if (!isFuture(todo.dueDate) && !isToday(todo.dueDate)) {
      return '⚠️ Overdue';
    }
    if (isToday(todo.dueDate)) {
      return '⏰ Due Today';
    }
    if (daysUntilDue <= 3) {
      return `🕒 Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
    }
    return '';
  };

  const getStatusBadge = (todo: Todo) => {
    switch (todo.status) {
      case 'completed':
        return <span className="status-badge completed">✓ Completed</span>;
      case 'skipped':
        return <span className="status-badge skipped">⤵️ Skipped</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (todo: Todo) => {
    if (todo.status === 'completed') return '✅';
    if (todo.status === 'skipped') return '⏭️';
    
    const today = new Date();
    const daysUntilDue = differenceInDays(todo.dueDate, today);
    
    if (!isFuture(todo.dueDate) && !isToday(todo.dueDate)) {
      return '⚠️';  // Overdue
    }
    if (isToday(todo.dueDate)) {
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

  const filteredAndSortedTodos = [...todos]
    .filter(todo => filterCategoryId === 'all' || todo.categoryId === filterCategoryId)
    .sort((a, b) => {
      // First, sort by status (pending first)
      if (a.status !== b.status) {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
      }
      // Then by due date
      return a.dueDate.getTime() - b.dueDate.getTime();
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
    const completedTasks = todos.filter(todo => todo.status === 'completed');
    onUpdateTodo(todos.filter(todo => todo.status !== 'completed'));
    setShowToast({
      message: `Cleared ${completedTasks.length} completed tasks`,
      type: 'success'
    });
  };

  const handleClearAll = () => {
    const taskCount = todos.length;
    onUpdateTodo([]);
    setShowToast({
      message: `Cleared all ${taskCount} tasks`,
      type: 'success'
    });
  };

  const handleReset = () => {
    // Reset to initial state
    onUpdateTodo([]);
    setCategories(DEFAULT_CATEGORIES);
    setUserStats({
      points: 0,
      streak: 0,
      totalCompleted: 0,
      totalSkipped: 0,
      achievements: [],
      level: 1,
      backgroundSettings: {
        type: 'preset',
        preset: 'basic',
        opacity: 1
      },
      momentum: {
        level: 1,
        multiplier: 1,
        streakDays: 0,
        weeklyTasks: 0,
        lastWeekTasks: 0,
        growthRate: 0
      }
    });
    setShowToast({
      message: 'App reset to default state',
      type: 'info'
    });
  };

  const closeToast = () => setShowToast(null);

  // Monthly stats
  const getMonthlyStats = () => {
    const now = new Date();
    const completedThisMonth = todos.filter(todo => 
      todo.status === 'completed' && 
      isWithinInterval(todo.updatedAt, {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
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
      
      {/* Add monthly stats */}
      <div className="monthly-stats">
        <p>This Month's Progress:</p>
        <div className="stats-row">
          <span>Completed: {monthlyStats.completed}</span>
          <span>Pending: {monthlyStats.pending}</span>
        </div>
      </div>

      {/* Add Reset Menu */}
      <ResetMenu
        todos={todos}
        onClearCompleted={handleClearCompleted}
        onClearAll={handleClearAll}
        onReset={handleReset}
      />

      <form onSubmit={handleSubmit} className="todo-form">
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
              const category = DEFAULT_CATEGORIES.find(c => c.id === e.target.value);
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
              style={{ '--category-color': category.color } as any}
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

      <div className="todos">
        {filteredAndSortedTodos.map((todo) => (
          <SwipeableTodoItem
            key={todo.id}
            todo={todo}
            onStatusUpdate={(newStatus) => handleStatusUpdate(todo, newStatus)}
            onDelete={() => {
              onDeleteTodo(todo.id);
            }}
          >
            <div className={`todo-item ${todo.status}`}>
              <div className="todo-content">
                <div className="todo-header">
                  <h3>{todo.title}</h3>
                  <span className="category-badge">
                    {getCategory(todo.categoryId || 'uncategorized').name}
                  </span>
                </div>
                <p>Due: {format(new Date(todo.dueDate), 'PPp')}</p>
              </div>
            </div>
          </SwipeableTodoItem>
        ))}
      </div>
    </div>
  );
};

export default TodoList;