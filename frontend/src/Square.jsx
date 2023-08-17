import React from "react";

export default function Square({ children, black }) {
  if (black !== null) {
    const bgClass = black ? "square-black" : "square-white";
    return <div className={`${bgClass} board-square`}>{children}</div>;
  } else {
    return <div className="board-square">{children}</div>;
  }
}

// Set default props
Square.defaultProps = {
  black: null, // or true, depending on what your default behavior should be
};
