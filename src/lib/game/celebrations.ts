import { Board } from '@/types';

export interface CelebrationResult {
  type: 'number' | 'row' | 'column' | 'box';
  index: number; // which row/col/box (0-8) or which number (1-9)
}

/** Check what was completed by placing a number at (row, col). */
export function checkCompletions(board: Board, row: number, col: number): CelebrationResult[] {
  const results: CelebrationResult[] = [];
  const num = board[row][col];

  // Check if this number is now fully placed (all 9 instances)
  let numCount = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === num) numCount++;
  if (numCount === 9) results.push({ type: 'number', index: num });

  // Check if row is complete
  const rowComplete = board[row].every(v => v !== 0);
  if (rowComplete) results.push({ type: 'row', index: row });

  // Check if column is complete
  const colComplete = board.every(r => r[col] !== 0);
  if (colComplete) results.push({ type: 'column', index: col });

  // Check if 3x3 box is complete
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  let boxComplete = true;
  for (let r = boxRow; r < boxRow + 3; r++)
    for (let c = boxCol; c < boxCol + 3; c++)
      if (board[r][c] === 0) boxComplete = false;
  if (boxComplete) results.push({ type: 'box', index: Math.floor(row / 3) * 3 + Math.floor(col / 3) });

  return results;
}
