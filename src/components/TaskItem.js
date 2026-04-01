import React from "react";

function TaskItem({ task, onToggle, onDelete, onMove }) {
  const isCompleted = task.status === "Completed";
  const moveTarget = task.day === "Today" ? "Tomorrow" : "Today";
  const moveIcon = task.day === "Today" ? "→" : "←";
  const moveTitle = `Move to ${moveTarget}`;

  return (
    <div className={`task-card ${isCompleted ? "completed" : ""}`}>
      <div
        className="task-checkbox"
        onClick={() => onToggle(task)}
        title={isCompleted ? "Mark as pending" : "Mark as completed"}
        role="checkbox"
        aria-checked={isCompleted}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle(task);
        }}
      >
        {isCompleted && <span className="task-checkbox-icon">✓</span>}
      </div>

      <span
        className="task-text"
        onClick={() => onToggle(task)}
      >
        {task.text}
      </span>

      <span className={`priority-badge ${task.priority?.toLowerCase() || "medium"}`}>
        {task.priority || "Medium"}
      </span>

      <div className="task-actions">
        <button
          className="btn-icon move"
          onClick={() => onMove(task)}
          title={moveTitle}
          aria-label={moveTitle}
        >
          {moveIcon}
        </button>
        <button
          className="btn-icon delete"
          onClick={() => onDelete(task.id)}
          title="Delete task"
          aria-label="Delete task"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default TaskItem;