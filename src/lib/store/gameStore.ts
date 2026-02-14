import { create } from 'zustand';
import {
  CellValue,
  Difficulty,
  Board,
  Puzzle,
  ComboState,
  GameAction,
  GameStatus,
  Notes,
} from '@/types';
import { generatePuzzle, generateDailyPuzzle } from '@/lib/sudoku/generator';
import { isCellCorrect, isBoardComplete } from '@/lib/sudoku/validator';
import { getHint } from '@/lib/sudoku/solver';
import { calculateFinalScore } from '@/lib/game/scoring';
import {
  updateComboOnCorrect,
  resetCombo,
  createInitialComboState,
  getComboTier,
} from '@/lib/game/combo';
import { soundManager } from '@/lib/audio/soundManager';
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticHeavy } from '@/lib/utils/haptic';
import { checkCompletions } from '@/lib/game/celebrations';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

function createEmptyNotes(): Notes {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>()),
  );
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]) as Board;
}

function cloneNotes(notes: Notes): Notes {
  return notes.map((row) => row.map((cell) => new Set(cell)));
}

/** Remove a candidate number from all notes in the same row, column, and box. */
function removeNoteFromPeers(
  notes: Notes,
  row: number,
  col: number,
  num: number,
): Notes {
  const next = cloneNotes(notes);

  // Row
  for (let c = 0; c < 9; c++) {
    next[row][c].delete(num);
  }
  // Column
  for (let r = 0; r < 9; r++) {
    next[r][col].delete(num);
  }
  // Box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      next[r][c].delete(num);
    }
  }

  return next;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MISTAKES = 3;
