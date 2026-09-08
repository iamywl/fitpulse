import React from 'react';
import { Dumbbell, Flame, Plus, RotateCcw, Sparkles, Smartphone, Monitor, CheckCircle2, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../theme/pantone';

interface HeaderProps {
  currentStreak: number;
  viewMode: 'mobile' | 'desktop';
  themeMode: ThemeMode;
  onToggleViewMode: (mode: 'mobile' | 'desktop') => void;
  onToggleTheme: () => void;
  onOpenLogModal: () => void;
  onResetMockData: () => void;
  onClearData: () => void;
  onQuickSimulateToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  viewMode,
  themeMode,
  onToggleViewMode,
  onToggleTheme,
  onOpenLogModal,
  onResetMockData,
  onClearData,
  onQuickSimulateToday,
}) => {
  const isLight = themeMode === 'light';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b px-3 sm:px-6 py-3 transition-colors ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#0A0A0E]/90 border-[#23232D] text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#D4FF00] flex items-center justify-center shadow-lg shadow-[#D4FF00]/25 ring-1 ring-[#D4FF00]/40 flex-shrink-0">
            <Dumbbell className="w-4 h-4 text-black stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-lg tracking-tight font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
                FitPulse
              </span>
              <span
                className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full font-mono-num ${
                  isLight
                    ? 'bg-lime-100 text-lime-800 border border-lime-300'
                    : 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30'
                }`}
              >
                PRO MVP
              </span>
            </div>
            <p className={`text-[10px] font-medium hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              점진적 과부하 & 요일별 루틴 트래커
            </p>
          </div>
        </div>

        {/* Center: Device Mode & Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Device Mode Switcher (Mobile Simulator vs Desktop) */}
          <div className={`flex items-center p-1 rounded-2xl border transition-colors ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121217] border-[#23232D]'
          }`}>
            <button
              onClick={() => onToggleViewMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                viewMode === 'mobile'
                  ? 'bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">모바일</span>
            </button>
            <button
              onClick={() => onToggleViewMode('desktop')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                viewMode === 'desktop'
                  ? 'bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">데스크톱</span>
            </button>
          </div>

          {/* Theme Mode Switcher (Dark vs Light) */}
          <button
            onClick={onToggleTheme}
            title={isLight ? '다크 모드로 전환 (Obsidian Carbon)' : '라이트 모드로 전환 (Clean White)'}
            aria-label="Toggle Theme"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
              isLight
                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200 shadow-sm'
                : 'bg-[#121217] text-slate-200 hover:text-white hover:bg-[#181820] border-[#23232D]'
            }`}
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">라이트</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden sm:inline">다크</span>
              </>
            )}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Current Streak Badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black shadow-sm ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-[#121217] border-[#FFB703]/30 text-[#FFB703]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="font-mono-num">{currentStreak}</span>일
          </div>

          {/* Quick Simulate Today's Workout */}
          <button
            onClick={onQuickSimulateToday}
            title="오늘 운동 완료 시뮬레이션 (잔디 & 볼륨 즉각 반영)"
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isLight
                ? 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100'
                : 'text-[#D4FF00] bg-[#121217] hover:bg-[#181820] border-[#D4FF00]/30'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <span>오늘 완료 시뮬레이션</span>
          </button>

          {/* Quick Mock Data load */}
          <button
            onClick={onResetMockData}
            title="1개월치 시연용 샘플 데이터 로드"
            className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 rounded-xl text-xs font-bold border transition-all ${
              isLight
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-sm'
                : 'text-slate-300 bg-[#121217] hover:bg-[#181820] border-[#23232D] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
            <span className="hidden xs:inline">샘플</span>
          </button>

          {/* Reset All Data to Empty State */}
          <button
            onClick={onClearData}
            title="초기 상태로 초기화 (데이터 비우기)"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isLight
                ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200'
                : 'text-slate-400 hover:text-[#FF3B56] hover:bg-[#121217] border-[#23232D] hover:border-[#FF3B56]/40'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>

          {/* New Workout CTA */}
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#D4FF00] hover:bg-[#C2EB00] text-black font-black text-xs sm:text-sm shadow-md shadow-[#D4FF00]/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>기록</span>
          </button>
        </div>
      </div>
    </header>
  );
};

