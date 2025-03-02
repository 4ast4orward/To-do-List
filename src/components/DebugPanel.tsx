import React, { useState, useEffect } from 'react';
import { clearAllData, saveUserStats, saveTodos } from '../utils/storage';
import { Todo, UserStats } from '../types/Todo';
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
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        createdAt: new Date(),
        categoryId: 'default',
        points: 10,
      },
      {
        id: 'test2',
        title: 'Weekend Task',
        description: 'Test weekend bonus',
        status: 'pending',
        dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
        createdAt: new Date(),
        categoryId: 'work',
        points: 10,
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
      
      const newAchievement = {
        ...randomAchievement,
        unlockedAt: new Date(),
      };
      
      const newStats = {
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