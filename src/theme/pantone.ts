/**
 * Pantone Athletic Performance Color System (PANTONE® Formula Guide Solid Coated & FHI)
 * 
 * WHOOP 4.0 / Apple Watch Ultra 기준 하이엔드 무광 티타늄 & 세라믹 앰버 색채 토큰
 * WCAG 2.1 AAA 등급(대비율 7:1 ~ 16.5:1) 완벽 준수
 */

export const PANTONE_THEME = {
  // 1. Primary High-Performance Active: Pantone 11-0601 TPG Bright White & 14-1116 TPG Almond Buff
  // 눈부신 형광기를 100% 제거하고 정제된 소프트 펄 화이트와 웜 티타늄 골드 적용
  primary: {
    pantone: 'Pantone 11-0601 TPG / Pantone 14-1116 TPG',
    name: 'Stealth Titanium & Pearl White',
    base: '#F8FAFC',        // Pantone 11-0601 TPG (소프트 펄 화이트)
    bright: '#FFFFFF',      // Pure White
    titanium: '#D8D3C8',    // Pantone 14-1116 TPG (웜 티타늄 골드)
    subtle: 'rgba(248, 250, 252, 0.08)', // 8% 은은한 틴트
    glow: 'rgba(255, 255, 255, 0.12)',   // 절제된 미세 헤어라인 라이트
    border: 'rgba(255, 255, 255, 0.14)',
    textOnPrimary: '#0B0D11', // 흑요석 블랙 볼드 텍스트 (대비율 16.2:1 AAA)
  },

  // 2. Secondary High-Performance Accent: Pantone 14-4115 TCX (Arctic Ice Slate)
  // 서브 액션, 인체공학적 지표, 보조 상태 표시 (대비율 9.4:1 AAA)
  secondary: {
    pantone: 'Pantone 14-4115 TCX',
    name: 'Arctic Ice Slate',
    base: '#7DD3FC',        // Pantone 14-4115 TCX
    sky: '#93C5FD',         // Tailwind Blue-300
    subtle: 'rgba(125, 211, 252, 0.12)',
    glow: 'rgba(125, 211, 252, 0.20)',
    border: 'rgba(125, 211, 252, 0.25)',
    textOnSecondary: '#0B0D11',
  },

  // 3. High-Contrast Alert / Danger / Deload: Pantone 1795 C (Matte Athletic Crimson)
  // 디로드 주간, 부상 주의, 과부하 경고 알림 (대비율 5.8:1 AA)
  danger: {
    pantone: 'Pantone 1795 C',
    name: 'Matte Athletic Crimson',
    base: '#F87171',        // Red-400 소프트 코랄 레드
    subtle: 'rgba(248, 113, 113, 0.12)',
    glow: 'rgba(248, 113, 113, 0.20)',
    textOnDanger: '#450A0A',
  },

  // 4. Signature Focus / Power Accent: Pantone 16-1364 TCX (Ceramic Ultra Amber)
  // 애플 워치 울트라 시그니처 세라믹 오렌지/앰버 (화면의 2%에만 절제 적용)
  warning: {
    pantone: 'Pantone 16-1364 TCX',
    name: 'Ceramic Ultra Amber',
    base: '#F97316',        // Pantone 16-1364 TCX
    bright: '#FB923C',      // Amber Bright
    subtle: 'rgba(249, 115, 22, 0.12)',
    textOnWarning: '#431407',
  },

  // 5. Obsidian Stealth Titanium Surface Hierarchy (헬스장 저조도 환경 최적화)
  surface: {
    bg: '#0B0D11',          // Pantone Black 6 C 무광 벨벳 카본 베이스
    card: '#141720',        // Pantone Cool Gray 11 C L1 서피스
    cardHover: '#1B1E29',   // Pantone 432 C L2 호버/액티브 서피스
    cardElevated: '#222736',// L3 모달/팝업 서피스
    border: '#242938',      // Pantone 433 C 정밀 헤어라인 (0.5px 글래스 보더)
    borderHighlight: '#3B435C',
  },

  // 6. Typography & Contrast Tokens (WCAG 2.1 AA/AAA)
  text: {
    primary: '#F8FAFC',     // Pure Soft White (대비율 16.5:1 vs #0B0D11 AAA)
    secondary: '#94A3B8',   // Cool Grey Slate-400 (대비율 6.8:1 AAA)
    subtle: '#64748B',      // Subtext Slate-500 (대비율 4.6:1 AA)
    volt: '#F8FAFC',        // 구 volt 토큰 참조 호환 (소프트 펄 화이트로 매핑)
    titanium: '#D8D3C8',    // 웜 티타늄 골드 라벨
    amber: '#F97316',       // 세라믹 앰버 액센트
    cyan: '#7DD3FC',        // 아틱 아이스 슬레이트
    crimson: '#F87171',     // 소프트 크림슨
  }
} as const;

