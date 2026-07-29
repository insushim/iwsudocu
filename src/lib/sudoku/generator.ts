import type { CellValue, Board } from './types';
import { DIFFICULTY_CONFIGS } from '@/lib/utils/constants';
import type { Difficulty } from '@/types';
import { ALL_DIGITS, BOX_OF, POPCOUNT, digitFromBit } from './bits';
import { NEEDS_GUESSING, rateBoard, type TechniqueRating } from './rating';

// ---------------------------------------------------------------------------
// Bitmask engine
// ---------------------------------------------------------------------------
// Row/column/box occupancy is tracked in three 9-entry mask tables, so finding
// a cell's candidates is one OR instead of scanning 27 cells, and the search
// runs on a flat Uint8Array instead of cloning a 9x9 array-of-arrays on every
// uniqueness check. That is what makes the retry loop in generatePuzzle
// affordable.

// Generation is synchronous and single-threaded, so one set of scratch buffers
// is reused across calls rather than allocated per call.
const grid = new Uint8Array(81);
const rowMask = new Uint16Array(9);
const colMask = new Uint16Array(9);
const boxMask = new Uint16Array(9);

// Sharing those buffers means exactly one generation may be in flight; see the
// reentrancy guard in pickBest.
let generating = false;

function place(index: number, digit: number): void {
  const bit = 1 << (digit - 1);
  grid[index] = digit;
  rowMask[(index / 9) | 0] |= bit;
  colMask[index % 9] |= bit;
  boxMask[BOX_OF[index]] |= bit;
}

function clearCell(index: number): void {
  const digit = grid[index];
  if (digit === 0) return;
  const bit = ~(1 << (digit - 1));
  grid[index] = 0;
  rowMask[(index / 9) | 0] &= bit;
  colMask[index % 9] &= bit;
  boxMask[BOX_OF[index]] &= bit;
}

function candidates(index: number): number {
  return ALL_DIGITS & ~(rowMask[(index / 9) | 0] | colMask[index % 9] | boxMask[BOX_OF[index]]);
}

// Proving that no *other* digit fits a cell is the only genuinely unbounded
// step in a dig, so it gets an explicit work budget. The budget is counted in
// search nodes rather than milliseconds for two reasons: a wall clock would
// make the daily puzzle depend on how fast the device is, and nodes are what
// actually vary. Worst observed over 150 Master runs is 27,934 nodes for a
// single cell, so this is ~9x headroom and never trips in normal play.
const SEARCH_NODE_LIMIT = 250_000;

let nodesLeft = 0;
let searchExhausted = false;

/**
 * Counts solutions of the current grid, stopping once `limit` are found.
 * Always branches on the empty cell with the fewest candidates, which prunes
 * far harder than the naive left-to-right order.
 *
 * Returns 0 and sets `searchExhausted` if it runs out of budget — callers must
 * treat that as "don't know", never as "no solutions".
 */
function countSolutions(limit: number): number {
  if (nodesLeft <= 0) {
    searchExhausted = true;
    return 0;
  }
  nodesLeft--;

  let bestCell = -1;
  let bestMask = 0;
  let bestCount = 10;

  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue;
    const mask = candidates(i);
    const count = POPCOUNT[mask];
    if (count === 0) return 0;
    if (count < bestCount) {
      bestCount = count;
      bestCell = i;
      bestMask = mask;
      if (count === 1) break;
    }
  }
  if (bestCell === -1) return 1;

  let found = 0;
  let mask = bestMask;
  while (mask !== 0) {
    const bit = mask & -mask;
    mask ^= bit;
    place(bestCell, digitFromBit(bit));
    found += countSolutions(limit - found);
    clearCell(bestCell);
    if (found >= limit) break;
  }
  return found;
}

type Rng = () => number;

/** Fills the (empty) grid with a random valid solution. */
function fillSolution(rand: Rng): boolean {
  let bestCell = -1;
  let bestMask = 0;
  let bestCount = 10;

  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue;
    const mask = candidates(i);
    const count = POPCOUNT[mask];
    if (count === 0) return false;
    if (count < bestCount) {
      bestCount = count;
      bestCell = i;
      bestMask = mask;
      if (count === 1) break;
    }
  }
  if (bestCell === -1) return true;

  const digits: number[] = [];
  let mask = bestMask;
  while (mask !== 0) {
    const bit = mask & -mask;
    mask ^= bit;
    digits.push(digitFromBit(bit));
  }
  for (let k = digits.length - 1; k > 0; k--) {
    const j = (rand() * (k + 1)) | 0;
    [digits[k], digits[j]] = [digits[j], digits[k]];
  }

  for (const digit of digits) {
    place(bestCell, digit);
    if (fillSolution(rand)) return true;
    clearCell(bestCell);
  }
  return false;
}

