'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import { generatePuzzle } from '@/lib/sudoku/generator';
import { DIFFICULTY_CONFIGS } from '@/lib/utils/constants';
import type { Difficulty } from '@/types';
import type { Board } from '@/lib/sudoku/types';

const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];
const PUZZLE_COUNTS = [1, 2, 4, 6] as const;
type PuzzleCount = (typeof PUZZLE_COUNTS)[number];

interface GeneratedPuzzle {
  puzzle: Board;
  solution: Board;
}

export default function PrintPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzleCount, setPuzzleCount] = useState<PuzzleCount>(1);
  const [puzzles, setPuzzles] = useState<GeneratedPuzzle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generatedRef = useRef(false);

  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const newPuzzles: GeneratedPuzzle[] = [];
      for (let i = 0; i < puzzleCount; i++) {
        newPuzzles.push(generatePuzzle(difficulty));
      }
      setPuzzles(newPuzzles);
      generatedRef.current = true;
      setIsGenerating(false);
    }, 50);
  }, [difficulty, puzzleCount]);

  const handlePrint = useCallback(() => {
    if (puzzles.length === 0) {
      // Generate first, then print
      setIsGenerating(true);
      setTimeout(() => {
        const newPuzzles: GeneratedPuzzle[] = [];
        for (let i = 0; i < puzzleCount; i++) {
          newPuzzles.push(generatePuzzle(difficulty));
        }
        setPuzzles(newPuzzles);
        generatedRef.current = true;
        setIsGenerating(false);
        setTimeout(() => window.print(), 100);
      }, 50);
    } else {
      window.print();
    }
  }, [puzzles, puzzleCount, difficulty]);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const gridSizeClass =
    puzzleCount === 1
      ? 'print-grid-large'
      : puzzleCount === 2
        ? 'print-grid-half'
        : 'print-grid-quarter';

  return (
    <>
      <style>{`
        /* Print-specific grid styles */
        .sudoku-print-grid {
          border-collapse: collapse;
        }
        .sudoku-print-grid td {
          width: 40px;
          height: 40px;
          text-align: center;
          vertical-align: middle;
          font-size: 20px;
          font-weight: bold;
          color: #000;
          border: 1px solid #999;
        }
        .sudoku-print-grid .box-right {
          border-right: 2px solid #000;
        }
        .sudoku-print-grid .box-bottom {
          border-bottom: 2px solid #000;
        }
        .sudoku-print-grid .box-left {
          border-left: 2px solid #000;
        }
        .sudoku-print-grid .box-top {
          border-top: 2px solid #000;
        }

        /* Preview styles (on-screen) */
        .preview-grid {
          border-collapse: collapse;
          margin: 0 auto;
        }
        .preview-grid td {
          width: 32px;
          height: 32px;
          text-align: center;
          vertical-align: middle;
          font-size: 14px;
          font-weight: bold;
          color: #e2e8f0;
          border: 1px solid #334155;
        }
        .preview-grid .box-right {
          border-right: 2px solid #94a3b8;
        }
        .preview-grid .box-bottom {
          border-bottom: 2px solid #94a3b8;
        }
        .preview-grid .box-left {
          border-left: 2px solid #94a3b8;
        }
        .preview-grid .box-top {
          border-top: 2px solid #94a3b8;
        }

        /* Print media styles */
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
          }
          .print-puzzle-wrapper {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .print-grid-large .print-puzzle-wrapper {
            page-break-after: always;
            break-after: page;
          }
          .print-grid-large .print-puzzle-wrapper:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          .print-grid-large .sudoku-print-grid td {
            width: 52px;
            height: 52px;
            font-size: 28px;
          }
          .print-grid-half {
            display: flex;
            flex-direction: column;
            gap: 40px;
          }
          .print-grid-half .sudoku-print-grid td {
            width: 44px;
            height: 44px;
            font-size: 22px;
          }
          .print-grid-quarter {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .print-grid-quarter .sudoku-print-grid td {
            width: 30px;
            height: 30px;
            font-size: 16px;
          }
          .print-grid-six {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .print-grid-six .sudoku-print-grid td {
            width: 26px;
            height: 26px;
            font-size: 14px;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* On-screen UI */}
      <div className="no-print min-h-screen bg-slate-900 pb-12">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/90 backdrop-blur-lg">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로가기</span>
            </Link>
            <h1 className="text-lg font-bold text-white">퍼즐 인쇄</h1>
            <div className="w-16" />
          </div>
        </div>

        <main className="mx-auto max-w-3xl space-y-8 px-4 pt-6">
          {/* Difficulty selector */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
              난이도 선택
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {DIFFICULTIES.map((d) => {
                const config = DIFFICULTY_CONFIGS[d];
                const isSelected = d === difficulty;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficulty(d);
                      setPuzzles([]);
                    }}
                    className={`
                      rounded-xl px-3 py-3 text-center transition-all duration-200 border-2
                      ${
                        isSelected
                          ? 'border-current bg-white/10 scale-105'
                          : 'border-transparent bg-white/5 hover:bg-white/10'
                      }
                    `}
                    style={{ color: isSelected ? config.color : '#94a3b8' }}
                  >
                    <span className="block text-lg">{config.icon}</span>
                    <span className="block mt-1 text-xs font-bold">{config.nameKo}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Puzzle count selector */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
              퍼즐 수
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {PUZZLE_COUNTS.map((count) => {
                const isSelected = count === puzzleCount;
                const label =
                  count === 1
                    ? '1개 (크게)'
                    : count === 2
                      ? '2개'
                      : count === 4
                        ? '4개'
                        : '6개';
                return (
                  <button
                    key={count}
                    onClick={() => {
                      setPuzzleCount(count);
                      setPuzzles([]);
                    }}
                    className={`
                      rounded-xl px-3 py-3 text-center transition-all duration-200 border-2
                      ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-transparent bg-white/5 text-slate-400 hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="block text-lg font-bold">{count}</span>
                    <span className="block mt-1 text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? '생성 중...' : '미리보기'}
            </button>
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
            >
              <Printer className="h-5 w-5" />
              인쇄하기
            </button>
          </div>

          {/* Preview */}
          {puzzles.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                미리보기
              </h2>
              <div
                className={`
                ${
                  puzzleCount <= 2
                    ? 'space-y-6'
                    : 'grid grid-cols-2 gap-4'
                }
              `}
              >
                {puzzles.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-800/50 border border-white/5 p-4"
                  >
                    <p className="mb-2 text-center text-sm font-semibold text-slate-300">
                      칸채움 스도쿠 - {difficultyConfig.nameKo}
                    </p>
                    <SudokuGrid board={p.puzzle} variant="preview" />
                    <p className="mt-2 text-center text-xs text-slate-500">{today}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Info text */}
          <p className="text-center text-xs text-slate-500 pb-4">
            인쇄 시 깨끗한 흑백 스도쿠 그리드만 출력됩니다.
          </p>
        </main>
      </div>

      {/* Print area - only visible when printing */}
      <div
        className="print-area"
        style={{ display: 'none' }}
      >
        <div className={puzzleCount === 6 ? 'print-grid-six' : gridSizeClass}>
          {puzzles.map((p, idx) => (
            <div key={idx} className="print-puzzle-wrapper" style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: puzzleCount >= 4 ? '14px' : '18px',
                  fontWeight: 'bold',
                  marginBottom: puzzleCount >= 4 ? '6px' : '12px',
                  color: '#000',
                }}
              >
                칸채움 스도쿠 - {difficultyConfig.nameKo}
              </p>
              <SudokuGrid board={p.puzzle} variant="print" />
              <p
                style={{
                  fontSize: puzzleCount >= 4 ? '10px' : '12px',
                  color: '#666',
                  marginTop: puzzleCount >= 4 ? '4px' : '8px',
                }}
              >
                {today}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SudokuGrid({ board, variant }: { board: Board; variant: 'preview' | 'print' }) {
  const tableClass = variant === 'print' ? 'sudoku-print-grid' : 'preview-grid';

  return (
    <table className={tableClass} style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
      <tbody>
        {board.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => {
              const classes: string[] = [];
              if (c % 3 === 0) classes.push('box-left');
              if (c === 8) classes.push('box-right');
              if (c % 3 === 2 && c !== 8) classes.push('box-right');
              if (r % 3 === 0) classes.push('box-top');
              if (r === 8) classes.push('box-bottom');
              if (r % 3 === 2 && r !== 8) classes.push('box-bottom');

              return (
                <td key={c} className={classes.join(' ')}>
                  {cell !== 0 ? cell : ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
