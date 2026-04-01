import React, { useState } from "react";

function TaskInput({ onAddTask }) {
  const [text, setText] = useState("");
  const [day, setDay] = useState("Today");
  const [priority, setPriority] = useState("Medium");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isAdding) return;

    setIsAdding(true);
    await onAddTask({ text: text.trim(), day, priority });
    setText("");
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="task-input-card animate-in">
      <div className="task-input-header">
        <span>✨</span>
        <h2>Add New Task</h2>
      </div>
      <form className="task-input-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="task-text-input">Task</label>
          <input
            id="task-text-input"
            className="form-input"
            type="text"
            placeholder="What do you need to work on?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="task-day-select">Day</label>
          <select
            id="task-day-select"
            className="form-select"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            <option value="Today">📅 Today</option>
            <option value="Tomorrow">🗓️ Tomorrow</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="task-priority-select">Priority</label>
          <select
            id="task-priority-select"
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">🟢 Low</option>
            <option value="Medium">🟡 Medium</option>
            <option value="High">🔴 High</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">&nbsp;</label>
          <button
            type="submit"
            className="btn-add"
            disabled={!text.trim() || isAdding}
          >
            {isAdding ? "Adding..." : "＋ Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskInput;
