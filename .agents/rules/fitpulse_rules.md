# FitPulse Agent Rules & Standards

이 문서는 Antigravity 에이전트 시스템이 상시 로드하여 준수하는 핵심 프로젝트 규칙입니다.

## 1. 아키텍처 원칙 (SOLID)
- `VolumeService`, `InBodyService`, `RoutineService`에 연산 비즈니스 로직을 격리한다.
- UI 컴포넌트 내부에 복잡한 1RM, 볼륨 계산, 인바디 공식을 하드코딩하지 않는다.
- 데이터 스토리지는 `IStorageService` 추상화 인터페이스를 경유한다.

## 2. 디자인 및 색채 시스템 (Pantone® 2288 C Volt & Clean White)
- 다크 테마: `Obsidian True Carbon` (`#09090B`, `#111115`, `#18181F`, 테두리 `#272732`) + `Pantone 2288 C Volt` (`#CCFF00` / `#D4FF00`)로 15.6:1~18:1 극대비 확보.
- 라이트 테마: `Sport Crisp Clean White` (`#F8FAFC`, `#FFFFFF`, 테두리 `#E2E8F0`) + `Slate 900` (`#0F172A`) 텍스트 (16.1:1 AAA 대비).
- 라이트 모드 주의사항: 흰색 배경 위에서는 Volt 단독 텍스트 절대 금지(대비 1.2:1). **Volt 배경 뱃지 + 블랙 텍스트** 또는 **Deep Volt Lime(`#3F6212` / `#4D7C0F`, 7.4:1)** 사용.
- 서브 액센트: `Pantone 2995 C Cyan` (`#38BDF8` / `#0284C7`), 디로드 경고: `Pantone 1788 C Crimson` (`#FF334B` / `#DC2626`).

## 3. 모바일 뷰포트 인체공학 & 타이포그래피 황금 비율 (Anti-Squish & Proportion)
- 390px 스마트폰 프레임 내부에서 텍스트 수직 쪼개짐(`바\n벨\n벤\n치...`)을 절대 허용하지 않는다.
- `isMobileView` 시 1열(1-Column) 전용 카드를 렌더링하고, 종목명과 단위에는 `whitespace-nowrap`을 적용한다.
- 수치(JetBrains Mono)와 단위(`kg`, `회`)는 반드시 `flex items-baseline`으로 정렬하며 단위 크기는 약 50~60% 크기를 유지한다.
- 퀵 중량 칩(`-2.5`, `+2.5`, `+5`)과 반복수 스테퍼는 최소 32px~36px 이상의 엄지 터치 영역을 확보한다.
- 7-Day 스트립 바는 TODAY 뱃지가 프레임 상단에 잘리지 않도록 안전 상단 패딩을 보장한다.

## 4. 품질 검증 의무 (Verification)
- 코드를 변경한 뒤에는 항상 `npm run build`를 실행하여 컴파일 에러 0건임을 보장한다.
