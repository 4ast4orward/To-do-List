import React, { useState, useEffect } from 'react';
import { Todo } from '../types/Todo';
import { TimeEntry, ProductivityMetrics, WorkloadAnalysis } from '../utils/analytics';
import { Integration, SUPPORTED_INTEGRATIONS } from '../utils/integrations';
import { analyzeProductivity, analyzeWorkload, generateReport } from '../utils/analytics';

interface DashboardProps {
  todos: Todo[];
  timeEntries: TimeEntry[];
}

const ProfessionalDashboard: React.FC<DashboardProps> = ({ todos, timeEntries }) => {
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [workload, setWorkload] = useState<WorkloadAnalysis | null>(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState<Integration[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    // Update metrics when todos or timeEntries change
    const updatedMetrics = analyzeProductivity(timeEntries, todos);
    const updatedWorkload = analyzeWorkload(todos);
    setMetrics(updatedMetrics);
    setWorkload(updatedWorkload);
  }, [todos, timeEntries]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - (timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30));
    
    try {
      const report = await generateReport(timeEntries, todos, startDate, now);
      // Implementation for downloading or displaying the report
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleIntegration = (integration: Integration) => {
    const isSelected = selectedIntegrations.some(i => i.id === integration.id);
    if (isSelected) {
      setSelectedIntegrations(selectedIntegrations.filter(i => i.id !== integration.id));
    } else {
      setSelectedIntegrations([...selectedIntegrations, integration]);
    }
  };

  return (
    <div className="professional-dashboard">
      <div className="dashboard-header">
        <h2>Professional Dashboard</h2>
        <div className="timeframe-selector">
          <button 
            className={timeframe === 'day' ? 'active' : ''} 
            onClick={() => setTimeframe('day')}
          >
            Day
          </button>
          <button 
            className={timeframe === 'week' ? 'active' : ''} 
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button 
            className={timeframe === 'month' ? 'active' : ''} 
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Productivity Metrics */}
        <div className="dashboard-card metrics">
          <h3>Productivity Metrics</h3>
          {metrics && (
            <>
              <div className="metric">
                <span>Time Spent</span>
                <strong>{Math.round(metrics.totalTimeSpent / 60)}h {metrics.totalTimeSpent % 60}m</strong>
              </div>
              <div className="metric">
                <span>Task Completion Rate</span>
                <strong>{metrics.taskCompletion}%</strong>
              </div>
              <div className="category-breakdown">
                {Object.entries(metrics.categoryBreakdown).map(([category, time]) => (
                  <div key={category} className="category-bar">
                    <span>{category}</span>
                    <div className="bar">
                      <div 
                        className="fill" 
                        style={{ width: `${(time / metrics.totalTimeSpent) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Workload Analysis */}
        <div className="dashboard-card workload">
          <h3>Workload Analysis</h3>
          {workload && (
            <>
              <div className="workload-meter">
                <div 
                  className="meter-fill"
                  style={{ 
                    width: `${workload.currentLoad}%`,
                    backgroundColor: workload.currentLoad > 80 ? 'var(--danger-color)' : 
                                   workload.currentLoad > 60 ? 'var(--warning-color)' : 
                                   'var(--primary-color)'
                  }}
                />
                <span>{workload.currentLoad}% Capacity</span>
              </div>
              <div className="recommendations">
                <p>Recommended daily tasks: {workload.recommendedDaily}</p>
                <p>Upcoming deadlines: {workload.upcomingDeadlines.length}</p>
              </div>
            </>
          )}
        </div>

        {/* Integrations */}
        <div className="dashboard-card integrations">
          <h3>Integrations</h3>
          <div className="integration-list">
            {SUPPORTED_INTEGRATIONS.map(integration => (
              <button
                key={integration.id}
                className={`integration-button ${
                  selectedIntegrations.some(i => i.id === integration.id) ? 'active' : ''
                }`}
                onClick={() => toggleIntegration(integration)}
              >
                <span className="integration-icon">{integration.icon}</span>
                <span className="integration-name">{integration.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="dashboard-card actions">
          <h3>Actions</h3>
          <button 
            className="action-button"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </button>
          <button className="action-button">
            Export Data
          </button>
          <button className="action-button">
            Sync Integrations
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard; 