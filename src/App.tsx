import { useState, useEffect } from 'react';
import { IInBodyData, IRecommendedWeight, WorkoutSession, IWeeklySplitDay } from './models/fitness';
import { generateMockWorkouts, INITIAL_INBODY_DATA } from './data/mockData';
import { VolumeService } from './services/calculator/VolumeService';
import { storageService } from './services/storage/LocalStorageService';
import { Header } from './components/Header';
import { WeeklySplitRoutineSection } from './components/WeeklySplitRoutineSection';
import { HeatmapSection } from './components/HeatmapSection';
import { VolumeProgressionSection } from './components/VolumeProgressionSection';
import { ExerciseAnalyticsSection } from './components/ExerciseAnalyticsSection';
import { InBodyRecommenderSection } from './components/InBodyRecommenderSection';
import { TodayWorkoutHeroSection } from './components/TodayWorkoutHeroSection';
import { WorkoutLogModal } from './components/WorkoutLogModal';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';
import { RoutineService } from './services/routine/RoutineService';
import { TdsSegmentedControl } from './components/tds/TdsSegmentedControl';
import { Zap, CalendarDays, TrendingUp, Scale, Wifi, Battery } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_WORKOUTS_KEY = 'FITPULSE_WORKOUTS';
const STORAGE_INBODY_KEY = 'FITPULSE_INBODY';
const STORAGE_THEME_KEY = 'FITPULSE_THEME';

type AppTab = 'today' | 'split' | 'analytics' | 'inbody';

