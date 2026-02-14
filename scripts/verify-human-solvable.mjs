/**
 * Human-solvability verification for ALL difficulties.
 * Tests if puzzles can be solved using HUMAN logical techniques:
 *   Level 1: Naked Singles (cell has only 1 candidate)
 *   Level 2: Hidden Singles (number has only 1 place in row/col/box)
 *   Level 3: Naked Pairs/Triples
 *   Level 4: Hidden Pairs/Triples
 *   Level 5: Pointing Pairs / Box-Line Reduction
 *   Level 6: X-Wing
 *   Fallback: Single hint (simulate game hint) then retry techniques
 *
 * If a puzzle can't be solved with these techniques + up to 3 hints,
 * it's considered NOT practically human-solvable.
 */

// --- Sudoku core ---
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
  for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
  for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c] === num) return false;
  return true;
}

function generateSolvedBoard() {
  const board = createEmptyBoard();
  function fill(pos) {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9), c = pos % 9;
    for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
      if (isValid(board, r, c, n)) {
        board[r][c] = n;
        if (fill(pos + 1)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }
  fill(0);
  return board;
}

function countSolutions(board, limit = 2) {
  let count = 0;
  const b = board.map(r => [...r]);
  function solve(pos) {
    if (count >= limit) return;
    if (pos === 81) { count++; return; }
    const r = Math.floor(pos / 9), c = pos % 9;
    if (b[r][c] !== 0) { solve(pos + 1); return; }
    for (let n = 1; n <= 9; n++) {
      if (count >= limit) return;
      if (isValid(b, r, c, n)) { b[r][c] = n; solve(pos + 1); b[r][c] = 0; }
    }
  }
  solve(0);
  return count;
}

const DIFFICULTY_REMOVALS = { beginner: 20, easy: 35, medium: 45, hard: 52, expert: 56, master: 60 };

function generatePuzzle(difficulty) {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(r => [...r]);
  const removals = DIFFICULTY_REMOVALS[difficulty] || 45;
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 })));
  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= removals) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (countSolutions(puzzle) === 1) removed++;
    else puzzle[row][col] = backup;
  }
  return { puzzle, solution, removed };
}

// --- Candidate computation ---
function computeCandidates(board) {
  const cands = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set())
  );
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      for (let n = 1; n <= 9; n++) {
        if (isValid(board, r, c, n)) cands[r][c].add(n);
      }
    }
  }
  return cands;
}

function getBoxCells(boxRow, boxCol) {
  const cells = [];
  for (let r = boxRow; r < boxRow + 3; r++)
    for (let c = boxCol; c < boxCol + 3; c++)
      cells.push([r, c]);
  return cells;
}

// --- Human techniques ---

function nakedSingles(board, cands) {
  let placed = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0 && cands[r][c].size === 1) {
        const val = [...cands[r][c]][0];
        board[r][c] = val;
        cands[r][c].clear();
        // Remove from peers
        for (let i = 0; i < 9; i++) { cands[r][i].delete(val); cands[i][c].delete(val); }
        const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
        for (let rr = br; rr < br+3; rr++)
          for (let cc = bc; cc < bc+3; cc++)
            cands[rr][cc].delete(val);
        placed++;
      }
    }
  }
  return placed;
}

function hiddenSingles(board, cands) {
  let placed = 0;

  // Check rows
  for (let r = 0; r < 9; r++) {
    for (let n = 1; n <= 9; n++) {
      const positions = [];
      for (let c = 0; c < 9; c++) {
        if (cands[r][c].has(n)) positions.push(c);
      }
      if (positions.length === 1) {
        const c = positions[0];
        board[r][c] = n;
        cands[r][c].clear();
        for (let i = 0; i < 9; i++) { cands[r][i].delete(n); cands[i][c].delete(n); }
        const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
        for (let rr = br; rr < br+3; rr++)
          for (let cc = bc; cc < bc+3; cc++)
            cands[rr][cc].delete(n);
        placed++;
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    for (let n = 1; n <= 9; n++) {
      const positions = [];
      for (let r = 0; r < 9; r++) {
        if (cands[r][c].has(n)) positions.push(r);
      }
      if (positions.length === 1) {
        const r = positions[0];
        if (board[r][c] !== 0) continue;
        board[r][c] = n;
        cands[r][c].clear();
        for (let i = 0; i < 9; i++) { cands[r][i].delete(n); cands[i][c].delete(n); }
        const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
        for (let rr = br; rr < br+3; rr++)
          for (let cc = bc; cc < bc+3; cc++)
            cands[rr][cc].delete(n);
        placed++;
      }
    }
  }

  // Check boxes
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      for (let n = 1; n <= 9; n++) {
        const positions = [];
        for (let r = br; r < br+3; r++)
          for (let c = bc; c < bc+3; c++)
            if (cands[r][c].has(n)) positions.push([r, c]);
        if (positions.length === 1) {
          const [r, c] = positions[0];
          if (board[r][c] !== 0) continue;
          board[r][c] = n;
          cands[r][c].clear();
          for (let i = 0; i < 9; i++) { cands[r][i].delete(n); cands[i][c].delete(n); }
          for (let rr = br; rr < br+3; rr++)
            for (let cc = bc; cc < bc+3; cc++)
              cands[rr][cc].delete(n);
          placed++;
        }
      }
    }
  }

  return placed;
}

