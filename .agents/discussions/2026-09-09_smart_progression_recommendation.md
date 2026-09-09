# 에이전트 간 디스커션 기록 (2026-09-09)
## 주제: 과거 누적 볼륨 및 실시간 피로도(RPE) 기반 다음 세트 무게/반복수/쉬는시간 스마트 추천 엔진 구현

### 1. 배경 및 사용자 요구사항
- **사용자 피드백**: "이런거 제대로 구현되있는 앱이 하나도 없어요. 이때까지 했던 볼륨기반으로 다음 횟수랑 무게 쉬는시간 추천해주는거 있으면 좋을듯합니다. 그리고 개발진행해주세요 우린애자일하게 움직일겁니다."
- **목표**: 
  - 과거 세션의 누적 볼륨(Progressive Overload)과 실시간 세트 피로도(RPE)를 조합하여, 다음 세트에 필요한 **목표 중량(kg, 2.5kg 단위)**, **목표 반복수(reps)**, **권장 휴식시간(초)**을 정밀 산출.
  - 세트 기록 화면(`ExerciseSetManager`) 및 휴식 타이머(`RestTimerModal`)에 토스 스타일로 직관적 노출 및 원클릭 세트 반영.

---

### 2. 아키텍처 및 SOLID 설계 결정
1. **Single Responsibility Principle (SRP)**:
   - 신규 연산 클래스 `ProgressionRecommendationService.ts` 분리.
   - 볼륨 계산 및 Epley 1RM은 기존 `VolumeService.ts` 활용, 피로도 및 점진적 과부하 알고리즘은 추천 서비스 전담.
2. **Interface Segregation Principle (ISP)**:
   - `models/fitness.ts`에 `INextSetRecommendation` 인터페이스 신설:
     - `targetWeight`, `targetReps`, `recommendedRestSeconds`, `reason`, `statusBadge`, `statusText`, `expectedSetVolume`, `restFormatted`.
3. **UI/UX (TDS Mobile 표준 준수)**:
   - `ExerciseSetManager.tsx`: 상단에 `볼륨 기반 스마트 세트 & 휴식 추천` 카드 배치.
   - 원클릭 `[추천으로 다음 세트 추가]`, `[미완료 세트에 반영]` 및 세트 카드별 `[추천]` 칩 지원.
   - `RestTimerModal.tsx`: 세트 완료 시 권장 휴식시간 자동 세팅 및 타이머 내부에서 다음 세트 목표 스펙 실시간 배너 제공.

---

### 3. 검증 결과
- `cmd /c "npm run build"` -> TypeScript 컴파일 에러 0건, 번들링 3.51초 완료.
- Netlify 자동 배포 트리거 준비 완료.
