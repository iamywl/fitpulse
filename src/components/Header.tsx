import React from 'react';
import { Dumbbell, Flame, Plus, RotateCcw, Sparkles, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentStreak: number;
  viewMode: 'mobile' | 'desktop';
  onToggleViewMode: (mode: 'mobile' | 'desktop') => void;
  onOpenLogModal: () => void;
  onResetMockData: () => void;
  onClearData: () => void;
  onQuickSimulateToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  viewMode,
  onToggleViewMode,
  onOpenLogModal,
  onResetMockData,
  onClearData,
  onQuickSimulateToday,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0E]/90 backdrop-blur-xl border-b border-[#23232D] px-3 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4FF00] flex items-center justify-center shadow-lg shadow-[#D4FF00]/25 ring-1 ring-[#D4FF00]/40 flex-shrink-0">
            <Dumbbell className="w-4 h-4 text-black stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white font-mono-num">
                FitPulse
              </span>
              <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 font-mono-num">
                PRO MVP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              점진적 과부하 & 요일별 루틴 트래커
            </p>
          </div>
        </div>

        {/* Center: Device Mode Switcher (Mobile Simulator vs Desktop) */}
        <div className="flex items-center bg-[#121217] p-1 rounded-2xl border border-[#23232D]">
          <button
            onClick={() => onToggleViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'mobile'
                ? 'bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">모바일 뷰</span>
          </button>
          <button
            onClick={() => onToggleViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              viewMode === 'desktop'
                ? 'bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">데스크톱 뷰</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Current Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#121217] border border-[#FFB703]/30 text-[#FFB703] text-xs font-black shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#FFB703] animate-pulse" />
            <span className="font-mono-num">{currentStreak}</span>일 연속
          </div>

          {/* Quick Simulate Today's Workout */}
          <button
            onClick={onQuickSimulateToday}
            title="오늘 운동 완료 시뮬레이션 (잔디 & 볼륨 즉각 반영)"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#D4FF00] bg-[#121217] hover:bg-[#181820] border border-[#D4FF00]/30 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>오늘 완료 시뮬레이션</span>
          </button>

          {/* Quick Mock Data load */}
          <button
            onClick={onResetMockData}
            title="1개월치 시연용 데이터 로드"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-[#121217] hover:bg-[#181820] border border-[#23232D] hover:text-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>샘플 로드</span>
          </button>

          {/* Reset */}
          <button
            onClick={onClearData}
            title="초기화"
            className="hidden xl:flex items-center p-2 rounded-xl text-xs text-slate-400 hover:text-[#FF3B56] hover:bg-[#121217] border border-transparent hover:border-[#FF3B56]/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* New Workout CTA */}
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#D4FF00] hover:bg-[#C2EB00] text-black font-black text-xs sm:text-sm shadow-lg shadow-[#D4FF00]/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>기록</span>
          </button>
        </div>
      </div>
    </header>
  );
};
