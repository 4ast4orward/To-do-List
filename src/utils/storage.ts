import { UserStats, Todo } from '../types/Todo';

const STORAGE_KEYS = {
  USER_STATS: 'todoApp_userStats',
  TODOS: 'todoApp_todos',
};

const defaultStats: UserStats = {
  totalTasks: 0,
  completedTasks: 0,
  skippedTasks: 0,
  currentStreak: 0,
  longestStreak: 0,
  tasksByCategory: {},
  lastActive: new Date(),
};

export const loadUserStats = (): UserStats => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
  if (!stored) {
    return defaultStats;
  }
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    if (parsed.lastActive) {
      parsed.lastActive = new Date(parsed.lastActive);
    }
    return parsed;
  } catch (error) {
    console.error('Error loading user stats:', error);
    return defaultStats;
  }
};

export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
};

export const loadTodos = (): Todo[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TODOS);
  if (!stored) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((todo: Todo) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    }));
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
};

export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

// Helper function to clear all data (useful for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_STATS);
  localStorage.removeItem(STORAGE_KEYS.TODOS);
}; 