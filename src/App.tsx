import { useState, useEffect } from 'react';
import { IInBodyData, IRecommendedWeight, WorkoutSession, IWeeklySplitDay } from './models/fitness';
import { generateMockWorkouts, INITIAL_INBODY_DATA } from './data/mockData';
import { VolumeService } from './services/calculator/VolumeService';
import { storageService } from './services/storage/LocalStorageService';
import { Header } from './components/Header';
import { WeeklySplitRoutineSection } from './components/WeeklySplitRoutineSection';
import { ExerciseSetManager } from './components/ExerciseSetManager';
import { HeatmapSection } from './components/HeatmapSection';
import { VolumeProgressionSection } from './components/VolumeProgressionSection';
import { ExerciseAnalyticsSection } from './components/ExerciseAnalyticsSection';
import { InBodyRecommenderSection } from './components/InBodyRecommenderSection';
import { WorkoutLogModal } from './components/WorkoutLogModal';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';
import { LayoutDashboard, CalendarDays, Dumbbell, Calendar, TrendingUp, Activity, Scale, Wifi, Battery } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_WORKOUTS_KEY = 'FITPULSE_WORKOUTS';
const STORAGE_INBODY_KEY = 'FITPULSE_INBODY';

export function App() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    return storageService.getItem<WorkoutSession[]>(STORAGE_WORKOUTS_KEY, generateMockWorkouts());
  });

  const [inbodyData, setInbodyData] = useState<IInBodyData>(() => {
    return storageService.getItem<IInBodyData>(STORAGE_INBODY_KEY, INITIAL_INBODY_DATA);
  });

  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Modals & Navigation State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<WorkoutSession | null>(null);
  const [presetForWorkout, setPresetForWorkout] = useState<IRecommendedWeight | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'split' | 'sets' | 'heatmap' | 'volume' | 'analytics' | 'inbody'>('all');
  const [routineExerciseOverride, setRoutineExerciseOverride] = useState<any>(null);

  // LocalStorage Sync
  useEffect(() => {
    storageService.setItem(STORAGE_WORKOUTS_KEY, workouts);
  }, [workouts]);

  useEffect(() => {
    storageService.setItem(STORAGE_INBODY_KEY, inbodyData);
  }, [inbodyData]);

  const streak = VolumeService.calculateStreak(workouts);

  const handleSaveWorkout = (newSession: WorkoutSession) => {
    setWorkouts(prev => [...prev.filter(w => w.date !== newSession.date), newSession]);
    setPresetForWorkout(null);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4FF00', '#38BDF8', '#FFFFFF']
    });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const handleResetMockData = () => {
    if (window.confirm('1개월치 시연용 샘플 운동 데이터로 새로고침하시겠습니까?')) {
      const mock = generateMockWorkouts();
      setWorkouts(mock);
      setInbodyData(INITIAL_INBODY_DATA);
    }
  };

  const handleClearData = () => {
    if (window.confirm('정말로 모든 운동 기록을 초기화하시겠습니까?')) {
      setWorkouts([]);
    }
  };

  const handleApplyRecommendationToWorkout = (rec: IRecommendedWeight) => {
    setPresetForWorkout(rec);
    setIsLogModalOpen(true);
  };

  const handleSelectRoutineExercise = (
    exerciseId: string,
    exerciseName: string,
    category: any,
    targetWeight: number,
    targetReps: number
  ) => {
    setRoutineExerciseOverride({
      exerciseId,
      exerciseName,
      category,
      targetWeight,
      targetReps,
    });
    setActiveTab('sets');
  };

  // 요일별 분할 루틴 적용하여 오늘 운동 세션 생성
  const handleStartRoutine = (splitDay: IWeeklySplitDay) => {
    if (splitDay.isRestDay) {
      alert(`[${splitDay.title}]\n충분한 수면과 영양 섭취로 신경계를 리셋하고 내일 운동을 준비하세요!`);
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: `workout-split-${Date.now()}`,
      date: todayStr,
      title: `[${splitDay.dayName}요일 분할] ${splitDay.title}`,
      durationMinutes: splitDay.estimatedMinutes,
      memo: `${splitDay.categoryDesc} - 점진적 과부하 달성 완료`,
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
    setActiveTab('sets');
  };

  // 원클릭 오늘 운동 시뮬레이션
  const handleQuickSimulateToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: `workout-today-${Date.now()}`,
      date: todayStr,
      title: '오늘의 가슴 & 삼두 파워 루틴',
      durationMinutes: 70,
      memo: '오늘 벤치프레스 85kg 성공! 점진적 과부하 달성 완료',
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
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#272732]">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>전체 보기</span>
        </button>
        <button
          onClick={() => setActiveTab('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'split'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>요일별 분할</span>
        </button>
        <button
          onClick={() => setActiveTab('sets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'sets'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>종목 세트 기입</span>
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'heatmap'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>잔디 히트맵</span>
        </button>
        <button
          onClick={() => setActiveTab('volume')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'volume'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>볼륨 비교</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>종목 성장 차트</span>
        </button>
        <button
          onClick={() => setActiveTab('inbody')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'inbody'
              ? 'bg-[#CCFF00] text-[#09090B] font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#18181F]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>인바디 추천</span>
        </button>
      </div>

      {/* 0. Weekly Split Routine Section (요일별 분할 루틴 핵심 기능) */}
      {(activeTab === 'all' || activeTab === 'split') && (
        <section>
          <WeeklySplitRoutineSection
            onStartRoutine={handleStartRoutine}
            onSelectRoutineExercise={handleSelectRoutineExercise}
            onQuickLog={handleQuickSimulateToday}
            isMobileView={isMobile}
          />
        </section>
      )}

      {/* 1. Exercise Set Manager: 직접 무게와 반복수 기입 기능 */}
      {(activeTab === 'all' || activeTab === 'sets') && (
        <section>
          <ExerciseSetManager
            workouts={workouts}
            onSaveExerciseSets={handleSaveWorkout}
            isMobileView={isMobile}
            selectedExerciseOverride={routineExerciseOverride}
          />
        </section>
      )}

      {/* 2. GitHub Activity Heatmap */}
      {(activeTab === 'all' || activeTab === 'heatmap') && (
        <section>
          <HeatmapSection
            workouts={workouts}
            onSelectWorkout={(w) => setSelectedWorkoutDetail(w)}
            onQuickLogToday={handleQuickSimulateToday}
            isMobileView={isMobile}
          />
        </section>
      )}

      {/* 3. Volume Progression Comparison */}
      {(activeTab === 'all' || activeTab === 'volume') && (
        <section>
          <VolumeProgressionSection
            workouts={workouts}
            isMobileView={isMobile}
          />
        </section>
      )}

      {/* 4. Exercise Analytics */}
      {(activeTab === 'all' || activeTab === 'analytics') && (
        <section>
          <ExerciseAnalyticsSection
            workouts={workouts}
            isMobileView={isMobile}
          />
        </section>
      )}

      {/* 5. InBody Recommender */}
      {(activeTab === 'all' || activeTab === 'inbody') && (
        <section>
          <InBodyRecommenderSection
            inbodyData={inbodyData}
            onUpdateInBody={setInbodyData}
            onApplyRecommendationToWorkout={handleApplyRecommendationToWorkout}
            isMobileView={isMobile}
          />
        </section>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-slate-100 flex flex-col antialiased selection:bg-[#D4FF00] selection:text-black">
      {/* GNB Header */}
      <Header
        currentStreak={streak.currentStreak}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenLogModal={() => {
          setPresetForWorkout(null);
          setIsLogModalOpen(true);
        }}
        onResetMockData={handleResetMockData}
        onClearData={handleClearData}
        onQuickSimulateToday={handleQuickSimulateToday}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 flex justify-center">
        {viewMode === 'mobile' ? (
          /* Mobile Smartphone Simulator Frame */
          <div className="relative w-full max-w-[420px] bg-[#0A0A0E] rounded-[48px] p-3 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.98)] border-[6px] border-[#1F1F28] ring-1 ring-[#D4FF00]/25 flex flex-col my-2">
            {/* Dynamic Island / Status Bar */}
            <div className="relative z-30 flex justify-between items-center px-6 pt-2 pb-1 text-xs text-slate-400 select-none">
              <span className="font-black text-white font-mono-num">9:41</span>
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center border border-[#1F1F28]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#121217] mr-2" />
                <div className="w-2 h-2 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
                <Battery className="w-4 h-4 text-slate-300" />
              </div>
            </div>

            {/* Scrollable Mobile App Body */}
            <div className="flex-1 overflow-y-auto max-h-[780px] px-1 py-3 scrollbar-thin scrollbar-thumb-slate-700">
              {renderContentSections()}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="mt-2 pt-2 border-t border-[#1F1F28] flex justify-around items-center bg-[#0A0A0E] rounded-b-[40px] py-1">
              <button
                onClick={() => setActiveTab('split')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black py-1 px-1.5 transition-all ${
                  activeTab === 'split' ? 'text-[#CCFF00]' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>분할루틴</span>
              </button>
              <button
                onClick={() => setActiveTab('sets')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black py-1 px-1.5 transition-all ${
                  activeTab === 'sets' ? 'text-[#D4FF00]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>세트기입</span>
              </button>
              <button
                onClick={() => setActiveTab('heatmap')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black py-1 px-1.5 transition-all ${
                  activeTab === 'heatmap' ? 'text-[#D4FF00]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>잔디</span>
              </button>
              <button
                onClick={() => setActiveTab('volume')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black py-1 px-1.5 transition-all ${
                  activeTab === 'volume' ? 'text-[#D4FF00]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>볼륨</span>
              </button>
              <button
                onClick={() => setActiveTab('inbody')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-black py-1 px-1.5 transition-all ${
                  activeTab === 'inbody' ? 'text-[#D4FF00]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>인바디</span>
              </button>
            </div>

            {/* iOS Bottom Home Bar */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2 mb-1" />
          </div>
        ) : (
          /* Desktop Wide Layout */
          <div className="max-w-7xl w-full">
            {renderContentSections()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#23232D] py-5 px-4 text-center text-xs text-slate-400 mt-8 bg-[#0A0A0E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FitPulse MVP Prototype · 헬스 볼륨 & 잔디 관측 트래커</span>
          <div className="flex gap-4 text-slate-400">
            <span>기능명세서: <code className="text-[#D4FF00] font-bold">docs/SPECIFICATION.md</code></span>
            <span>에이전트 지침: <code className="text-[#D4FF00] font-bold">AGENTS.md</code></span>
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
        />
      )}

      {selectedWorkoutDetail && (
        <WorkoutDetailModal
          workout={selectedWorkoutDetail}
          onClose={() => setSelectedWorkoutDetail(null)}
          onDelete={handleDeleteWorkout}
        />
      )}
    </div>
  );
}
