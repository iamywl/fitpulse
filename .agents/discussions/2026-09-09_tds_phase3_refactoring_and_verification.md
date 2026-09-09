# TDS Mobile Phase 3 Refactoring & Verification Discussion

**일자**: 2026-09-09
**참여자**: `design_agent` (수석 UI/UX 디자인), `qa_agent` (수석 QA 엔지니어링), `devops_agent`, 총괄 오케스트레이터

---

## 1. 디스커션 안건
1. 잔여 형광색 (`#D4FF00`, `#CCFF00`) 69건 전수 치환 계획 및 TDS Mobile 컴포넌트(`src/components/tds/`) 전면 적용
2. `ExerciseAnalyticsSection`, `InBodyRecommenderSection`, `RestTimerModal`, `RoutineBuilderModal`, `WorkoutDetailModal`, `WorkoutLogModal`, `ExerciseSetManager`, `WeeklyRoutineSection` 리팩토링
3. 모바일(390px) 뷰포트 기준 바텀시트 / 중앙 모달 적응형 레이아웃 및 터치 타겟(44px) 인체공학 적용
4. `npm.cmd run build` 타입 무결성 및 형광색 0건 전수 검증

---

## 2. 디자인 에이전트 (`design_agent`) 의견 요약
- **ExerciseAnalyticsSection**:
  - 대화형 타이틀: `"운동별로 얼마나 성장했는지 볼까요?"` + 서브 카피 `"꾸준히 기록하면 1RM 추정치와 볼륨이 차트로 쌓여요"`
  - 차트 색상: Toss Blue (`#3182F6`) 선, TDS Teal (`#00BFA5`) 막대, 점유 반경 6px.
  - 지표 카드: `TdsBadge` (`variant="weak"`) 적용.
- **InBodyRecommenderSection**:
  - 대화형 타이틀: `"내 몸에 딱 맞는 무게를 추천받아 보세요"` (토스 신용/대출 진단 룩).
  - 슬라이더: `accent-[#3182F6]` 및 `TdsSegmentedControl`.
  - 세트별 추천 카드: `TdsBadge` (`variant="weak"` color `yellow`/`blue`/`red`).
- **RestTimerModal**:
  - 카피: `"휴식 시간"`, `"{secondsLeft}초 동안 숨 고르고 쉴게요 🧘"`.
  - 원형 타이머: Toss Blue (`#3182F6`), 경고 시 Rose Red (`#F04452`).
  - 버튼: `TdsButton` (`primary`, `weak`).
- **Modal 공통**:
  - 모바일 바텀시트 + 데스크톱 팝업 듀얼 레이아웃, `TdsButton`과 `TdsBadge` 전면 적용.

---

## 3. QA 에이전트 (`qa_agent`) 의견 요약
- 잔여 형광색 코드 전수 조사 결과: 8개 파일 총 69건 검출.
- 각 파일별 치환 목표:
  - `RoutineBuilderModal.tsx` (14건)
  - `ExerciseAnalyticsSection.tsx` (7건)
  - `InBodyRecommenderSection.tsx` (16건)
  - `ExerciseSetManager.tsx` (11건)
  - `WeeklyRoutineSection.tsx` (11건)
  - `WorkoutLogModal.tsx` (7건)
  - `RestTimerModal.tsx` (4건)
  - `WorkoutDetailModal.tsx` (3건)
- 컴파일 무결성: `TdsBadge`, `TdsButton` Props strict 타입 일치 확인.
- 모바일 인체공학: 바텀시트, 닫기 버튼 44px 터치 면적, `active:scale-[0.98]` 햅틱 반응.

---

## 4. 합의된 실행 계획
- 상기 8개 파일 순차 리팩토링 진행.
- 모든 파일에서 `#D4FF00` 및 `#CCFF00` 완전 제거 (0건 확인).
- `npm.cmd run build` 실행 및 최종 검증.
