# iPhone 15 Pro Max 규격 표준화 및 시각적 결함(Visual Regression) QA 룰 개정 디스커션

**일자**: 2026-09-09
**참여자**: `design_agent`, `qa_agent`, 총괄 오케스트레이터

---

## 1. 긴급 안건 발생 배경
실제 로컬 브라우저 구동 스크린샷 검토 결과, 다음 4가지 치명적 결함이 적발됨:
1. **Dynamic Island & Safe Area 침범**: 상태바 상단 59px 미확보로 첫 번째 카드의 요일 뱃지와 날짜가 다이나믹 아일랜드에 가려짐.
2. **미디어 쿼리 누수(Media Query Leakage)로 인한 텍스트 쪼개짐**: 데스크톱 윈도우 폭(>=640px)으로 인해 420px 모바일 프레임 내부에서 `sm:flex-row`가 강제 발동되어, 타이틀 영역이 150px로 억지 압축되면서 "오늘 할 운\n동이에요"로 비정상 개행됨.
3. **BottomCTA의 뷰포트 탈출**: `TdsBottomCTA`가 `fixed bottom-0`으로 인해 시뮬레이터 프레임 밖 브라우저 하단에 걸쳐짐.
4. **비표준 화면비**: iPhone 15 Pro Max(430×932, 55px 코너) 물리 비율 미달.
5. **휴식 시간 포맷 미흡**: 150초 등의 원시 초 단위가 비정상적으로 표기됨.

---

## 2. design_agent 해결 가이드
- **iPhone 15 Pro Max 물리 스펙**:
  - 해상도: `430px × 932px` (19.5:9 종횡비)
  - 코너 반경: `rounded-[55px]`
  - Dynamic Island: `w-[126px] h-[37px] rounded-[20px]`, 상단 마진 11px
  - Safe Area Insets: Top `59px`, Bottom `34px`
  - Home Indicator: `w-[140px] h-[5px] rounded-full`, 하단 마진 8px
- **레이아웃**:
  - `isMobileView` 시 1열 레이아웃 강제. 타이틀에 `whitespace-nowrap`, `break-keep` 부여.
  - 통계 카드는 모바일에서 2열 그리드(`grid-cols-2 w-full`)로 배치.
  - `TdsBottomCTA`에 `isSimulator` 프로퍼티 추가하여 프레임 내부 sticky 도킹.
  - 휴식 시간 포맷터(`formatRestTime(150)` ➡️ `"휴식 2분 30초"`) 및 TDS Badge 적용.

---

## 3. qa_agent 검증 및 룰 개정 방침
- **원인 반성**: 정적 빌드(`npm run build`)와 Epley 계산 수식만 검사하고, 런타임 CSS 스태킹 컨텍스트와 브라우저 미디어 쿼리 누수를 자동 감지하지 못함.
- **QA 에이전트 행동 지침 개정**:
  - `iPhone 15 Pro Max 430px × 932px` 시뮬레이터 뷰포트 기준 검증 의무화.
  - 상단 Safe Area 59px 침범 여부 점검.
  - 모바일 내부 `sm:`, `md:` 미디어쿼리 누수 및 단어 쪼개짐(Squish) 차단.
  - 고정 플로팅 요소(`fixed`)의 시뮬레이터 프레임 탈출 방지.

---

## 4. 즉시 실행 작업
1. `TdsBottomCTA.tsx`에 `isSimulator` 지원 추가
2. `TodayWorkoutHeroSection.tsx` 텍스트 줄바꿈 방지, 통계 카드 2열 그리드, 휴식 시간 포맷터 적용
3. `App.tsx` 모바일 프레임을 iPhone 15 Pro Max 430×932 실측 규격으로 전면 개편
4. QA 에이전트 지침(`.agents/agents/qa-agent/agent.md`) 및 `AGENTS.md`, `fitpulse_rules.md` 개정
5. `npm.cmd run build` 통과 확인
