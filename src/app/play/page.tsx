'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';
import { useUserStore } from '@/lib/store/userStore';
import { useTimer } from '@/hooks/useTimer';
import { useKeyboard } from '@/hooks/useKeyboard';
import DifficultySelector from '@/components/game/DifficultySelector';
import GameHeader from '@/components/game/GameHeader';
import SudokuBoard from '@/components/game/SudokuBoard';
import GameControls from '@/components/game/GameControls';
import NumberPad from '@/components/game/NumberPad';
import ComboIndicator from '@/components/game/ComboIndicator';
import GameCompleteModal from '@/components/game/GameCompleteModal';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import type { Difficulty } from '@/types';

export default function PlayPage() {
  const router = useRouter();
  const status = useGameStore((s) => s.status);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const getGameResult = useGameStore((s) => s.getGameResult);
  const recordGameResult = useUserStore((s) => s.recordGameResult);
  const recordStreak = useUserStore((s) => s.recordStreak);

  // Hooks
  useTimer();
  useKeyboard();

  const handleSelectDifficulty = useCallback(
    (difficulty: Difficulty) => {
      startNewGame(difficulty);
    },
    [startNewGame]
  );

  const handleGameComplete = useCallback(() => {
    const result = getGameResult();
    if (result) {
      recordGameResult({
        difficulty: result.difficulty,
        timeInSeconds: result.timeInSeconds,
        mistakes: result.mistakes,
        hintsUsed: result.hintsUsed,
        maxCombo: result.maxCombo,
        totalScore: result.totalScore,
      });
      recordStreak();
    }
  }, [getGameResult, recordGameResult, recordStreak]);

  const handleNewGame = useCallback(() => {
    const difficulty = useGameStore.getState().difficulty;
    startNewGame(difficulty);
  }, [startNewGame]);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Idle: show difficulty selector
  if (status === 'idle') {
    return (
      <div className="min-h-screen pb-24 pt-16">
        <Header />
        <main className="mx-auto max-w-lg px-4 pt-4">
          <DifficultySelector onSelect={handleSelectDifficulty} />
        </main>
        <BottomNav />
      </div>
    );
  }

  // Active game (playing/paused)
  const isGameActive = status === 'playing' || status === 'paused';

  return (
    <div className="flex min-h-screen flex-col">
      {/* Game UI */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-2 pt-2 pb-4">
        <GameHeader />
        <ComboIndicator />
        <div className="flex-1 flex items-center justify-center py-2">
          <SudokuBoard />
        </div>
        <GameControls />
        <div className="mt-2">
          <NumberPad />
        </div>
      </main>

      {/* Completed modal */}
      <GameCompleteModal
        isOpen={status === 'completed'}
        onClose={() => {
          handleGameComplete();
        }}
        onNewGame={() => {
          handleGameComplete();
          handleNewGame();
        }}
        onGoHome={() => {
          handleGameComplete();
          handleGoHome();
        }}
      />

      {/* Failed modal */}
      <Modal
        isOpen={status === 'failed'}
        onClose={handleGoHome}
        title="게임 오버"
      >
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="h-16 w-16 text-red-400" />
          <p className="text-center text-slate-300">
            실수가 너무 많았습니다. 다시 도전해 보세요!
          </p>
          <div className="flex w-full gap-3">
            <Button
              variant="secondary"
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Button>
            <Button
              variant="primary"
              onClick={handleNewGame}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4" />
              다시 도전
            </Button>
          </div>
        </div>
      </Modal>

      {/* Hide bottom nav during active game */}
      {!isGameActive && status !== 'completed' && status !== 'failed' && (
        <BottomNav />
      )}
    </div>
  );
}
