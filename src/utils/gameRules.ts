import { Todo, UserStats, Achievement } from '../types/Todo';

export const ACHIEVEMENTS = [
  {
    id: 'first_todo',
    name: 'First Step',
    description: 'Complete your first todo',
    icon: '🎯'
  },
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Complete tasks for 3 days in a row',
    icon: '🌱'
  },
  {
    id: 'streak_7',
    name: 'Momentum',
    description: 'Complete tasks for 7 days in a row',
    icon: '🔥'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: '🌅'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🌙'
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 5 tasks on weekends',
    icon: '🎮'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 tasks before their due date',
    icon: '💎'
  },
  {
    id: 'category_master',
    name: 'Category Master',
    description: 'Complete tasks in all default categories',
    icon: '🎯'
  },
  {
    id: 'custom_category',
    name: 'Personal Touch',
    description: 'Create your first custom category',
    icon: '🎨'
  },
  {
    id: 'task_streak_5',
    name: 'Momentum',
    description: 'Complete 5 tasks in a single day',
    icon: '🚀'
  }
];

export const calculateTaskPoints = (todo: Todo): number => {
  const now = new Date();
  const dueDate = todo.dueDate;
  const createdDate = todo.createdAt;
  
  let points = 10; // Base points

  // Bonus for completing before due date
  if (dueDate && now < dueDate) {
    const daysEarly = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    points += daysEarly * 2;
  }

  // Bonus for quick completion
  const hoursToComplete = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  if (hoursToComplete < 1) {
    points += 5; // Quick completion bonus
  }

  // Weekend bonus
  if (now.getDay() === 0 || now.getDay() === 6) {
    points += 5;
  }

  // Early bird bonus (before 9 AM)
  if (now.getHours() < 9) {
    points += 3;
  }

  // Night owl bonus (after 10 PM)
  if (now.getHours() >= 22) {
    points += 3;
  }

  return points;
};

export const checkAchievements = (
  stats: UserStats,
  todo: Todo
): Achievement[] => {
  const unlockedAchievements: Achievement[] = [];
  const now = new Date();

  // Check each achievement condition
  ACHIEVEMENTS.forEach(achievement => {
    switch (achievement.id) {
      case 'first_todo':
        if (stats.completedTasks === 1) {
          unlockedAchievements.push({ ...achievement, unlockedAt: now });
        }
        break;
      case 'streak_3':
        if (stats.currentStreak >= 3) {
          unlockedAchievements.push({ ...achievement, unlockedAt: now });
        }
        break;
      case 'streak_7':
        if (stats.currentStreak >= 7) {
          unlockedAchievements.push({ ...achievement, unlockedAt: now });
        }
        break;
      case 'early_bird':
        if (todo.status === 'completed' && todo.updatedAt.getHours() < 9) {
          unlockedAchievements.push({ ...achievement, unlockedAt: now });
        }
        break;
      case 'night_owl':
        if (todo.status === 'completed' && todo.updatedAt.getHours() >= 22) {
          unlockedAchievements.push({ ...achievement, unlockedAt: now });
        }
        break;
    }
  });

  return unlockedAchievements;
}; 