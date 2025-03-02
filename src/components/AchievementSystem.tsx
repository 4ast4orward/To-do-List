import React from 'react';
import { Achievement, UserStats } from '../types/Todo';

interface AchievementSystemProps {
  userStats: UserStats;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ userStats }) => {
  const calculateLevel = (points: number) => Math.floor(Math.sqrt(points / 100)) + 1;
  const calculateProgress = (points: number) => {
    const currentLevel = calculateLevel(points);
    const pointsForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * currentLevel * 100;
    return ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
  };

  return (
    <div className="achievement-system">
      <div className="level-card">
        <div className="level-info">
          <h3>Level {calculateLevel(userStats.points)}</h3>
          <div className="level-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${calculateProgress(userStats.points)}%` }}
            />
          </div>
          <p>{userStats.points} Points</p>
        </div>
        <div className="streak-info">
          <span className="streak-flame">🔥</span>
          <p>{userStats.streak} Day Streak</p>
        </div>
      </div>

      <div className="achievements-grid">
        {userStats.achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-details">
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
              {achievement.unlockedAt && (
                <span className="unlock-date">
                  Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="momentum-tracker">
        <h3>Productivity Momentum</h3>
        <div className="momentum-stats">
          <div className="momentum-multiplier">
            <span>×{userStats.momentum.multiplier.toFixed(1)}</span>
            <p>Point Multiplier</p>
          </div>
          <div className="momentum-streak">
            <span>{userStats.momentum.streakDays}</span>
            <p>Days Active</p>
          </div>
          <div className="momentum-growth">
            <span>{(userStats.momentum.growthRate * 100).toFixed(0)}%</span>
            <p>Weekly Growth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem; 