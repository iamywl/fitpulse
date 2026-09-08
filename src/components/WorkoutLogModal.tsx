import React, { useState } from 'react';
import { IExerciseLog, IExerciseSet, IRecommendedWeight, WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { X, Plus, Trash2, CheckCircle2, Dumbbell, Calendar, Clock, Flame, Check } from 'lucide-react';

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkout: (workout: WorkoutSession) => void;
  initialPreset?: IRecommendedWeight | null;
}

const DEFAULT_EXERCISE_OPTIONS = [
  { id: 'bench-press', name: '바벨 벤치프레스', category: 'chest' as const },
  { id: 'incline-db-press', name: '인클라인 덤벨 프레스', category: 'chest' as const },
  { id: 'squat', name: '바벨 백스쿼트', category: 'legs' as const },
  { id: 'leg-press', name: '레그 프레스', category: 'legs' as const },
  { id: 'deadlift', name: '컨벤셔널 데드리프트', category: 'back' as const },
  { id: 'barbell-row', name: '바벨 로우', category: 'back' as const },
  { id: 'ohp', name: '오버헤드 프레스 (OHP)', category: 'shoulders' as const },
  { id: 'lat-pulldown', name: '랫 풀다운', category: 'back' as const },
  { id: 'cable-fly', name: '케이블 크로스오버 플라이', category: 'chest' as const },
];

