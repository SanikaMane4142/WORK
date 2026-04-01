import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

const initialForm = {
  title: "",
  problem: "",
  why: "",
  approach: "",
  solution: "",
  mistake: "",
  learning: "",
  confidence_before: 5,
  confidence_after: 5,
  energy: "Medium",
};

function generateDebugStory(form) {
  return `Problem:
${form.problem || "N/A"}

Cause:
${form.why || "N/A"}

Attempts:
${form.approach || "N/A"}

Fix:
${form.solution || "N/A"}

Mistake:
${form.mistake || "None"}

Learning:
${form.learning || "N/A"}

Confidence Shift:
${form.confidence_before} → ${form.confidence_after}

Energy Level:
${form.energy}`;
}

function DevThinking({ addToast }) {
  const [form, setForm] = useState(initialForm);
  const [story, setStory] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("dev_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch logs error:", error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateStory = (e) => {
    e.preventDefault();
    setStory(generateDebugStory(form));
  };

  const handleSaveEntry = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);

    const { error } = await supabase.from("dev_logs").insert([
      {
        title: form.title,
        problem: form.problem,
        why: form.why,
        approach: form.approach,
        solution: form.solution,
        mistake: form.mistake,
        learning: form.learning,
        confidence_before: parseInt(form.confidence_before, 10),
        confidence_after: parseInt(form.confidence_after, 10),
        energy: form.energy,
      },
    ]);

    if (error) {
      addToast("Failed to save entry", "error");
      console.error("Save entry error:", error);
    } else {
      addToast("AI Dev Thinking Entry Saved!", "success");
      fetchLogs();
      setForm(initialForm);
      setStory("");
    }
    setSaving(false);
  };

  const getInsights = () => {
    const insights = [];
    if (logs.length < 2) return insights;

    // Check for repetitive mistakes
    const mistakes = logs.map((l) => l.mistake?.toLowerCase().trim()).filter(Boolean);
    const mistakeCounts = {};
    mistakes.forEach((m) => {
      mistakeCounts[m] = (mistakeCounts[m] || 0) + 1;
    });

    const frequentMistakes = Object.values(mistakeCounts).some((count) => count >= 2);
    if (frequentMistakes) {
      insights.push({
        type: "warning",
        message: "You are repeating this mistake frequently",
        icon: "⚠️",
      });
    }

    // Check for confidence drops (last 3 entries)
    const recentLogs = logs.slice(0, 3);
    const dropCount = recentLogs.filter(
      (l) => l.confidence_after < l.confidence_before
    ).length;

    if (dropCount >= 2) {
      insights.push({
        type: "info",
        message: "Your estimation accuracy needs improvement",
        icon: "📉",
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="dev-thinking-section">
      <div className="section-divider">
        <span className="divider-line"></span>
        <span className="divider-label">AI Dev Thinking System</span>
        <span className="divider-line"></span>
      </div>

      <div className="thinking-card animate-in">
        <div className="thinking-card-header">
          <div className="thinking-card-title">
            <span>🧠</span>
            <h2>Problem Thinking Tracker</h2>
          </div>
        </div>

        <form className="thinking-form" onSubmit={handleGenerateStory}>
          <div className="form-group">
            <label className="form-label" htmlFor="th-title">Task / Problem Title</label>
            <input
              id="th-title"
              className="form-input"
              type="text"
              placeholder="e.g., Debugging Supabase auth error"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="th-problem">Problem Description</label>
            <textarea
              id="th-problem"
              className="form-textarea"
              rows="3"
              placeholder="Describe the challenge..."
              value={form.problem}
              onChange={(e) => handleChange("problem", e.target.value)}
            />
          </div>

          <div className="thinking-form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="th-why">Why did this problem occur? (root cause)</label>
              <textarea
                id="th-why"
                className="form-textarea"
                rows="3"
                placeholder="Root cause analysis..."
                value={form.why}
                onChange={(e) => handleChange("why", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="th-approach">What approaches were considered?</label>
              <textarea
                id="th-approach"
                className="form-textarea"
                rows="3"
                placeholder="List considered approaches..."
                value={form.approach}
                onChange={(e) => handleChange("approach", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="th-solution">What solution was implemented?</label>
            <textarea
              id="th-solution"
              className="form-textarea"
              rows="3"
              placeholder="Final fix details..."
              value={form.solution}
              onChange={(e) => handleChange("solution", e.target.value)}
            />
          </div>

          <div className="thinking-form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="th-mistake">Mistake Made (if any)</label>
              <textarea
                id="th-mistake"
                className="form-textarea"
                rows="3"
                placeholder="Any cognitive errors or bugs?"
                value={form.mistake}
                onChange={(e) => handleChange("mistake", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="th-learning">Learning / Insight gained</label>
              <textarea
                id="th-learning"
                className="form-textarea"
                rows="3"
                placeholder="What did you learn?"
                value={form.learning}
                onChange={(e) => handleChange("learning", e.target.value)}
              />
            </div>
          </div>

          <div className="thinking-form-row three-col">
            <div className="form-group">
              <label className="form-label" htmlFor="th-before">Confidence Before: {form.confidence_before}/10</label>
              <input
                id="th-before"
                className="rating-slider"
                type="range"
                min="1"
                max="10"
                value={form.confidence_before}
                onChange={(e) => handleChange("confidence_before", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="th-after">Confidence After: {form.confidence_after}/10</label>
              <input
                id="th-after"
                className="rating-slider"
                type="range"
                min="1"
                max="10"
                value={form.confidence_after}
                onChange={(e) => handleChange("confidence_after", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="th-energy">Energy Level</label>
              <select
                id="th-energy"
                className="form-select"
                value={form.energy}
                onChange={(e) => handleChange("energy", e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="thinking-actions">
            <button type="submit" className="btn-generate">
              ⚡ Generate Debug Story
            </button>
            <button
              type="button"
              className="btn-save"
              onClick={handleSaveEntry}
              disabled={saving || !form.title.trim()}
            >
              {saving ? "Saving..." : "💾 Save Entry"}
            </button>
          </div>
        </form>
      </div>

      {story && (
        <div className="story-card animate-in card-glow">
          <div className="thinking-card-header">
            <div className="thinking-card-title">
              <span>⚡</span>
              <h2>Debug Story Output</h2>
            </div>
          </div>
          <pre className="story-output">{story}</pre>
        </div>
      )}

      {insights.length > 0 && (
        <div className="insights-container animate-in">
          {insights.map((insight, idx) => (
            <div key={idx} className={`insight-card ${insight.type}`}>
              <span className="insight-icon">{insight.icon}</span>
              <span className="insight-message">{insight.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="thinking-history animate-in">
        <div className="thinking-card-header">
          <div className="thinking-card-title">
            <span>📚</span>
            <h2>Past Thinking Logs</h2>
          </div>
          <span className="column-count">{logs.length}</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <p>No dev logs yet</p>
          </div>
        ) : (
          <div className="history-list">
            {logs.map((log) => (
              <div key={log.id} className={`history-item ${expandedId === log.id ? 'expanded' : ''}`}>
                <div className="history-item-header" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                  <div className="history-item-meta">
                    <span className="history-date">{new Date(log.created_at).toLocaleDateString()}</span>
                    <span className="history-title">{log.title}</span>
                    <span className="history-tag">Learning</span>
                  </div>
                  <span className="history-expand-icon">{expandedId === log.id ? '▲' : '▼'}</span>
                </div>
                {expandedId === log.id && (
                  <div className="history-item-body">
                    <div className="history-body-grid">
                      <div className="history-field">
                        <strong>Problem:</strong>
                        <p>{log.problem}</p>
                      </div>
                      <div className="history-field">
                        <strong>Learning:</strong>
                        <p>{log.learning}</p>
                      </div>
                    </div>
                    <pre className="story-output mini">{generateDebugStory(log)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DevThinking;
