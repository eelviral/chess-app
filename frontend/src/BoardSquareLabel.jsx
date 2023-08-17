import React from "react";

export default function BoardSquareLabel({ label, black, type }) {
  return (
    <span className={`${black ? "white-label" : "black-label"} ${type}-label`}>
      {label}
    </span>
  );
}
