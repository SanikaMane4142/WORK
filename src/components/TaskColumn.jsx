import React from "react";
import TaskItem from "./TaskItem";

function TaskColumn({ title, emoji, tasks, onToggle, onDelete, onMove }) {
  return (
    <div className="task-column">
      <div className="column-header">
        <div className="column-title">
          <span className="emoji">{emoji}</span>
          <h2>{title}</h2>
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No tasks for {title.toLowerCase()}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskColumn;