function nakedPairs(board, cands) {
  let eliminations = 0;

  function processGroup(cells) {
    // Find cells with exactly 2 candidates
    const pairs = cells.filter(([r, c]) => board[r][c] === 0 && cands[r][c].size === 2);
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        const [r1, c1] = pairs[i], [r2, c2] = pairs[j];
        const s1 = [...cands[r1][c1]], s2 = [...cands[r2][c2]];
        if (s1.length === 2 && s2.length === 2 && s1[0] === s2[0] && s1[1] === s2[1]) {
          // Found naked pair - eliminate from other cells in group
          for (const [r, c] of cells) {
            if ((r === r1 && c === c1) || (r === r2 && c === c2)) continue;
            if (board[r][c] !== 0) continue;
            for (const n of s1) {
              if (cands[r][c].delete(n)) eliminations++;
            }
          }
        }
      }
    }
  }

  // Rows
  for (let r = 0; r < 9; r++) {
    processGroup(Array.from({ length: 9 }, (_, c) => [r, c]));
  }
  // Columns
  for (let c = 0; c < 9; c++) {
    processGroup(Array.from({ length: 9 }, (_, r) => [r, c]));
  }
  // Boxes
  for (let br = 0; br < 9; br += 3)
    for (let bc = 0; bc < 9; bc += 3)
      processGroup(getBoxCells(br, bc));

  return eliminations;
}

function nakedTriples(board, cands) {
  let eliminations = 0;

  function processGroup(cells) {
    const candidates = cells.filter(([r, c]) => board[r][c] === 0 && cands[r][c].size >= 2 && cands[r][c].size <= 3);
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        for (let k = j + 1; k < candidates.length; k++) {
          const union = new Set([
            ...cands[candidates[i][0]][candidates[i][1]],
            ...cands[candidates[j][0]][candidates[j][1]],
            ...cands[candidates[k][0]][candidates[k][1]],
          ]);
          if (union.size === 3) {
            for (const [r, c] of cells) {
              if ([i, j, k].some(idx => candidates[idx][0] === r && candidates[idx][1] === c)) continue;
              if (board[r][c] !== 0) continue;
              for (const n of union) {
                if (cands[r][c].delete(n)) eliminations++;
              }
            }
          }
        }
      }
    }
  }

  for (let r = 0; r < 9; r++) processGroup(Array.from({ length: 9 }, (_, c) => [r, c]));
  for (let c = 0; c < 9; c++) processGroup(Array.from({ length: 9 }, (_, r) => [r, c]));
  for (let br = 0; br < 9; br += 3)
    for (let bc = 0; bc < 9; bc += 3)
      processGroup(getBoxCells(br, bc));

  return eliminations;
}

