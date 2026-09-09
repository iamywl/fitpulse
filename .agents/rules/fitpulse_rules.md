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

## 3. 모바일 뷰포트 인체공학 & 타이포그래피 황금 비율 (Anti-Squish & Proportion)
- 390px 스마트폰 프레임 내부에서 텍스트 수직 쪼개짐(`바\n벨\n벤\n치...`)을 절대 허용하지 않는다.
- `isMobileView` 시 1열(1-Column) 전용 카드를 렌더링하고, 종목명과 단위에는 `whitespace-nowrap`을 적용한다.
- 수치와 단위(`kg`, `회`)는 반드시 `flex items-baseline`으로 정렬하며 단위 크기는 약 50~60% 크기를 유지한다.
- 모든 주요 터치 타겟(버튼, 닫기, 스테퍼)은 Apple HIG 기준 최소 44 × 44px 터치 영역을 확보한다.
- 7-Day 스트립 바는 오늘 뱃지가 프레임 상단에 잘리지 않도록 안전 상단 패딩을 보장한다.

## 4. 크로스 플랫폼 도커 표준 (Docker)
- Mac (Apple Silicon arm64 & Intel) 및 Windows (WSL2 & Docker Desktop) 어디서나 `docker-compose up`으로 빌드 및 구동되어야 한다.

## 5. 품질 검증 의무 (Verification)
- 코드를 변경한 뒤에는 항상 `npm run build`를 실행하여 컴파일 에러 0건임을 보장한다.
- 모든 작업 시에는 에이전트 파일을 갱신하고 서브에이전트 간 디스커션 기록을 남긴다.
