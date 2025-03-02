import React, { useEffect, useState } from 'react';
import { Challenge, DailyQuest, QuestProgress } from '../types/Challenge';
import { format, isToday, differenceInHours } from 'date-fns';

interface ChallengesPanelProps {
  userStats: {
    points: number;
    streak: number;
  };
  onQuestComplete: (questId: string, reward: { points: number; streak: number }) => void;
}

const ChallengesPanel: React.FC<ChallengesPanelProps> = ({ userStats, onQuestComplete }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [questProgress, setQuestProgress] = useState<QuestProgress>({
    currentQuests: [],
    completedQuests: [],
    lastRefresh: new Date(),
    streakMultiplier: 1
  });

  // Generate daily quests
  const generateDailyQuests = () => {
    const quests: DailyQuest[] = [
      {
        id: crypto.randomUUID(),
        title: 'Early Bird',
        description: 'Complete 3 tasks before noon',
        difficulty: 'easy',
        reward: { points: 50, streak: 1 },
        completed: false,
        refreshedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        title: 'Category Master',
        description: 'Complete tasks from 3 different categories',
        difficulty: 'medium',
        reward: { points: 100, streak: 2 },
        completed: false,
        refreshedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        title: 'Productivity Champion',
        description: 'Complete 5 tasks within 2 hours',
        difficulty: 'hard',
        reward: { points: 200, streak: 3 },
        completed: false,
        refreshedAt: new Date()
      }
    ];
    return quests;
  };

  // Check and refresh daily quests
  useEffect(() => {
    const lastRefresh = new Date(questProgress.lastRefresh);
    if (!isToday(lastRefresh)) {
      setQuestProgress(prev => ({
        ...prev,
        currentQuests: generateDailyQuests(),
        lastRefresh: new Date()
      }));
    }
  }, [questProgress.lastRefresh]);

  // Generate weekly challenges
  useEffect(() => {
    const weeklyChallenges: Challenge[] = [
      {
        id: crypto.randomUUID(),
        title: 'Task Warrior',
        description: 'Complete 20 tasks this week',
        type: 'weekly',
        requirements: {
          type: 'tasks',
          target: 20
        },
        reward: {
          points: 500,
          multiplier: 1.5
        },
        progress: 0,
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: crypto.randomUUID(),
        title: 'Streak Master',
        description: 'Maintain a 5-day streak',
        type: 'weekly',
        requirements: {
          type: 'streak',
          target: 5
        },
        reward: {
          points: 300,
          achievement: 'streak_master'
        },
        progress: userStats.streak,
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];
    setChallenges(weeklyChallenges);
  }, [userStats.streak]);

  const handleQuestComplete = (quest: DailyQuest) => {
    if (!quest.completed) {
      onQuestComplete(quest.id, quest.reward);
      setQuestProgress(prev => ({
        ...prev,
        completedQuests: [...prev.completedQuests, quest.id],
        currentQuests: prev.currentQuests.map(q =>
          q.id === quest.id ? { ...q, completed: true } : q
        )
      }));
    }
  };

  return (
    <div className="challenges-panel">
      <div className="daily-quests">
        <h3>Daily Quests</h3>
        <div className="quests-grid">
          {questProgress.currentQuests.map(quest => (
            <div
              key={quest.id}
              className={`quest-card ${quest.difficulty} ${quest.completed ? 'completed' : ''}`}
              onClick={() => handleQuestComplete(quest)}
            >
              <div className="quest-header">
                <h4>{quest.title}</h4>
                <span className="difficulty-badge">{quest.difficulty}</span>
              </div>
              <p>{quest.description}</p>
              <div className="quest-rewards">
                <span className="points">+{quest.reward.points} pts</span>
                <span className="streak">+{quest.reward.streak} streak</span>
              </div>
              {quest.completed && <div className="completed-overlay">✓ Completed</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="weekly-challenges">
        <h3>Weekly Challenges</h3>
        <div className="challenges-grid">
          {challenges.map(challenge => (
            <div
              key={challenge.id}
              className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
            >
              <div className="challenge-header">
                <h4>{challenge.title}</h4>
                <span className="expires-in">
                  Expires in: {differenceInHours(challenge.expiresAt, new Date())}h
                </span>
              </div>
              <p>{challenge.description}</p>
              <div className="challenge-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(challenge.progress / challenge.requirements.target) * 100}%`
                    }}
                  />
                </div>
                <span className="progress-text">
                  {challenge.progress} / {challenge.requirements.target}
                </span>
              </div>
              <div className="challenge-rewards">
                <span className="points">+{challenge.reward.points} pts</span>
                {challenge.reward.multiplier && (
                  <span className="multiplier">×{challenge.reward.multiplier} multiplier</span>
                )}
                {challenge.reward.achievement && (
                  <span className="achievement">🏆 New Achievement</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengesPanel; 