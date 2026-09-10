# 에이전트 간 디스커션 기록 (2026-09-10)
## 주제: Phase 1 킬러 기능 구현, 문서화 전담 에이전트(docs-agent) 출범 및 README 전면 리뉴얼

### 1. 배경 및 사용자 요구사항
- **사용자 요청**:
  > "리드미도 싹다 수정하고 문서화시켜주고 문서화도 전담에이전트 만들어서 진행해줘"
  > "[Phase 1. 지금 당장 웹에서 구현 가능한 킬러 보완 (1~2일)]
  > 👉 1. '오운완(인스타 스토리)' 토스 감성 요약 카드 이미지 1클릭 다운로드 기능 (html2canvas / svg)
  > 👉 2. 덤벨/머신/바벨 커스텀 운동 종목 자유 등록 기능
  > 👉 3. 백그라운드 전환 시 웹 Web Notification(소리+진동 알림) 연동
  > 이런부분 기능 추가해줘"

---

### 2. 참여 에이전트 및 역할 분담
- **docs_agent (신규 수석 테크니컬 라이터 에이전트)**:
  - 최상위 `README.md`를 TDS Mobile 토큰 규격, 기능 투어, SOLID 5원칙, Docker, Git 브랜칭에 맞춰 전면 리뉴얼.
  - `docs/ARCHITECTURE.md` (계층형 클린 아키텍처 및 Web Native APIs 명세) 신규 작성.
  - `docs/FEATURES.md` (Phase 1 킬러 기능 5종 및 핵심 기능 명세) 신규 작성.
  - `docs/SPECIFICATION.md` v1.3.0 업데이트 및 `docs/ERD.md`에 `CUSTOM_EXERCISES` 엔티티 반영.
- **qa_agent**:
  - `WorkoutCardCanvasService`, `ExerciseLibraryService`, `WebNotificationService` 단위 테스트 및 빌드 검증 (`cmd /c "npm run build"` 0 error 통과).
- **design_agent**:
  - 인스타그램 스토리 9:16 (1080×1920) 캔버스 레이아웃, 오프블랙(#101012) + 토스 블루(#3182F6) 비주얼 계층 검수.
  - `CustomExerciseCreateModal` 및 `RestTimerModal`의 TDS Mobile 모달 표준 및 44px+ 터치 타겟 검증.
- **product_research_agent**:
  - 경쟁사(플랜핏, 헤비, 번핏) 대비 차별점 및 결핍 분석 문서(`docs/COMPETITIVE_ANALYSIS.md`) 기반 기능 기획.

---

### 3. 구현 세부 사항
1. **오운완 인스타 스토리 2D Canvas 다운로드 (`WorkoutCardCanvasService.ts`)**:
   - 외부 라이브러리(html2canvas) 의존 없이 순수 HTML5 2D Canvas API로 레티나 해상도(1080×1920) 이미지 1초 내 렌더링.
   - 메인 총 볼륨 메가 카드, 종목 수/세트 수/RPE 3열 메트릭, 완주 종목 상세 리스트, 토스 공식 슬로건 워터마크 자동 합성.
2. **커스텀 운동 종목 등록 및 라이브러리 연동 (`ExerciseLibraryService.ts`, `CustomExerciseCreateModal.tsx`)**:
   - 장비(바벨/덤벨/머신/케이블/맨몸), 목표 부위, 세부 자극 부위, 기본 세트/반복/휴식시간 영속화.
   - `ExerciseSetManager` 및 `RoutineBuilderModal`의 종목 선택 피커에서 원클릭 등록 및 즉시 선택 지원.
3. **백그라운드 웹 푸시 알림 & 햅틱 진동 (`WebNotificationService.ts`, `RestTimerModal.tsx`)**:
   - W3C Web Notification API 연동으로 탭이 백그라운드로 전환되거나 화면이 잠겨도 휴식 완료 푸시 알림 발송.
   - Vibration API (`[250, 120, 250, 120, 500]`) 햅틱 진동 피드백.
   - 모달 헤더에 알림 허용 토글 버튼 배치.

---

### 4. 검증 결과
- `cmd /c "npm run build"`: TypeScript strict 모드 빌드 정상 완료 (0 errors).
- `develop` 브랜치 커밋 및 원격 푸시 준비 완료.
