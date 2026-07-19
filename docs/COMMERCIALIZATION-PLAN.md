# 칸채움(iwsudocu) 상업화 강화 계획서

> 작성: 2026-07-19 · 검증: 7way FULL 교차검증 (Tier-0 결정론 게이트 + codex GPT + Gemini + Claude 리뷰어 + 메인 종합)
> 상태: **v1.1 — 구현 완료** (Phase 0~3 + Phase 5 코드 반영, Phase 4는 스토어 계정 필요로 배포 후 과제). tsc·build·순수로직 유닛테스트 9건 통과. 수정 후 FULL 재검증 진행.

## 구현 요약 (2026-07-19 반영)
- **Phase 0(치팅·버그 CRITICAL 11)**: 전부 코드 반영 ✅ — 리더보드 서버검증(세션토큰 HMAC·점수상한·타입/범위검증·rate limit·CORS 제한), 스트릭 프리즈 실작동, 데일리 완료 분리추적+보너스 지급, 완료모달 보상=실지급(calculateRewards 단일화), 스트릭 마일스톤 중복차단, undo 콤보 파밍 차단(스냅샷 복원), monotonic clock 시간(시계조작 무력화), speed 업적 case 추가.
- **Phase 1(성능·버그)**: 퍼즐생성 비동기 스케줄+로딩 UI(※Web Worker는 Turbopack 정적export 미지원 실측→폴백), 81셀 리렌더 최적화(notesKey 문자열), 진행게임 persist(Set 직렬화), persist migrate/merge, 콤보 실시각 만료, 완성 축하 정답검증, solver invalid board 방어, 히스토리 상한.
- **Phase 2(시인성)**: 색각 접근성(오답 밑줄·given 굵기), help 카피 4건. (라이트모드 전면 토큰화는 design-master 후속.)
- **Phase 3(중독성)**: 부활(코인 이어하기), 주간미션(3종/주 결정론), 스트릭 위기 배너, 온보딩 모달.
- **Phase 4(수익화)**: 광고/IAP는 AdMob 계정+TWA 필요 → 배포 후 과제(부활은 코인으로 선구현). 
- **Phase 5(심사)**: 비속어 필터(클라+서버), npm audit(런타임 무관 잔여 2건은 next 마이너업 필요로 보류).

## FULL 재검증 결과 (2026-07-19, 수정 후 3계열)
- **Gemini**: CORS 반사 버그 → 수정(allow-list만 반사). 배포 환경변수 의존성 확인 요구.
- **Claude**: 앞선 CRITICAL 4건 중 3건 완전 해소·1건 toast 보완. 신규 회귀 2건(콤보 persist 세션상대 타임스탬프 고착, ComboIndicator 진행바 정지) → **둘 다 수정**.
- **codex**: 신규 지적 반영 수정 완료 —
  - undo가 실수/힌트 비용을 환급하던 문제 → mistakes/hints 영구 유지(콤보만 복원), redo 대칭 단순화.
  - 새로고침/부활 시 경과시간 소실 → onRehydrate·revive·failed에서 accumulatedMs 커밋/복원(monotonic 정합).
  - 콤보 실시각 만료가 입력 시점 미적용 → placeNumber에도 만료 판정.
  - 리더보드: nonce 일회성 소비(replay 방지) + is_perfect 서버 재계산(모순 차단) + 데일리/스트릭 KST 통일.

## 알려진 잔여(후속 과제 — 치명적 아님)
- **리더보드 완전 authoritative 검증**: 클라이언트 생성 퍼즐 구조상 서버가 점수를 독립 재계산할 수 없음 → 완전 방지는 서버 퍼즐 생성/검증 재설계 필요. 현재는 nonce+범위+rate limit+상한으로 "실용적 방어"(위조 난이도 대폭 상승). **배포 시 `LEADERBOARD_SECRET`·`ALLOWED_ORIGINS` 환경변수와 schema.sql(submission_log·used_tokens) 적용 필수** — 미설정 시 세션검증/CORS가 no-op.
- 로컬 XP/코인은 싱글플레이 특성상 자기 localStorage 조작 완전 방지 불가(리더보드만 서버 방어). 
- freeze 만료~다음 tick 사이 pause 시 최대 수초 오차(엣지), rate limit COUNT→INSERT 비원자성, 인접 셀 자동삭제 메모의 undo 미복원(기존 동작) — LOW.
- 라이트모드 전면 토큰화·수익화 SDK(AdMob/IAP)·주간 리그 — design-master/배포 후 과제.