export const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkout,
  initialPreset,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [title, setTitle] = useState<string>('오늘의 파워 루틴');
  const [durationMinutes, setDurationMinutes] = useState<number>(65);
  const [memo, setMemo] = useState<string>('');

  const [exercises, setExercises] = useState<IExerciseLog[]>(() => {
    if (initialPreset) {
      return [
        {
          id: 'ex-preset-1',
          exerciseId: initialPreset.exerciseId,
          exerciseName: initialPreset.exerciseName,
          category: initialPreset.category,
          sets: [
            { id: 's1', setNumber: 1, weight: initialPreset.warmupSet.weight, reps: initialPreset.warmupSet.reps, completed: true, isWarmup: true },
            { id: 's2', setNumber: 2, weight: initialPreset.hypertrophySet.weight, reps: initialPreset.hypertrophySet.reps, completed: true },
            { id: 's3', setNumber: 3, weight: initialPreset.hypertrophySet.weight, reps: initialPreset.hypertrophySet.reps, completed: true },
            { id: 's4', setNumber: 4, weight: initialPreset.hypertrophySet.weight, reps: initialPreset.hypertrophySet.reps, completed: true },
          ]
        }
      ];
    }
    return [
      {
        id: 'ex-default-1',
        exerciseId: 'bench-press',
        exerciseName: '바벨 벤치프레스',
        category: 'chest',
        sets: [
          { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true, isWarmup: true },
          { id: 's2', setNumber: 2, weight: 70, reps: 8, completed: true },
          { id: 's3', setNumber: 3, weight: 75, reps: 6, completed: true },
          { id: 's4', setNumber: 4, weight: 80, reps: 5, completed: true },
        ]
      }
    ];
  });

  if (!isOpen) return null;

  const currentTotalVolume = VolumeService.calculateSessionVolume(exercises);

  const handleAddExercise = (opt: typeof DEFAULT_EXERCISE_OPTIONS[0]) => {
    const newEx: IExerciseLog = {
      id: `ex-${Date.now()}`,
      exerciseId: opt.id,
      exerciseName: opt.name,
      category: opt.category,
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, weight: 60, reps: 10, completed: true }
      ]
    };
    setExercises(prev => [...prev, newEx]);
  };

  const handleRemoveExercise = (exId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exId));
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: IExerciseSet = {
          id: `set-${Date.now()}`,
          setNumber: ex.sets.length + 1,
          weight: lastSet ? lastSet.weight : 60,
          reps: lastSet ? lastSet.reps : 10,
          completed: true,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps' | 'completed',
    value: number | boolean
  ) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id !== setId) return s;
            return { ...s, [field]: value };
          })
        };
      })
    );
  };

  const handleAdjustWeight = (exerciseId: string, setId: string, delta: number) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id !== setId) return s;
            return { ...s, weight: Math.max(0, Math.round((s.weight + delta) * 10) / 10) };
          })
        };
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const remaining = ex.sets.filter(s => s.id !== setId);
        return {
          ...ex,
          sets: remaining.map((s, idx) => ({ ...s, setNumber: idx + 1 }))
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: WorkoutSession = {
      id: `workout-${Date.now()}`,
      date,
      title: title || '오늘의 운동',
      durationMinutes: durationMinutes || 60,
      exercises,
      memo,
      totalVolume: currentTotalVolume,
    };
    onSaveWorkout(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#121217] border border-[#23232D] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#23232D] bg-[#0A0A0E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center font-black shadow-md shadow-[#D4FF00]/30">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">운동 일지 상세 작성</h2>
              <p className="text-xs text-slate-400">종목별 중량(kg)과 반복횟수(reps)를 기입하면 볼륨이 자동 계산됩니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#181820] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D4FF00]" />
                운동 날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0A0A0E] border border-[#23232D] rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:border-[#D4FF00]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FFB703]" />
                루틴 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 가슴 & 삼두 파워 데이"
                className="w-full bg-[#0A0A0E] border border-[#23232D] rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:border-[#D4FF00]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                운동 시간 (분)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0A0A0E] border border-[#23232D] rounded-xl px-3 py-2 text-xs font-black text-white font-mono-num outline-none focus:border-[#D4FF00]"
              />
            </div>
          </div>

          {/* Realtime Volume Preview Banner */}
          <div className="bg-[#0A0A0E] border border-[#D4FF00]/40 rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#D4FF00]">
                실시간 세션 총 볼륨
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono-num">
                {VolumeService.formatKg(currentTotalVolume)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-300">
              총 {exercises.length}개 종목 ·{' '}
              <strong className="text-[#D4FF00] font-black font-mono-num">
                {exercises.reduce((sum, e) => sum + e.sets.filter(s => s.completed).length, 0)}세트
              </strong>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              수행 종목 및 세트 (중량 x 횟수)
            </h3>

            {exercises.map((ex, exIdx) => {
              const exVol = VolumeService.calculateExerciseVolume(ex);
              return (
                <div
                  key={ex.id}
                  className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-[#181820] text-[#D4FF00] text-xs flex items-center justify-center font-black">
                        {exIdx + 1}
                      </span>
                      <span className="font-extrabold text-sm text-white">{ex.exerciseName}</span>
                      <span className="text-[10px] text-slate-400 uppercase bg-[#181820] px-2 py-0.5 rounded border border-[#23232D]">
                        {ex.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#D4FF00] font-mono-num">
                        {VolumeService.formatKg(exVol)}
                      </span>
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="text-slate-500 hover:text-[#FF3B56] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Set Rows */}
                  <div className="space-y-2">
                    {ex.sets.map(s => (
                      <div key={s.id} className="bg-[#121217] border border-[#23232D] rounded-xl p-2.5 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400">Set #{s.setNumber}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(ex.id, s.id, -2.5)}
                              className="px-1.5 py-0.5 rounded bg-[#181820] text-[10px] text-slate-300 border border-[#23232D]"
                            >
                              -2.5kg
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustWeight(ex.id, s.id, 2.5)}
                              className="px-1.5 py-0.5 rounded bg-[#181820] text-[10px] text-[#D4FF00] border border-[#23232D]"
                            >
                              +2.5kg
                            </button>
                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(ex.id, s.id)}
                                className="p-0.5 text-slate-500 hover:text-rose-400 ml-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.5"
                                value={s.weight}
                                onChange={(e) =>
                                  handleUpdateSet(ex.id, s.id, 'weight', parseFloat(e.target.value) || 0)
                                }
                                className="w-full bg-[#181820] border border-[#23232D] rounded-lg px-2.5 py-1 text-xs font-black text-white font-mono-num outline-none focus:border-[#D4FF00]"
                              />
                              <span className="absolute right-2 top-1 text-[10px] text-slate-500">kg</span>
                            </div>
                          </div>

                          <div className="col-span-5">
                            <div className="relative">
                              <input
                                type="number"
                                value={s.reps}
                                onChange={(e) =>
                                  handleUpdateSet(ex.id, s.id, 'reps', parseInt(e.target.value) || 0)
                                }
                                className="w-full bg-[#181820] border border-[#23232D] rounded-lg px-2.5 py-1 text-xs font-black text-white font-mono-num outline-none focus:border-[#D4FF00]"
                              />
                              <span className="absolute right-2 top-1 text-[10px] text-slate-500">reps</span>
                            </div>
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleUpdateSet(ex.id, s.id, 'completed', !s.completed)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                s.completed
                                  ? 'bg-[#D4FF00] text-black shadow-md'
                                  : 'bg-[#181820] border border-[#23232D] text-slate-600'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSet(ex.id)}
                    className="w-full py-1.5 text-xs font-bold text-slate-300 hover:text-[#D4FF00] hover:bg-[#181820] rounded-xl border border-dashed border-[#23232D] hover:border-[#D4FF00]/50 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>세트 추가</span>
                  </button>
                </div>
              );
            })}

            {/* Quick Add Exercise */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2">
                + 새 종목 추가:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_EXERCISE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAddExercise(opt)}
                    className="px-2.5 py-1 rounded-lg bg-[#0A0A0E] hover:bg-[#181820] border border-[#23232D] hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-[#D4FF00]" />
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Memo textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              운동 메모 (컨디션, 특이사항)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="오늘 벤치프레스 세트 증량 성공, 어깨 가동범위 양호..."
              rows={2}
              className="w-full bg-[#0A0A0E] border border-[#23232D] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4FF00]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#23232D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#0A0A0E] hover:bg-[#181820] border border-[#23232D] transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black text-black bg-gradient-to-r from-[#D4FF00] to-[#A3E635] hover:brightness-105 shadow-lg shadow-[#D4FF00]/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>기록 저장 및 볼륨 반영</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
