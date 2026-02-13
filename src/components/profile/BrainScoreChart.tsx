'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import {
  calculateBrainScore,
  getBrainScoreGrade,
} from '@/lib/game/brainScore';
import { Card } from '@/components/ui/Card';

export function BrainScoreChart() {
  const stats = useUserStore((s) => s.profile.stats);
  const brainScore = calculateBrainScore(stats);
  const grade = getBrainScoreGrade(brainScore);

  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedAngle, setAnimatedAngle] = useState(0);

  useEffect(() => {
    // Animate score on mount
    const targetAngle = (brainScore / 999) * 270; // 270 degree arc
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedScore(Math.round(eased * brainScore));
      setAnimatedAngle(eased * targetAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [brainScore]);

  // SVG circular gauge
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // For a 270 degree arc
  const arcLength = (270 / 360) * circumference;
  const filledLength = (animatedAngle / 270) * arcLength;
  const dashArray = `${filledLength} ${circumference}`;

  // Start from 135 degrees (bottom-left) to go 270 degrees clockwise
  const startAngle = 135;

  return (
    <Card className="flex flex-col items-center space-y-2 py-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        두뇌 점수
      </h3>

      {/* Circular gauge */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-[0deg]"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          />
          {/* Filled arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={grade.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            style={{
              filter: `drop-shadow(0 0 8px ${grade.color}40)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-extrabold font-number"
            style={{ color: grade.color }}
          >
            {animatedScore}
          </span>
          <span
            className="text-lg font-bold"
            style={{ color: grade.color }}
          >
            {grade.grade}
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="text-sm font-medium text-slate-300">
        {grade.labelKo}
      </span>
      <span className="text-xs text-slate-500">0 ~ 999</span>
    </Card>
  );
}
