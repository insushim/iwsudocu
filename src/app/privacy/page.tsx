'use client';

import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
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
          <Shield className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">개인정보처리방침</h2>
        </div>

        <Card className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p className="text-xs text-slate-500">시행일: 2025년 2월 14일 | 최종 수정: 2025년 2월 14일</p>

          <section>
            <h3 className="text-white font-semibold mb-1">1. 수집하는 정보</h3>
            <p>
              <strong className="text-slate-200">가. 리더보드 데이터 (선택)</strong><br />
              게임 완료 시 리더보드에 다음 정보가 전송됩니다: 플레이어 표시 이름, 점수, 난이도,
              클리어 시간, 실수 횟수, 최대 콤보, 퍼펙트 여부, 데일리 챌린지 날짜.
              표시 이름은 사용자가 직접 설정한 닉네임이며, 실명이나 개인 식별 정보가 아닙니다.
            </p>
            <p className="mt-2">
              <strong className="text-slate-200">나. 로컬 저장 데이터</strong><br />
              게임 진행 상황, 설정, 업적, 통계 등은 사용자 기기의 로컬 스토리지에만 저장되며
              외부 서버로 전송되지 않습니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">2. 수집하지 않는 정보</h3>
            <p>
              본 앱은 다음 정보를 수집하지 않습니다: 실명, 이메일, 전화번호, 위치 정보,
              기기 고유 식별자(IMEI, 광고 ID 등), 연락처, 사진, 파일, 쿠키 또는 추적 데이터.
              제3자 분석 도구(Google Analytics, Firebase 등)를 사용하지 않습니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">3. 정보의 이용 목적</h3>
            <p>
              수집된 리더보드 데이터는 오직 전체 순위표 표시 목적으로만 사용되며,
              마케팅, 광고, 프로파일링 또는 제3자 공유에 사용되지 않습니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">4. 데이터 보관 및 보호</h3>
            <p>
              리더보드 데이터는 Cloudflare의 보안 인프라(D1 Database)에 암호화되어 저장됩니다.
              로컬 데이터는 사용자 기기에만 존재하며, 브라우저 데이터 삭제 또는 앱 삭제 시
              자동으로 제거됩니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">5. 데이터 삭제 요청</h3>
            <p>
              로컬 데이터: 브라우저 설정에서 사이트 데이터를 삭제하거나, 앱을 삭제하면 됩니다.<br />
              리더보드 데이터: 아래 연락처로 삭제를 요청할 수 있습니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">6. 아동 보호</h3>
            <p>
              본 앱은 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.
              만 14세 미만 사용자의 정보가 수집된 사실을 인지할 경우 즉시 삭제합니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">7. 변경 사항</h3>
            <p>
              본 방침은 변경될 수 있으며, 변경 시 앱 내 공지 또는 본 페이지를 통해 안내합니다.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-1">8. 문의</h3>
            <p>
              개인정보 관련 문의사항은 아래로 연락해주세요.<br />
              <span className="text-indigo-400">kanchaeum.sudoku@gmail.com</span>
            </p>
          </section>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
