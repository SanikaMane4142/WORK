import React from "react";

function Header() {
  const today = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateString = today.toLocaleDateString("en-US", options);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-icon">🧠</div>
          <div>
            <h1 className="header-title">Smart Work Planner</h1>
            <p className="header-subtitle">Plan smarter, achieve more</p>
          </div>
        </div>
        <div className="header-date">📅 {dateString}</div>
      </div>
    </header>
  );
}

export default Header;