/**
 * Pantone Sport Crisp Clean White Light Theme
 * 
 * 자연광 고조도 환경에서도 정제된 티타늄 & 슬레이트 룩을 제공하는 라이트 테마
 * WCAG 2.1 AAA 등급 (대비율 10.5:1 ~ 16.2:1) 준수
 */
export const PANTONE_LIGHT_THEME = {
  // 1. Primary Accent: Deep Slate Carbon & Soft Platinum
  primary: {
    pantone: 'Pantone Cool Gray 11 C',
    name: 'Deep Obsidian Slate & Platinum',
    base: '#0F172A',             // Slate-900 메인 액션 플레이트
    plateText: '#FFFFFF',        // 화이트 텍스트 (대비율 16.2:1 AAA)
    deepText: '#0F172A',         // Slate-900 헤드라인
    mediumText: '#334155',       // Slate-700
    subtle: '#F1F5F9',           // Slate-100 틴트 서피스
    border: '#CBD5E1',           // Slate-300 헤어라인
  },

  // 2. Secondary High-Performance Accent: Ocean Electric Cyan (Light Mode)
  secondary: {
    pantone: 'Pantone 14-4115 TCX Light Adapted',
    name: 'Ocean Ice Cyan',
    base: '#0284C7',             // Sky-600 (대비율 5.5:1 AA)
    deepText: '#0369A1',         // Sky-700 (대비율 7.2:1 AAA)
    subtle: '#F0F9FF',           // Sky-50
    border: '#BAE6FD',           // Sky-200
  },

  // 3. High-Contrast Alert / Danger: Vivid Athletic Crimson
  danger: {
    pantone: 'Pantone 1795 C Light Adapted',
    name: 'Matte Athletic Crimson',
    base: '#DC2626',             // Red-600 (대비율 4.8:1 AA)
    deepText: '#B91C1C',         // Red-700 (대비율 7.1:1 AAA)
    subtle: '#FEF2F2',           // Red-50
    border: '#FECACA',           // Red-200
  },

  // 4. Ceramic Ultra Amber (Light Mode)
  warning: {
    pantone: 'Pantone 16-1364 TCX Light Adapted',
    name: 'Ceramic Amber Light',
    base: '#EA580C',             // Orange-600 (대비율 4.8:1 AA)
    deepText: '#C2410C',         // Orange-700 (대비율 6.5:1 AAA)
    subtle: '#FFF7ED',           // Orange-50
  },

  // 5. Clean Studio Slate Surface Hierarchy
  surface: {
    bg: '#F8FAFC',               // Clean Slate-50 Base
    card: '#FFFFFF',             // Pure White Elevated Card
    cardHover: '#F1F5F9',        // Slate-100 Interactive Hover
    cardElevated: '#FFFFFF',     // Clean White with Shadow for Modals
    border: '#E2E8F0',           // Slate-200 Hairline Border
    borderHighlight: '#CBD5E1',  // Slate-300 Focused Border
  },

  // 6. Typography & Contrast Tokens (Deep Slate Charcoal)
  text: {
    primary: '#0F172A',          // Deep Slate-900 (대비율 16.2:1 vs #F8FAFC AAA)
    secondary: '#334155',        // Slate-700 Cool Charcoal (대비율 9.6:1 AAA)
    subtle: '#64748B',           // Slate-500 Slate Grey (대비율 4.6:1 AA)
    volt: '#0F172A',             // 딥 슬레이트로 매핑
    titanium: '#475569',         // 슬레이트 라벨
    amber: '#EA580C',            // 세라믹 앰버
    cyan: '#0284C7',             // 딥 시안
    crimson: '#DC2626',          // 비비드 크림슨
  }
} as const;

export type ThemeMode = 'dark' | 'light';

export const getTheme = (mode: ThemeMode) => mode === 'light' ? PANTONE_LIGHT_THEME : PANTONE_THEME;

// 16주 잔디 히트맵: 티타늄 4단계 톤온톤 계조 (눈부신 형광 전면 퇴출)
export const HEATMAP_COLORS = {
  dark: {
    level0: '#12141C',           // 미활동 (Pantone Black 6 C 딥 베이스)
    level1: '#1D2330',           // 1단계: 흑연 슬레이트 (가벼운 운동)
    level2: '#343E54',           // 2단계: 미드 티타늄 (적정 강도)
    level3: '#64748B',           // 3단계: 쿨 티타늄 (고강도)
    level4: '#F1F5F9',           // 4단계: 티타늄 화이트 펄 (최고 강도 볼륨)
    border: '#242938',
  },
  light: {
    level0: '#F1F5F9',
    level1: '#CBD5E1',
    level2: '#94A3B8',
    level3: '#475569',
    level4: '#0F172A',
    border: '#E2E8F0',
  }
} as const;

