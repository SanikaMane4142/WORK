import React from "react";

function DailySummary({ tasks }) {
  const todayCompleted = tasks.filter(
    (t) => t.day === "Today" && t.status === "Completed"
  );

  const todayPending = tasks.filter(
    (t) => t.day === "Today" && t.status === "Pending"
  );

  if (todayCompleted.length === 0 && todayPending.length === 0) {
    return null;
  }

  const completedText =
    todayCompleted.length > 0
      ? todayCompleted.map((t) => t.text).join(", ")
      : null;

  const pendingText =
    todayPending.length > 0
      ? todayPending.map((t) => t.text).join(", ")
      : null;

  return (
    <div className="summary-card animate-in">
      <div className="summary-header">
        <span>📝</span>
        <h2>Daily Summary</h2>
      </div>
      <div className="summary-content">
        {completedText && (
          <p>
            <strong>✅ Completed today:</strong> {completedText}
          </p>
        )}
        {pendingText && (
          <p style={{ marginTop: completedText ? "8px" : 0 }}>
            <strong>⏳ Still pending:</strong> {pendingText}
          </p>
        )}
        {todayCompleted.length > 0 && todayPending.length === 0 && (
          <p style={{ marginTop: "8px" }}>
            <em>🎉 Great job! You completed all of today's tasks!</em>
          </p>
        )}
      </div>
    </div>
  );
}

export default DailySummary;
