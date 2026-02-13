import { CellValue, Board } from './types';

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function generateSolvedBoard(): Board {
  const board = createEmptyBoard();

  function fillBoard(pos: number): boolean {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;

    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of numbers) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num as CellValue;
        if (fillBoard(pos + 1)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  fillBoard(0);
  return board;
}

function countSolutions(board: Board, limit: number = 2): number {
  let count = 0;
  const b = board.map(row => [...row]) as Board;

  function solve(pos: number): void {
    if (count >= limit) return;
    if (pos === 81) { count++; return; }
    const row = Math.floor(pos / 9);
    const col = pos % 9;

    if (b[row][col] !== 0) {
      solve(pos + 1);
      return;
    }

    for (let num = 1; num <= 9; num++) {
      if (count >= limit) return;
      if (isValid(b, row, col, num)) {
        b[row][col] = num as CellValue;
        solve(pos + 1);
        b[row][col] = 0;
      }
    }
  }

  solve(0);
  return count;
}

const DIFFICULTY_REMOVALS: Record<string, number> = {
  beginner: 20,
  easy: 35,
  medium: 45,
  hard: 52,
  expert: 56,
  master: 60,
};

export function generatePuzzle(difficulty: string): { puzzle: Board; solution: Board } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]) as Board;
  const removals = DIFFICULTY_REMOVALS[difficulty] || 45;

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= removals) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

export function generateDailyPuzzle(dateString: string): { puzzle: Board; solution: Board } {
  const seed = dateString.split('-').reduce((acc, val) => acc * 100 + parseInt(val), 0);

  let state = seed;
  function seededRandom(): number {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function seededShuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const board = createEmptyBoard();

  function fillBoard(pos: number): boolean {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    const numbers = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of numbers) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num as CellValue;
        if (fillBoard(pos + 1)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  fillBoard(0);
  const solution = board.map(row => [...row]) as Board;
  const puzzle = board.map(row => [...row]) as Board;

  const positions = seededShuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= 45) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

export { isValid, createEmptyBoard };