---

## 0. 검증 방법론 및 현재 상태 요약

| 검증 레인 | 결과 |
|---|---|
| Tier-0 게이트 (gitleaks·tsc·oxlint·npm audit) | 통과 (시크릿 0, 타입에러 0 / 취약 의존성은 devDeps 수준) |
| codex (GPT, 로직·치팅 렌즈) | REQUEST_CHANGES — CRITICAL 1 + HIGH 6 + 발견 26건 (리더보드 위조 확정 · SQLi 없음 · 유일해 보장 확정) |
| Gemini (보안·카피·접근성 렌즈) | REQUEST_CHANGES — CRITICAL 1 + HIGH 1 + MEDIUM 3 |
| Claude 리뷰어 (구조·성능·버그 렌즈) | REQUEST_CHANGES — CRITICAL 4 + HIGH 2 + MEDIUM 4 |
| 메인 종합 | 아래 계획 확정 |

**총평**: 게임 코어(생성기 유일해 보장, 콤보·스트릭·레벨·업적·샵 등 엔게이지먼트 뼈대)는 상업화 기반이 이미 탄탄하다. 그러나 ① 리더보드가 완전 무방비, ② **돈 받고 파는 기능(스트릭 프리즈)이 실제로 작동하지 않음**, ③ 데일리 챌린지 보상 체계가 절반만 구현됨 — 이 3가지가 출시 차단급이다. 수익화 장치는 전무하다.

---

## Phase 0 — 출시 차단급 (버그·보안) 🔴 최우선

### P0-1. 리더보드 서버 신뢰 경계 구축 [CRITICAL · 3계열 합의]
- **현상**: `functions/api/leaderboard.ts:71-95` — 익명 POST 바디의 score/time/combo를 검증 없이 그대로 D1 INSERT. CORS `*`, rate limit 없음. curl 한 줄로 전세계 1위 조작 가능.
- **수정**:
  1. **플레이 세션 토큰 방식** 도입: 게임 시작 시 `/api/game/start`에서 서명된 세션 토큰(퍼즐 시드+시작시각, HMAC) 발급 → 제출 시 토큰 검증으로 최소 플레이 시간·점수 상한(난이도별 이론 최대치) plausibility 체크.
  2. score/time/mistakes/combo **범위 검증** (난이도별 `BASE_SCORES` 기반 이론 최대·최소).
  3. **rate limit**: IP당 분당 제출 횟수 제한 (Cloudflare Turnstile 또는 D1 카운터).
  4. CORS를 자체 도메인으로 제한.
  5. `!body.score` falsy 버그 수정 → `typeof body.score !== 'number'` 타입 가드 (0점 제출 거부 버그 동시 해소). player_name 비문자열 TypeError 가드.
- **성공조건**: 임의 curl POST가 400/403으로 거부됨을 실측. 정상 0점 제출은 통과.

### P0-2. 스트릭 프리즈 파워업 미작동 수정 [CRITICAL · Claude 단독→코드 확인 완료]
- **현상**: `userStore.ts:559-562` — 250코인 구매·사용 시 인벤토리만 차감되고 `streakFreezeCount` 증가 코드가 코드베이스 어디에도 없음. **결제만 되고 효과 0인 유료 기능.**
- **수정**: usePowerUp의 streak_freeze case에서 `profile.streak.streakFreezeCount + 1` 반영.
- **성공조건**: 구매→사용→하루 건너뛰기 시나리오 테스트에서 스트릭 유지 확인.

