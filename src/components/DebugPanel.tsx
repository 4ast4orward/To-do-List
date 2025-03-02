import React, { useState, useEffect } from 'react';
import { clearAllData, saveUserStats, saveTodos } from '../utils/storage';
import { Todo, UserStats, Achievement } from '../types/Todo';
import { ACHIEVEMENTS } from '../utils/gameRules';

interface DebugPanelProps {
  userStats: UserStats;
  setUserStats: (stats: UserStats) => void;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  userStats,
  setUserStats,
  todos,
  setTodos,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '`') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const resetAllData = () => {
    clearAllData();
    setUserStats({
      points: 0,
      streak: 0,
      totalCompleted: 0,
      totalSkipped: 0,
      achievements: [],
      level: 1,
      backgroundSettings: {
        type: 'preset',
        preset: 'default',
        opacity: 1
      },
      momentum: {
        level: 1,
        multiplier: 1,
        streakDays: 0,
        weeklyTasks: 0,
        lastWeekTasks: 0,
        growthRate: 0
      },
      completedTasks: 0,
      skippedTasks: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActive: new Date().toISOString(),
      totalTasks: 0,
      tasksByCategory: {}
    });
    setTodos([]);
  };

  const addTestTodos = () => {
    const newTodos: Todo[] = [
      {
        id: 'test1',
        title: 'Early Bird Test',
        description: 'Test early completion',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'default',
        categoryId: 'default',
        priority: 'medium'
      },
      {
        id: 'test2',
        title: 'Weekend Task',
        description: 'Test weekend bonus',
        status: 'pending',
        dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'work',
        categoryId: 'work',
        priority: 'medium'
      },
    ];

    setTodos([...todos, ...newTodos]);
    saveTodos([...todos, ...newTodos]);
  };

  const modifyPoints = (amount: number) => {
    const newStats = {
      ...userStats,
      points: Math.max(0, userStats.points + amount),
    };
    setUserStats(newStats);
    saveUserStats(newStats);
  };

  const modifyStreak = (amount: number) => {
    const newStats = {
      ...userStats,
      streak: Math.max(0, userStats.streak + amount),
    };
    setUserStats(newStats);
    saveUserStats(newStats);
  };

  const unlockRandomAchievement = () => {
    const lockedAchievements = ACHIEVEMENTS.filter(
      achievement => !userStats.achievements.find(a => a.id === achievement.id)
    );
    
    if (lockedAchievements.length > 0) {
      const randomAchievement = lockedAchievements[
        Math.floor(Math.random() * lockedAchievements.length)
      ];
      
      const newAchievement: Achievement = {
        id: randomAchievement.id,
        title: randomAchievement.name || randomAchievement.title, // Handle both name and title
        description: randomAchievement.description,
        icon: randomAchievement.icon,
        unlockedAt: new Date().toISOString()
      };
      
      const newStats: UserStats = {
        ...userStats,
        achievements: [...userStats.achievements, newAchievement],
      };
      
      setUserStats(newStats);
      saveUserStats(newStats);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="debug-panel">
      <h2>🛠️ Debug Panel</h2>
      <p className="debug-hint">Press ` to toggle</p>
      
      <div className="debug-section">
        <h3>Data Management</h3>
        <button onClick={resetAllData}>Reset All Data</button>
        <button onClick={addTestTodos}>Add Test Todos</button>
      </div>

      <div className="debug-section">
        <h3>Points & Streak</h3>
        <div className="debug-buttons">
          <button onClick={() => modifyPoints(-50)}>-50 Points</button>
          <button onClick={() => modifyPoints(-10)}>-10 Points</button>
          <button onClick={() => modifyPoints(10)}>+10 Points</button>
          <button onClick={() => modifyPoints(50)}>+50 Points</button>
        </div>
        <div className="debug-buttons">
          <button onClick={() => modifyStreak(-1)}>-1 Streak</button>
          <button onClick={() => modifyStreak(1)}>+1 Streak</button>
        </div>
      </div>

      <div className="debug-section">
        <h3>Achievements</h3>
        <button onClick={unlockRandomAchievement}>Unlock Random Achievement</button>
      </div>

      <div className="debug-section">
        <h3>Current Stats</h3>
        <pre>
          {JSON.stringify(
            {
              points: userStats.points,
              level: userStats.level,
              streak: userStats.streak,
              totalCompleted: userStats.totalCompleted,
              achievementsUnlocked: userStats.achievements.length,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel; 