import React from "react";
import Square from "./Square";
import { move } from "./Game";

const promotionPieces = ["n", "b", "r", "q"];

export default function Promote({ promotion: { from, to, color } }) {
  const rank = parseInt(to[1]);

  const file = to[0];
  const isLeftFile = ["a"].includes(file);
  const isRightFile = ["h"].includes(file);

  const isTopRank = rank >= 7;
  const isBottomRank = rank <= 2;

  let overlayTransformX = "0%";
  if (isLeftFile) {
    overlayTransformX = "10%";
  } else if (isRightFile) {
    overlayTransformX = "-45%";
  }

  let overlayTransformY;
  if (color === "b" && isBottomRank) {
    overlayTransformY = "-45%";
  } else if (color === "w" && isTopRank) {
    overlayTransformY = "10%";
  }

  return (
    <div
      className="promotion-overlay"
      style={{
        transform: `translate(${overlayTransformX}, ${overlayTransformY})`,
      }}
    >
      {promotionPieces.map((type, i) => (
        <div key={i} className="promote-square">
          <Square>
            <div
              className="piece-container"
              onClick={() => move(from, to, type)}
            >
              <img
                src={require(`./assets/${type}_${color}.png`)}
                alt={`${type}_${color}.png`}
                className="piece cursor-pointer"
              />
            </div>
          </Square>
        </div>
      ))}
    </div>
  );
}
