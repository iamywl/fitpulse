# AGENTS.md - FitPulse Master Architecture & Agent Operational Guidelines

이 문서는 Antigravity 및 모든 전담 서브에이전트(`design-agent`, `qa-agent`, `product-research-agent`, `devops-agent` 등)가 본 프로젝트의 맥락, 기술 스택, 토스 디자인 시스템(TDS Mobile) 표준, 도메인 비즈니스 로직, SOLID 객체지향 표준 및 작업 프로토콜을 완벽히 이해하고 수행하도록 정의한 **단일 진실 공급원(Single Source of Truth)** 가이드라인입니다.

---

## 1. 프로젝트 개요 (Project Overview)
- **서비스 명**: FitPulse (토스 감성의 건강/헬스 기록 및 점진적 과부하 성장 분석 서비스)
- **디자인 철학**: **TDS Mobile (Toss Design System)** 기반 - "당연한 것을 더 쉽고 명확하게"
  - 싸구려 형광 볼트(#D4FF00, #CCFF00)를 완전히 걷어내고, 신뢰감 있고 눈이 편안한 **Toss Blue (`#3182F6`)** 및 세련된 TDS 시맨틱 컬러(Teal, Green, Red, Yellow, Elephant) 시스템을 적용합니다.
  - 여유로운 여백(Breathe Space), 부드러운 라운딩(`rounded-2xl`, `rounded-3xl`), 플로팅 화이트 카드, 친근한 대화형 마이크로카피("~했어요", "~해볼까요?", "오늘 할 운동이에요")를 일관되게 유지합니다.
- **핵심 가치**:
  1. **요일별 분할 루틴 스케줄러 (Weekly Split Routine Planner)**: 사용자의 훈련 분할(월~일)을 시각화하고 당일 예정된 종목과 세트를 원클릭으로 시작.
  2. **종목별 세트 및 무게(kg)/반복수(reps) 간편 기입**: 헬스장에서 한 손으로 간편하게 조작할 수 있는 퀵 중량 칩(`-2.5`, `+2.5`, `+5`)과 반복수 스테퍼, 완료 체크 및 실시간 총 볼륨/1RM 즉시 연산.
  3. **깃허브 잔디 히트맵 (Activity Heatmap)**: 16주간의 출석 및 세션 볼륨 강도를 차분한 5단계 토스 블루 그리드로 시각화 ("차곡차곡 쌓인 내 운동 기록").
  4. **지난 세션 대비 총 볼륨 증감 비교**: 동일 부위 직전 세션 대비 `+kg` 및 `+%` 점진적 과부하(Progressive Overload) 달성률 즉각 피드백 ("지난번보다 X% 더 들었어요! 대단해요").
  5. **인바디 기반 맞춤 중량 추천기**: 체중, 골격근량, 체지방률, 경력 슬라이더 조절 시 3대 운동(SBD) 및 주요 종목의 웜업/본세트/스트렝스 중량 산출 ("내 몸에 딱 맞는 무게를 추천받아 보세요").
  6. **디자인 MVP 및 UI/UX 점검용 모바일 시뮬레이터 (390px~420px)**: 실제 스마트폰 환경(Apple iPhone / Android)과 데스크톱 와이드 뷰를 원클릭으로 전환하여 터치감과 시인성 사전 점검.
  7. **크로스 플랫폼 도커 (Docker)**: macOS(Apple Silicon/Intel)와 Windows(WSL2/Docker Desktop) 어디서나 `docker-compose up`으로 원클릭 구동.

---

## 2. 토스 디자인 시스템 (TDS Mobile) 색채 및 토큰 규격

### 2.1 토스 컬러 팔레트 (TDS Mobile Specification)
| 토큰 명칭 | HEX 코드 | 디자인 의도 및 적용처 |
| :--- | :--- | :--- |
| **Primary (Toss Blue)** | `#3182F6` (Hover `#1B64DA`) | 토스를 상징하는 대표 컬러. 주 액션 CTA 버튼, 활성 탭, 주요 차트 선, 1RM 강조. |
| **Secondary Accent (Teal)** | `#00BFA5` | 볼륨 막대 차트, 휴식 타이머 보조 배지, 보조 지표. |
| **Danger / Warning (Red)** | `#F04452` | 디로드 경고, 휴식 타이머 3초 전 카운트다운, 기록 삭제 액션. |
| **Success / Done (Green)** | `#04B014` | 세트 완료 체크, 오늘 운동 달성 축하 뱃지. |
| **Caution / Streak (Yellow)** | `#FFB300` | 연속 운동 스트릭(🔥 Flame), PR 최고 기록 배지, 웜업 세트 구분. |
| **Neutral / Elephant** | `#6B7684` | 보조 설명 텍스트, 카테고리 태그(Weak). |

### 2.2 배경 및 표면 토큰 (Surfaces)
| 모드 | 베이스 캔버스 (`bg-base`) | 카드 표면 (`bg-card`) | 서브 카드 (`bg-subcard`) | 테두리 (`border`) |
| :--- | :--- | :--- | :--- | :--- |
| **라이트 테마** | `#F2F4F6` (TDS Calm Light) | `#FFFFFF` (Floating Card) | `#F8F9FA` | `#F2F4F6` / `#E5E8EB` |
| **다크 테마** | `#101012` (TDS Dark Base) | `#1C1C1E` (Dark Elevated) | `#252528` | `#2C2C2E` / `#333D4B` |

### 2.3 공통 TDS 컴포넌트 라이브러리 (`src/components/tds/`)
1. **`TdsBadge`**:
   - TDS Mobile 규격의 뱃지. `size` ('xsmall' | 'small' | 'medium' | 'large'), `variant` ('fill' | 'weak'), `color` ('blue' | 'teal' | 'green' | 'red' | 'yellow' | 'elephant').
   - 정보 위계를 위해 보조 지표에는 반드시 `variant="weak"`을 사용.
2. **`TdsButton`**:
   - `size` ('small' | 'medium' | 'large'), `variant` ('primary' | 'secondary' | 'weak' | 'danger'), `fullWidth`.
   - Apple HIG / TDS 터치 반응(`active:scale-[0.98]`) 내장.
3. **`TdsBottomCTA`**:
   - 엄지손가락 조작 영역(Thumb Zone)을 위한 하단 플로팅 56px 고정 바. 모바일 뷰포트에서 즉시 세트 완료/시작 가능.
4. **`TdsSegmentedControl`**:
   - 부드러운 알약(Pill) 형태의 토글 스위치. 모드 전환 및 서브 탭에 적용.
5. **`TdsStepper`**:
   - 44px 원형 +, - 버튼과 중앙 수치 표기, 퀵 증감 칩이 결합된 조작기.

---

## 3. 모바일 뷰포트 인체공학 & iPhone 15 Pro Max 물리 표준 (Visual Regression Standards)

스마트폰 프레임 내부에서 발생하는 Dynamic Island 침범, 미디어 쿼리 누수로 인한 텍스트 쪼개짐, 플로팅 버튼 뷰포트 탈출을 원천 방지하기 위해 에이전트는 다음 규칙을 반드시 지켜야 합니다:

1. **iPhone 15 Pro Max 표준 물리 규격**:
   - 논리 해상도: **430pt × 932pt** (19.5:9 종횡비), 모서리 곡률 **55pt (`rounded-[55px]`)**.
   - Safe Area Top: **최소 59px** (Dynamic Island 높이 37px + 마진 11px + 여백) 확보. 상단 헤더, 배지, 날짜 텍스트가 다이나믹 아일랜드에 가려지지 않도록 상단 패딩(`pt-[59px]` 이상) 의무화.
   - Safe Area Bottom: **최소 34px** (Home Indicator) 확보. 하단 탭 및 액션 바가 홈바와 겹치지 않도록 안전 영역 분리.
2. **미디어 쿼리 누수(Media Query Leakage) 및 Anti-Wrapping 원칙**:
   - 데스크톱 브라우저에서 모바일 시뮬레이터 구동 시 Tailwind `sm:`(640px+), `md:`(768px+)가 430px 프레임 내부에 오작동하지 않도록 `isMobileView` 시 1열(1-Column) 레이아웃을 엄격히 강제합니다.
   - 한국어 종목명과 헤드라인(`오늘 할 운동이에요`, `바벨 벤치프레스`) 및 숫자/단위(`80kg`, `10회`, `4세트`)는 `whitespace-nowrap`과 `break-keep`으로 처리하여 단어가 세로로 쪼개지는 현상("오늘 할 운\n동이에요")을 원천 방어합니다.
   - 긴 텍스트 컨테이너에는 `min-w-0`와 `truncate`를 선언합니다.
3. **고정 플로팅 요소 프레임 격리 (Fixed Containment)**:
   - `TdsBottomCTA` 및 플로팅 모달 등 `position: fixed` 요소가 시뮬레이터 프레임을 탈출하여 브라우저 전체 창 바닥에 렌더링되지 않도록 `isSimulator` 플래그를 통한 프레임 내부 도킹(`sticky bottom-0`)을 의무화합니다.
4. **엄격한 터치 타겟 (Apple HIG 기준 44pt+)**:
   - 모든 버튼 및 스테퍼 탭 영역은 최소 **44 × 44px (`min-h-[44px]`)**를 보장합니다.
5. **수치/시간 표기 인지 공학**:
   - 60초 이상의 휴식 시간은 `150초`와 같이 원시 숫자로 표기하지 않고 반드시 **`2분 30초`** 형태로 `TdsBadge`에 담아 표시합니다.
6. **토스식 리스트 아이템 글자 잘림(Truncation) 금지 (TDS BoardRow 2행 표준)**:
   - 모바일 리스트 카드에서 4~5개 요소를 1행에 몰아넣어 본질적인 종목명이 `스...`, `사..`처럼 1글자만 남고 잘리는 현상을 엄격히 금지합니다.
   - TDS Mobile 표준 2행 구조를 적용: 1행(체크박스 + 순번 + **운동명 전체 `break-keep`** + 액션 버튼), 2행(부위 뱃지 + 정규화된 세트/반복 정보 + 권장 휴식 시간).
   - 7-Day 요일 탭의 2글자 한글(`하체`, `가슴`, `어깨` 등)이 `하...`로 잘리지 않도록 2글자 정규화 헬퍼와 여유 공간을 보장합니다.
   - 모든 `TdsButton`과 `TdsBadge`에 `whitespace-nowrap flex-shrink-0`을 선언하여 찌그러짐을 방지합니다.
7. **오늘 운동 완료(Completion) 상태 시각적 변화 의무화**:
   - 완료 저장 시 헤더가 "오늘 운동을 멋지게 완료했어요! 🎉" 상태로 즉시 전환되고 총 볼륨, 완주 종목, 완료 세트 요약 카드 및 성장 분석 링크를 제공합니다.
8. **16주 히트맵 샘플 데이터 및 신규 유저 빈 화면 무결성**:
   - 샘플 데이터는 16주(112일)간 50여 회의 현실적 세션으로 5단계 토스 블루 잔디를 풍성하게 가득 채웁니다.
   - 기록 0개(신규 유저) 상태에서도 오류(NaN) 없이 친절한 엠프티 스테이트 안내 배너와 샘플 데이터 둘러보기 버튼을 제공합니다.
9. **원터치 휴식 타이머 프리셋**:
   - `[30초]`, `[1분]`, `[1분 30초]`, `[2분]`, `[3분]` 퀵 프리셋 칩을 제공하여 연타 없이 1탭으로 시간을 변경할 수 있어야 합니다.

---

## 4. SOLID 소프트웨어 설계 원칙 준수

| 원칙 | 구현 및 적용 기준 | 해당 소스 파일 |
|---|---|---|
| **S (Single Responsibility)** | 연산 로직과 UI 렌더링을 엄격히 분리. `VolumeService`는 1RM/볼륨 계산만, `InBodyService`는 체성분 및 추천 중량만, `RoutineService`는 요일별 루틴 관리만 전담. | `src/services/calculator/VolumeService.ts`<br>`src/services/calculator/InBodyService.ts`<br>`src/services/routine/RoutineService.ts` |
| **O (Open/Closed)** | 신규 운동 종목 및 부위별 계수는 기존 계산 엔진을 수정하지 않고 `registerExercise()`를 통해 런타임 확장 가능. | `src/services/calculator/InBodyService.ts` |
| **L (Liskov Substitution)** | `IStorageService` 인터페이스를 구현한 `LocalStorageService`는 추후 `IndexedDBStorageService`나 `ApiStorageService`로 코드 수정 없이 100% 대체 가능. | `src/services/storage/IStorageService.ts`<br>`src/services/storage/LocalStorageService.ts` |
| **I (Interface Segregation)** | 거대한 단일 모델 대신 목적별로 분리된 도메인 인터페이스 설계 (`IExerciseSet`, `IExerciseLog`, `IWorkoutSession`, `IInBodyData`, `IWeeklyRoutineDay`). | `src/models/fitness.ts`<br>`src/models/routine.ts` |
| **D (Dependency Inversion)** | 모든 컴포넌트와 비즈니스 로직은 구체적인 `localStorage` 호출 대신 추상화된 `IStorageService` 인터페이스에 의존. | `src/services/storage/IStorageService.ts` |

---

## 5. 핵심 도메인 규칙 및 알고리즘

### 5.1 총 볼륨 (Total Volume) 및 세트 기입 규칙
- **단일 세트 볼륨**: $\text{Volume} = \text{중량(kg)} \times \text{반복 수(reps)}$ (완료된 세트만 산입)
- **세션 총 볼륨**: $\text{Total Session Volume} = \sum (\text{weight} \times \text{reps})$
- **볼륨 증감율**: $\Delta \text{Volume (\%)} = \frac{V_{\text{curr}} - V_{\text{prev}}}{V_{\text{prev}}} \times 100$
- **휴식 타이머 및 오디오 알림 (Web Audio API)**:
  - 세트 완료 시 성공 딩동음(D5-A5) 재생 및 종목별 권장 휴식 타이머(90~120초) 자동 시작.
  - 잔여 3초 전 카운트다운 틱(E5) 및 종료 시 3연타 비프음(A5-C6) 발림.
  - 토스 스타일의 편안하고 깔끔한 HUD 인터페이스 유지.

### 5.2 1RM (Epley 공식)
$$\text{1RM} \approx \text{Weight} \times \left(1 + \frac{\text{Reps}}{30}\right) \quad (\text{단, } \text{reps} \le 10 \text{ 권장})$$

### 5.3 잔디 히트맵 (TDS Blue Activity Heatmap) 5단계
- **Level 0**: 0 kg (휴식일, `#E5E8EB` 라이트 / `#1C1C1E` 다크)
- **Level 1**: < 5,000 kg (가벼운 운동, `#D0E4FF` / `#162A45`)
- **Level 2**: 5,000 ~ 12,000 kg (적정 강도, `#84BAFF` / `#1E4273`)
- **Level 3**: 12,000 ~ 20,000 kg (고강도, `#3182F6` / `#2B66B8`)
- **Level 4**: > 20,000 kg (극한 볼륨, `#1B64DA` / `#3182F6` + Soft Blue Glow)

### 5.4 인바디 기반 추천 중량 알고리즘
- **제지방량 (FFM)**: $\text{FFM} = \text{Weight} \times (1 - \text{BodyFat} / 100)$
- **근육 충실도 (MF)**: $\text{MF} = \text{Skeletal Muscle Mass} / \text{Weight}$
- **훈련 추천 세트 중량 (2.5kg 바벨 원판 단위 반올림)**:
  - 웜업 (12 reps): 추정 1RM의 50%
  - 근비대 본세트 (8~10 reps): 추정 1RM의 72%
  - 스트렝스 (5 reps): 추정 1RM의 82%

---

## 6. 에이전트 작업 시 불변 원칙 (Non-Negotiable Rules)
1. **토스 디자인 철학 엄수**: 싸구려 형광 볼트(#D4FF00, #CCFF00) 사용을 영구 금지하며, Toss Blue(#3182F6)와 TDS Mobile 공식 토큰만 사용한다.
2. 모든 작업 시에는 에이전트 파일(`.agents/`)을 유지하고 서브에이전트 간 디스커션 기록(`.agents/discussions/`)을 남긴다.
3. 모든 UI/UX 컴포넌트는 모바일 시뮬레이터(390px)와 데스크톱 양쪽 모두에서 찌그러짐(Anti-Squish) 없이 완벽히 동작해야 한다.
4. 코드 수정 후에는 반드시 `npm run build`를 통과하여 타입 에러가 0건임을 보장해야 한다.
5. Docker 환경(Dockerfile, docker-compose.yml)은 macOS(Apple Silicon/Intel)와 Windows 양쪽에서 언제든 원클릭으로 구동 가능해야 한다.

---

## 7. Git 브랜치 전략 및 배포 운영 원칙 (Branching & Deployment Policy)
- **`develop` 브랜치 (Active Development & Dialogue)**:
  - 사용자와의 모든 일상적인 대화, 피처 개발, 버그 수정, 리팩토링은 반드시 **`develop` 브랜치**에서 진행한다.
  - 작업 완료 시 커밋 및 푸시는 기본적으로 `develop` 브랜치를 대상으로 수행한다.
- **`main` 브랜치 (Production / Deployment Only)**:
  - `main` 브랜치는 Netlify 실서비스 배포와 연동된 배포 전용 브랜치이다.
  - **사용자가 명시적으로 "배포해줘", "배포를 위해 머지해줘"라고 명령할 때만** `develop` 브랜치를 `main` 브랜치에 머지하고 푸시한다.
  - 사용자의 명시적인 배포 요청 없이는 절대로 `main` 브랜치에 직접 작업하거나 머지/푸시하지 않는다.
