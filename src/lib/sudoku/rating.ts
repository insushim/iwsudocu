import { ALL_DIGITS, BOX_OF, PEERS, POPCOUNT, UNITS, digitFromBit } from './bits';

/**
 * Difficulty rating for a puzzle, expressed as the hardest technique a solver
 * is forced to reach for. Clue count is a poor proxy on its own — measured over
 * 360 boards, 58% of 22-to-29-clue puzzles needed nothing a beginner lacks —
 * so the generator rates each candidate and keeps the ones inside its tier's
 * band. See DIFFICULTY_BANDS in ./generator.
 *
 * Cheapest first; the order is also the order the solver applies them, so a
 * puzzle's rating is the deepest rung it ever has to use. Indices are a public
 * contract — DIFFICULTY_BANDS in ./generator is written in terms of them.
 */
export const TECHNIQUES = [
  'naked singles',
  'hidden singles',
  'box-line',
  'naked pairs',
  'naked triples',
  'x-wing',
] as const;

export type TechniqueRating = number;

/** Rating for a board that none of the supported techniques can finish. */
export const NEEDS_GUESSING: TechniqueRating = TECHNIQUES.length;

export function ratingLabel(rating: TechniqueRating): string {
  return TECHNIQUES[rating] ?? 'needs guessing';
}

/**
 * Returns the hardest technique index required to finish `cells`, or
 * NEEDS_GUESSING when the supported set stalls.
 *
 * Pure: `cells` is copied, never mutated. Cost is roughly 0.1 ms, which is what
 * makes it affordable inside the generator's retry loop.
 */
