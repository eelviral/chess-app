import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
  image: string;
  x: number;
  y: number;
}

const initialBoardState: Piece[] = [];
const BLACK_IMAGES = "assets/images/black/";
const WHITE_IMAGES = "assets/images/white/";

// Add non-pawn pieces
for (let p = 0; p < 2; p++) {
  const color = p === 0 ? BLACK_IMAGES : WHITE_IMAGES;
  const y = p === 0 ? 7 : 0;

  initialBoardState.push({ image: `${color}rook.png`, x: 0, y });
  initialBoardState.push({ image: `${color}knight.png`, x: 1, y });
  initialBoardState.push({ image: `${color}bishop.png`, x: 2, y });
  initialBoardState.push({ image: `${color}queen.png`, x: 3, y });
  initialBoardState.push({ image: `${color}king.png`, x: 4, y });
  initialBoardState.push({ image: `${color}bishop.png`, x: 5, y });
  initialBoardState.push({ image: `${color}knight.png`, x: 6, y });
  initialBoardState.push({ image: `${color}rook.png`, x: 7, y });
}

// Add pawns
for (let i = 0; i < 8; i++) {
  initialBoardState.push({ image: `${BLACK_IMAGES}pawn.png`, x: i, y: 6 });
  initialBoardState.push({ image: `${WHITE_IMAGES}pawn.png`, x: i, y: 1 });
}

export default function Chessboard() {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [gridX, setGridX] = useState(0);
  const [gridY, setGridY] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const chessboardRef = useRef<HTMLDivElement>(null);

  // logic for grabbing a chesspiece
  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (element.classList.contains("chess-piece") && chessboard) {
      setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
      setGridY(
        Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100))
      );
      const x = e.clientX - 50;
      const y = e.clientY - 50;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  }

  // logic for moving a chesspiece
  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 30;
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 70;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
      const x = e.clientX - 50;
      const y = e.clientY - 50;
      activePiece.style.position = "absolute";

      // Keep piece inside horizontal bounds
      activePiece.style.left =
        x < minX ? `${minX}px` : x > maxX ? `${maxX}px` : `${x}px`;

      // Keep piece inside vertical bounds
      activePiece.style.top =
        y < minY ? `${minY}px` : y > maxY ? `${maxY}px` : `${y}px`;
    }
  }

  // logic for letting go of a chesspiece
  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;

    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
      const y = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100)
      );

      setPieces((value) => {
        const pieces = value.map((p) => {
          if (p.x === gridX && p.y === gridY) {
            p.x = x;
            p.y = y;
          }
          return p;
        });
        return pieces;
      });
      // Snap piece back to the grid
      activePiece.style.left = `${x * 100 + chessboard.offsetLeft}px`;
      activePiece.style.top = `${(7 - y) * 100 + chessboard.offsetTop}px`;

      setActivePiece(null);
    }
  }

  let board = [];

  // Create the board
  for (let j = verticalAxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < horizontalAxis.length; i++) {
      const number = i + j + 2;
      let image = undefined;

      pieces.forEach((p) => {
        if (p.x === i && p.y === j) {
          image = p.image;
        }
      });
      board.push(<Tile key={`${j},${i}`} number={number} image={image} />);
    }
  }
  return (
    <div
      onMouseMove={(e) => {
        movePiece(e);
      }}
      onMouseDown={(e) => {
        grabPiece(e);
      }}
      onMouseUp={(e) => {
        dropPiece(e);
      }}
      id="chessboard"
      ref={chessboardRef}
    >
      {board}
    </div>
  );
}
