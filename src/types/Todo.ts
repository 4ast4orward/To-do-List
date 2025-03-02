export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type TodoStatus = 'pending' | 'completed' | 'skipped';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface BackgroundSettings {
  type: 'preset' | 'gradient' | 'pattern' | 'image';
  preset?: string;
  gradient?: {
    colors: string[];
    angle: number;
  };
  pattern?: string;
  imageUrl?: string;
  opacity: number;
}

export interface UserStats {
  points: number;
  streak: number;
  totalCompleted: number;
  totalSkipped: number;
  achievements: Achievement[];
  level: number;
  backgroundSettings: BackgroundSettings;
  momentum: {
    level: number;
    multiplier: number;
    streakDays: number;
    weeklyTasks: number;
    lastWeekTasks: number;
    growthRate: number;
  };
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'skipped';
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
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