import { Board, CellValue } from './types';
import { isValid } from './generator';

export function solve(board: Board): Board | null {
  const b = board.map(row => [...row]) as Board;

  function backtrack(pos: number): boolean {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;

    if (b[row][col] !== 0) return backtrack(pos + 1);

    for (let num = 1; num <= 9; num++) {
      if (isValid(b, row, col, num)) {
        b[row][col] = num as CellValue;
        if (backtrack(pos + 1)) return true;
        b[row][col] = 0;
      }
    }
    return false;
  }

  return backtrack(0) ? b : null;
}

export function getHint(board: Board, solution: Board): { row: number; col: number; value: CellValue } | null {
  let bestCell: { row: number; col: number } | null = null;
  let minCandidates = 10;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        let candidates = 0;
        for (let n = 1; n <= 9; n++) {
          if (isValid(board, r, c, n)) candidates++;
        }
        if (candidates < minCandidates) {
          minCandidates = candidates;
          bestCell = { row: r, col: c };
        }
      }
    }
  }

  if (!bestCell) return null;
  return {
    row: bestCell.row,
    col: bestCell.col,
    value: solution[bestCell.row][bestCell.col],
  };
}
