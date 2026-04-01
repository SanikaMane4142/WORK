import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const initialFormState = {
  date: new Date().toISOString().split("T")[0],
  hours: "",
  planned: "",
  completed: "",
  wip: "",
  blockers: "",
  learnings: "",
  rating: 7,
  tomorrow: "",
  notes: "",
};

function generateReport(form) {
  return `📅 Date: ${form.date}
⏳ Total Working Hours: ${form.hours || "N/A"}

🎯 Tasks Planned for Today:
${form.planned || "—"}

✅ Tasks Completed:
${form.completed || "—"}

🚧 Work in Progress (WIP):
${form.wip || "—"}

❌ Blockers / Issues:
${form.blockers || "—"}

💡 Learnings / Insights:
${form.learnings || "—"}

⭐ Productivity Rating (1–10):
${form.rating}

📌 Tomorrow's Plan:
${form.tomorrow || "—"}

📝 Notes:
${form.notes || "—"}

========================================`;
}

function WorkLog({ addToast }) {
  const [form, setForm] = useState(initialFormState);
  const [report, setReport] = useState("");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch logs error:", error);
    } else {
      setLogs(data || []);
    }
    setLoadingLogs(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const text = generateReport(form);
    setReport(text);
  };

  const handleSaveLog = async () => {
    if (saving) return;
    setSaving(true);

    const { error } = await supabase.from("work_logs").insert([
      {
        date: form.date,
        hours: form.hours,
        planned: form.planned,
        completed: form.completed,
        wip: form.wip,
        blockers: form.blockers,
        learnings: form.learnings,
        rating: parseInt(form.rating, 10) || 0,
        tomorrow: form.tomorrow,
        notes: form.notes,
      },
    ]);

    if (error) {
      addToast("Failed to save log", "error");
      console.error("Save log error:", error);
    } else {
      addToast("Work log saved successfully!", "success");
      fetchLogs();
    }
    setSaving(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      addToast("Report copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-log-${form.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Report downloaded!", "success");
  };

  const handleReset = () => {
    setForm(initialFormState);
    setReport("");
  };

  const toggleExpand = (id) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const ratingColor = (r) => {
    if (r >= 8) return "var(--success)";
    if (r >= 5) return "var(--warning)";
    return "var(--danger)";
  };

  return (
    <div className="worklog-section">
      {/* ── Section Divider ── */}
      <div className="section-divider">
        <span className="divider-line"></span>
        <span className="divider-label">Daily Work Log</span>
        <span className="divider-line"></span>
      </div>

      {/* ── Log Form ── */}
      <div className="worklog-card animate-in">
        <div className="worklog-card-header">
          <div className="worklog-card-title">
            <span>📋</span>
            <h2>Daily Work Log Generator</h2>
          </div>
          <button
            className="btn-reset"
            onClick={handleReset}
            title="Clear form"
            type="button"
          >
            ↺ Reset
          </button>
        </div>

        <form className="worklog-form" onSubmit={handleGenerateReport}>
          {/* Row 1: Date + Hours + Rating */}
          <div className="worklog-form-row three-col">
            <div className="form-group">
              <label className="form-label" htmlFor="wl-date">Date</label>
              <input
                id="wl-date"
                className="form-input"
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wl-hours">Total Working Hours</label>
              <input
                id="wl-hours"
                className="form-input"
                type="text"
                placeholder="e.g. 8"
                value={form.hours}
                onChange={(e) => handleChange("hours", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wl-rating">
                Productivity Rating
                <span
                  className="rating-value"
                  style={{ color: ratingColor(form.rating) }}
                >
                  {form.rating}/10
                </span>
              </label>
              <input
                id="wl-rating"
                className="rating-slider"
                type="range"
                min="1"
                max="10"
                value={form.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
              />
              <div className="rating-labels">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Row 2: Planned + Completed */}
          <div className="worklog-form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="wl-planned">🎯 Tasks Planned for Today</label>
              <textarea
                id="wl-planned"
                className="form-textarea"
                rows="4"
                placeholder="- Task 1&#10;- Task 2&#10;- Task 3"
                value={form.planned}
                onChange={(e) => handleChange("planned", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wl-completed">✅ Tasks Completed</label>
              <textarea
                id="wl-completed"
                className="form-textarea"
                rows="4"
                placeholder="- Completed task 1&#10;- Completed task 2"
                value={form.completed}
                onChange={(e) => handleChange("completed", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: WIP + Blockers */}
          <div className="worklog-form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="wl-wip">🚧 Work in Progress (WIP)</label>
              <textarea
                id="wl-wip"
                className="form-textarea"
                rows="3"
                placeholder="Tasks currently being worked on..."
                value={form.wip}
                onChange={(e) => handleChange("wip", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wl-blockers">❌ Blockers / Issues</label>
              <textarea
                id="wl-blockers"
                className="form-textarea"
                rows="3"
                placeholder="Any impediments or issues..."
                value={form.blockers}
                onChange={(e) => handleChange("blockers", e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Learnings + Tomorrow */}
          <div className="worklog-form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="wl-learnings">💡 Learnings / Insights</label>
              <textarea
                id="wl-learnings"
                className="form-textarea"
                rows="3"
                placeholder="What did you learn today?"
                value={form.learnings}
                onChange={(e) => handleChange("learnings", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="wl-tomorrow">📌 Tomorrow's Plan</label>
              <textarea
                id="wl-tomorrow"
                className="form-textarea"
                rows="3"
                placeholder="What's the plan for tomorrow?"
                value={form.tomorrow}
                onChange={(e) => handleChange("tomorrow", e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div className="worklog-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="wl-notes">📝 Notes (Optional)</label>
              <textarea
                id="wl-notes"
                className="form-textarea"
                rows="2"
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="worklog-actions">
            <button type="submit" className="btn-generate">
              📄 Generate Report
            </button>
            <button
              type="button"
              className="btn-save-log"
              onClick={handleSaveLog}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Log"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Generated Report ── */}
      {report && (
        <div className="worklog-report-card animate-in">
          <div className="worklog-card-header">
            <div className="worklog-card-title">
              <span>📄</span>
              <h2>Generated Report</h2>
            </div>
            <div className="report-action-btns">
              <button
                className="btn-copy"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
              <button
                className="btn-download"
                onClick={handleDownload}
                title="Download as text file"
              >
                ⬇ Download
              </button>
            </div>
          </div>
          <pre className="report-output">{report}</pre>
        </div>
      )}

      {/* ── History Section ── */}
      <div className="worklog-history animate-in">
        <div className="worklog-card-header">
          <div className="worklog-card-title">
            <span>📚</span>
            <h2>Log History</h2>
          </div>
          <span className="column-count">{logs.length}</span>
        </div>

        {loadingLogs ? (
          <div className="loading-container" style={{ padding: "40px 20px" }}>
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No logs saved yet</p>
          </div>
        ) : (
          <div className="history-list">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className={`history-item ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    className="history-item-header"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div className="history-item-meta">
                      <span className="history-date">📅 {log.date}</span>
                      <span className="history-hours">⏳ {log.hours || "—"}h</span>
                      <span
                        className="history-rating"
                        style={{
                          background: ratingColor(log.rating) + "20",
                          color: ratingColor(log.rating),
                        }}
                      >
                        ⭐ {log.rating}/10
                      </span>
                    </div>
                    <span className="history-expand-icon">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="history-item-body">
                      <pre className="report-output">
                        {generateReport(log)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkLog;