### P0-3. 데일리 챌린지 완료 오판정 수정 [CRITICAL]
- **현상**: `recordStreak()`이 모든 게임에서 호출되어 `streakHistory`에 오늘 날짜 추가 → `DailyPuzzle.tsx:57`이 이를 "오늘의 도전 완료"로 오판정. 일반 퍼즐만 풀어도 데일리 진입이 차단됨.
- **수정**: `puzzle.id.startsWith('daily-')` 기반 별도 `dailyCompletedDates` 필드로 분리 추적.
- **성공조건**: 일반 퍼즐 완료 후 데일리 진입 가능, 데일리 완료 후에만 완료 표시.

### P0-4. 데일리 보너스 미지급 수정 [CRITICAL]
- **현상**: `DailyPuzzle.tsx:18-49` — "+200 XP" 등 보너스를 UI로 약속하지만 지급 코드가 전무. 소비자 기만에 해당.
- **수정**: 데일리 완료 경로에서 조건(무실수·시간 등) 검증 후 실지급, 완료 모달에 표기.
- **성공조건**: 각 보너스 조건 충족/미충족 케이스에서 지급액 실측 일치.

### P0-5. 완료 모달 보상 표시값 불일치 수정 [CRITICAL]
- **현상**: `GameCompleteModal.tsx:305-313` — 표시값이 `totalScore*0.5/0.1` 독자 계산으로, 실지급(스트릭 배율·업적 보너스 포함)과 상시 불일치.
- **수정**: `recordGameResult`가 지급 내역을 반환하도록 리팩토링 → 모달은 반환값만 표시 (단일 진실원).
- **성공조건**: 스트릭 7일차 계정으로 완료 시 표시값 == 실지급값.

### P0-6. 날짜/시간대 로직 통일 [HIGH]
- **현상**: 데일리 퍼즐·streak·daily_date가 전부 기기 로컬 시계 기준(`gameStore.ts:219-230` 데일리 seed도 UTC 아닌 로컬 → 전세계 공통 데일리 아님). 시계를 하루씩 전진시키면 실제 경과 없이 스트릭 무한 증가, 데일리 리더보드 끼어들기 가능.
- **수정**: 서버(Pages Function)에서 KST 기준 오늘 날짜 제공(`/api/today`), daily_date·데일리 seed는 서버가 기록. 스트릭은 클라 유지하되 미래 날짜/시계 되감기 방어.
- **성공조건**: 기기 시계를 ±1일 조작해도 데일리 날짜·스트릭 판정은 서버 기준.

### P0-7. 스트릭 마일스톤 당일 중복 수령 [CRITICAL · codex+실측 확정]
- **현상**: `userStore.ts:303-325` — `recordStreak`가 `updateStreak`으로 스트릭을 갱신하는데, 같은 날 재완료 시 `lastPlayDate===today`라 스트릭은 안 늘지만 `currentStreak`(예: 7)은 그대로 → `getStreakMilestoneReward(7)`이 매번 재조회되어 **같은 마일스톤 보상(코인·XP)을 무한 재지급**. 실측: 7일차 계정으로 재완료 반복 시 매번 +150코인.
- **수정**: 마일스톤 지급을 "스트릭이 실제 증가한 경우"에만 실행(updateStreak가 today와 동일해 early-return하면 보상 스킵). 지급 이력(`claimedMilestones`)으로 이중 방어.
- **성공조건**: 같은 날 재완료 시 마일스톤 재지급 0.

### P0-8. undo 콤보 무한 파밍 [CRITICAL · codex+실측 방향]
- **현상**: `gameStore.ts:312-366,530-552` — undo가 combo/maxCombo를 되돌리지 않아 "동일 셀 입력→undo→재입력" 반복으로 콤보 무한 파밍(30회 반복 시 maxCombo=30 → 콤보 보너스 1000점 + 업적 해금). 리더보드 점수와 직결.
- **수정**: undo/redo 스냅샷에 combo·maxCombo·mistakes·hints·peer notes 포함해 함께 복원.
- **성공조건**: 입력→undo→재입력 반복해도 maxCombo가 정당한 연속 정답 수를 초과하지 않음.

