import { Board } from './types';

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  conflicts: { row: number; col: number }[];
}

export function validateBoard(board: Board): ValidationResult {
  const conflicts: { row: number; col: number }[] = [];
  let isComplete = true;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        isComplete = false;
        continue;
      }

      const val = board[r][c];
      let hasConflict = false;

      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && board[r][cc] === val) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        for (let rr = 0; rr < 9; rr++) {
          if (rr !== r && board[rr][c] === val) {
            hasConflict = true;
            break;
          }
        }
      }

      if (!hasConflict) {
        const boxRow = Math.floor(r / 3) * 3;
        const boxCol = Math.floor(c / 3) * 3;
        for (let br = boxRow; br < boxRow + 3 && !hasConflict; br++) {
          for (let bc = boxCol; bc < boxCol + 3 && !hasConflict; bc++) {
            if ((br !== r || bc !== c) && board[br][bc] === val) {
              hasConflict = true;
            }
          }
        }
      }

      if (hasConflict) {
        conflicts.push({ row: r, col: c });
      }
    }
  }

  return {
    isValid: conflicts.length === 0,
    isComplete: isComplete && conflicts.length === 0,
    conflicts,
  };
}

export function isCellCorrect(board: Board, solution: Board, row: number, col: number): boolean {
  return board[row][col] === solution[row][col];
}

export function isBoardComplete(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
