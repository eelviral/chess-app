import React from "react";
import BoardSquare from "./BoardSquare";
import BoardSquareLabel from "./BoardSquareLabel";

export default function Board({ board, computerColor }) {
  function getXYPosition(i) {
    const x = i % 8;
    const y = Math.abs(Math.floor(i / 8) - 7);
    return { x, y };
  }

  function isBlack(i) {
    const { x, y } = getXYPosition(i);
    return (x + y) % 2 === 1;
  }

  function getPosition(i) {
    const { x, y } = getXYPosition(i);
    const orientedY = computerColor === "w" ? 7 - y : y;
    const orientedX = computerColor === "w" ? 7 - x : x;
    const letter = ["a", "b", "c", "d", "e", "f", "g", "h"][orientedX];
    return `${letter}${orientedY + 1}`;
  }

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const orientedFiles = computerColor === "w" ? files.reverse() : files.slice();
  const orientedRanks = computerColor === "w" ? ranks.reverse() : ranks.slice();

  const orientedBoard =
    computerColor === "w" ? board.flat().reverse() : board.flat();

  return (
    <div className="board">
      {orientedBoard.flat().map((piece, i) => {
        const { x, y } = getXYPosition(i);
        const blackSquare = isBlack(i);

        return (
          <div key={i} className="square">
            {x === 0 && (
              <BoardSquareLabel
                label={orientedRanks[y]}
                black={blackSquare}
                type="rank"
              />
            )}
            {y === 0 && (
              <BoardSquareLabel
                label={orientedFiles[x]}
                black={blackSquare}
                type="file"
              />
            )}
            <BoardSquare
              piece={piece}
              black={blackSquare}
              position={getPosition(i)}
              computerColor={computerColor}
            />
          </div>
        );
      })}
    </div>
  );
}
