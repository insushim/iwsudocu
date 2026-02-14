'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Lightbulb,
  Target,
  Zap,
  Trophy,
  HelpCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/* Mini Sudoku board for visual examples                               */
/* ------------------------------------------------------------------ */

function MiniBoard({
  cells,
  highlight,
  notes,
}: {
  cells: (number | null)[][];
  highlight?: [number, number][];
  notes?: { row: number; col: number; values: number[] }[];
}) {
  const highlightSet = new Set(
    (highlight ?? []).map(([r, c]) => `${r}-${c}`),
  );
  const noteMap = new Map<string, number[]>();
  for (const n of notes ?? []) {
    noteMap.set(`${n.row}-${n.col}`, n.values);
  }

  return (
    <div className="inline-grid grid-cols-4 border-2 border-indigo-400/60 rounded-lg overflow-hidden w-fit">
      {cells.flatMap((row, r) =>
        row.map((val, c) => {
          const isHL = highlightSet.has(`${r}-${c}`);
          const cellNotes = noteMap.get(`${r}-${c}`);
          return (
            <div
              key={`${r}-${c}`}
              className={cn(
                'w-9 h-9 flex items-center justify-center text-sm font-bold',
                'border-r border-b border-white/10',
                c === 1 && 'border-r-2 border-r-indigo-400/40',
                r === 1 && 'border-b-2 border-b-indigo-400/40',
                isHL
                  ? 'bg-indigo-500/30 text-indigo-300'
                  : val
                    ? 'text-white/80'
                    : 'text-transparent',
              )}
            >
              {cellNotes ? (
                <div className="grid grid-cols-2 gap-0 w-full h-full p-px">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        'flex items-center justify-center text-[8px]',
                        cellNotes.includes(n)
                          ? 'text-blue-400'
                          : 'text-transparent',
                      )}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                val ?? ''
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section component                                                   */
/* ------------------------------------------------------------------ */

function Section({
  icon: Icon,
  title,
  children,
  color = 'text-indigo-400',
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl bg-white/5',
            color,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        {children}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Control button visual                                               */
/* ------------------------------------------------------------------ */

function ControlButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 py-2 px-3 rounded-xl',
        active
          ? 'bg-blue-500/30 text-blue-400 border border-blue-500/40'
          : 'bg-white/10 text-white/70',
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-medium">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HelpPage() {
  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </Link>
          <h2 className="text-lg font-bold text-white">게임 도움말</h2>
        </div>

        {/* ---- 스도쿠란? ---- */}
        <Section icon={HelpCircle} title="스도쿠란?" color="text-purple-400">
          <p>
            스도쿠는 9x9 칸에 1부터 9까지 숫자를 채우는 논리 퍼즐입니다.
            수학이 아닌 <strong className="text-white">논리적 사고력</strong>만
            있으면 누구나 풀 수 있습니다!
          </p>
        </Section>

        {/* ---- 기본 규칙 ---- */}
        <Section icon={Target} title="기본 규칙 (딱 3가지!)" color="text-green-400">
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-semibold text-white">
                  가로줄에 1~9가 하나씩
                </p>
                <p className="text-slate-400">
                  같은 행에 같은 숫자가 올 수 없습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-semibold text-white">
                  세로줄에 1~9가 하나씩
                </p>
                <p className="text-slate-400">
                  같은 열에 같은 숫자가 올 수 없습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-semibold text-white">
                  3x3 박스에 1~9가 하나씩
                </p>
                <p className="text-slate-400">
                  굵은 선으로 나뉜 각 박스에도 같은 숫자가 올 수 없습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <MiniBoard
              cells={[
                [1, 2, 3, 4],
                [3, 4, 1, 2],
                [2, 1, 4, 3],
                [4, 3, 2, 1],
              ]}
              highlight={[
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
              ]}
            />
          </div>
          <p className="text-center text-xs text-slate-500">
            하이라이트된 행: 1, 2, 3, 4가 하나씩!
          </p>
        </Section>

        {/* ---- 플레이 방법 ---- */}
        <Section icon={Zap} title="플레이 방법" color="text-amber-400">
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                1
              </span>
              <p>
                <strong className="text-white">빈 칸을 터치</strong>하여
                선택합니다. 선택된 칸은 파란색으로 표시됩니다.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                2
              </span>
              <p>
                아래 <strong className="text-white">숫자 패드</strong>에서
                넣고 싶은 숫자를 터치합니다.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                3
              </span>
              <p>
                맞으면 숫자가 채워지고,{' '}
                <strong className="text-red-400">틀리면 실수 +1</strong>!
                실수 3번이면 게임 오버입니다.
              </p>
            </div>
          </div>
        </Section>

        {/* ---- 버튼 설명 ---- */}
        <Section icon={Pencil} title="버튼 설명" color="text-blue-400">
          <div className="space-y-4">
            {/* 메모 */}
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3">
              <div className="flex items-center gap-3 mb-2">
                <ControlButton icon={Pencil} label="메모" active />
                <span className="text-sm font-bold text-blue-400">
                  메모 (가장 중요!)
                </span>
              </div>
              <p>
                확실하지 않을 때 후보 숫자를 작게 적어두는 기능입니다.
              </p>
              <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                <p>
                  1. <strong className="text-white">메모 버튼</strong>을
                  눌러 파란색으로 활성화
                </p>
                <p>
                  2. <strong className="text-white">빈 칸</strong>을 선택
                </p>
                <p>
                  3. 후보 <strong className="text-white">숫자들</strong>을
                  터치하면 작게 표시됨
                </p>
                <p>
                  4. 다시 터치하면 해당 메모가 사라짐
                </p>
                <p>
                  5. 정답을 놓으면 같은 행/열/박스의 메모가 자동 정리됨
                </p>
              </div>
              <div className="flex justify-center mt-3">
                <MiniBoard
                  cells={[
                    [1, null, 3, null],
                    [null, null, null, null],
                    [null, null, null, null],
                    [null, null, null, null],
                  ]}
                  notes={[
                    { row: 0, col: 1, values: [2, 4] },
                    { row: 0, col: 3, values: [2, 4] },
                  ]}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-1">
                &quot;여기 2 또는 4가 올 수 있겠다&quot; → 메모!
              </p>
            </div>

            {/* 되돌리기 */}
            <div className="flex items-start gap-3">
              <ControlButton icon={Undo2} label="되돌리기" />
              <div>
                <p className="font-semibold text-white text-sm">되돌리기</p>
                <p className="text-xs text-slate-400">
                  방금 한 동작을 취소합니다. 실수로 잘못 넣었을 때 사용하세요.
                </p>
              </div>
            </div>

            {/* 다시하기 */}
            <div className="flex items-start gap-3">
              <ControlButton icon={Redo2} label="다시하기" />
              <div>
                <p className="font-semibold text-white text-sm">다시하기</p>
                <p className="text-xs text-slate-400">
                  되돌리기한 동작을 다시 실행합니다.
                </p>
              </div>
            </div>

            {/* 지우기 */}
            <div className="flex items-start gap-3">
              <ControlButton icon={Eraser} label="지우기" />
              <div>
                <p className="font-semibold text-white text-sm">지우기</p>
                <p className="text-xs text-slate-400">
                  선택된 칸의 숫자나 메모를 지웁니다.
                </p>
              </div>
            </div>

            {/* 힌트 */}
            <div className="flex items-start gap-3">
              <ControlButton icon={Lightbulb} label="힌트" />
              <div>
                <p className="font-semibold text-white text-sm">
                  힌트 (3회)
                </p>
                <p className="text-xs text-slate-400">
                  가장 풀기 쉬운 칸에 정답을 자동으로 채워줍니다.
                  게임당 3번까지 사용 가능합니다. 단, 콤보가 초기화됩니다.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ---- 콤보 시스템 ---- */}
        <Section icon={Zap} title="콤보 시스템" color="text-orange-400">
          <p>
            연속으로 정답을 맞추면 <strong className="text-orange-400">콤보</strong>가
            쌓입니다!
          </p>
          <div className="rounded-xl bg-white/5 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>3~4 콤보</span>
              <span className="text-green-400 font-bold">Nice! (1.5x)</span>
            </div>
            <div className="flex justify-between">
              <span>5~9 콤보</span>
              <span className="text-blue-400 font-bold">Great! (2x)</span>
            </div>
            <div className="flex justify-between">
              <span>10~14 콤보</span>
              <span className="text-purple-400 font-bold">Amazing! (2.5x)</span>
            </div>
            <div className="flex justify-between">
              <span>15~19 콤보</span>
              <span className="text-pink-400 font-bold">
                Incredible! (3x)
              </span>
            </div>
            <div className="flex justify-between">
              <span>20+ 콤보</span>
              <span className="text-yellow-400 font-bold">
                UNSTOPPABLE! (4x)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            틀리거나 힌트를 쓰면 콤보가 초기화됩니다. 너무 오래 고민해도 콤보
            타이머가 만료됩니다!
          </p>
        </Section>

        {/* ---- 난이도 ---- */}
        <Section icon={Trophy} title="난이도 가이드" color="text-yellow-400">
          <div className="space-y-2">
            {[
              {
                icon: '🌱',
                name: '입문',
                desc: '빈 칸 20개. 스도쿠를 처음 해본다면 여기서 시작!',
                color: 'text-green-400',
              },
              {
                icon: '🍀',
                name: '쉬움',
                desc: '빈 칸 35개. 기본 규칙에 익숙해졌다면 도전.',
                color: 'text-lime-400',
              },
              {
                icon: '🔥',
                name: '보통',
                desc: '빈 칸 45개. 메모 기능을 활용해보세요.',
                color: 'text-orange-400',
              },
              {
                icon: '💪',
                name: '어려움',
                desc: '빈 칸 52개. 메모 필수! 꼼꼼한 분석이 필요합니다.',
                color: 'text-red-400',
              },
              {
                icon: '🧠',
                name: '전문가',
                desc: '빈 칸 56개. Naked Pairs 같은 고급 기법이 필요할 수 있습니다.',
                color: 'text-purple-400',
              },
              {
                icon: '👑',
                name: '마스터',
                desc: '빈 칸 57~60개. 최상급 도전! 힌트를 전략적으로 사용하세요.',
                color: 'text-yellow-400',
              },
            ].map((d) => (
              <div key={d.name} className="flex items-start gap-2">
                <span className="text-base">{d.icon}</span>
                <div>
                  <span className={cn('text-sm font-bold', d.color)}>
                    {d.name}
                  </span>
                  <p className="text-xs text-slate-400">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- 초보자 팁 ---- */}
        <Section icon={Lightbulb} title="초보자 꿀팁" color="text-cyan-400">
          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="text-cyan-400">💡</span>
              <p>
                <strong className="text-white">메모를 적극 활용하세요!</strong>{' '}
                고수들도 메모 없이는 풀기 어렵습니다.
                빈 칸마다 가능한 숫자를 메모해두면 답이 보입니다.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-400">💡</span>
              <p>
                <strong className="text-white">
                  확실한 것부터 채우세요.
                </strong>{' '}
                행/열/박스에서 하나만 빠진 숫자를 먼저 찾으세요.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-400">💡</span>
              <p>
                <strong className="text-white">추측은 금물!</strong>{' '}
                스도쿠는 논리 퍼즐입니다.
                찍지 말고 확실한 근거가 있을 때만 숫자를 넣으세요.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-400">💡</span>
              <p>
                <strong className="text-white">막히면 힌트를 사용하세요.</strong>{' '}
                3개까지 쓸 수 있고, 힌트가 뚫어주면 연쇄적으로 풀립니다.
              </p>
            </div>
          </div>
        </Section>

        {/* ---- 키보드 단축키 ---- */}
        <Section icon={HelpCircle} title="키보드 단축키 (PC)" color="text-slate-400">
          <div className="rounded-xl bg-white/5 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">1~9</span>
              <span className="text-white">숫자 입력</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">방향키</span>
              <span className="text-white">셀 이동</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">N</span>
              <span className="text-white">메모 모드 전환</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">H</span>
              <span className="text-white">힌트 사용</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Backspace</span>
              <span className="text-white">지우기</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ctrl+Z / Ctrl+Y</span>
              <span className="text-white">되돌리기 / 다시하기</span>
            </div>
          </div>
        </Section>

        <p className="text-center text-xs text-slate-600 pb-4">
          이제 시작해볼까요? 홈에서 &quot;게임 시작&quot;을 눌러보세요! 🎮
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
