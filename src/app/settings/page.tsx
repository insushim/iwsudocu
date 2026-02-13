'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/lib/store/userStore';
import type { UserSettings } from '@/types';
import { cn } from '@/lib/utils/cn';

interface SettingToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-indigo-500' : 'bg-white/10'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

type SettingKey = keyof UserSettings;

interface SettingItem {
  key: SettingKey;
  label: string;
  description: string;
}

const SETTING_GROUPS: { title: string; items: SettingItem[] }[] = [
  {
    title: '사운드',
    items: [
      {
        key: 'soundEnabled',
        label: '효과음',
        description: '게임 효과음을 활성화합니다',
      },
      {
        key: 'musicEnabled',
        label: '배경 음악',
        description: '배경 음악을 활성화합니다',
      },
      {
        key: 'vibrationEnabled',
        label: '진동',
        description: '터치 시 진동 피드백을 제공합니다',
      },
    ],
  },
  {
    title: '게임플레이',
    items: [
      {
        key: 'autoRemoveNotes',
        label: '자동 메모 제거',
        description: '숫자 배치 시 관련 메모를 자동 삭제합니다',
      },
      {
        key: 'highlightSameNumbers',
        label: '같은 숫자 하이라이트',
        description: '선택된 숫자와 같은 숫자를 강조합니다',
      },
      {
        key: 'highlightConflicts',
        label: '충돌 표시',
        description: '규칙 위반 셀을 빨간색으로 표시합니다',
      },
      {
        key: 'numberFirst',
        label: '숫자 먼저 모드',
        description: '숫자를 먼저 선택하고 셀을 터치합니다',
      },
    ],
  },
  {
    title: '디스플레이',
    items: [
      {
        key: 'showTimer',
        label: '타이머 표시',
        description: '게임 중 경과 시간을 표시합니다',
      },
      {
        key: 'showMistakeCount',
        label: '실수 횟수 표시',
        description: '남은 실수 횟수를 표시합니다',
      },
      {
        key: 'darkMode',
        label: '다크 모드',
        description: '어두운 테마를 사용합니다',
      },
    ],
  },
];

export default function SettingsPage() {
  const settings = useUserStore((s) => s.profile.settings);
  const updateSettings = useUserStore((s) => s.updateSettings);

  const handleToggle = (key: SettingKey, value: boolean) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </Link>
          <h2 className="text-lg font-bold text-white">설정</h2>
        </div>

        {SETTING_GROUPS.map((group) => (
          <Card key={group.title} className="divide-y divide-white/5">
            <h3 className="pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.title}
            </h3>
            {group.items.map((item) => (
              <SettingToggle
                key={item.key}
                label={item.label}
                description={item.description}
                checked={settings[item.key] as boolean}
                onChange={(value) => handleToggle(item.key, value)}
              />
            ))}
          </Card>
        ))}

        {/* Language setting */}
        <Card>
          <h3 className="pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            언어
          </h3>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => updateSettings({ language: 'ko' })}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                settings.language === 'ko'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              한국어
            </button>
            <button
              onClick={() => updateSettings({ language: 'en' })}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                settings.language === 'en'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              English
            </button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
