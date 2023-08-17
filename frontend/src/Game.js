import { Chess } from "chess.js";
import { BehaviorSubject } from "rxjs";
import { API_URL } from "./config.js";

// let promotion = "8/PPPPPPPP/2k5/4K3/8/8/pppppppp/8 w - - 0 1";
// let staleMate = "4k3/4P3/4K3/8/8/8/8/8 b - - 0 78";
// let checkMate = "rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3";
// let insufficientMaterial = "k7/8/n7/8/8/8/8/7K b - - 0 1";

const chess = new Chess();

export const gameSubject = new BehaviorSubject({
  board: chess.board(),
});

export function initGame() {
  updateGame();
}

export function resetGame() {
  chess.reset();
  updateGame();
}

export function handleMove(from, to) {
  const promotions = chess.moves({ verbose: true }).filter((m) => m.promotion);
  if (promotions.some((p) => `${p.from}:${p.to}` === `${from}:${to}`)) {
    const pendingPromotion = { from, to, color: promotions[0].color };
    updateGame(pendingPromotion);
  }

  const { pendingPromotion } = gameSubject.getValue();
  if (!pendingPromotion) {
    move(from, to);
  }
}

export function move(from, to, promotion) {
  let tempMove = { from, to };
  if (promotion) {
    tempMove.promotion = promotion;
  }

  let isLegalMove;
  try {
    isLegalMove = chess.move(tempMove);
  } catch (error) {
    console.error(
      `Error attempting move from ${from} to ${to}: ${error.message}`
    );
    return;
  }

  if (isLegalMove) {
    updateGame();
  }
}

export async function makeComputerMove() {
  const computerMove = await getComputerMove();
  if (computerMove) {
    move(computerMove.from, computerMove.to, computerMove.promotion);
  }
}

export async function getComputerMove() {
  const fen = chess.fen();

  try {
    const response = await fetch(`${API_URL}/api/ai-move/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fen }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const { move } = data; // The server should send the move in UCI format in the response

    return {
      from: move.substring(0, 2),
      to: move.substring(2, 4),
      promotion: move.length > 4 ? move[4] : undefined,
    };
  } catch (error) {
    console.error("Error fetching the computer move:", error);
    return null;
  }
}

function updateGame(pendingPromotion) {
  const isGameOver = chess.isGameOver();
  const newGame = {
    board: chess.board(),
    pendingPromotion: pendingPromotion,
    isGameOver,
    result: isGameOver ? getGameResult() : null,
    turn: chess.turn(),
    fen: chess.fen(),
  };
  gameSubject.next(newGame);
}

function getGameResult() {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "BLACK" : "WHITE";
    return `CHECKMATE - WINNER - ${winner}`;
  } else if (chess.isDraw()) {
    let reason = "50 - MOVES - RULE";
    if (chess.isStalemate()) {
      reason = "STALEMATE";
    } else if (chess.isThreefoldRepetition()) {
      reason = "REPETITION";
    } else if (chess.isInsufficientMaterial()) {
      reason = "INSUFFICIENT MATERIAL";
    }
    return `DRAW - ${reason}`;
  } else {
    return `UNKNOWN REASON`;
  }
}
