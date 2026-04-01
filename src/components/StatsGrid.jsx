import React from "react";

function StatsGrid({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const todayCount = tasks.filter((t) => t.day === "Today").length;

  return (
    <div className="stats-grid animate-in">
      <div className="stat-card total">
        <div className="stat-card-header">
          <span className="stat-label">Total Tasks</span>
          <div className="stat-icon">📋</div>
        </div>
        <div className="stat-value">{total}</div>
      </div>

      <div className="stat-card completed">
        <div className="stat-card-header">
          <span className="stat-label">Completed</span>
          <div className="stat-icon">✅</div>
        </div>
        <div className="stat-value">{completed}</div>
      </div>

      <div className="stat-card pending">
        <div className="stat-card-header">
          <span className="stat-label">Pending</span>
          <div className="stat-icon">⏳</div>
        </div>
        <div className="stat-value">{pending}</div>
      </div>

      <div className="stat-card today-count">
        <div className="stat-card-header">
          <span className="stat-label">Today</span>
          <div className="stat-icon">🎯</div>
        </div>
        <div className="stat-value">{todayCount}</div>
      </div>
    </div>
  );
}

export default StatsGrid;
