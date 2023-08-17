import React from "react";
import { useDrag, DragPreviewImage } from "react-dnd";

export default function Piece({
  piece: { type, color },
  position,
  computerColor,
}) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: "piece",
    item: { type: "piece", id: `${position}_${type}_${color}` },
    canDrag: () => color !== computerColor, // Prevent dragging of computer pieces
    collect: (monitor) => {
      return { isDragging: !!monitor.isDragging() };
    },
  });
  const pieceImg = require(`./assets/${type}_${color}.png`);
  return (
    <>
      <DragPreviewImage connect={preview} src={pieceImg} />
      <div className="piece-container">
        <img
          src={pieceImg}
          alt={`${type}_${color}.png`}
          className="piece"
          ref={drag}
          style={{ opacity: isDragging ? 0 : 1 }}
        />
      </div>
    </>
  );
}
