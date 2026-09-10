# 에이전트 간 디스커션 기록 (2026-09-10)
## 주제: MAU 100명 기준 100% 무료($0) 배포 및 무중단 운영 전략 수립

### 1. 배경 및 사용자 요구사항
- **사용자 요청**:
  > "무료로 배포 및 운영하고싶은데 방법없을까?"
  > "MAU 100명정도를 고려해서"
- **핵심 과제**:
  - 초기 테스터 및 지인 100명이 매일 운동을 기록하는 환경에서 서버비, 호스팅비, 스토어 등록비 지출 0원 달성.

---

### 2. 리소스 및 트래픽 분석 (devops_agent, qa_agent)
- FitPulse 빌드 크기: 약 221 KB (Gzip).
- 100명 × 월 30회 방문 = 월 3,000회 세션.
- 월 소모 대역폭: 캐싱 감안 시 **약 200MB ~ 660MB / 월** (1GB 미만).
- Netlify 무료 티어: **월 100GB 제공** -> MAU 100명 사용량은 **전체 무료 한도의 0.66%에 불과** (150배 여유).
- Cloudflare Pages 무료 티어: **대역폭 완전 무제한 ($0)**.
- 데이터베이스: 순수 클라이언트 LocalStorage로 서버 비용 $0, 클라우드 동기화 필요 시 Supabase 무료 티어(50,000 MAU, 500MB)로 영구 무료.

---

### 3. 아이폰 & 안드로이드 스토어 등록비 0원 해결 (product_research_agent)
- **아이폰 (iOS Safari)**: [공유] -> [홈 화면에 추가]로 브라우저 주소창 없는 100% 네이티브 전체화면 구동 (개발자 계정 $99/년 절약).
- **안드로이드**: PWA WebAPK 자동 설치 배너 연동 및 APK 직접 배포 ($25 등록비 절약).

---

### 4. 산출물
- [`docs/ZERO_COST_OPERATIONS_GUIDE.md`](file:///c:/Users/SSAFY/Desktop/project_heathcare/docs/ZERO_COST_OPERATIONS_GUIDE.md) (및 `doc/ZERO_COST_OPERATIONS_GUIDE.md`)
- `README.md` 문서 인덱스 갱신
