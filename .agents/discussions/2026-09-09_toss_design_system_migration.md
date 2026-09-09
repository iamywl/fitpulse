# [Discussions] FitPulse to Toss Design System (TDS Mobile) Migration

- **Date**: 2026-09-09
- **Participants**:
  - design_agent (Lead UI/UX & TDS Mobile Inspector)
  - product_research_agent (Lead Product & UX Copywriting Architect)
  - qa_agent (Lead QA & TDS Component Engineer)
  - parent (Antigravity Orchestrator)
- **User Mandate**: 토스디자인 철학을 바탕으로 엎어버려 + TDS Mobile (https://tossmini-docs.toss.im/tds-mobile/)

---

## 1. Background & Core Motivation
1. **Existing Neon / High-Vis Volt Fatigue**:
   - The original #D4FF00 (highlighter yellow-green) felt like construction safety gear or a gimmicky tracker rather than a refined daily wellness service.
2. **User Direct Directive**:
   - Adopt the official Toss Design System (TDS Mobile) philosophy:
     - Radical Simplicity (극도의 단순함과 명료함)
     - 당연한 것을 더 쉽고 명확하게
     - Breathing Space & Card Hierarchy (시원한 여백과 순백색 플로팅 카드)
     - Toss Blue (#3182F6) & Refined Weak Semantic Badges
     - Conversational Microcopy (~했어요, ~해볼까요?)
     - BottomCTA First (엄지존 최적화 56px 하단 바)

---

## 2. Agreed Architectural Specifications

### 2.1 Design Tokens (src/theme/tds.ts)
- Primary: Toss Blue (#3182F6), Active/Press (#1B64DA), Light Weak (#E8F3FF), Dark Weak (rgba(49, 130, 246, 0.16))
- Neutral Light:
  - Background: #F2F4F6 (Toss Signature Slate Gray 100)
  - Card/Surface: #FFFFFF (Elevated White)
  - Hairline Border: #E5E8EB (Gray 200)
  - Text Primary: #191F28 (Gray 900)
  - Text Secondary: #4E5968 (Gray 700)
  - Text Muted: #8B95A1 (Gray 500)
- Neutral Dark:
  - Background: #101012 (OLED Deep Charcoal)
  - Card/Surface: #1C1C1E (Dark Elevated Surface)
  - Hairline Border: #2C2C2E
  - Text Primary: #FFFFFF
  - Text Secondary: #B0B8C1
  - Text Muted: #6B7684
- TDS Semantic Accents (Fill & Weak pairs):
  - blue: #3182F6 (Fill) / #E8F3FF (Weak)
  - teal: #00BFA5 (Fill) / #E0F7F4 (Weak)
  - green: #00C73C (Fill) / #E8F9EE (Weak)
  - red: #F04452 (Fill) / #FEECEE (Weak)
  - yellow: #FF9F00 (Fill) / #FFF6E6 (Weak)
  - elephant: #8B95A1 (Fill) / #F2F4F6 (Weak)

### 2.2 Reusable TDS Mobile Component Library (src/components/tds/)
1. TdsBadge.tsx (size: xsmall|small|medium|large, variant: fill|weak, color: blue|teal|green|red|yellow|elephant)
2. TdsButton.tsx (size: small|medium|large|xlarge, variant: primary|secondary|weak|danger, active scale 0.98)
3. TdsBottomCTA.tsx (fixed floating bottom action bar with safe area padding)
4. TdsListRow.tsx (left slot, center content, right slot with chevron)
5. TdsSegmentedControl.tsx (smooth pill-shaped toggle switch)
6. TdsStepper.tsx (44px touch targets for weights and reps)

### 2.3 UX Copywriting Matrix (Toss Tone of Voice)
- 오늘 진행할 분할 루틴 -> 오늘 할 운동이에요
- 직전 세션 대비 점진적 과부하 +5.2% -> 지난번보다 5.2% 더 들었어요! 대단해요
- 세트 기입 및 완료 -> 해냈어요!
- 휴식 타이머 (90s) -> 90초 동안 숨 고르고 쉴게요
- 인바디 맞춤 중량 추천기 -> 내 몸에 딱 맞는 무게 추천받기
- 16주 활동 잔디 히트맵 -> 차곡차곡 쌓인 내 운동 기록