function newSolution(rand: Rng): Uint8Array {
  grid.fill(0);
  rowMask.fill(0);
  colMask.fill(0);
  boxMask.fill(0);
  fillSolution(rand);
  return grid.slice();
}

function shuffledOrder(rand: Rng): Uint8Array {
  const order = new Uint8Array(81);
  for (let i = 0; i < 81; i++) order[i] = i;
  for (let i = 80; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0;
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

/**
 * Removes cells from the current (solved) grid in `order` until `targetGivens`
 * is reached, keeping the solution unique. Returns the number of givens left.
 *
 * `deadline` is a performance.now() timestamp, or 0 for "no time limit" — the
 * daily puzzle must be reproducible on every device, so it never uses one.
 */
function dig(targetGivens: number, order: Uint8Array, deadline: number): number {
  let givens = 81;

  for (let k = 0; k < 81; k++) {
    if (givens <= targetGivens) break;
    if (deadline !== 0 && now() > deadline) break;

    const index = order[k];
    const value = grid[index];
    clearCell(index);

    // The puzzle was uniquely solvable before this removal, so it still has at
    // least one solution (the original). A second one can only come from some
    // *other* digit fitting here — testing that directly is much cheaper than
    // recounting every solution from scratch.
    let ambiguous = false;
    nodesLeft = SEARCH_NODE_LIMIT;
    searchExhausted = false;
    let mask = candidates(index);
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      const digit = digitFromBit(bit);
      if (digit === value) continue;
      place(index, digit);
      const solvable = countSolutions(1) > 0;
      clearCell(index);
      if (solvable) {
        ambiguous = true;
        break;
      }
    }

    // Exhausting the budget means the search never finished, so "no alternative
    // was found" proves nothing. Put the clue back rather than risk shipping a
    // puzzle with more than one solution.
    if (ambiguous || searchExhausted) place(index, value);
    else givens--;
  }

  return givens;
}

function toBoard(cells: Uint8Array): Board {
  const board: Board = [];
  for (let r = 0; r < 9; r++) {
    const row: CellValue[] = [];
    for (let c = 0; c < 9; c++) row.push(cells[r * 9 + c] as CellValue);
    board.push(row);
  }
  return board;
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// ---------------------------------------------------------------------------
// Difficulty targets
// ---------------------------------------------------------------------------
// The target given count comes straight from DIFFICULTY_CONFIGS so the number
// the difficulty advertises and the number the generator aims for cannot drift
// apart.
//
// A single random dig pass overshoots at the hard end: once a cell fails the
// uniqueness test it can never pass later either (removing more cells only ever
// adds solutions), so one pass stalls above the target. Master used to end up
// at 23-25 givens against a target of 21 — statistically indistinguishable from
// Expert's 25, while paying 5x XP and 200 coins to Expert's 3x/100. The fix is
// to retry with a fresh grid and a fresh removal order, keeping the best run.

function targetGivensFor(difficulty: string): number {
  return (
    DIFFICULTY_CONFIGS[difficulty as Difficulty]?.givens ?? DIFFICULTY_CONFIGS.medium.givens
  );
}

// Wall-clock ceiling for one generatePuzzle call. Generation runs on the main
// thread behind a spinner, so an unbounded retry loop would be a visible
// freeze; when the budget runs out we ship the best attempt so far, which is
// always a valid, uniquely-solvable puzzle. The clock is checked once per dug
// cell and each cell's work is capped by SEARCH_NODE_LIMIT, so the overshoot
// past the budget is bounded too — it is a real ceiling, not a hint: re-run
// against a 200 ms budget, the worst block over 200 Master runs was 201 ms.
//
// Grading the tiers by technique (see DIFFICULTY_BANDS) made the hardest target
// rarer, and so more expensive. Master now blocks for p50 ~100 ms and p95
// ~280 ms (two samples of 200 runs: 89/270 and 105/289, max 330); every other
// tier is under 10 ms at p95. What ends the search at p95 is MAX_ATTEMPTS, not
// this clock — the budget only starts binding on a device around 4x slower,
// where it holds the block to ~800 ms.
const GENERATION_BUDGET_MS = 800;

// The clue target is a goal; the band is a requirement. Boards that hit both
// the Master target (22 clues) and the band are much rarer than boards one clue
// short, and chasing the last clue dominates the median — though not the tail.
// Re-measured against the graded bands, 200 runs each: dropping the slack to 0
// takes Master from p50 105 ms to p50 252 ms while p95 barely moves (289 vs
// 282 ms, both ended by MAX_ATTEMPTS rather than the clock). What the slack
// costs is tightness, not the band: 22-clue boards fall from 39% to 14%. Master
// still lands at 22-23 against Expert's 25-26, so the ladder keeps its gap.
// Raising it to 2 pushes Master to 24 and crowds Expert.
const GIVENS_SLACK = 1;

// Tries allowed to the "just give me something solvable" fallback in pickBest.
const FALLBACK_ATTEMPTS = 8;
const MAX_ATTEMPTS = 400;
// The daily has no wall-clock escape hatch (it must be reproducible), so its
// only budget is this attempt count. It is generous because a date that
// exhausted it would serve a sub-par board to every player, all day.
const DAILY_ATTEMPTS = 12;

// ---------------------------------------------------------------------------
// Difficulty bands
// ---------------------------------------------------------------------------
// Selecting on clue count alone produced a ladder that did not hold up: 58% of
// Hard/Expert/Master boards needed no technique a Beginner lacks, and 13% of
// all boards could not be finished with the supported technique set at all.
// Each tier now also has to land inside a technique band, so the ladder is
// graded by what the player has to *know*, not only by how much is missing.
//
// Bands are indices into TECHNIQUES (see ./rating), which is ordered the way
// the common references rank the techniques for a human solver.
interface Band {
  min: TechniqueRating;
  max: TechniqueRating;
}

export const DIFFICULTY_BANDS: Record<Difficulty, Band> = {
  // The on-ramp: singles only, so a first-time player is never stuck.
  beginner: { min: 0, max: 1 },
  easy: { min: 0, max: 1 },
  // Anything a human can finish. Also covers the daily puzzle.
  medium: { min: 0, max: NEEDS_GUESSING - 1 },
  // Each of the top three demands a strictly deeper technique than the one
  // below, and none of them may need a guess. Master is the expensive one:
  // deep-technique boards are rare at 22 clues, so it costs p50 91 ms / p95
  // 257 ms over 200 runs where Hard costs 1 ms (node; a browser is ~1.5x).
  // That buys a real distinction — 53 of 60 Master boards need a naked triple,
  // where Hard is box-line-dominated. Relaxing Master to `min: 3` would bring
  // it back under ~30 ms, if the wait ever matters more than the ladder.
  hard: { min: 2, max: NEEDS_GUESSING - 1 },
  expert: { min: 3, max: NEEDS_GUESSING - 1 },
  master: { min: 4, max: NEEDS_GUESSING - 1 },
};

function bandFor(difficulty: string): Band {
  return DIFFICULTY_BANDS[difficulty as Difficulty] ?? DIFFICULTY_BANDS.medium;
}

/**
 * How well a candidate fits its tier, most important distinction first:
 * 2 in band, 1 solvable but outside the band, 0 needs guessing. Ranking by this
 * before clue count means a budget-starved generation degrades to "an easier
 * board than asked for", never to "a board that cannot be solved".
 */
function qualityOf(rating: TechniqueRating, band: Band): number {
  if (rating >= NEEDS_GUESSING) return 0;
  if (rating < band.min || rating > band.max) return 1;
  return 2;
}

interface Attempt {
  puzzle: Uint8Array;
  solution: Uint8Array;
  givens: number;
  /** Memoised — rating a board is the expensive half of an attempt. */
  quality: () => number;
}

function makeAttempt(
  puzzle: Uint8Array,
  solution: Uint8Array,
  givens: number,
  band: Band,
): Attempt {
  let cached = -1;
  return {
    puzzle,
    solution,
    givens,
    quality() {
      if (cached < 0) {
        // A dig that removed nothing is not a puzzle. Left to rateBoard a full
        // grid comes back as "naked singles" (there is nothing to deduce), which
        // lands inside the Beginner/Easy band and would beat a real board on
        // quality — so rule it out before the rating is ever consulted.
        cached = givens >= 81 ? 0 : qualityOf(rateBoard(puzzle), band);
      }
      return cached;
    },
  };
}

/** In-band beats out-of-band beats unsolvable; then fewer clues. */
function isBetter(candidate: Attempt, incumbent: Attempt): boolean {
  // Rating dominates the cost of an attempt, and most attempts are hopeless:
  // at the Master target only 1 in 100 digs clears both the clue count and the
  // band. When the incumbent is already in band and the candidate cannot beat
  // it on clues, nothing the rating could say would change the outcome — so
  // never ask. This drops Master from ~98 ratings per puzzle to a handful.
  if (incumbent.quality() === 2 && candidate.givens >= incumbent.givens) return false;
  if (candidate.quality() !== incumbent.quality()) return candidate.quality() > incumbent.quality();
  return candidate.givens < incumbent.givens;
}

/**
 * Digs up to `maxAttempts` puzzles, each from a fresh solved grid and a fresh
 * removal order, and keeps the one with the fewest givens.
 *
 * The first attempt deliberately ignores `deadline`: the budget exists to bound
 * *retries*, which is where the old generator's multi-second tail lived. A
 * clock that could cut the first attempt short would let a board with nothing
 * removed through as a "puzzle" — much worse than a few extra milliseconds.
 * Pass `deadline = 0` to drop the clock entirely (the daily puzzle must be
 * reproducible on every device, so timing can never influence it).
 */
function pickBest(
  rand: Rng,
  target: number,
  maxAttempts: number,
  deadline: number,
  band: Band,
): Attempt {
  // `solution` is snapshotted before digging while `puzzle` is snapshotted after,
  // both from the same shared `grid`. A nested generation between those two
  // reads would hand back a puzzle belonging to a different board — silently,
  // since both halves are individually well-formed. Nothing here yields (no
  // await, no callback into caller code) so that cannot happen today; the guard
  // is here so a future change that breaks the assumption fails loudly instead
  // of shipping unsolvable puzzles.
  if (generating) {
    throw new Error('sudoku generator is not reentrant');
  }
  generating = true;

  const attemptOnce = (attemptDeadline: number, digTarget = target): Attempt => {
    const solution = newSolution(rand);
    const givens = dig(digTarget, shuffledOrder(rand), attemptDeadline);
    return makeAttempt(grid.slice(), solution, givens, band);
  };

  const satisfied = (a: Attempt) => a.givens <= target + GIVENS_SLACK && a.quality() === 2;

  try {
    // The first attempt ignores the clock (see the doc comment above).
    let best = attemptOnce(0);

    for (let attempt = 1; attempt < maxAttempts && !satisfied(best); attempt++) {
      // While nothing usable has been found, the clock neither ends the search
      // nor curtails the dig. Both halves matter: handing the player a board no
      // amount of logic will finish is worse than making them wait (without the
      // first half, 7 of 20 Master boards went out needing a guess), and a dig
      // the deadline cut short leaves most clues in place, which then rates as
      // trivially solvable and beats a real-but-unsolvable candidate on quality
      // (without the second half, 5 of 20 came back as fully solved grids).
      const unusable = best.quality() === 0;
      if (deadline !== 0 && !unusable && now() >= deadline) break;
      const candidate = attemptOnce(unusable ? 0 : deadline);
      if (isBetter(candidate, best)) best = candidate;
    }

    // Last resort. The loop above is bounded by maxAttempts, so "keep digging
    // until something is solvable" is a strong tendency, not a guarantee — with
    // the RNG pinned to a constant an adversary can walk it to the cap. Back off
    // to a clue count where being solvable is near-certain: an easier board than
    // the tier promises is a disappointment, an unsolvable one is a bug report.
    for (let i = 0; i < FALLBACK_ATTEMPTS && best.quality() === 0; i++) {
      const relaxed = attemptOnce(0, Math.max(target, targetGivensFor('medium')));
      if (relaxed.quality() > 0) best = relaxed;
    }

    return best;
  } finally {
    generating = false;
  }
}

export function generatePuzzle(difficulty: string): { puzzle: Board; solution: Board } {
  const best = pickBest(
    Math.random,
    targetGivensFor(difficulty),
    MAX_ATTEMPTS,
    now() + GENERATION_BUDGET_MS,
    bandFor(difficulty),
  );
  return { puzzle: toBoard(best.puzzle), solution: toBoard(best.solution) };
}

export function generateDailyPuzzle(dateString: string): { puzzle: Board; solution: Board } {
  const seed = dateString.split('-').reduce((acc, val) => acc * 100 + parseInt(val), 0);

  let state = seed;
  function seededRandom(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Everyone playing the same date must get the same board, so this path is
  // driven purely by the seeded RNG: a fixed attempt count and no wall-clock
  // deadline. The daily sits at the medium target, which a single pass reaches
  // essentially always, so the extra attempts are cheap insurance.
  const best = pickBest(
    seededRandom,
    targetGivensFor('medium'),
    DAILY_ATTEMPTS,
    0,
    bandFor('medium'),
  );
  return { puzzle: toBoard(best.puzzle), solution: toBoard(best.solution) };
}

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

export function isValid(board: Board, row: number, col: number, num: number): boolean {
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