### P0-9. 클라이언트 점수→보상 무검증 환산 [HIGH · codex]
- **현상**: `userStore.ts:341-350,443-453` — `recordGameResult`가 호출자 제공 `totalScore`를 재계산 없이 XP·코인으로 환산. localStorage(`numero-quest-user`) 직접 수정 후 새로고침하면 위조 코인/레벨 그대로 사용(`userStore.ts:248-250,623-632`).
- **수정**: 순수 클라 게임이라 로컬 위조를 100% 막을 순 없으나 — (a) 지급 XP·코인을 store 내부에서 게임 파라미터로 재계산(호출자 totalScore 신뢰 금지), (b) 상한 클램프, (c) 리더보드는 P0-1 서버 검증으로 상쇄. 로컬 이코노미는 "치팅해도 남에게 피해 없음" 선까지만 방어.
- **성공조건**: recordGameResult에 비정상 totalScore 주입 시 지급액이 난이도 상한으로 클램프됨.

### P0-10. 시계 되감기 → 음수 시간·상한없는 시간보너스 [HIGH · codex]
- **현상**: `gameStore.ts:652-688,720-740` + `scoring.ts:25-30` — 시스템 시계를 과거로 되돌리면 음수 elapsedTime 발생, 시간보너스에 상한 없어 비정상 고득점.
- **수정**: elapsedTime을 monotonic clock(`performance.now()`) 기반으로, 음수/역행 방어. 시간보너스 상한 클램프.
- **성공조건**: 게임 중 시계 되감기 시 elapsedTime 단조증가 유지.

### P0-11. speed 업적 영구 미해금 [HIGH · codex+실측 확정]
- **현상**: `achievements.ts:18-22` speed_* 5종 선언되어 있으나 `checkAchievements` switch(53-83줄)에 `case 'speed_*'`가 **없음** → 조건 충족해도 절대 해금 안 됨. UI엔 표시되는 미완성 업적.
- **수정**: speed 카테고리 case 추가(난이도별 완료 시간 ≤ requirement 판정).
- **성공조건**: easy 3분 내 완료 시 speed_easy_3m 해금 실측.

---

## Phase 1 — 성능·품질 🟠

### P1-1. 퍼즐 생성 Web Worker 이전 [HIGH]
- **현상**: `generator.ts` — countSolutions 백트래킹이 제거 시도마다(최대 81회) 메인스레드 동기 실행. master(60칸 제거)에서 저사양 폰 UI 프리즈 가능.
- **수정**: Web Worker + 로딩 인디케이터. 또는 사전 생성 퍼즐 풀(빌드타임 생성 JSON) 병행 — 품질 균일화 부수 효과.
- **성공조건**: master 생성 중 메인스레드 블로킹 < 50ms (Performance 패널 실측).

### P1-2. 보드 리렌더 최적화 [HIGH]
- **현상**: 입력 1회당 81셀 전체 리렌더 — `cloneNotes` 전체 깊은 복제 + `Array.from(notes[r][c])` 매번 새 배열로 memo 무력화.
- **수정**: 변경 셀만 새 참조를 갖는 정밀 clone, notes를 정렬 문자열 등 안정 원시값으로 전달.
- **성공조건**: React DevTools Profiler로 입력 1회당 리렌더 셀 ≤ 관련 하이라이트 셀 수(~21개) 확인.

### P1-3. persist 버전 마이그레이션 도입 [MEDIUM]
- **현상**: userStore persist에 version/migrate 없음 → 향후 필드 추가 시 기존 유저 stats에 undefined→NaN 전파 위험.
- **수정**: `version: 1` + migrate 함수 + 기본값 deep-merge. gameStore도 동일.

### P1-4. 진행 게임 persist [MEDIUM · codex]
- **현상**: `gameStore.ts:191-240` — gameStore 자체가 미persist라 새로고침/앱 전환 시 진행 중 보드·타이머·undo 이력이 전부 초기화. play/page의 "진행 중 게임 이어하기" UI가 실제로는 재시작 후 복원 불가.
- **수정**: gameStore에 persist 미들웨어 추가(진행 중 puzzle·입력·타이머 상태). 완료/실패 시 클리어.

