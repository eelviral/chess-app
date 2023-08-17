import React, { useEffect, useState } from "react";
import "./App.css";
import { gameSubject, initGame, resetGame, makeComputerMove } from "./Game";
import Board from "./Board";
import ChessGPTInput from "./components/ChessGPT/ChessGPTInput";
import Settings from "./components/Settings/Settings";

function App() {
  const [board, setBoard] = useState([]);
  const [isGameOver, setIsGameOver] = useState();
  const [result, setResult] = useState();
  const [turn, setTurn] = useState("w");
  const [computerColor, setComputerColor] = useState(null);
  const [fen, setFen] = useState();
  const [showSettings, setShowSettings] = useState(true); // Add this state

  const handleSelectTeam = (color) => {
    setComputerColor(color === "w" ? "b" : "w");
    setShowSettings(false);
  };

  useEffect(() => {
    initGame();
    const subscribe = gameSubject.subscribe((game) => {
      setBoard(game.board);
      setIsGameOver(game.isGameOver);
      setResult(game.result);
      setTurn(game.turn);
      setFen(game.fen);
    });

    return () => subscribe.unsubscribe();
  }, []);

  useEffect(() => {
    // Check if it's the computer's turn
    if (!isGameOver && turn === computerColor) {
      makeComputerMove();
    }
  }, [turn, isGameOver, computerColor]);

  return (
    <div className="container">
      {showSettings && <Settings onSelectTeam={handleSelectTeam} />}
      <h1 className="eight-bit-title">CHESS GAME</h1>
      <div className="game-container">
        {isGameOver && (
          <h2 className="vertical-text">
            GAME OVER
            <button onClick={resetGame}>
              <span className="vertical-text">NEW GAME</span>
            </button>
          </h2>
        )}
        <div className="board-container">
          <Board board={board} turn={turn} computerColor={computerColor} />
        </div>
        {result && <p className="vertical-text">{result}</p>}
      </div>
      <ChessGPTInput currentFen={fen} />
    </div>
  );
}

export default App;
