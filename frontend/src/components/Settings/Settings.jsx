import React from "react";
import "./Settings.css";

export default function Settings({ onSelectTeam }) {
  return (
    <div className="settings-overlay">
      <div className="settings-box">
        <h2>Select Your Team</h2>
        <button onClick={() => onSelectTeam("w")}>White</button>
        <button onClick={() => onSelectTeam("b")}>Black</button>
      </div>
    </div>
  );
}
