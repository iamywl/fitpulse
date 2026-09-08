# FitPulse Agent Rules & Standards

이 문서는 Antigravity 에이전트 시스템이 상시 로드하여 준수하는 핵심 프로젝트 규칙입니다.

## 1. 아키텍처 원칙 (SOLID)
- `VolumeService`, `InBodyService`, `RoutineService`에 연산 비즈니스 로직을 격리한다.
- UI 컴포넌트 내부에 복잡한 1RM, 볼륨 계산, 인바디 공식을 하드코딩하지 않는다.
- 데이터 스토리지는 `IStorageService` 추상화 인터페이스를 경유한다.

## 2. 디자인 및 색채 시스템 (Pantone® 2288 C Volt)
- 메인 액센트: `Pantone 2288 C Volt` (`#CCFF00` / `#D4FF00`) + 블랙 텍스트 (15.6:1 ~ 18.2:1 극대비).
- 서브 액센트: `Pantone 2995 C Cyan` (`#38BDF8`), 디로드 경고: `Pantone 1788 C Crimson` (`#FF334B`).
- 베이스 배경: `Obsidian True Carbon` (`#09090B`, `#111115`, `#18181F`, 테두리 `#272732`).
- 어둡거나 칙칙한 슬레이트/올리브 톤을 사용하지 않는다.

## 3. 모바일 뷰포트 인체공학 (Anti-Squish Rule)
- 390px 스마트폰 프레임 내부에서 텍스트 수직 쪼개짐(`바\n벨\n벤\n치...`)을 절대 허용하지 않는다.
- `isMobileView` 시 1열(1-Column) 전용 카드를 렌더링하고, 종목명과 단위에는 `whitespace-nowrap`을 적용한다.
- 모든 터치 타겟은 Apple HIG 기준 최소 44 × 44px를 확보한다.

## 4. 품질 검증 의무 (Verification)
- 코드를 변경한 뒤에는 항상 `npm run build`를 실행하여 컴파일 에러 0건임을 보장한다.
