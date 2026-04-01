import React, { useEffect, useState } from "react";

function Toast({ message, type = "success", onClose }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2500);
    const removeTimer = setTimeout(() => onClose(), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div className={`toast ${type} ${fading ? "fade-out" : ""}`}>
      <span>{icons[type] || icons.info}</span>
      <span>{message}</span>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
