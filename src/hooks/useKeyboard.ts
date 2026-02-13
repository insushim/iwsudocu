'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';

export function useKeyboard() {
  const placeNumber = useGameStore((state) => state.placeNumber);
  const eraseNumber = useGameStore((state) => state.eraseNumber);
  const selectCell = useGameStore((state) => state.selectCell);
  const selectedCell = useGameStore((state) => state.selectedCell);
  const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
  const undo = useGameStore((state) => state.undo);
  const redo = useGameStore((state) => state.redo);
  const useHint = useGameStore((state) => state.useHint);
  const isNotesMode = useGameStore((state) => state.isNotesMode);
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;

      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const num = parseInt(e.key, 10);
        placeNumber(num);
        return;
      }

      // Backspace/Delete: erase
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        eraseNumber();
        return;
      }

      // Arrow keys: move selection
      if (e.key.startsWith('Arrow') && selectedCell) {
        e.preventDefault();
        const { row, col } = selectedCell;

        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        }

        if (newRow !== row || newCol !== col) {
          selectCell(newRow, newCol);
        }
        return;
      }

      // If no cell is selected yet and arrow key pressed, select center
      if (e.key.startsWith('Arrow') && !selectedCell) {
        e.preventDefault();
        selectCell(4, 4);
        return;
      }

      // N key: toggle notes mode
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleNotesMode();
        return;
      }

      // Ctrl+Z: undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y: redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // H key: hint
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useHint();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, isNotesMode, selectedCell, placeNumber, eraseNumber, selectCell, toggleNotesMode, undo, redo, useHint]);
}