### P1-5. 콤보 만료 실시각 기반 전환 [MEDIUM · codex]
- **현상**: `combo.ts:43-53` + `gameStore.ts:667-683` — 콤보 만료가 실시각이 아닌 tick 횟수 의존. 탭 백그라운드로 interval throttle 시 15초 경과해도 콤보 유지(우회). pause 중 콤보 decay도 멈춤.
- **수정**: 콤보 타임스탬프를 `performance.now()` 기반 실시각으로 판정.

### P1-6. 완성 축하 정답 검증 [MEDIUM · codex]
- **현상**: `celebrations.ts:9-35` + `gameStore.ts:368-408` — 행/열/박스 완성 축하가 정확성 아닌 "0(빈칸) 없음"만 확인 → 오답으로 채운 행도 완성 축하 표시. `solver.ts:7-24`도 기존 nonzero 셀 유효성 미검사(모든 셀=1인 invalid board를 해답처럼 반환 가능).
- **수정**: 완성 판정에 solution 대조 추가. solver에 입력 보드 유효성 사전 검사.

### P1-7. 기타 정리 [LOW]
- 렌더 중 store mutate(`play/page.tsx:36-43`) → useEffect 이전.
- 죽은 조건(`play/page.tsx:288`) 정리, AnimatedCounter 중복 통합.
- limit NaN/음수 가드(`leaderboard.ts:48` — limit=-1이면 전체 행 조회됨).
- undo/redo 히스토리 크기 상한(현재 무제한 → 노트 토글 반복 시 메모리 누수).
- daily_bonus_all 업적 잘못된 조건(`achievements.ts:33-37` — 보너스 완료수 아닌 일반 daily 완료수 사용).
- 닉네임 정제 후 빈문자열/제어문자/방향전환문자(‮) 재검증(`leaderboard.ts:74-81`).
- 멀티탭 동기화(nastier: 두 탭 동시 조작 시 덮어씀 — storage 이벤트 구독).
- visibilitychange 자동 일시정지 + streakHistory 최근 400일 캡.

---

## Phase 2 — 시인성·접근성·리디자인 🟡

### P2-1. 색각 접근성 [MEDIUM · WCAG 1.4.1]
- 충돌/오류 셀이 색상만으로 구분됨(`SudokuCell.tsx:47-98`) → 언더라인/아이콘/굵기 등 색상 외 보조 신호 추가. given vs 입력 숫자도 굵기 차등.
- 노트 색 `#7DD3FC`, 에러 `#DC2626` 하드코딩 → 테마 토큰으로 이전 (테마샵 일관성).

### P2-2. 라이트 모드 완성도
- 현재 UI가 사실상 다크 고정(text-white, bg-white/5 하드코딩 다수). next-themes가 있으니 시맨틱 토큰(Tailwind CSS 변수)으로 정리해 라이트 모드 대비(4.5:1) 확보 — 야외 플레이 시인성에 직결.

### P2-3. 리디자인 방향 (design-master 공정으로 별도 실행)
- 디자인 브리프 → 테마 3안 → 토큰화 → 적용 → 게이트 검증.
- 방향성: 현재 인디고/퍼플 그라데이션 다크는 준수하나, **게임 보드 자체의 프리미엄감**(셀 입체감, 완료 시 행/열/박스 완성 애니메이션, 숫자 타이포그래피)과 **홈 화면의 데일리 중심 재배치**(오늘의 도전을 히어로로 승격, 스트릭 위기 경고 배너)가 개선 포인트.
- help 카피 4건 수정: "정답을 놓으면"→"정답을 채우면", "Naked Pairs"→"네이키드 페어(Naked Pairs)", 어조 통일, "힌트가 뚫어주면"→"힌트로 막힌 칸을 뚫어주면".

---

