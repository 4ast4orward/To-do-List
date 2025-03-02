import React from 'react';
import { UserStats } from '../types/Todo';

interface UserProgressProps {
  stats: UserStats;
}

const UserProgress: React.FC<UserProgressProps> = ({ stats }) => {
  return (
    <div className="user-progress">
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <h3>{stats.totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <h3>{stats.completedTasks}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏭️</span>
          <div className="stat-info">
            <h3>{stats.skippedTasks}</h3>
            <p>Skipped</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <div className="stat-info">
            <h3>{stats.currentStreak}</h3>
            <p>Current Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <h3>{stats.longestStreak}</h3>
            <p>Longest Streak</p>
          </div>
        </div>
      </div>

      <div className="category-breakdown">
        <h2>Category Breakdown</h2>
        <div className="category-stats">
          {Object.entries(stats.tasksByCategory).map(([category, count]) => (
            <div key={category} className="category-stat">
              <span className="category-name">{category}</span>
              <span className="category-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProgress; 