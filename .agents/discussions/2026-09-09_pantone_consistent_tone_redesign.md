# FitPulse 디자인 전면 재검토 및 팬톤 일관 톤앤매너 재정의 보고서

- **일시**: 2026-09-09
- **사용자 핵심 피드백**:
  1. *"디자인은 난 전면재검토를 요청해 형광색? 너무짜쳐 감성이없어"*
  2. *"팬턴색공간기반으로 색톤을 일정하게 가져가고"*
- **참여 에이전트**: `design_agent`, `product_research_agent`, `qa_agent`

---

## 1. 기존 형광 볼트(#D4FF00) 반성 및 문제 진단
- **형광 조끼/스톱워치 기시감**: 쨍한 형광색은 90년대 체육관이나 공사현장 안전조끼를 연상시켜 '싸구려 헬스앱' 같은 인상을 줌.
- **감성 부재**: 2030 운동인들이 추구하는 "오운완" 인스타그램 감성, Apple Fitness / Whoop 4.0 같은 콰이어트 럭셔리(Quiet Luxury) 및 미니멀 테크 트렌드와 정면 충돌.
- **시각 피로도**: OLED 다크 화면에서 극단적 네온 글로우로 인해 고중량 훈련 중 안구 피로감 유발.

---

## 2. 팬톤 색공간(Pantone Color Space) 기반 일관된 톤앤매너(Tone-on-Tone) 설계안

### 🏆 [컨셉 1: 강력 추천] **Pantone Stealth Titanium & Ceramic Amber** (Apple Watch Ultra & Whoop 감성)
- **Base Surface**: `Pantone Black 6 C` (`#0C0D11`)
- **Card Surface**: `Pantone Cool Gray 11 C` (`#14161F` / `#1B1E2B`)
- **Border Hairline**: `Pantone 433 C` (`rgba(255,255,255,0.08)` / `#252938`)
- **Primary Hero (Today/CTA)**: `Pantone 11-0601 TPG Bright White` (`#F8FAFC` 소프트 화이트 플레이트 + 블랙 볼드)
- **Signature Accent**: `Pantone 16-1364 TCX Vibrant Orange` (`#F97316` 세라믹 울트라 오렌지 포인트)
- **Heatmap (잔디)**: 흑요석 카본 $\rightarrow$ 딥 그래파이트 $\rightarrow$ 쿨 슬레이트 $\rightarrow$ 티타늄 화이트 펄 (모노크롬 계조)

### 🌿 [컨셉 2] **Pantone Muted Sage & Sand** (Oura Ring & Lululemon 감성)
- **Base Surface**: `Pantone 19-0414 TCX Forest Night` (`#0E110F`)
- **Card Surface**: `Pantone 19-0508 TCX Peat` (`#141A16`)
- **Primary Hero**: `Pantone 14-0115 TCX Muted Sage` (`#84A98C` 차분한 세이지 올리브)
- **Sub Accent**: `Pantone 14-1118 TCX Warm Sand` (`#D4A373`)
- **Heatmap (잔디)**: 딥 포레스트 $\rightarrow$ 톤다운 올리브 $\rightarrow$ 차분한 세이지 그린 4단계

### 🌌 [컨셉 3] **Pantone Deep Cobalt & Ice White** (Gymshark Onyx & Linear 감성)
- **Base Surface**: `Pantone 19-4010 TCX Total Eclipse` (`#0A0C12`)
- **Card Surface**: `Pantone 19-4024 TCX Dress Blues` (`#121624`)
- **Primary Hero**: `Pantone 19-3952 TCX Surf the Web` (`#3B82F6` 딥 코발트) + `Pantone Pure Brilliant White`
- **Heatmap (잔디)**: 다크 미드나이트 $\rightarrow$ 딥 코발트 $\rightarrow$ 스카이 블루 $\rightarrow$ 아이스 프로스트 화이트

---

## 3. 리팩토링 구현 원칙 (90 : 8 : 2 법칙)
- 화면의 90%는 매트 캔버스와 톤다운된 정돈된 타이포그래피(JetBrains Mono + Sans).
- 화면의 8%는 차분한 메타데이터 칩과 세련된 0.5px 헤어라인.
- 화면의 2%에만 정제된 팬톤 시그니처 뱃지/체크 액센트를 절제하여 적용.
- 네온 글로우(Glow Box-Shadow) 전면 삭제 $\rightarrow$ 럭셔리 매트 질감으로 교체.
