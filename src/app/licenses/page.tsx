'use client';

import { ArrowLeft, Scale } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

interface LicenseInfo {
  name: string;
  version: string;
  license: string;
  author: string;
  url: string;
}

const LICENSES: LicenseInfo[] = [
  { name: 'React', version: '19.2.3', license: 'MIT', author: 'Meta Platforms, Inc.', url: 'https://github.com/facebook/react' },
  { name: 'Next.js', version: '16.1.6', license: 'MIT', author: 'Vercel, Inc.', url: 'https://github.com/vercel/next.js' },
  { name: 'Tailwind CSS', version: '4', license: 'MIT', author: 'Tailwind Labs, Inc.', url: 'https://github.com/tailwindlabs/tailwindcss' },
  { name: 'Zustand', version: '5.0.11', license: 'MIT', author: 'Paul Henschel', url: 'https://github.com/pmndrs/zustand' },
  { name: 'Framer Motion', version: '12.34.0', license: 'MIT', author: 'Framer B.V.', url: 'https://github.com/framer/motion' },
  { name: 'Lucide React', version: '0.563.0', license: 'ISC', author: 'Lucide Contributors', url: 'https://github.com/lucide-icons/lucide' },
  { name: 'canvas-confetti', version: '1.9.4', license: 'ISC', author: 'Kiril Vatev', url: 'https://github.com/catdad/canvas-confetti' },
  { name: 'date-fns', version: '4.1.0', license: 'MIT', author: 'Sasha Koss', url: 'https://github.com/date-fns/date-fns' },
  { name: 'next-themes', version: '0.4.6', license: 'MIT', author: 'Paco Coursey', url: 'https://github.com/pacocoursey/next-themes' },
  { name: 'react-hot-toast', version: '2.6.0', license: 'MIT', author: 'Timo Lins', url: 'https://github.com/timolins/react-hot-toast' },
  { name: 'clsx', version: '2.1.1', license: 'MIT', author: 'Luke Edwards', url: 'https://github.com/lukeed/clsx' },
  { name: 'tailwind-merge', version: '3.4.0', license: 'MIT', author: 'Dany Castillo', url: 'https://github.com/dcastil/tailwind-merge' },
  { name: 'class-variance-authority', version: '0.7.1', license: 'Apache-2.0', author: 'Joe Bell', url: 'https://github.com/joe-bell/cva' },
];

function getLicenseBadgeColor(license: string): string {
  switch (license) {
    case 'MIT': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'ISC': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Apache-2.0': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export default function LicensesPage() {
  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </Link>
          <Scale className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">오픈소스 라이선스</h2>
        </div>

        <p className="text-xs text-slate-500 px-1">
          칸채움은 아래의 오픈소스 소프트웨어를 사용하고 있습니다.
          각 소프트웨어의 저작권과 라이선스를 존중하며, 해당 라이선스 조건에 따라 사용합니다.
        </p>

        <div className="space-y-2">
          {LICENSES.map((lib) => (
            <Card key={lib.name} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{lib.name}</span>
                    <span className="text-xs text-slate-500">{lib.version}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{lib.author}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 text-xs font-mono font-medium rounded-md border ${getLicenseBadgeColor(lib.license)}`}>
                  {lib.license}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
