# FitPulse Agent Rules & Standards

이 문서는 Antigravity 에이전트 시스템이 상시 로드하여 준수하는 핵심 프로젝트 규칙입니다.

## 1. 아키텍처 원칙 (SOLID)
- `VolumeService`, `InBodyService`, `RoutineService`에 연산 비즈니스 로직을 격리한다.
- UI 컴포넌트 내부에 복잡한 1RM, 볼륨 계산, 인바디 공식을 하드코딩하지 않는다.
- 데이터 스토리지는 `IStorageService` 추상화 인터페이스를 경유한다.

## 2. 디자인 및 색채 시스템 (TDS Mobile - Toss Design System)
- **핵심 철학**: "당연한 것을 더 쉽고 명확하게" - 미니멀리즘, 직관성, 눈의 편안함.
- **형광색 영구 퇴출**: 싸구려 형광 볼트(`#D4FF00`, `#CCFF00`) 사용을 영구 금지한다.
- **메인 컬러**: `Toss Blue` (`#3182F6`, Hover `#1B64DA`). 주 액션 버튼, 활성 탭, 1RM 강조에 사용.
- **시맨틱 컬러**: Teal (`#00BFA5`), Green (`#04B014`), Red (`#F04452`), Yellow (`#FFB300`), Elephant (`#6B7684`).
- **서피스 & 캔버스**:
  - 라이트 모드: 베이스 캔버스 `#F2F4F6`, 플로팅 카드 `#FFFFFF`, 테두리 `#F2F4F6` / `#E5E8EB`.
  - 다크 모드: 베이스 캔버스 `#101012`, 플로팅 카드 `#1C1C1E`, 테두리 `#2C2C2E` / `#333D4B`.
- **공통 컴포넌트**: `src/components/tds/`의 `TdsBadge`, `TdsButton`, `TdsBottomCTA`, `TdsListRow`, `TdsSegmentedControl`, `TdsStepper`를 재사용한다.
- **마이크로카피**: 기계적인 안내문 대신 친근한 대화형 마이크로카피("~했어요", "~해볼까요?", "오늘 할 운동이에요")를 사용한다.

## 3. 모바일 뷰포트 인체공학 & iPhone 15 Pro Max 표준 (Anti-Squish & Safe Area)
- **최신 플래그십 기준**: iPhone 15 Pro Max (430px × 932px, 19.5:9 화면비)를 최우선 모바일 기준으로 설정한다.
- **Safe Area Inset 보장**:
  - Safe Area Top: **최소 59px** (Dynamic Island 높이 35px + 여백) 확보하여 컨텐츠 상단 잘림 및 겹침을 방지한다.
  - Safe Area Bottom: **최소 34px** (Home Indicator) 확보하여 하단 탭 및 CTA 버튼 가림을 방지한다.
- **미디어 쿼리 누수(Media Query Leakage) 방지**:
  - 데스크톱에서 모바일 시뮬레이터 구동 시 Tailwind `sm:`, `md:`가 발동되어 430px 내부 레이아웃이 2열로 깨지는 현상을 차단한다.
  - `isMobileView` 프롭이 활성화되면 부모 윈도우 크기와 상관없이 강제 1열(1-Column) 모바일 레이아웃을 렌더링하고, 종목명/텍스트에 `whitespace-nowrap`과 `break-keep-all`을 적용하여 세로 쪼개짐("오늘 할 운\n동이에요")을 원천 금지한다.
- **Viewport 탈출 방지 (Fixed Containment)**:
  - 시뮬레이터 환경에서 `position: fixed` 요소(`TdsBottomCTA` 등)가 브라우저 바닥으로 튕겨나가지 않도록 프레임 내부 격리(`sticky` 또는 absolute/transform 바인딩)를 보장한다.
- 모든 주요 터치 타겟(버튼, 닫기, 스테퍼)은 Apple HIG 기준 최소 44 × 44px 터치 영역을 확보한다.
- **리스트 아이템 글자 잘림(Truncation) 금지**:
  - 모바일 리스트 카드에서 4~5개 요소를 1줄에 몰아넣어 본질적인 종목명이 `스...`, `사..`처럼 1글자만 남고 잘리는 현상을 엄격히 금지한다.
  - TDS Mobile 표준 2행(BoardRow) 구조를 적용하여 종목명은 `break-keep`으로 100% 온전히 표기하고, 세트수/부위/휴식시간은 2행에 분리 배치한다.
  - `TdsButton`과 `TdsBadge`에 `whitespace-nowrap flex-shrink-0`을 선언하여 찌그러짐을 방지한다.
- **오늘 운동 완료 피드백 의무화**:
  - 운동 완료 시 상단 HUD가 축하 상태("오늘 운동을 멋지게 완료했어요! 🎉", Green 뱃지)로 전환되고 총 볼륨, 완주 종목, 완료 세트 요약 카드를 반드시 제공한다.
- **16주 히트맵 및 신규 유저 엠프티 스테이트 무결성**:
  - 샘플 데이터는 16주(112일)간 50여 회의 현실적 세션으로 5단계 토스 블루 잔디를 가득 채워야 한다.
  - 운동 기록이 0개일 때도 오류(NaN) 없이 친절한 Toss 안내 문구와 샘플 데이터 둘러보기 버튼을 제공해야 한다.
- **휴식 타이머 원터치 프리셋**:
  - `[30초]`, `[1분]`, `[1분 30초]`, `[2분]`, `[3분]` 퀵 프리셋 칩을 제공하여 연타 없이 1탭으로 설정할 수 있어야 한다.

## 4. 크로스 플랫폼 도커 표준 (Docker)
- Mac (Apple Silicon arm64 & Intel) 및 Windows (WSL2 & Docker Desktop) 어디서나 `docker-compose up`으로 빌드 및 구동되어야 한다.

## 5. 품질 검증 의무 (Verification)
- 코드를 변경한 뒤에는 항상 `npm run build`를 실행하여 컴파일 에러 0건임을 보장한다.
- 모든 작업 시에는 에이전트 파일을 갱신하고 서브에이전트 간 디스커션 기록을 남긴다.
