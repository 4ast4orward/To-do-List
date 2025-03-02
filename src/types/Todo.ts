export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type TodoStatus = 'pending' | 'completed' | 'skipped';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface BackgroundSettings {
  type: 'preset' | 'gradient' | 'image' | 'pattern';
  preset?: string;
  gradient?: {
    colors: string[];
    angle: number;
  };
  imageUrl?: string;
  pattern?: string;
  opacity: number;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  currentStreak: number;
  longestStreak: number;
  tasksByCategory: Record<string, number>;
  lastActive: Date;
}

export interface Todo {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'skipped';
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  categoryId: string | null;
}

export interface MomentumStats {
  level: number;
  multiplier: number;
  streakDays: number;
  weeklyTasks: number;
  lastWeekTasks: number;
  growthRate: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#4CAF50', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#2196F3', icon: '👤' },
  { id: 'shopping', name: 'Shopping', color: '#FF9800', icon: '🛒' },
  { id: 'health', name: 'Health', color: '#E91E63', icon: '❤️' },
]; 