## Phase 3 — 중독성·재미 강화 🟢

기존 자산(스트릭+배율, 콤보, 코인샵, 레벨/티어, 업적, 두뇌점수, 데일리, 리더보드, BGM/햅틱)은 우수. 빠진 것은 **세션 복귀 훅**과 **단기 목표 루프**.

### P3-1. 부활(이어하기) 시스템 [효과 최대]
- 실수 3회 게임오버 → "코인 소모 or 광고 시청으로 이어하기(실수 1회 차감)". 검증된 리텐션+수익 훅. 긴 판(expert+)을 통째로 날리는 좌절 이탈 방지.

### P3-2. 주간 미션/퀘스트
- "이번 주 hard 3판", "무실수 클리어 2회" 등 3슬롯 위클리 미션 + 코인/XP 보상. 데일리(1판)와 시즌(레벨) 사이의 중기 루프 부재를 메움.

### P3-3. 데일리 스트릭 위기 알림
- 홈 진입 시 "오늘 스트릭이 끊깁니다 — N시간 남음" 배너. TWA 푸시 도입 전에도 앱 내 배너로 효과.

### P3-4. 온보딩
- 최초 실행 시 30초 인터랙티브 튜토리얼(3칸만 채우는 미니 보드) → 첫 판 완료 보상 크게. 현재 help 페이지 정적 문서만으로는 신규 이탈 큼.

### P3-5. 주간 리그 (P0-1 서버 신뢰 확보 후)
- 주간 점수 합산 리그(브론즈~그랜드마스터 승강제). 티어 시스템이 이미 있어 재사용 가능. 리더보드 검증이 선행 조건.

---

## Phase 4 — 수익화 💰

현재 수익 장치 0. TWA(안드로이드 출시) 전제:
1. **보상형 광고** (AdMob): 부활·힌트 충전·코인 2배 — 강제 전면광고보다 퍼즐 게임 정서에 맞고 eCPM 높음.
2. **코인 IAP**: 소액 패키지 + "광고 제거" 단품(퍼즐 게임 구매 전환 1위 상품).
3. **프리미엄 테마 팩**: 테마샵 확장(계절 한정 테마).
- 순서: 광고 먼저(설치 기반 확보) → IAP는 DAU 안정 후.

---

## Phase 5 — 스토어 심사·법적 🔵

- **UGC 정책**: 리더보드 닉네임이 자유 입력 — 비속어 필터(한/영 금칙어) + 신고 메커니즘. 구글 플레이 UGC 정책 요구사항.
- 프라이버시 페이지는 현재 코드와 일치(양호). 광고/IAP 도입 시 개정 필요.
- npm audit 취약점은 devDeps라 런타임 무관하나 `npm audit fix` 1회 실행.

---

## 실행 순서 및 검증 계획

| 순서 | 내용 | 규모 | 검증 |
|---|---|---|---|
| 1 | P0-2~P0-5, P0-7, P0-8, P0-11 (보상/데일리/치팅 버그 7건) | 소~중 | **치팅·이코노미 → FULL 재검증** |
| 2 | P0-1, P0-6, P0-9, P0-10 (리더보드 서버 검증 + 시계·환산 방어) | 중 | **중대(치팅·데이터) → FULL 재검증** |
| 3 | P1-1, P1-2, P1-4~P1-6 (성능 + 진행 persist + 콤보/완성 판정) | 중 | LITE + Profiler 실측 |
| 4 | P2 (시인성·리디자인) | 중 | design-master 게이트 |
| 5 | P3-1~P3-4 (중독성) | 중 | LITE |
| 6 | P4~P5 (수익화·심사) | 중 | financial-saas 룰 적용(결제 = 중대 → FULL) |
| 7 | P3-5 (리그) | 대 | FULL |

- 각 단계 완료 시 Tier-0 게이트(`preflight-gate.sh`) 선행 후 AI 재검증.
- XSS는 3계열 모두 "경로 없음" 판정(React 이스케이프 + dangerouslySetInnerHTML 0건) — 추가 조치 불요.
- SQL injection 없음(전 쿼리 파라미터 바인딩) — codex 확인.

