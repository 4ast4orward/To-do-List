export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: {
    type: 'tasks' | 'streak' | 'category' | 'points';
    target: number;
    categoryId?: string;
  };
  reward: {
    points: number;
    multiplier?: number;
    achievement?: string;
  };
  progress: number;
  completed: boolean;
  expiresAt: Date;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: {
    points: number;
    streak: number;
  };
  completed: boolean;
  refreshedAt: Date;
}

export interface QuestProgress {
  currentQuests: DailyQuest[];
  completedQuests: string[];
  lastRefresh: Date;
  streakMultiplier: number;
} 