function pointingPairs(board, cands) {
  let eliminations = 0;

  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      for (let n = 1; n <= 9; n++) {
        const positions = [];
        for (let r = br; r < br+3; r++)
          for (let c = bc; c < bc+3; c++)
            if (cands[r][c].has(n)) positions.push([r, c]);

        if (positions.length < 2 || positions.length > 3) continue;

        // All in same row?
        const rows = new Set(positions.map(p => p[0]));
        if (rows.size === 1) {
          const row = [...rows][0];
          for (let c = 0; c < 9; c++) {
            if (c >= bc && c < bc + 3) continue;
            if (cands[row][c].delete(n)) eliminations++;
          }
        }

        // All in same column?
        const cols = new Set(positions.map(p => p[1]));
        if (cols.size === 1) {
          const col = [...cols][0];
          for (let r = 0; r < 9; r++) {
            if (r >= br && r < br + 3) continue;
            if (cands[r][col].delete(n)) eliminations++;
          }
        }
      }
    }
  }

  // Box-Line Reduction (reverse direction)
  // If a number in a row is confined to one box, eliminate from rest of box
  for (let r = 0; r < 9; r++) {
    for (let n = 1; n <= 9; n++) {
      const cols = [];
      for (let c = 0; c < 9; c++) {
        if (cands[r][c].has(n)) cols.push(c);
      }
      if (cols.length < 2 || cols.length > 3) continue;
      const boxes = new Set(cols.map(c => Math.floor(c / 3)));
      if (boxes.size === 1) {
        const bc = [...boxes][0] * 3;
        const br = Math.floor(r / 3) * 3;
        for (let rr = br; rr < br + 3; rr++) {
          if (rr === r) continue;
          for (let cc = bc; cc < bc + 3; cc++) {
            if (cands[rr][cc].delete(n)) eliminations++;
          }
        }
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    for (let n = 1; n <= 9; n++) {
      const rows = [];
      for (let r = 0; r < 9; r++) {
        if (cands[r][c].has(n)) rows.push(r);
      }
      if (rows.length < 2 || rows.length > 3) continue;
      const boxes = new Set(rows.map(r => Math.floor(r / 3)));
      if (boxes.size === 1) {
        const br = [...boxes][0] * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let cc = bc; cc < bc + 3; cc++) {
          if (cc === c) continue;
          for (let rr = br; rr < br + 3; rr++) {
            if (cands[rr][cc].delete(n)) eliminations++;
          }
        }
      }
    }
  }

  return eliminations;
}

function xWing(board, cands) {
  let eliminations = 0;

  // X-Wing on rows
  for (let n = 1; n <= 9; n++) {
    const rowPositions = [];
    for (let r = 0; r < 9; r++) {
      const cols = [];
      for (let c = 0; c < 9; c++) {
        if (cands[r][c].has(n)) cols.push(c);
      }
      if (cols.length === 2) rowPositions.push({ row: r, cols });
    }

    for (let i = 0; i < rowPositions.length; i++) {
      for (let j = i + 1; j < rowPositions.length; j++) {
        if (rowPositions[i].cols[0] === rowPositions[j].cols[0] &&
            rowPositions[i].cols[1] === rowPositions[j].cols[1]) {
          const [c1, c2] = rowPositions[i].cols;
          for (let r = 0; r < 9; r++) {
            if (r === rowPositions[i].row || r === rowPositions[j].row) continue;
            if (cands[r][c1].delete(n)) eliminations++;
            if (cands[r][c2].delete(n)) eliminations++;
          }
        }
      }
    }
  }

  // X-Wing on columns
  for (let n = 1; n <= 9; n++) {
    const colPositions = [];
    for (let c = 0; c < 9; c++) {
      const rows = [];
      for (let r = 0; r < 9; r++) {
        if (cands[r][c].has(n)) rows.push(r);
      }
      if (rows.length === 2) colPositions.push({ col: c, rows });
    }

    for (let i = 0; i < colPositions.length; i++) {
      for (let j = i + 1; j < colPositions.length; j++) {
        if (colPositions[i].rows[0] === colPositions[j].rows[0] &&
            colPositions[i].rows[1] === colPositions[j].rows[1]) {
          const [r1, r2] = colPositions[i].rows;
          for (let c = 0; c < 9; c++) {
            if (c === colPositions[i].col || c === colPositions[j].col) continue;
            if (cands[r1][c].delete(n)) eliminations++;
            if (cands[r2][c].delete(n)) eliminations++;
          }
        }
      }
    }
  }

  return eliminations;
}

// --- Human solver ---

