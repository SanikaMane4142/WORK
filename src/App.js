import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./services/supabaseClient";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import TaskInput from "./components/TaskInput";
import TaskColumn from "./components/TaskColumn";
import DailySummary from "./components/DailySummary";
import ToastContainer from "./components/Toast";
import WorkLog from "./components/WorkLog";
import DevThinking from "./components/DevThinking";
import "./App.css";

let toastIdCounter = 0;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all tasks from Supabase
  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      addToast("Failed to load tasks", "error");
      console.error("Fetch error:", error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add a new task
  const addTask = async ({ text, day, priority }) => {
    const { error } = await supabase.from("tasks").insert([
      {
        text,
        day,
        priority,
        status: "Pending",
      },
    ]);

    if (error) {
      addToast("Failed to add task", "error");
      console.error("Insert error:", error);
    } else {
      addToast(`Task added to ${day}`, "success");
      fetchTasks();
    }
  };

  // Toggle task status
  const toggleStatus = async (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (error) {
      addToast("Failed to update task", "error");
      console.error("Update error:", error);
    } else {
      fetchTasks();
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      addToast("Failed to delete task", "error");
      console.error("Delete error:", error);
    } else {
      addToast("Task deleted", "info");
      fetchTasks();
    }
  };

  // Move task between Today and Tomorrow
  const moveTask = async (task) => {
    const newDay = task.day === "Today" ? "Tomorrow" : "Today";

    const { error } = await supabase
      .from("tasks")
      .update({ day: newDay })
      .eq("id", task.id);

    if (error) {
      addToast("Failed to move task", "error");
      console.error("Move error:", error);
    } else {
      addToast(`Task moved to ${newDay}`, "success");
      fetchTasks();
    }
  };

  // Auto-move: shift all Tomorrow tasks to Today
  const autoMoveTasks = async () => {
    const tomorrowTasks = tasks.filter((t) => t.day === "Tomorrow");
    if (tomorrowTasks.length === 0) {
      addToast("No tomorrow tasks to move", "info");
      return;
    }

    const ids = tomorrowTasks.map((t) => t.id);
    const { error } = await supabase
      .from("tasks")
      .update({ day: "Today" })
      .in("id", ids);

    if (error) {
      addToast("Failed to auto-move tasks", "error");
      console.error("Auto-move error:", error);
    } else {
      addToast(`Moved ${tomorrowTasks.length} task(s) to Today`, "success");
      fetchTasks();
    }
  };

  // Filter tasks by day
  const todayTasks = tasks.filter((t) => t.day === "Today");
  const tomorrowTasks = tasks.filter((t) => t.day === "Tomorrow");
  const hasTomorrowTasks = tomorrowTasks.length > 0;

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <StatsGrid tasks={tasks} />

        <TaskInput onAddTask={addTask} />

        {hasTomorrowTasks && (
          <div className="auto-move-banner animate-in">
            <div className="auto-move-text">
              <span>🔄</span>
              <span>
                You have <strong>{tomorrowTasks.length}</strong> task(s)
                scheduled for tomorrow. Start working on them today?
              </span>
            </div>
            <button className="btn-auto-move" onClick={autoMoveTasks}>
              Move All to Today
            </button>
          </div>
        )}

        <div className="task-columns">
          <TaskColumn
            title="Today's Tasks"
            emoji="☀️"
            tasks={todayTasks}
            onToggle={toggleStatus}
            onDelete={deleteTask}
            onMove={moveTask}
          />
          <TaskColumn
            title="Tomorrow's Tasks"
            emoji="🌙"
            tasks={tomorrowTasks}
            onToggle={toggleStatus}
            onDelete={deleteTask}
            onMove={moveTask}
          />
        </div>

        <DailySummary tasks={tasks} />

        <WorkLog addToast={addToast} />

        <DevThinking addToast={addToast} />
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;