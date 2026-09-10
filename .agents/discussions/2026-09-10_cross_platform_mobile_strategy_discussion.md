# 에이전트 간 디스커션 기록 (2026-09-10)
## 주제: 안드로이드(Google Play) & 아이폰(App Store) 동시 지원을 위한 크로스 플랫폼 기술 전략 수립

### 1. 배경 및 사용자 요구사항
- **사용자 요청**:
  > "안드로이드 아이폰 모두다 가능하도록만들려면 어떤것이 좋을지 알아보고 보고서작성해줘"
- **핵심 과제**:
  - React 18 + Vite + Tailwind CSS 기반 TDS Mobile 웹앱으로 구축된 FitPulse의 자산을 바탕으로,
  - 1인 또는 소규모 개발팀 관점에서 최소 비용과 개발 공수로 양대 스토어(App Store, Play Store)에 동시 출시할 수 있는 최적의 아키텍처 및 헬스 앱 특화 요구사항 해결책 탐색.

---

### 2. 참여 에이전트 및 역할 분담
- **product_research_agent**:
  - PWA vs Capacitor vs React Native vs Flutter 4개 후보군 다각도 비교 (코드 재사용률, Time-to-Market, 스토어 심사 통과 가능성, 유지보수성).
  - 헬스장 환경 특화 요구사항 분석 (지하 헬스장 오프라인 영속성, 잠금화면/백그라운드 타이머 & 진동, 인스타 9:16 네이티브 공유, Apple HealthKit/Samsung Health 연동).
  - 3단계 점진적 실행 로드맵 수립 및 [`docs/CROSS_PLATFORM_STRATEGY.md`](file:///c:/Users/SSAFY/Desktop/project_heathcare/docs/CROSS_PLATFORM_STRATEGY.md) 작성.
- **devops_agent**:
  - Capacitor 6/7 기반 패키징 파이프라인 (Xcode SPM/CocoaPods, Android Gradle) 구성 방안.
  - GitHub Actions + Fastlane을 활용한 TestFlight 및 Google Play 내부 테스트 트랙 CI/CD 자동화 설계.
  - Apple App Store 가이드라인 4.2(Minimum Functionality) 리젝 회피를 위한 5대 필수 네이티브 플러그인(Local Notifications, Haptics, Camera, HealthKit, Network) 무장 전략 도출.
- **qa_agent**:
  - Web Native API (Web Audio, Canvas 2D, Web Notification)와 네이티브 플러그인의 1:1 어댑터 설계 무결성 검증.
- **docs_agent**:
  - 최상위 `README.md` 문서 인덱스 동기화 및 단일 진실 공급원(SSOT) 관리.

---

### 3. 디스커션 합의 결론 및 전략 (Consensus)
1. **최종 추천 기술**: **Capacitor 6 기반 네이티브 하이브리드 아키텍처**
   - **이유**: 기존 React/Vite/Tailwind 코드를 95% 이상 그대로 재사용하여 **1~2주 만에 양대 마켓 동시 론칭 가능**. React Native 대비 2~3개월의 개발 기간 및 수천만 원의 공수 절감.
   - **아키텍처 부합성**: FitPulse의 비즈니스 로직(Volume, Plate, Progression, InBody)이 이미 SOLID 원칙으로 DOM과 분리되어 있어 네이티브 플러그인과 즉각 연동 가능.
2. **핵심 문제 해결책**:
   - **백그라운드 타이머**: WebKit의 JS 동결을 우회하기 위해 `@capacitor/local-notifications`에 완료 타임스탬프를 사전 스케줄링하여 화면 잠금 상태에서도 OS 커널 레벨에서 사운드/진동 발생.
   - **인스타 공유**: 1080×1920 Canvas 렌더링 후 `@capacitor/filesystem` 및 `@capacitor/share`를 통해 OS 네이티브 공유 시트 호출.
   - **지하 헬스장**: `capacitor://localhost` 로컬 번들링 및 SQLite 스토리지로 100% 오프라인 작동 보장.
3. **실행 로드맵**:
   - Phase 1: Capacitor 6 패키징 & 양대 스토어 론칭 (1.5 ~ 2주)
   - Phase 2: 오프라인 SQLite 스토리지 & Apple HealthKit / Google Health Connect 연동 (3 ~ 4주)
   - Phase 3: MAU 10만+ 달성 시 필요 부분 점진적 React Native/네이티브 위젯 확장

---

### 4. 산출물
- [`docs/CROSS_PLATFORM_STRATEGY.md`](file:///c:/Users/SSAFY/Desktop/project_heathcare/docs/CROSS_PLATFORM_STRATEGY.md) (및 `doc/CROSS_PLATFORM_STRATEGY.md`)
- `README.md` 문서 허브 갱신