export function App() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    return storageService.getItem<WorkoutSession[]>(STORAGE_WORKOUTS_KEY, generateMockWorkouts());
  });

  const [inbodyData, setInbodyData] = useState<IInBodyData>(() => {
    return storageService.getItem<IInBodyData>(STORAGE_INBODY_KEY, INITIAL_INBODY_DATA);
  });

  // Custom Weekly Split Routine state
  const [weeklySplit, setWeeklySplit] = useState<IWeeklySplitDay[]>(() => {
    return RoutineService.getWeeklySplit();
  });

  const queryParams = new URLSearchParams(window.location.search);
  const initialTheme = (queryParams.get('theme') as 'dark' | 'light') || storageService.getItem<'dark' | 'light'>(STORAGE_THEME_KEY, 'light');
  const initialView = (queryParams.get('view') as 'mobile' | 'desktop') || 'mobile';

  const rawTab = queryParams.get('tab');
  const initialTab: AppTab = 
    rawTab === 'split' ? 'split' :
    (rawTab === 'analytics' || rawTab === 'heatmap' || rawTab === 'volume') ? 'analytics' :
    rawTab === 'inbody' ? 'inbody' : 'today';

  const initialModal = queryParams.get('modal') === 'log';

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(initialTheme);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>(initialView);

  // Modals & Navigation State: 'today' is the Primary Default View
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(initialModal);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<WorkoutSession | null>(null);
  const [presetForWorkout, setPresetForWorkout] = useState<IRecommendedWeight | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);

  const isDark = themeMode === 'dark';

  // Theme synchronization with DOM and Storage
  useEffect(() => {
    storageService.setItem(STORAGE_THEME_KEY, themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // LocalStorage Sync
  useEffect(() => {
    storageService.setItem(STORAGE_WORKOUTS_KEY, workouts);
  }, [workouts]);

  useEffect(() => {
    storageService.setItem(STORAGE_INBODY_KEY, inbodyData);
  }, [inbodyData]);

  const handleSaveWeeklySplit = (updatedSplit: IWeeklySplitDay[]) => {
    setWeeklySplit(updatedSplit);
    RoutineService.saveWeeklySplit(updatedSplit);
  };

  const streak = VolumeService.calculateStreak(workouts);

  const handleSaveWorkout = (newSession: WorkoutSession) => {
    setWorkouts(prev => [...prev.filter(w => w.date !== newSession.date), newSession]);
    setPresetForWorkout(null);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3182F6', '#00BFA5', '#00C73C', '#FF9F00']
    });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const handleSetSampleData = () => {
    const mock = generateMockWorkouts();
    setWorkouts(mock);
    setInbodyData(INITIAL_INBODY_DATA);
  };

  const handleSetEmptyData = () => {
    setWorkouts([]);
  };

  const handleResetMockData = handleSetSampleData;

  const handleApplyRecommendationToWorkout = (rec: IRecommendedWeight) => {
    setPresetForWorkout(rec);
    setIsLogModalOpen(true);
  };

  const handleSelectRoutineExercise = (
    _exerciseId: string,
    _exerciseName: string,
    _category: any,
    _targetWeight: number,
    _targetReps: number
  ) => {
    setActiveTab('today');
  };

  // 요일별 분할 루틴 적용하여 오늘 운동 세션 생성
  const handleStartRoutine = (splitDay: IWeeklySplitDay) => {
    if (splitDay.isRestDay) {
      alert(`[${splitDay.title}]\n충분한 휴식과 영양 섭취로 내일 운동을 충전하세요!`);
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: `workout-split-${Date.now()}`,
      date: todayStr,
      title: `[${splitDay.dayName}요일] ${splitDay.title}`,
      durationMinutes: splitDay.estimatedMinutes,
      memo: `${splitDay.categoryDesc} - 오늘 운동 완료!`,
      totalVolume: 0,
      exercises: splitDay.exercises.map((ex: any, idx: number) => ({
        id: `ex-split-${idx}-${Date.now()}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: (ex.targetMuscle.includes('가슴') ? 'chest' :
                   ex.targetMuscle.includes('등') ? 'back' :
                   ex.targetMuscle.includes('하체') || ex.targetMuscle.includes('스쿼트') || ex.targetMuscle.includes('둔근') ? 'legs' :
                   ex.targetMuscle.includes('어깨') || ex.targetMuscle.includes('삼각근') ? 'shoulders' :
                   ex.targetMuscle.includes('이두') || ex.targetMuscle.includes('삼두') ? 'arms' : 'core') as any,
        sets: Array.from({ length: ex.sets }, (_, sIdx) => ({
          id: `set-sp-${idx}-${sIdx}`,
          setNumber: sIdx + 1,
          weight: 60 + sIdx * 5,
          reps: 10,
          completed: true,
          isWarmup: sIdx === 0,
        }))
      }))
    };
    newSession.totalVolume = newSession.exercises.reduce((sum: number, e: any) => 
      sum + e.sets.reduce((sSum: number, s: any) => sSum + s.weight * s.reps, 0), 0
    );
    handleSaveWorkout(newSession);
    setActiveTab('today');
  };

  // 원클릭 오늘 운동 시뮬레이션
  const handleQuickSimulateToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: `workout-today-${Date.now()}`,
      date: todayStr,
      title: '오늘의 가슴 & 팔 운동',
      durationMinutes: 70,
      memo: '오늘 벤치프레스 85kg 성공! 지난번보다 더 들었어요 👍',
      totalVolume: 15400,
      exercises: [
        {
          id: 'ex-t1',
          exerciseId: 'bench-press',
          exerciseName: '바벨 벤치프레스',
          category: 'chest',
          sets: [
            { id: 'ts1', setNumber: 1, weight: 70, reps: 10, completed: true, isWarmup: true },
            { id: 'ts2', setNumber: 2, weight: 80, reps: 8, completed: true },
            { id: 'ts3', setNumber: 3, weight: 85, reps: 6, completed: true },
            { id: 'ts4', setNumber: 4, weight: 85, reps: 5, completed: true },
          ]
        },
        {
          id: 'ex-t2',
          exerciseId: 'incline-db-press',
          exerciseName: '인클라인 덤벨 프레스',
          category: 'chest',
          sets: [
            { id: 'ts5', setNumber: 1, weight: 28, reps: 10, completed: true },
            { id: 'ts6', setNumber: 2, weight: 30, reps: 8, completed: true },
          ]
        }
      ]
    };
    handleSaveWorkout(newSession);
  };

  const isMobile = viewMode === 'mobile';

  // Render dashboard sections
  const renderContentSections = () => (
    <div className="space-y-4">
      {/* TDS Segmented Control Tab Navigation */}
      <TdsSegmentedControl<AppTab>
        isDark={isDark}
        value={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        options={[
          { value: 'today', label: '오늘 운동' },
          { value: 'split', label: '주간 계획' },
          { value: 'analytics', label: '성장 분석' },
          { value: 'inbody', label: '내 몸 맞춤' },
        ]}
      />

      {/* 1. PRIMARY DEFAULT VIEW: Today's Active Workout Hero HUD */}
      {activeTab === 'today' && (
        <section>
          <TodayWorkoutHeroSection
            workouts={workouts}
            onSaveWorkoutSession={handleSaveWorkout}
            splitList={weeklySplit}
            onUpdateSplit={handleSaveWeeklySplit}
            isMobileView={isMobile}
            themeMode={themeMode}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        </section>
      )}

      {/* 2. Weekly Split Routine Section */}
      {activeTab === 'split' && (
        <section>
          <WeeklySplitRoutineSection
            splitList={weeklySplit}
            onUpdateSplit={handleSaveWeeklySplit}
            onStartRoutine={handleStartRoutine}
            onSelectRoutineExercise={handleSelectRoutineExercise}
            onQuickLog={handleQuickSimulateToday}
            isMobileView={isMobile}
            themeMode={themeMode}
          />
        </section>
      )}

      {/* 3. Growth & Overload Analytics (Integrated View: Heatmap + Volume + 1RM) */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <section>
            <HeatmapSection
              workouts={workouts}
              onSelectWorkout={(w) => setSelectedWorkoutDetail(w)}
              onQuickLogToday={handleQuickSimulateToday}
              onLoadSampleData={handleResetMockData}
              isMobileView={isMobile}
              themeMode={themeMode}
            />
          </section>

          <section>
            <VolumeProgressionSection
              workouts={workouts}
              onLoadSampleData={handleResetMockData}
              isMobileView={isMobile}
              themeMode={themeMode}
            />
          </section>

          <section>
            <ExerciseAnalyticsSection
              workouts={workouts}
              isMobileView={isMobile}
              themeMode={themeMode}
            />
          </section>
        </div>
      )}

      {/* 4. InBody Recommender */}
      {activeTab === 'inbody' && (
        <section>
          <InBodyRecommenderSection
            inbodyData={inbodyData}
            onUpdateInBody={setInbodyData}
            onApplyRecommendationToWorkout={handleApplyRecommendationToWorkout}
            isMobileView={isMobile}
            themeMode={themeMode}
          />
        </section>
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen flex flex-col antialiased selection:bg-[#3182F6] selection:text-white transition-colors ${
        isDark ? 'bg-[#101012] text-white' : 'bg-[#F2F4F6] text-[#191F28]'
      }`}
    >
      {/* GNB Header */}
      <Header
        currentStreak={streak.currentStreak}
        viewMode={viewMode}
        themeMode={themeMode}
        isSampleMode={workouts.length > 0}
        onToggleViewMode={setViewMode}
        onToggleTheme={handleToggleTheme}
        onOpenLogModal={() => {
          setPresetForWorkout(null);
          setIsLogModalOpen(true);
        }}
        onSetSampleData={handleSetSampleData}
        onSetEmptyData={handleSetEmptyData}
        onResetMockData={handleSetSampleData}
        onClearData={handleSetEmptyData}
        onQuickSimulateToday={handleQuickSimulateToday}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 flex justify-center">
        {viewMode === 'mobile' ? (
          /* iPhone 15 Pro Max Simulator Frame (430px × 932px, 55px Corner Radius) */
          <div className="flex flex-col items-center my-2">
            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <span>Apple iPhone 15 Pro Max · 430 × 932 pt</span>
            </div>

            <div
              className={`relative w-[430px] h-[932px] rounded-[55px] border-[10px] shadow-2xl flex flex-col overflow-hidden transition-all select-none ${
                isDark
                  ? 'bg-[#101012] border-[#252528] ring-1 ring-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
                  : 'bg-[#F2F4F6] border-[#1C1C1E] ring-1 ring-black/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]'
              }`}
            >
              {/* iPhone 15 Pro Max Hardware: Top Speaker Earpiece Slit */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-[#333D4B]/40 pointer-events-none z-40" />

              {/* Status Bar & Dynamic Island (Top Safe Area = 59px) */}
              <div className="absolute top-0 left-0 right-0 h-[59px] z-30 pointer-events-none flex items-center justify-between px-7 pt-1 select-none backdrop-blur-md bg-white/40 dark:bg-[#101012]/40">
                {/* Left: Clock */}
                <span className={`text-sm font-bold tracking-tight font-mono-num ${isDark ? 'text-white' : 'text-[#191F28]'}`}>
                  9:41
                </span>

                {/* Center: Dynamic Island (126px × 37px, rounded-full) */}
                <div className="w-[126px] h-[37px] rounded-[20px] bg-black border border-black/80 flex items-center justify-between px-3 shadow-inner pointer-events-auto">
                  {/* Camera lens reflection */}
                  <div className="w-3 h-3 rounded-full bg-[#1A1A1E] border border-[#2C2C2E] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0E1A2E]" />
                  </div>
                  {/* Subtle sensor indicator / Toss pulse */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3182F6]/90 animate-pulse" />
                  </div>
                </div>

                {/* Right: Icons (Signal, Wifi, Battery) */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200">
                  <Wifi className="w-4 h-4" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* Scrollable Mobile App Body with 64px Top Padding (clears Dynamic Island) and 96px Bottom Padding */}
              <div className={`flex-1 overflow-y-auto pt-[64px] pb-[96px] px-3.5 scrollbar-thin ${
                isDark ? 'scrollbar-thumb-[#2C2C2E]' : 'scrollbar-thumb-slate-300'
              }`}>
                {renderContentSections()}
              </div>

              {/* Pinned Mobile Bottom Navigation Bar (4 Core Tabs) */}
              <div className={`absolute bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t transition-colors ${
                isDark ? 'bg-[#101012]/95 border-[#2C2C2E]' : 'bg-white/95 border-slate-200'
              }`}>
                <div className="grid grid-cols-4 items-center pt-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('today')}
                    className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold py-1 transition-all min-h-[44px] ${
                      activeTab === 'today'
                        ? 'text-[#3182F6] font-black'
                        : isDark ? 'text-[#8B95A1] hover:text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${activeTab === 'today' ? 'fill-current' : ''}`} />
                    <span>오늘 운동</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('split')}
                    className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold py-1 transition-all min-h-[44px] ${
                      activeTab === 'split'
                        ? 'text-[#3182F6] font-black'
                        : isDark ? 'text-[#8B95A1] hover:text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>주간 계획</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold py-1 transition-all min-h-[44px] ${
                      activeTab === 'analytics'
                        ? 'text-[#3182F6] font-black'
                        : isDark ? 'text-[#8B95A1] hover:text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>성장 분석</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('inbody')}
                    className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold py-1 transition-all min-h-[44px] ${
                      activeTab === 'inbody'
                        ? 'text-[#3182F6] font-black'
                        : isDark ? 'text-[#8B95A1] hover:text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    <span>내 몸 맞춤</span>
                  </button>
                </div>

                {/* iPhone 15 Pro Max Home Indicator (140px × 5px, centered, 8px bottom margin) */}
                <div className="w-full flex justify-center pb-2 pt-0.5">
                  <div className={`w-[140px] h-[5px] rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Wide Layout */
          <div className="max-w-5xl w-full">
            {renderContentSections()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-4 text-center text-xs mt-8 transition-colors ${
        isDark ? 'bg-[#101012] border-[#2C2C2E] text-[#8B95A1]' : 'bg-white border-slate-200 text-[#6B7684]'
      }`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>FitPulse · Toss Design System (TDS Mobile) 기반 피트니스 트래커</span>
          <div className="flex gap-4">
            <span>설문조사: <code className={`font-bold ${isDark ? 'text-white' : 'text-[#191F28]'}`}>docs/SURVEY.md</code></span>
            <span>도커 가이드: <code className={`font-bold text-[#3182F6]`}>docker compose up -d</code></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isLogModalOpen && (
        <WorkoutLogModal
          isOpen={isLogModalOpen}
          onClose={() => {
            setIsLogModalOpen(false);
            setPresetForWorkout(null);
          }}
          onSaveWorkout={handleSaveWorkout}
          initialPreset={presetForWorkout}
          themeMode={themeMode}
        />
      )}

      {selectedWorkoutDetail && (
        <WorkoutDetailModal
          workout={selectedWorkoutDetail}
          onClose={() => setSelectedWorkoutDetail(null)}
          onDelete={handleDeleteWorkout}
          themeMode={themeMode}
        />
      )}
    </div>
  );
}
