import React, { useEffect, useState } from 'react';

interface FlywheelProps {
  completionCount: number;
  maxSpeed: number;
}

const Flywheel: React.FC<FlywheelProps> = ({ completionCount, maxSpeed = 20 }) => {
  const [rotationSpeed, setRotationSpeed] = useState(0);

  useEffect(() => {
    // Calculate speed based on completion count (1-5 tasks = slow, 20+ = max speed)
    const speed = Math.min((completionCount / maxSpeed) * 100, 100);
    setRotationSpeed(speed);
  }, [completionCount, maxSpeed]);

  return (
    <div className="flywheel-container">
      <div 
        className="flywheel" 
        style={{ 
          '--rotation-speed': `${Math.max(2, 20 - rotationSpeed/5)}s`
        } as React.CSSProperties}
      >
        <div className="spoke"></div>
        <div className="spoke"></div>
        <div className="spoke"></div>
        <div className="spoke"></div>
      </div>
      <div className="flywheel-stats">
        <span className="momentum-label">Task Momentum</span>
        <div className="speed-indicator">
          <div 
            className="speed-fill"
            style={{ width: `${rotationSpeed}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Flywheel; 