---

## 부록: 발견 원장 (심각도순)

| # | 심각도 | 위치 | 요지 | 발견 계열 |
|---|---|---|---|---|
| 1 | CRITICAL | functions/api/leaderboard.ts:71-95 | 점수 위조 무방비 (검증·인증·rate limit 0) | main+gemini+codex+claude |
| 2 | CRITICAL | userStore.ts:559-562 | 스트릭 프리즈 구매만 되고 효과 미작동 | claude (코드 재확인 완료) |
| 3 | CRITICAL | DailyPuzzle.tsx:57 | 일반 퍼즐로도 데일리 완료 처리 | claude |
| 4 | CRITICAL | DailyPuzzle.tsx:18-49 | 데일리 보너스 약속만 하고 미지급 | claude |
| 5 | CRITICAL | GameCompleteModal.tsx:305-313 | 보상 표시값 ≠ 실지급값 | claude |
| 6 | CRITICAL | userStore.ts:303-325 | 스트릭 마일스톤 당일 중복 수령 | codex+실측 |
| 7 | CRITICAL | gameStore.ts:312-366 | undo 콤보 무한 파밍 | codex |
| 8 | HIGH | userStore.ts:341-350 | 클라 totalScore 무검증 → XP/코인 환산 | codex |
| 9 | HIGH | gameStore.ts:652-688 | 시계 되감기 → 음수시간·상한없는 시간보너스 | codex |
| 10 | HIGH | achievements.ts:18-22,53-83 | speed 업적 case 누락 → 영구 미해금 | codex+실측 |
| 11 | HIGH | leaderboard.ts:17-33 | CORS * → 임의 오리진 cross-origin 쓰기 | codex+gemini |
| 12 | HIGH | leaderboard.ts:74 | 0점/0초 제출 falsy 거부 | gemini |
| 13 | HIGH | SudokuCell/Board + gameStore cloneNotes | 입력당 81셀 전체 리렌더 | claude |
| 14 | HIGH | generator.ts | 퍼즐 생성 메인스레드 블로킹 | main+claude+codex |
| 15 | MEDIUM | leaderboard.ts:72-95 | 음수/비정수 점수·임의 날짜 검증 없음 | codex |
| 16 | MEDIUM | gameStore.ts:191-240 | 진행 게임 미persist → 새로고침 시 소실 | codex |
| 17 | MEDIUM | combo.ts:43-53 | 콤보 만료 tick 의존 → 백그라운드 우회 | codex |
| 18 | MEDIUM | celebrations.ts:9-35 / solver.ts:7-24 | 완성 축하·solver 정답 미검증 | codex |
| 19 | MEDIUM | leaderboard.ts:81 | player_name 비문자열 TypeError | gemini |
| 20 | MEDIUM | SudokuCell.tsx:47-98 | 색상 단독 오류 표시 (WCAG 1.4.1) | gemini |
| 21 | MEDIUM | userStore persist | version/migrate 부재 | claude+codex |
| 22 | MEDIUM | streak/daily 날짜 | 로컬 시계·시간대 의존 | main+gemini+codex |
| 23 | LOW | leaderboard.ts:48 | limit NaN/음수(-1=전체 조회) | main+gemini+codex |
| 24 | LOW | achievements.ts:33-37 | daily_bonus_all 잘못된 조건 | codex |
| 25 | LOW | help 페이지 | 한국어 카피 4건 | gemini |
| 26 | NIT | 여러 곳 | undo 히스토리 무제한, 멀티탭 미동기화, AnimatedCounter 중복, 죽은 조건, 렌더 중 mutate | claude+codex |

**검증 합의**: 리더보드 위조(#1)는 4계열 만장일치. SQL injection = 3계열 "경로 없음"(전 쿼리 bind 파라미터화). XSS = 3계열 "경로 없음"(React 이스케이프 + dangerouslySetInnerHTML 0건). 퍼즐 유일해 = codex 확정 보장.