const MAX_HINTS = 3;

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface GameStore {
  // --- State ---
  puzzle: Puzzle | null;
  currentBoard: Board;
  notes: Notes;
  selectedCell: { row: number; col: number } | null;
  history: GameAction[];
  historyIndex: number;
  status: GameStatus;
  startTime: number;
  elapsedTime: number;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
  maxHints: number;
  score: number;
  isNotesMode: boolean;
  highlightedNumber: CellValue;
  difficulty: Difficulty;
  combo: ComboState;
  maxCombo: number;

  // --- Power-up state ---
  timerFrozenUntil: number;
  comboBoostUntil: number;
  errorHighlights: { row: number; col: number }[];

  // --- Actions ---
  startNewGame: (difficulty: Difficulty) => void;
  startDailyChallenge: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  selectCell: (row: number, col: number) => void;
  clearSelection: () => void;
  placeNumber: (num: number) => void;
  eraseNumber: () => void;
  toggleNote: (num: number) => void;
  toggleNotesMode: () => void;
  undo: () => void;
  redo: () => void;
  useHint: () => void;
  tick: () => void;
  checkCompletion: () => boolean;

  // --- Power-up actions ---
  revealCell: () => void;
  checkBoardErrors: () => void;
  freezeTimer: () => void;
  activateComboBoost: () => void;
  undoMistake: () => void;
  resetToIdle: () => void;
  getGameResult: () => {
    difficulty: Difficulty;
    timeInSeconds: number;
    mistakes: number;
    hintsUsed: number;
    maxCombo: number;
    baseScore: number;
    timeBonus: number;
    comboBonus: number;
    perfectBonus: number;
    mistakePenalty: number;
    hintPenalty: number;
    totalScore: number;
  } | null;
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

function getInitialState() {
  return {
    puzzle: null as Puzzle | null,
    currentBoard: createEmptyBoard(),
    notes: createEmptyNotes(),
    selectedCell: null as { row: number; col: number } | null,
    history: [] as GameAction[],
    historyIndex: -1,
    status: 'idle' as GameStatus,
    startTime: 0,
    elapsedTime: 0,
    mistakes: 0,
    maxMistakes: MAX_MISTAKES,
    hintsUsed: 0,
    maxHints: MAX_HINTS,
    score: 0,
    isNotesMode: false,
    highlightedNumber: 0 as CellValue,
    difficulty: 'medium' as Difficulty,
    combo: createInitialComboState(),
    maxCombo: 0,
    timerFrozenUntil: 0,
    comboBoostUntil: 0,
    errorHighlights: [],
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),

  // -----------------------------------------------------------------------
  // Game lifecycle
  // -----------------------------------------------------------------------

  startNewGame: (difficulty: Difficulty) => {
    const { puzzle, solution } = generatePuzzle(difficulty);

    const puzzleObj: Puzzle = {
      id: `${difficulty}-${Date.now()}`,
      board: puzzle,
      solution,
      difficulty,
      createdAt: new Date().toISOString(),
    };

    set({
      ...getInitialState(),
      puzzle: puzzleObj,
      currentBoard: cloneBoard(puzzle),
      difficulty,
      status: 'playing',
      startTime: Date.now(),
    });
  },

  startDailyChallenge: () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const { puzzle, solution } = generateDailyPuzzle(dateStr);

    const puzzleObj: Puzzle = {
      id: `daily-${dateStr}`,
      board: puzzle,
      solution,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      seed: parseInt(dateStr.replace(/-/g, ''), 10),
    };

    set({
      ...getInitialState(),
      puzzle: puzzleObj,
      currentBoard: cloneBoard(puzzle),
      difficulty: 'medium',
      status: 'playing',
      startTime: Date.now(),
    });
  },

  pauseGame: () => {
    const { status } = get();
    if (status === 'playing') {
      set({ status: 'paused' });
    }
  },

  resumeGame: () => {
    const { status } = get();
    if (status === 'paused') {
      set({ status: 'playing' });
    }
  },

  // -----------------------------------------------------------------------
  // Cell selection
  // -----------------------------------------------------------------------

  selectCell: (row: number, col: number) => {
    const { currentBoard } = get();
    const value = currentBoard[row][col];
    soundManager.play('tap');
    hapticLight();
    set({
      selectedCell: { row, col },
      highlightedNumber: value,
    });
  },

  clearSelection: () => {
    set({ selectedCell: null, highlightedNumber: 0 as CellValue });
  },

  // -----------------------------------------------------------------------
  // Number placement
  // -----------------------------------------------------------------------

  placeNumber: (num: number) => {
    const {
      puzzle,
      currentBoard,
      notes,
      selectedCell,
      status,
      isNotesMode,
      history,
      historyIndex,
      mistakes,
      maxMistakes,
      combo,
      maxCombo,
    } = get();

    if (!puzzle || !selectedCell || status !== 'playing') return;

    const { row, col } = selectedCell;

    // Cannot modify given cells
    if (puzzle.board[row][col] !== 0) return;

    // Notes mode: toggle note instead
    if (isNotesMode) {
      get().toggleNote(num);
      return;
    }

    const prevValue = currentBoard[row][col];
    const prevNotes = Array.from(notes[row][col]);

    // Create action for history (truncate any redo history)
    const action: GameAction = {
      type: 'place',
      row,
      col,
      prevValue: prevValue as CellValue,
      newValue: num as CellValue,
      prevNotes,
      newNotes: [],
      timestamp: Date.now(),
    };
    const newHistory = [...history.slice(0, historyIndex + 1), action];

    // Place the number
    const newBoard = cloneBoard(currentBoard);
    newBoard[row][col] = num as CellValue;

    // Clear notes on this cell
    let newNotes = cloneNotes(notes);
    newNotes[row][col].clear();

    // Check correctness
    const correct = isCellCorrect(newBoard, puzzle.solution, row, col);

    if (correct) {
      // Auto-remove this number from notes in same row/col/box
      newNotes = removeNoteFromPeers(newNotes, row, col, num);

      // Update combo (with boost if active)
      let newCombo = updateComboOnCorrect(combo, Date.now());
      if (get().comboBoostUntil > Date.now()) {
        newCombo = { ...newCombo, multiplier: newCombo.multiplier * 2 };
      }
      const newMaxCombo = Math.max(maxCombo, newCombo.current);

      // Play combo sound
      const tier = getComboTier(newCombo.current);
      if (tier.sound) {
        soundManager.play(tier.sound as Parameters<typeof soundManager.play>[0]);
      } else {
        soundManager.play('correct');
      }

      hapticMedium();
      hapticSuccess();

      set({
        currentBoard: newBoard,
        notes: newNotes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        combo: newCombo,
        maxCombo: newMaxCombo,
        highlightedNumber: num as CellValue,
      });

      // Check for completion celebrations (row/col/box/number)
      const completions = checkCompletions(newBoard, row, col);
      for (const c of completions) {
        if (c.type === 'number') {
          toast(`숫자 ${c.index} 완성!`, { icon: '🎯' });
        } else if (c.type === 'row') {
          toast(`${c.index + 1}행 완성!`, { icon: '✨' });
        } else if (c.type === 'column') {
          toast(`${c.index + 1}열 완성!`, { icon: '✨' });
        } else if (c.type === 'box') {
          toast('박스 완성!', { icon: '🎉' });
        }
      }
      // Play a special sound for completions
      if (completions.length > 0) {
        soundManager.play('dailyComplete');
      }

      // Check if game is complete
      get().checkCompletion();
    } else {
      // Wrong placement
      const newMistakes = mistakes + 1;
      const newCombo = resetCombo();

      soundManager.play('wrong');
      hapticMedium();
      hapticError();
      if (combo.current > 0) {
        soundManager.play('comboBreak');
      }

      set({
        currentBoard: newBoard,
        notes: newNotes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        mistakes: newMistakes,
        combo: newCombo,
        highlightedNumber: num as CellValue,
      });

      // Check if game failed
      if (newMistakes >= maxMistakes) {
        soundManager.play('wrong');
        hapticHeavy();
        set({ status: 'failed' });
      }
    }
  },

  // -----------------------------------------------------------------------
  // Erase
  // -----------------------------------------------------------------------

  eraseNumber: () => {
    const { puzzle, currentBoard, notes, selectedCell, status, history, historyIndex } = get();

    if (!puzzle || !selectedCell || status !== 'playing') return;

    const { row, col } = selectedCell;

    // Cannot erase given cells
    if (puzzle.board[row][col] !== 0) return;

    const prevValue = currentBoard[row][col];
    // Nothing to erase
    if (prevValue === 0 && notes[row][col].size === 0) return;

    const prevNotesList = Array.from(notes[row][col]);

    const action: GameAction = {
      type: 'erase',
      row,
      col,
      prevValue: prevValue as CellValue,
      newValue: 0 as CellValue,
      prevNotes: prevNotesList,
      newNotes: [],
      timestamp: Date.now(),
    };
    const newHistory = [...history.slice(0, historyIndex + 1), action];

    const newBoard = cloneBoard(currentBoard);
    newBoard[row][col] = 0;

    const newNotes = cloneNotes(notes);
    newNotes[row][col].clear();

    soundManager.play('undo');

    set({
      currentBoard: newBoard,
      notes: newNotes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      highlightedNumber: 0 as CellValue,
    });
  },

  // -----------------------------------------------------------------------
  // Notes
  // -----------------------------------------------------------------------

  toggleNote: (num: number) => {
    const { puzzle, currentBoard, notes, selectedCell, status, history, historyIndex } = get();

    if (!puzzle || status !== 'playing') return;

    if (!selectedCell) {
      toast('셀을 먼저 선택해주세요', { icon: '👆' });
      return;
    }

    const { row, col } = selectedCell;

    // Cannot add notes to given cells or cells that already have a value
    if (puzzle.board[row][col] !== 0 || currentBoard[row][col] !== 0) return;

    const prevNotesList = Array.from(notes[row][col]);
    const newNotes = cloneNotes(notes);

    if (newNotes[row][col].has(num)) {
      newNotes[row][col].delete(num);
    } else {
      newNotes[row][col].add(num);
    }

    const newNotesList = Array.from(newNotes[row][col]);

    const action: GameAction = {
      type: 'note',
      row,
      col,
      prevValue: 0 as CellValue,
      newValue: 0 as CellValue,
      prevNotes: prevNotesList,
      newNotes: newNotesList,
      timestamp: Date.now(),
    };
    const newHistory = [...history.slice(0, historyIndex + 1), action];

    soundManager.play('tap');

    set({
      notes: newNotes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  toggleNotesMode: () => {
    const newMode = !get().isNotesMode;
    soundManager.play('tap');
    hapticLight();
    set({ isNotesMode: newMode });
  },

  // -----------------------------------------------------------------------
  // Undo / Redo
  // -----------------------------------------------------------------------

  undo: () => {
    const { history, historyIndex, currentBoard, notes, status, puzzle } = get();

    if (historyIndex < 0 || status !== 'playing' || !puzzle) return;

    const action = history[historyIndex];
    const newBoard = cloneBoard(currentBoard);
    const newNotes = cloneNotes(notes);

    // Restore previous state
    newBoard[action.row][action.col] = action.prevValue;
    if (action.prevNotes) {
      newNotes[action.row][action.col] = new Set(action.prevNotes);
    }

    soundManager.play('undo');

    set({
      currentBoard: newBoard,
      notes: newNotes,
      historyIndex: historyIndex - 1,
      highlightedNumber: action.prevValue,
    });
  },

  redo: () => {
    const { history, historyIndex, currentBoard, notes, status, puzzle } = get();

    if (historyIndex >= history.length - 1 || status !== 'playing' || !puzzle) return;

    const action = history[historyIndex + 1];
    const newBoard = cloneBoard(currentBoard);
    const newNotes = cloneNotes(notes);

    newBoard[action.row][action.col] = action.newValue;
    if (action.newNotes) {
      newNotes[action.row][action.col] = new Set(action.newNotes);
    }

    soundManager.play('tap');

    set({
      currentBoard: newBoard,
      notes: newNotes,
      historyIndex: historyIndex + 1,
      highlightedNumber: action.newValue,
    });
  },

  // -----------------------------------------------------------------------
  // Hint
  // -----------------------------------------------------------------------

  useHint: () => {
    const {
      puzzle,
      currentBoard,
      notes,
      hintsUsed,
      maxHints,
      status,
      history,
      historyIndex,
      combo,
    } = get();

    if (!puzzle || status !== 'playing' || hintsUsed >= maxHints) return;

    const hint = getHint(currentBoard, puzzle.solution);
    if (!hint) return;

    const { row, col, value } = hint;
    const prevValue = currentBoard[row][col];
    const prevNotesList = Array.from(notes[row][col]);

    const action: GameAction = {
      type: 'hint',
      row,
      col,
      prevValue: prevValue as CellValue,
      newValue: value,
      prevNotes: prevNotesList,
      newNotes: [],
      timestamp: Date.now(),
    };
    const newHistory = [...history.slice(0, historyIndex + 1), action];

    const newBoard = cloneBoard(currentBoard);
    newBoard[row][col] = value;

    // Clear notes and remove from peers
    let newNotes = cloneNotes(notes);
    newNotes[row][col].clear();
    newNotes = removeNoteFromPeers(newNotes, row, col, value);

    // Hints reset combo
    const newCombo = resetCombo();

    soundManager.play('hint');
    if (combo.current > 0) {
      soundManager.play('comboBreak');
    }

    set({
      currentBoard: newBoard,
      notes: newNotes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      hintsUsed: hintsUsed + 1,
      combo: newCombo,
      selectedCell: { row, col },
      highlightedNumber: value,
    });

    // Check completion after hint
    get().checkCompletion();
  },

  // -----------------------------------------------------------------------
  // Timer tick
  // -----------------------------------------------------------------------

  tick: () => {
    const { status, startTime, combo, timerFrozenUntil } = get();

    if (status !== 'playing') return;

    const now = Date.now();

    // If timer is frozen, advance startTime to keep elapsed the same
    if (timerFrozenUntil > now) {
      set({ startTime: startTime + 1000 });
      // Still process combo decay below
    }

    const elapsed = Math.floor((now - (timerFrozenUntil > now ? startTime + 1000 : startTime)) / 1000);

    // Decay combo timer
    let newCombo = { ...combo };
    if (newCombo.current > 0 && newCombo.timer > 0) {
      // Each tick is ~1 second, subtract 1000ms
      newCombo = {
        ...newCombo,
        timer: Math.max(0, newCombo.timer - 1000),
      };

      // If timer expired, reset combo
      if (newCombo.timer <= 0) {
        if (combo.current > 0) {
          soundManager.play('comboBreak');
        }
        newCombo = resetCombo();
      }
    }

    set({
      elapsedTime: elapsed,
      combo: newCombo,
    });
  },

  // -----------------------------------------------------------------------
  // Completion check
  // -----------------------------------------------------------------------

  checkCompletion: (): boolean => {
    const { puzzle, currentBoard, status } = get();

    if (!puzzle || status !== 'playing') return false;

    const complete = isBoardComplete(currentBoard, puzzle.solution);

    if (complete) {
      soundManager.play('complete');
      hapticHeavy();

      const result = get().getGameResult();
      set({
        status: 'completed',
        score: result?.totalScore ?? 0,
      });
    }

    return complete;
  },

  // -----------------------------------------------------------------------
  // Game result
  // -----------------------------------------------------------------------

  getGameResult: () => {
    const { puzzle, elapsedTime, mistakes, hintsUsed, maxCombo, difficulty } = get();

    if (!puzzle) return null;

    const scoreResult = calculateFinalScore({
      difficulty,
      timeInSeconds: elapsedTime,
      mistakes,
      hintsUsed,
      maxCombo,
    });

    return {
      difficulty,
      timeInSeconds: elapsedTime,
      mistakes,
      hintsUsed,
      maxCombo,
      ...scoreResult,
    };
  },

  // -----------------------------------------------------------------------
  // Power-up actions
  // -----------------------------------------------------------------------

  revealCell: () => {
    const { puzzle, currentBoard, notes, status, history, historyIndex } = get();
    if (!puzzle || status !== 'playing') return;

    // Find all empty cells
    const emptyCells: { row: number; col: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0 && puzzle.board[r][c] === 0) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }
    if (emptyCells.length === 0) return;

    // Pick a random empty cell
    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = puzzle.solution[target.row][target.col];
    const prevNotesList = Array.from(notes[target.row][target.col]);

    const action: GameAction = {
      type: 'hint',
      row: target.row,
      col: target.col,
      prevValue: 0 as CellValue,
      newValue: value,
      prevNotes: prevNotesList,
      newNotes: [],
      timestamp: Date.now(),
    };
    const newHistory = [...history.slice(0, historyIndex + 1), action];

    const newBoard = cloneBoard(currentBoard);
    newBoard[target.row][target.col] = value;

    let newNotes = cloneNotes(notes);
    newNotes[target.row][target.col].clear();
    newNotes = removeNoteFromPeers(newNotes, target.row, target.col, value);

    soundManager.play('hint');
    hapticSuccess();
    toast('셀이 공개되었습니다!', { icon: '🔍' });

    set({
      currentBoard: newBoard,
      notes: newNotes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedCell: target,
      highlightedNumber: value,
    });

    get().checkCompletion();
  },

  checkBoardErrors: () => {
    const { puzzle, currentBoard, status } = get();
    if (!puzzle || status !== 'playing') return;

    const errors: { row: number; col: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] !== 0 && currentBoard[r][c] !== puzzle.solution[r][c]) {
          errors.push({ row: r, col: c });
        }
      }
    }

    soundManager.play('hint');
    hapticMedium();

    if (errors.length === 0) {
      toast('오류가 없습니다! 잘하고 있어요!', { icon: '✅' });
    } else {
      toast(`${errors.length}개의 오류가 발견되었습니다!`, { icon: '❌' });
      set({ errorHighlights: errors });
      // Clear highlights after 3 seconds
      setTimeout(() => {
        set({ errorHighlights: [] });
      }, 3000);
    }
  },

  freezeTimer: () => {
    const { status } = get();
    if (status !== 'playing') return;

    soundManager.play('powerup');
    hapticSuccess();
    toast('30초 동안 타이머가 정지됩니다!', { icon: '❄️' });

    set({ timerFrozenUntil: Date.now() + 30000 });
  },

  activateComboBoost: () => {
    const { status } = get();
    if (status !== 'playing') return;

    soundManager.play('powerup');
    hapticSuccess();
    toast('60초 동안 콤보 배율 2배!', { icon: '🚀' });

    set({ comboBoostUntil: Date.now() + 60000 });
  },

  undoMistake: () => {
    const { mistakes, status } = get();
    if (status !== 'playing' || mistakes <= 0) return;

    soundManager.play('powerup');
    hapticSuccess();
    toast('실수 1회가 취소되었습니다!', { icon: '⏪' });

    set({ mistakes: mistakes - 1 });
  },

  resetToIdle: () => {
    set(getInitialState());
  },
}));
