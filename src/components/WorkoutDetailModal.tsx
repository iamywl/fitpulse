import React from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { X, Calendar, Clock } from 'lucide-react';
import { ThemeMode } from '../theme/pantone';

interface WorkoutDetailModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
  onDelete?: (workoutId: string) => void;
  themeMode?: ThemeMode;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  onClose,
  onDelete,
  themeMode = 'dark',
}) => {
  if (!workout) return null;
  const isLight = themeMode === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121217] border-[#23232D] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
          <div>
            <div className={`flex items-center gap-1.5 text-xs font-black mb-0.5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{workout.date}</span>
            </div>
            <h2 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{workout.title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#181820]'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className={`grid grid-cols-2 gap-3 p-3 rounded-2xl border transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
            <div>
              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>총 수행 볼륨</span>
              <div className={`text-lg font-black font-mono-num ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                {VolumeService.formatKg(workout.totalVolume)}
              </div>
            </div>
            <div>
              <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>운동 시간</span>
              <div className={`text-lg font-black font-mono-num flex items-center gap-1 ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>
                <Clock className="w-4 h-4" />
                <span>{workout.durationMinutes}분</span>
              </div>
            </div>
          </div>

          {workout.memo && (
            <div className={`p-3 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0A0A0E] border-[#23232D] text-slate-200'}`}>
              <span className={`font-bold block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>메모</span>
              {workout.memo}
            </div>
          )}

          {/* Exercises & Sets */}
          <div className="space-y-3">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              운동 세부 내역 ({workout.exercises.length}개 종목)
            </h3>
            {workout.exercises.map((ex, idx) => (
              <div
                key={ex.id || idx}
                className={`border rounded-2xl p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{ex.exerciseName}</span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md border ${
                    isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-[#181820] text-slate-400 border-[#23232D]'
                  }`}>
                    {ex.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {ex.sets.map((s, sIdx) => (
                    <div
                      key={s.id || sIdx}
                      className={`p-2 rounded-xl border font-mono-num text-center transition-colors ${
                        s.completed
                          ? isLight
                            ? 'bg-white border-lime-300 text-slate-900 shadow-sm'
                            : 'bg-[#181820] border-[#D4FF00]/40 text-white'
                          : isLight
                          ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                          : 'bg-[#0A0A0E] border-dashed border-[#23232D] text-slate-500'
                      }`}
                    >
                      <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>Set #{s.setNumber}</div>
                      <div className={`font-black text-xs mt-0.5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                        {s.weight}kg × {s.reps}회
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex justify-between items-center ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#23232D] bg-[#0A0A0E]'}`}>
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
                  onDelete(workout.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all"
            >
              기록 삭제
            </button>
          )}
          <button
            onClick={onClose}
            className={`ml-auto px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isLight
                ? 'text-slate-700 bg-white hover:bg-slate-100 border-slate-300'
                : 'text-white bg-[#181820] hover:bg-slate-700 border-[#23232D]'
            }`}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

