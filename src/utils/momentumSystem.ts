import { UserStats, Todo, MomentumStats } from '../types/Todo';
import { startOfWeek, endOfWeek, isWithinInterval, differenceInDays } from 'date-fns';

const MOMENTUM_LEVELS = {
  1: { multiplier: 1.0, threshold: 0 },
  2: { multiplier: 1.2, threshold: 5 },
  3: { multiplier: 1.5, threshold: 10 },
  4: { multiplier: 2.0, threshold: 15 },
  5: { multiplier: 2.5, threshold: 20 }
};

export const calculateMomentum = (todos: Todo[], currentStats: UserStats): MomentumStats => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const lastWeekStart = startOfWeek(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  const lastWeekEnd = endOfWeek(new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000));

  // Calculate weekly tasks
  const weeklyTasks = todos.filter(todo => 
    todo.status === 'completed' && 
    todo.completedAt &&
    isWithinInterval(todo.completedAt, { start: weekStart, end: weekEnd })
  ).length;

  // Calculate last week's tasks
  const lastWeekTasks = todos.filter(todo => 
    todo.status === 'completed' && 
    todo.completedAt &&
    isWithinInterval(todo.completedAt, { start: lastWeekStart, end: lastWeekEnd })
  ).length;

  // Calculate streak days
  const streakDays = currentStats.streak || 0;

  // Calculate growth rate
  const growthRate = lastWeekTasks > 0 
    ? ((weeklyTasks - lastWeekTasks) / lastWeekTasks) * 100 
    : 0;

  // Determine momentum level based on weekly tasks and streak
  let level = 1;
  for (let i = 5; i >= 1; i--) {
    if (weeklyTasks >= MOMENTUM_LEVELS[i as keyof typeof MOMENTUM_LEVELS].threshold) {
      level = i;
      break;
    }
  }

  // Apply streak bonus to multiplier
  const baseMultiplier = MOMENTUM_LEVELS[level as keyof typeof MOMENTUM_LEVELS].multiplier;
  const streakBonus = Math.min(streakDays * 0.1, 1.0); // Max 100% bonus from streak
  const multiplier = baseMultiplier + streakBonus;

  return {
    level,
    multiplier,
    streakDays,
    weeklyTasks,
    lastWeekTasks,
    growthRate
  };
};

export const calculateTaskPoints = (todo: Todo, momentum: MomentumStats): number => {
  let basePoints = 10;

  // Add points based on task completion speed
  if (todo.status === 'completed' && todo.dueDate) {
    const daysEarly = differenceInDays(todo.dueDate, todo.updatedAt);
    if (daysEarly > 0) {
      basePoints += daysEarly * 2; // Bonus points for early completion
    }
  }

  // Apply momentum multiplier
  return Math.round(basePoints * momentum.multiplier);
};

export const getMomentumBenefits = (momentum: MomentumStats) => {
  return {
    pointMultiplier: momentum.multiplier,
    streakBonus: Math.min(momentum.streakDays * 0.1, 1.0),
    weeklyProgress: (momentum.weeklyTasks / MOMENTUM_LEVELS[5].threshold) * 100,
    growthIndicator: momentum.growthRate >= 0 ? 'increasing' : 'decreasing',
    nextLevelThreshold: momentum.level < 5 
      ? MOMENTUM_LEVELS[(momentum.level + 1) as keyof typeof MOMENTUM_LEVELS].threshold 
      : null,
    tasksToNextLevel: momentum.level < 5 
      ? MOMENTUM_LEVELS[(momentum.level + 1) as keyof typeof MOMENTUM_LEVELS].threshold - momentum.weeklyTasks 
      : 0
  };
}; 