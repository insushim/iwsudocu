/**
 * Cross-parallel verification: generate puzzles for ALL difficulties
 * and verify they are solvable with unique solutions.
 */

// --- Sudoku Logic (copied from generator.ts for standalone execution) ---

function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValid(board, row, col, num) {
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

function generateSolvedBoard() {
  const board = createEmptyBoard();
  function fillBoard(pos) {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of numbers) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (fillBoard(pos + 1)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }
  fillBoard(0);
  return board;
}

function countSolutions(board, limit = 2) {
  let count = 0;
  const b = board.map(row => [...row]);
  function solve(pos) {
    if (count >= limit) return;
    if (pos === 81) { count++; return; }
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    if (b[row][col] !== 0) { solve(pos + 1); return; }
    for (let num = 1; num <= 9; num++) {
      if (count >= limit) return;
      if (isValid(b, row, col, num)) {
        b[row][col] = num;
        solve(pos + 1);
        b[row][col] = 0;
      }
    }
  }
  solve(0);
  return count;
}

function solve(board) {
  const b = board.map(row => [...row]);
  function backtrack(pos) {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    if (b[row][col] !== 0) return backtrack(pos + 1);
    for (let num = 1; num <= 9; num++) {
      if (isValid(b, row, col, num)) {
        b[row][col] = num;
        if (backtrack(pos + 1)) return true;
        b[row][col] = 0;
      }
    }
    return false;
  }
  return backtrack(0) ? b : null;
}

const DIFFICULTY_REMOVALS = {
  beginner: 20,
  easy: 35,
  medium: 45,
  hard: 52,
  expert: 56,
  master: 60,
};

function generatePuzzle(difficulty) {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]);
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
  return { puzzle, solution, removed };
}

// --- Validation helpers ---

function validateSolution(board) {
  // Check all rows
  for (let r = 0; r < 9; r++) {
    const seen = new Set();
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v < 1 || v > 9 || seen.has(v)) return { valid: false, reason: `Row ${r} invalid` };
      seen.add(v);
    }
  }
  // Check all columns
  for (let c = 0; c < 9; c++) {
    const seen = new Set();
    for (let r = 0; r < 9; r++) {
      const v = board[r][c];
      if (seen.has(v)) return { valid: false, reason: `Column ${c} invalid` };
      seen.add(v);
    }
  }
  // Check all 3x3 boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Set();
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          const v = board[r][c];
          if (seen.has(v)) return { valid: false, reason: `Box ${br},${bc} invalid` };
          seen.add(v);
        }
      }
    }
  }
  return { valid: true };
}

function solutionMatchesPuzzle(puzzle, solution) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] !== 0 && puzzle[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

// --- Main verification ---

const TESTS_PER_DIFFICULTY = 3;
const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];

console.log('=== Sudoku Puzzle Solvability Verification ===\n');
console.log(`Testing ${TESTS_PER_DIFFICULTY} puzzles per difficulty level\n`);

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const difficulty of difficulties) {
  console.log(`--- ${difficulty.toUpperCase()} (target removals: ${DIFFICULTY_REMOVALS[difficulty]}) ---`);

  for (let i = 0; i < TESTS_PER_DIFFICULTY; i++) {
    totalTests++;
    const start = Date.now();
    const { puzzle, solution, removed } = generatePuzzle(difficulty);
    const genTime = Date.now() - start;

    const givens = 81 - removed;
    const checks = [];

    // 1. Validate solution is a valid sudoku
    const solCheck = validateSolution(solution);
    checks.push({ name: 'Solution valid', pass: solCheck.valid, detail: solCheck.reason });

    // 2. Puzzle givens match solution
    const matchCheck = solutionMatchesPuzzle(puzzle, solution);
    checks.push({ name: 'Givens match solution', pass: matchCheck });

    // 3. Puzzle has exactly 1 solution (unique)
    const solCount = countSolutions(puzzle, 2);
    checks.push({ name: 'Unique solution', pass: solCount === 1, detail: `found ${solCount}` });

    // 4. Independent solver can find the solution
    const solveStart = Date.now();
    const solved = solve(puzzle);
    const solveTime = Date.now() - solveStart;
    const solverMatch = solved && solved.every((row, r) => row.every((v, c) => v === solution[r][c]));
    checks.push({ name: 'Solver finds correct solution', pass: solverMatch });

    // 5. Correct number of removals
    checks.push({ name: `Removals achieved: ${removed}/${DIFFICULTY_REMOVALS[difficulty]}`, pass: removed >= DIFFICULTY_REMOVALS[difficulty] * 0.8 });

    const allPass = checks.every(c => c.pass);
    if (allPass) totalPassed++; else totalFailed++;

    const icon = allPass ? 'PASS' : 'FAIL';
    console.log(`  [${icon}] Puzzle ${i + 1}: ${givens} givens, gen ${genTime}ms, solve ${solveTime}ms`);
    for (const c of checks) {
      const ci = c.pass ? 'OK' : 'FAIL';
      console.log(`    [${ci}] ${c.name}${c.detail && !c.pass ? ` (${c.detail})` : ''}`);
    }
  }
  console.log('');
}

console.log('=== Summary ===');
console.log(`Total: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalFailed}`);

if (totalFailed > 0) {
  console.log('\nWARNING: Some puzzles failed verification!');
  process.exit(1);
} else {
  console.log('\nAll puzzles are valid and solvable!');
  process.exit(0);
}
