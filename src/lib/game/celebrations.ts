import { Board } from '@/types';

export interface CelebrationResult {
  type: 'number' | 'row' | 'column' | 'box';
  index: number; // which row/col/box (0-8) or which number (1-9)
}

/**
 * Check what was CORRECTLY completed by placing a number at (row, col).
 * A unit only counts as complete when every cell matches the solution — a unit
 * filled with wrong values must not trigger a celebration.
 */
export function checkCompletions(
  board: Board,
  row: number,
  col: number,
  solution: Board,
): CelebrationResult[] {
  const results: CelebrationResult[] = [];
  const num = board[row][col];

  const cellCorrect = (r: number, c: number) =>
    board[r][c] !== 0 && board[r][c] === solution[r][c];

  // Check if this number is now fully AND correctly placed (all 9 instances).
  let numCount = 0;
  let numAllCorrect = true;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === num) {
        numCount++;
        if (solution[r][c] !== num) numAllCorrect = false;
      }
  if (numCount === 9 && numAllCorrect) results.push({ type: 'number', index: num });

  // Row complete + correct
  let rowComplete = true;
  for (let c = 0; c < 9; c++) if (!cellCorrect(row, c)) rowComplete = false;
  if (rowComplete) results.push({ type: 'row', index: row });

  // Column complete + correct
  let colComplete = true;
  for (let r = 0; r < 9; r++) if (!cellCorrect(r, col)) colComplete = false;
  if (colComplete) results.push({ type: 'column', index: col });

  // 3x3 box complete + correct
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  let boxComplete = true;
  for (let r = boxRow; r < boxRow + 3; r++)
    for (let c = boxCol; c < boxCol + 3; c++)
      if (!cellCorrect(r, c)) boxComplete = false;
  if (boxComplete) results.push({ type: 'box', index: Math.floor(row / 3) * 3 + Math.floor(col / 3) });

  return results;
}
