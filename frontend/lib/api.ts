export type Mark = "X" | "O";

const API_URL = "http://127.0.0.1:8000";

export type GameState = {
  board: (Mark | "")[][];
  current_move: Mark;
  winner: Mark | null;
  game_over: boolean;
};

async function requestGame(path: string, init: RequestInit = {}): Promise<GameState> {
  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "The game server could not complete that request.");
  }
  return response.json() as Promise<GameState>;
}

export async function startGame() {
  return requestGame("/game/new", {
    method: "POST",
  });
}

export async function makeMove(row: number, col: number) {
  return requestGame("", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      row,
      col,
    }),
  });
}

export async function restartGame() {
  return requestGame("/restart/game", {
    method: "POST",
  });
}