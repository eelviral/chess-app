import Tile from "../Tile/Tile";
import "./Chessboard.css";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
  image: string;
  x: number;
  y: number;
}

const pieces: Piece[] = [];
const BLACK_IMAGES = "assets/images/black/";
const WHITE_IMAGES = "assets/images/white/";

// Add non-pawn pieces
for (let p = 0; p < 2; p++) {
  const color = p === 0 ? BLACK_IMAGES : WHITE_IMAGES;
  const y = p === 0 ? 7 : 0;

  pieces.push({ image: `${color}rook.png`, x: 0, y });
  pieces.push({ image: `${color}knight.png`, x: 1, y });
  pieces.push({ image: `${color}bishop.png`, x: 2, y });
  pieces.push({ image: `${color}queen.png`, x: 3, y });
  pieces.push({ image: `${color}king.png`, x: 4, y });
  pieces.push({ image: `${color}bishop.png`, x: 5, y });
  pieces.push({ image: `${color}knight.png`, x: 6, y });
  pieces.push({ image: `${color}rook.png`, x: 7, y });
}

// Add pawns
for (let i = 0; i < 8; i++) {
  pieces.push({ image: `${BLACK_IMAGES}pawn.png`, x: i, y: 6 });
  pieces.push({ image: `${WHITE_IMAGES}pawn.png`, x: i, y: 1 });
}

let activePiece: HTMLElement | null = null;

// logic for grabbing a chesspiece
function grabPiece(e: React.MouseEvent) {
  const element = e.target as HTMLElement;
  if (!activePiece && element.classList.contains("chess-piece")) {
    const x = e.clientX - 50;
    const y = e.clientY - 50;
    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    activePiece = element;
  }
}

// logic for moving a chesspiece
function movePiece(e: React.MouseEvent) {
  if (activePiece) {
    const x = e.clientX - 50;
    const y = e.clientY - 50;
    activePiece.style.position = "absolute";
    activePiece.style.left = `${x}px`;
    activePiece.style.top = `${y}px`;
  }
}

// logic for letting go of a chesspiece
function dropPiece(e: React.MouseEvent) {
  if (activePiece) {
    activePiece = null;
  }
}

export default function Chessboard() {
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
    >
      {board}
    </div>
  );
}
