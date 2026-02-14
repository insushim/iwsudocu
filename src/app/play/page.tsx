'use client';

import { useCallback, useEffect, useRef } from 'react';
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
import { bgmManager } from '@/lib/audio/bgmManager';
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

  // BGM: start when playing, stop when done or leaving
  const musicEnabled = useUserStore((s) => s.profile.settings.musicEnabled);

  useEffect(() => {
    if (status === 'playing' && musicEnabled) {
      bgmManager.setEnabled(true);
      bgmManager.play();
    } else if (status === 'completed' || status === 'failed' || status === 'idle') {
      bgmManager.stop();
    }

    return () => {
      bgmManager.stop();
    };
  }, [status, musicEnabled]);

  // Record game result immediately on completion (not on modal button click)
  const resultRecorded = useRef(false);

  useEffect(() => {
    if (status === 'completed' && !resultRecorded.current) {
      resultRecorded.current = true;
      const result = getGameResult();
      if (result) {
        const puzzleId = useGameStore.getState().puzzle?.id ?? '';
        const isDaily = puzzleId.startsWith('daily-');

        recordGameResult({
          difficulty: result.difficulty,
          timeInSeconds: result.timeInSeconds,
          mistakes: result.mistakes,
          hintsUsed: result.hintsUsed,
          maxCombo: result.maxCombo,
          totalScore: result.totalScore,
          isDaily,
        });
        recordStreak();

        const playerName = useUserStore.getState().profile.displayName;
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_name: playerName,
            score: result.totalScore,
            difficulty: result.difficulty,
            time_seconds: result.timeInSeconds,
            mistakes: result.mistakes,
            max_combo: result.maxCombo,
            is_perfect: result.mistakes === 0 ? 1 : 0,
            is_daily: isDaily ? 1 : 0,
            daily_date: isDaily ? dateStr : undefined,
          }),
        }).catch(() => { /* silently fail for offline */ });
      }
    }
    if (status === 'idle') {
      resultRecorded.current = false;
    }
  }, [status, getGameResult, recordGameResult, recordStreak]);

  const handleSelectDifficulty = useCallback(
    (difficulty: Difficulty) => {
      startNewGame(difficulty);
    },
    [startNewGame]
  );

  // handleGameComplete is now handled by the useEffect above

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
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Game UI */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-2 pt-1 pb-2 safe-top">
        <GameHeader />
        <ComboIndicator />
        <div className="flex-1 flex items-center justify-center py-1 min-h-0">
          <SudokuBoard />
        </div>
        <div className="shrink-0 space-y-1.5 pb-[env(safe-area-inset-bottom)]">
          <GameControls />
          <NumberPad />
        </div>
      </main>

      {/* Completed modal */}
      <GameCompleteModal
        isOpen={status === 'completed'}
        onClose={handleGoHome}
        onNewGame={handleNewGame}
        onGoHome={handleGoHome}
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