function solveWithHumanTechniques(board, solution, maxHints = 3) {
  const b = board.map(r => [...r]);
  let cands = computeCandidates(b);
  let hintsUsed = 0;
  const techniquesUsed = new Set();
  let totalPlaced = 0;
  const emptyCells = board.flat().filter(v => v === 0).length;

  let stuck = false;
  let iterations = 0;
  const MAX_ITERATIONS = 500;

  while (iterations++ < MAX_ITERATIONS) {
    let progress = false;

    // Level 1: Naked Singles
    let p = nakedSingles(b, cands);
    if (p > 0) { techniquesUsed.add('Naked Singles'); totalPlaced += p; progress = true; continue; }

    // Level 2: Hidden Singles
    p = hiddenSingles(b, cands);
    if (p > 0) { techniquesUsed.add('Hidden Singles'); totalPlaced += p; progress = true; continue; }

    // Level 3: Naked Pairs
    let e = nakedPairs(b, cands);
    if (e > 0) { techniquesUsed.add('Naked Pairs'); progress = true; continue; }

    // Level 3b: Naked Triples
    e = nakedTriples(b, cands);
    if (e > 0) { techniquesUsed.add('Naked Triples'); progress = true; continue; }

    // Level 4: Pointing Pairs / Box-Line Reduction
    e = pointingPairs(b, cands);
    if (e > 0) { techniquesUsed.add('Pointing/Box-Line'); progress = true; continue; }

    // Level 5: X-Wing
    e = xWing(b, cands);
    if (e > 0) { techniquesUsed.add('X-Wing'); progress = true; continue; }

    // No progress with logic - try hint
    if (!progress) {
      if (hintsUsed < maxHints) {
        // Find cell with fewest candidates (same as game hint)
        let bestCell = null;
        let minCands = 10;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (b[r][c] === 0 && cands[r][c].size > 0 && cands[r][c].size < minCands) {
              minCands = cands[r][c].size;
              bestCell = [r, c];
            }
          }
        }
        if (bestCell) {
          const [hr, hc] = bestCell;
          const val = solution[hr][hc];
          b[hr][hc] = val;
          cands[hr][hc].clear();
          // Remove from peers
          for (let i = 0; i < 9; i++) { cands[hr][i].delete(val); cands[i][hc].delete(val); }
          const br2 = Math.floor(hr/3)*3, bc2 = Math.floor(hc/3)*3;
          for (let rr = br2; rr < br2+3; rr++)
            for (let cc = bc2; cc < bc2+3; cc++)
              cands[rr][cc].delete(val);
          hintsUsed++;
          totalPlaced++;
          techniquesUsed.add(`Hint (${hintsUsed})`);
          continue;
        }
      }
      stuck = true;
      break;
    }
  }

  // Check if solved
  const remaining = b.flat().filter(v => v === 0).length;
  const solved = remaining === 0;

  // Verify correctness
  let correct = true;
  if (solved) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (b[r][c] !== solution[r][c]) correct = false;
  }

  return {
    solved,
    correct: solved && correct,
    remaining,
    emptyCells,
    placed: totalPlaced,
    hintsUsed,
    techniquesUsed: [...techniquesUsed],
    stuck,
  };
}

// --- Main ---

const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];
const TESTS_PER_DIFFICULTY = 5;

console.log('=== Human-Solvability Verification ===');
console.log(`Testing ${TESTS_PER_DIFFICULTY} puzzles x ${difficulties.length} difficulties`);
console.log(`Techniques: Naked/Hidden Singles, Naked Pairs/Triples, Pointing Pairs, Box-Line, X-Wing`);
console.log(`Fallback: Up to 3 game hints (reveals cell with fewest candidates)\n`);

let totalTests = 0;
let totalSolved = 0;
let totalSolvedNoHints = 0;

for (const difficulty of difficulties) {
  console.log(`\n--- ${difficulty.toUpperCase()} (${DIFFICULTY_REMOVALS[difficulty]} removals) ---`);

  let diffSolved = 0;
  let diffNoHints = 0;

  for (let i = 0; i < TESTS_PER_DIFFICULTY; i++) {
    totalTests++;
    const start = Date.now();
    const { puzzle, solution } = generatePuzzle(difficulty);
    const genTime = Date.now() - start;

    const solveStart = Date.now();
    const result = solveWithHumanTechniques(puzzle, solution, 3);
    const solveTime = Date.now() - solveStart;

    const icon = result.solved && result.correct ? 'PASS' : 'FAIL';
    if (result.solved && result.correct) {
      totalSolved++;
      diffSolved++;
      if (result.hintsUsed === 0) { totalSolvedNoHints++; diffNoHints++; }
    }

    const hintsInfo = result.hintsUsed > 0 ? ` (hints: ${result.hintsUsed}/3)` : ' (no hints needed)';
    console.log(`  [${icon}] #${i+1}: ${result.placed}/${result.emptyCells} cells${hintsInfo} | ${solveTime}ms`);
    console.log(`         Techniques: ${result.techniquesUsed.join(', ')}`);
    if (!result.solved) {
      console.log(`         STUCK: ${result.remaining} cells remaining`);
    }
  }

  console.log(`  => ${difficulty}: ${diffSolved}/${TESTS_PER_DIFFICULTY} solved (${diffNoHints} without hints)`);
}

console.log('\n=== FINAL SUMMARY ===');
console.log(`Total: ${totalSolved}/${totalTests} puzzles human-solvable`);
console.log(`Without hints: ${totalSolvedNoHints}/${totalTests}`);
console.log(`With up to 3 hints: ${totalSolved}/${totalTests}`);

if (totalSolved < totalTests) {
  console.log(`\nWARNING: ${totalTests - totalSolved} puzzle(s) may require advanced techniques beyond X-Wing or trial-and-error.`);
  process.exit(1);
} else {
  console.log('\nAll puzzles are human-solvable!');
  process.exit(0);
}