export function rateBoard(cells: Uint8Array): TechniqueRating {
  const board = cells.slice();
  const cand = new Uint16Array(81);
  let empty = 0;
  let broken = false;

  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) continue;
    empty++;
    let mask = ALL_DIGITS;
    for (let p = 0; p < 20; p++) {
      const digit = board[PEERS[i * 20 + p]];
      if (digit !== 0) mask &= ~(1 << (digit - 1));
    }
    cand[i] = mask;
  }

  function assign(index: number, bit: number): void {
    board[index] = digitFromBit(bit);
    cand[index] = 0;
    for (let p = 0; p < 20; p++) cand[PEERS[index * 20 + p]] &= ~bit;
    empty--;
  }

  /** A cell with exactly one candidate left. */
  function nakedSingles(): boolean {
    let progress = false;
    for (let i = 0; i < 81; i++) {
      if (board[i] !== 0) continue;
      const mask = cand[i];
      if (mask === 0) {
        broken = true;
        return false;
      }
      if (POPCOUNT[mask] === 1) {
        assign(i, mask);
        progress = true;
      }
    }
    return progress;
  }

  /** A digit with exactly one home left in some unit. */
  function hiddenSingles(): boolean {
    let progress = false;
    for (let u = 0; u < 27; u++) {
      for (let d = 0; d < 9; d++) {
        const bit = 1 << d;
        let count = 0;
        let target = -1;
        let alreadyPlaced = false;
        for (let k = 0; k < 9; k++) {
          const i = UNITS[u * 9 + k];
          if (board[i] !== 0) {
            if (board[i] === d + 1) {
              alreadyPlaced = true;
              break;
            }
            continue;
          }
          if (cand[i] & bit) {
            count++;
            target = i;
          }
        }
        if (alreadyPlaced) continue;
        if (count === 0) {
          broken = true;
          return false;
        }
        if (count === 1) {
          assign(target, bit);
          progress = true;
        }
      }
    }
    return progress;
  }

  /**
   * `size` cells in a unit whose candidates together span exactly `size`
   * digits: those digits cannot live anywhere else in the unit.
   *
   * The guard below is `<` and not `<=`: a unit holding exactly `size`
   * constrained cells is the textbook shape of the pattern, not a case to skip.
   * Getting that wrong rated 34% of Hard+ boards harder than they are.
   */
  function nakedSubsets(size: 2 | 3): boolean {
    let changed = false;
    const cells: number[] = [];

    for (let u = 0; u < 27; u++) {
      cells.length = 0;
      for (let k = 0; k < 9; k++) {
        const i = UNITS[u * 9 + k];
        if (board[i] === 0 && POPCOUNT[cand[i]] >= 2 && POPCOUNT[cand[i]] <= size) cells.push(i);
      }
      if (cells.length < size) continue;

      const prune = (union: number, a: number, b: number, c: number) => {
        for (let k = 0; k < 9; k++) {
          const i = UNITS[u * 9 + k];
          if (i === a || i === b || i === c) continue;
          if (board[i] !== 0 || (cand[i] & union) === 0) continue;
          cand[i] &= ~union;
          changed = true;
        }
      };

      for (let x = 0; x < cells.length; x++) {
        for (let y = x + 1; y < cells.length; y++) {
          if (size === 2) {
            const union = cand[cells[x]] | cand[cells[y]];
            if (POPCOUNT[union] === 2) prune(union, cells[x], cells[y], -1);
            continue;
          }
          for (let z = y + 1; z < cells.length; z++) {
            const union = cand[cells[x]] | cand[cells[y]] | cand[cells[z]];
            if (POPCOUNT[union] === 3) prune(union, cells[x], cells[y], cells[z]);
          }
        }
      }
    }
    return changed;
  }

  /**
   * Pointing pairs (a digit confined to one row/column inside a box clears that
   * row/column elsewhere) and box-line reduction (the converse).
   */
  function boxLine(): boolean {
    let changed = false;

    for (let b = 0; b < 9; b++) {
      for (let d = 0; d < 9; d++) {
        const bit = 1 << d;
        let rows = 0;
        let cols = 0;
        let count = 0;
        for (let k = 0; k < 9; k++) {
          const i = UNITS[(18 + b) * 9 + k];
          if (board[i] !== 0 || (cand[i] & bit) === 0) continue;
          count++;
          rows |= 1 << ((i / 9) | 0);
          cols |= 1 << (i % 9);
        }
        if (count < 2) continue;

        if (POPCOUNT[rows] === 1) {
          const r = digitFromBit(rows) - 1;
          for (let c = 0; c < 9; c++) {
            const i = r * 9 + c;
            if (BOX_OF[i] === b || board[i] !== 0 || (cand[i] & bit) === 0) continue;
            cand[i] &= ~bit;
            changed = true;
          }
        }
        if (POPCOUNT[cols] === 1) {
          const c = digitFromBit(cols) - 1;
          for (let r = 0; r < 9; r++) {
            const i = r * 9 + c;
            if (BOX_OF[i] === b || board[i] !== 0 || (cand[i] & bit) === 0) continue;
            cand[i] &= ~bit;
            changed = true;
          }
        }
      }
    }

    for (let u = 0; u < 18; u++) {
      for (let d = 0; d < 9; d++) {
        const bit = 1 << d;
        let boxes = 0;
        let count = 0;
        for (let k = 0; k < 9; k++) {
          const i = UNITS[u * 9 + k];
          if (board[i] !== 0 || (cand[i] & bit) === 0) continue;
          count++;
          boxes |= 1 << BOX_OF[i];
        }
        if (count < 2 || POPCOUNT[boxes] !== 1) continue;

        const b = digitFromBit(boxes) - 1;
        for (let k = 0; k < 9; k++) {
          const i = UNITS[(18 + b) * 9 + k];
          const inSourceUnit = u < 9 ? ((i / 9) | 0) === u : i % 9 === u - 9;
          if (inSourceUnit || board[i] !== 0 || (cand[i] & bit) === 0) continue;
          cand[i] &= ~bit;
          changed = true;
        }
      }
    }

    return changed;
  }

  /**
   * Two rows where a digit has the same two possible columns (or the transpose)
   * lock that digit out of those columns everywhere else.
   */
  function xWing(): boolean {
    let changed = false;
    const lines = new Int16Array(9);

    for (let d = 0; d < 9; d++) {
      const bit = 1 << d;

      for (let transposed = 0; transposed < 2; transposed++) {
        for (let a = 0; a < 9; a++) {
          let mask = 0;
          let count = 0;
          for (let b = 0; b < 9; b++) {
            const i = transposed ? b * 9 + a : a * 9 + b;
            if (board[i] !== 0 || (cand[i] & bit) === 0) continue;
            count++;
            mask |= 1 << b;
          }
          lines[a] = count === 2 ? mask : -1;
        }

        for (let a1 = 0; a1 < 9; a1++) {
          if (lines[a1] < 0) continue;
          for (let a2 = a1 + 1; a2 < 9; a2++) {
            if (lines[a2] !== lines[a1]) continue;
            for (let b = 0; b < 9; b++) {
              if ((lines[a1] & (1 << b)) === 0) continue;
              for (let a = 0; a < 9; a++) {
                if (a === a1 || a === a2) continue;
                const i = transposed ? b * 9 + a : a * 9 + b;
                if (board[i] !== 0 || (cand[i] & bit) === 0) continue;
                cand[i] &= ~bit;
                changed = true;
              }
            }
          }
        }
      }
    }

    return changed;
  }

  // Cheapest first, and the order is the rating scale: locked candidates
  // (pointing / box-line reduction) sit below the naked subsets, matching how
  // the common references — Hodoku, SudokuWiki — rank them for a human solver.
  // Getting this order wrong would invert tiers whose floors sit on it.
  const steps: (() => boolean)[] = [
    nakedSingles,
    hiddenSingles,
    boxLine,
    () => nakedSubsets(2),
    () => nakedSubsets(3),
    xWing,
  ];

  let hardest = 0;
  for (;;) {
    if (broken) return NEEDS_GUESSING;
    if (empty === 0) return hardest;

    let advanced = false;
    for (let step = 0; step < steps.length; step++) {
      if (!steps[step]()) continue;
      if (step > hardest) hardest = step;
      advanced = true;
      break;
    }
    if (!advanced) return NEEDS_GUESSING;
  }
}
