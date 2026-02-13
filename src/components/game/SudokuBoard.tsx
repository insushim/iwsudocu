'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { useUserStore } from '@/lib/store/userStore';
import { cn } from '@/lib/utils/cn';
import SudokuCell from './SudokuCell';

export default function SudokuBoard() {
  const currentBoard = useGameStore((s) => s.currentBoard);
  const puzzle = useGameStore((s) => s.puzzle);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const highlightedNumber = useGameStore((s) => s.highlightedNumber);
  const notes = useGameStore((s) => s.notes);
  const highlightSameNumbers = useUserStore((s) => s.profile.settings.highlightSameNumbers);

  // Pre-compute which cells are given
  const givenBoard = useMemo(() => {
    if (!puzzle) return null;
    return puzzle.board;
  }, [puzzle]);

  // Pre-compute conflicts: cells that have a duplicate in their row/col/box
  const conflicts = useMemo(() => {
    const result: boolean[][] = Array.from({ length: 9 }, () =>
      Array(9).fill(false),
    );
    if (!puzzle) return result;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = currentBoard[r][c];
        if (val === 0) continue;
        // If the value doesn't match the solution, it's a conflict
        if (val !== puzzle.solution[r][c]) {
          result[r][c] = true;
        }
      }
    }
    return result;
  }, [currentBoard, puzzle]);

  const cells = useMemo(() => {
    const items: React.ReactNode[] = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const value = currentBoard[r][c];
        const isGiven = givenBoard ? givenBoard[r][c] !== 0 : false;
        const isSelected =
          selectedCell !== null &&
          selectedCell.row === r &&
          selectedCell.col === c;
        const isHighlighted =
          highlightSameNumbers && highlightedNumber !== 0 && value === highlightedNumber && !isSelected;
        const isSameRow = selectedCell !== null && selectedCell.row === r && !isSelected;
        const isSameCol = selectedCell !== null && selectedCell.col === c && !isSelected;
        const isSameBox =
          selectedCell !== null &&
          Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
          Math.floor(selectedCell.col / 3) === Math.floor(c / 3) &&
          !isSelected;
        const isConflict = conflicts[r][c];
        const cellNotes = notes[r][c] ? Array.from(notes[r][c]) : [];

        items.push(
          <SudokuCell
            key={`${r}-${c}`}
            row={r}
            col={c}
            value={value}
            isGiven={isGiven}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            isSameRow={isSameRow}
            isSameCol={isSameCol}
            isSameBox={isSameBox}
            isConflict={isConflict}
            notes={cellNotes}
          />,
        );
      }
    }

    return items;
  }, [currentBoard, givenBoard, selectedCell, highlightedNumber, conflicts, notes]);

  return (
    <div
      className={cn(
        'grid grid-cols-9 w-full max-w-[min(100vw-2rem,420px)] aspect-square mx-auto',
        'rounded-xl border-2 border-indigo-500/60 overflow-hidden',
        'bg-slate-900/80 backdrop-blur-sm shadow-2xl shadow-indigo-500/10',
      )}
    >
      {cells}
    </div>
  );
}
