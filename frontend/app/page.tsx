"use client";

import { useCallback, useEffect, useState } from "react";

import {
  type GameState,
  type Mark as PlayerMark,
  makeMove,
  restartGame,
  startGame,
} from "../lib/api";

type Score = {
  X: number;
  O: number;
  draws: number;
};

function Mark({ type }: { type: PlayerMark | "" }) {
  if (type === "X") {
    return (
      <svg
        className="mark mark-x"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M25 25 75 75M75 25 25 75" />
      </svg>
    );
  }

  if (type === "O") {
    return (
      <svg
        className="mark mark-o"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="32" />
      </svg>
    );
  }

  return null;
}

export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);

  const [score, setScore] = useState<Score>({
    X: 0,
    O: 0,
    draws: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Generic function for handling API requests.
  const performAction = useCallback(
    async (action: () => Promise<GameState>) => {
      setLoading(true);
      setError("");

      try {
        const nextGame = await action();

        // The backend response becomes our React game state.
        setGame(nextGame);

        return nextGame;
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Something went wrong."
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Start the game when the page loads.
  useEffect(() => {
    void performAction(startGame);
  }, [performAction]);

  // Send a move to the backend.
  const submitMove = async (row: number, col: number) => {
  if (!game || loading || game.game_over) return;

  if (game.board[row][col] !== "") return;

  // Save the current board so we can restore it if the request fails.
  const previousGame = game;

  // Create a temporary board with the player's X.
  const playerBoard = game.board.map((r) => [...r]);
  playerBoard[row][col] = "X";

  // Display X immediately.
  setGame({
    ...game,
    board: playerBoard,
    current_move: "O",
  });

  setLoading(true);
  setError("");

  try {
    // The backend waits 1 second, then makes the bot's move.
    const nextGame = await makeMove(row, col);

    // Display the updated board containing the bot's O.
    setGame(nextGame);
  } catch (actionError) {
    // Restore the previous board if the request fails.
    setGame(previousGame);

    setError(
      actionError instanceof Error
        ? actionError.message
        : "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  // Start a new round without resetting the scoreboard.
  async function handleNewRound() {
    await performAction(game ? restartGame : startGame);
  }

  function gameMessage() {
    if (loading && !game) {
      return "CONNECTING TO GAME SERVER";
    }

    if (error && !game) {
      return "COULD NOT LOAD GAME";
    }

    if (!game) {
      return "GAME NOT STARTED";
    }

    if (game.winner) {
      return `${game.winner} WINS THIS ROUND`;
    }

    if (game.game_over) {
      return "ROUND DRAWN";
    }

    if (loading) {
      return "PROCESSING MOVE...";
    }

    return `${game.current_move} TO MOVE`;
  }

  const heading = game?.winner
    ? `${game.winner} takes the round`
    : game?.game_over
      ? "A square deal"
      : game
        ? `${game.current_move}'s turn`
        : "Ready when you are";

  return (
    <div className="page-shell">
      <header className="topbar">
        <a
          className="wordmark"
          href="#top"
          aria-label="Three in a Row home"
        >
          <span className="wordmark-icon" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>

          <span>
            THREE
            <br />
            IN A ROW
          </span>
        </a>

        <div className="local-label">
          <span className="local-dot" />

          {loading && !game
            ? "CONNECTING"
            : error
              ? "SERVER ISSUE"
              : "LIVE GAME"}
        </div>
      </header>

      <main className="game-layout" id="top">
        <section
          className="intro"
          aria-labelledby="page-title"
        >
          <p className="eyebrow">
            A CLASSIC GAME <span>NO. 01</span>
          </p>

          <h1 id="page-title">
            Three
            <br />
            in a
            <br />
            <em>row.</em>
          </h1>

          <p className="intro-copy">
            A little space for
            <br />
            some friendly rivalry.
          </p>

          <div className="how-to">
            <span className="how-to-mark" aria-hidden="true">
              ✳
            </span>

            <span>
              PLAYER ONE
              <br />
              &amp; PLAYER TWO
            </span>
          </div>
        </section>

        <section
          className="play-area"
          aria-label="Tic tac toe game"
        >
          <div className="game-heading">
            <div>
              <p className="eyebrow">
                THE BOARD <span>3 × 3</span>
              </p>

              <h2>{heading}</h2>
            </div>

            <span
              className="turn-indicator"
              aria-hidden="true"
            >
              {game && !game.game_over ? (
                <Mark type={game.current_move} />
              ) : (
                "✳"
              )}
            </span>
          </div>

          <div className="board-frame">
            <div
              className="board"
              role="group"
              aria-label="Tic tac toe board"
            >
              {Array.from({ length: 9 }, (_, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;

                const cellValue =
                  game?.board[row]?.[col] ?? "";

                return (
                  <button
                    className="cell"
                    key={index}
                    type="button"
                    aria-label={`Row ${row + 1}, column ${
                      col + 1
                    }${cellValue ? `, ${cellValue}` : ", empty"}`}
                    disabled={
                      !game ||
                      loading ||
                      game.game_over ||
                      Boolean(cellValue)
                    }
                    onClick={() => {
                      void submitMove(row, col);
                    }}
                  >
                    <Mark type={cellValue} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="game-footer">
            <p
              className="game-message"
              aria-live="polite"
            >
              {gameMessage()}
            </p>

            <button
              className="text-button"
              type="button"
              disabled={loading}
              onClick={() => {
                void handleNewRound();
              }}
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M16.2 8A6.4 6.4 0 0 0 4.5 6.1L3 8m0 0V4.5M3 8h3.5M3.8 12a6.4 6.4 0 0 0 11.7 1.9L17 12m0 0v3.5M17 12h-3.5" />
              </svg>

              New round
            </button>
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </section>

        <aside
          className="score-panel"
          aria-label="Scoreboard"
        >
          <div className="score-heading">
            <p className="eyebrow">THE SCORE</p>

            <span
              className="score-rule"
              aria-hidden="true"
            />
          </div>

          <div className="score-row score-x">
            <span
              className="score-symbol"
              aria-hidden="true"
            >
              X
            </span>

            <div className="score-player">
              <span>PLAYER ONE</span>
              <strong>{score.X}</strong>
            </div>
          </div>

          <div className="score-row score-o">
            <span
              className="score-symbol"
              aria-hidden="true"
            >
              O
            </span>

            <div className="score-player">
              <span>PLAYER TWO</span>
              <strong>{score.O}</strong>
            </div>
          </div>

          <div className="draw-row">
            <span>Draws</span>
            <strong>{score.draws}</strong>
          </div>

          <button
            className="reset-button"
            type="button"
            disabled={
              loading ||
              (score.X === 0 &&
                score.O === 0 &&
                score.draws === 0)
            }
            onClick={() => {
              setScore({
                X: 0,
                O: 0,
                draws: 0,
              });
            }}
          >
            Reset score
          </button>

          <p className="score-note">
            SCORES TRACKED
            <br />
            FOR THIS SESSION
          </p>
        </aside>
      </main>

      <footer className="page-footer">
        <span>THE WORLD&apos;S SMALLEST STADIUM</span>
        <span>CONNECTED GAME</span>
      </footer>
    </div>
  );
}