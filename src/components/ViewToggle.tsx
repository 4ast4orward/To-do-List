import React from 'react';

type ViewType = 'list' | 'calendar' | 'kanban';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button 
        className={`view-button ${currentView === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
      >
        📝 List View
      </button>
      <button 
        className={`view-button ${currentView === 'calendar' ? 'active' : ''}`}
        onClick={() => onViewChange('calendar')}
      >
        📅 Calendar View
      </button>
      <button 
        className={`view-button ${currentView === 'kanban' ? 'active' : ''}`}
        onClick={() => onViewChange('kanban')}
      >
        📊 Kanban Board
      </button>
    </div>
  );
};

export default ViewToggle; 