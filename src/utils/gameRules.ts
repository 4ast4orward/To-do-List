import { Todo, UserStats, Achievement } from '../types/Todo';

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_todo',
    title: 'First Step',
    description: 'Complete your first todo',
    icon: '🎯'
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Complete tasks for 3 days in a row',
    icon: '🌱'
  },
  {
    id: 'streak_7',
    title: 'Momentum',
    description: 'Complete tasks for 7 days in a row',
    icon: '🔥'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task before its due date',
    icon: '🌅'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🌙'
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Complete 5 tasks on weekends',
    icon: '🎮'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 10 tasks before their due date',
    icon: '💎'
  },
  {
    id: 'category_master',
    title: 'Category Master',
    description: 'Complete tasks in all default categories',
    icon: '🎯'
  },
  {
    id: 'custom_category',
    title: 'Personal Touch',
    description: 'Create your first custom category',
    icon: '🎨'
  },
  {
    id: 'task_streak_5',
    title: 'Momentum Builder',
    description: 'Complete 5 tasks in a single day',
    icon: '🚀'
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day completion streak',
    icon: '🔥'
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: '✨'
  },
  {
    id: 'category_pro',
    title: 'Category Pro',
    description: 'Use all task categories',
    icon: '📊'
  },
  {
    id: 'momentum_king',
    title: 'Momentum King',
    description: 'Reach 2x momentum multiplier',
    icon: '👑'
  }
];

export const calculateTaskPoints = (todo: Todo): number => {
  try {
    const now = new Date();
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    const createdDate = todo.createdAt ? new Date(todo.createdAt) : null;
    
    let points = 10; // Base points

    // Validate dates
    if (dueDate && !isNaN(dueDate.getTime())) {
      // Bonus for completing before due date
      if (now < dueDate) {
        const daysEarly = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        points += Math.min(daysEarly * 2, 20); // Cap early completion bonus at 20 points
      }
    }

    if (createdDate && !isNaN(createdDate.getTime())) {
      // Bonus for quick completion
      const hoursToComplete = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      if (hoursToComplete < 1) {
        points += 5; // Quick completion bonus
      }
    }

    // Time-based bonuses
    const currentHour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Weekend bonus
    if (isWeekend) {
      points += 5;
    }

    // Early bird bonus (before 9 AM)
    if (currentHour < 9) {
      points += 3;
    }

    // Night owl bonus (after 10 PM)
    if (currentHour >= 22) {
      points += 3;
    }

    // Ensure points are always positive
    return Math.max(0, points);
  } catch (error) {
    console.error('Error calculating task points:', error);
    return 10; // Return base points if there's an error
  }
};

export const checkAchievements = (
  stats: UserStats,
  todo: Todo
): Achievement[] => {
  const unlockedAchievements: Achievement[] = [];
  const now = new Date();
  const updatedAt = new Date(todo.updatedAt);
  const dueDate = new Date(todo.dueDate);

  // Check each achievement condition
  ACHIEVEMENTS.forEach(achievement => {
    if (!stats.achievements.some(a => a.id === achievement.id)) {
      switch (achievement.id) {
        case 'first_todo':
          if (stats.completedTasks === 1) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'streak_3':
          if (stats.currentStreak >= 3) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'streak_7':
          if (stats.currentStreak >= 7) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'early_bird':
          if (todo.status === 'completed' && !isNaN(updatedAt.getTime()) && updatedAt.getHours() < 9) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'night_owl':
          if (todo.status === 'completed' && !isNaN(updatedAt.getTime()) && updatedAt.getHours() >= 22) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'weekend_warrior':
          if (todo.status === 'completed' && (now.getDay() === 0 || now.getDay() === 6)) {
            const weekendTasks = stats.tasksByCategory['weekend'] || 0;
            if (weekendTasks >= 5) {
              unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
            }
          }
          break;

        case 'perfectionist':
          if (todo.status === 'completed' && !isNaN(dueDate.getTime()) && now < dueDate) {
            const earlyTasks = stats.tasksByCategory['early'] || 0;
            if (earlyTasks >= 10) {
              unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
            }
          }
          break;

        case 'category_master':
          const usedCategories = new Set(Object.keys(stats.tasksByCategory));
          if (usedCategories.size >= DEFAULT_CATEGORIES.length) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'task_streak_5':
          const todayTasks = stats.tasksByCategory[now.toISOString().split('T')[0]] || 0;
          if (todayTasks >= 5) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'task_master':
          if (stats.completedTasks >= 50) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'momentum_king':
          if (stats.momentum.multiplier >= 2) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;

        case 'category_pro':
          const categoriesWithTasks = Object.keys(stats.tasksByCategory).length;
          if (categoriesWithTasks >= DEFAULT_CATEGORIES.length) {
            unlockedAchievements.push({ ...achievement, unlockedAt: now.toISOString() });
          }
          break;
      }
    }
  });

  return unlockedAchievements;
}; 