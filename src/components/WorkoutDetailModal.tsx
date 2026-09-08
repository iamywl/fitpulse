import React from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { X, Calendar, Clock } from 'lucide-react';

interface WorkoutDetailModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
  onDelete?: (workoutId: string) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  onClose,
  onDelete,
}) => {
  if (!workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#121217] border border-[#23232D] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#23232D] bg-[#0A0A0E]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#D4FF00] font-black mb-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{workout.date}</span>
            </div>
            <h2 className="text-base font-black text-white">{workout.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#181820] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-[#0A0A0E] p-3 rounded-2xl border border-[#23232D]">
            <div>
              <span className="text-[11px] text-slate-400 font-bold">총 수행 볼륨</span>
              <div className="text-lg font-black text-[#D4FF00] font-mono-num">
                {VolumeService.formatKg(workout.totalVolume)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold">운동 시간</span>
              <div className="text-lg font-black text-[#38BDF8] font-mono-num flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <span>{workout.durationMinutes}분</span>
              </div>
            </div>
          </div>

          {workout.memo && (
            <div className="bg-[#0A0A0E] p-3 rounded-xl border border-[#23232D] text-xs text-slate-200">
              <span className="text-slate-400 font-bold block mb-0.5">메모</span>
              {workout.memo}
            </div>
          )}

          {/* Exercises & Sets */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              운동 세부 내역 ({workout.exercises.length}개 종목)
            </h3>
            {workout.exercises.map((ex, idx) => (
              <div
                key={ex.id || idx}
                className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-white">{ex.exerciseName}</span>
                  <span className="text-[10px] text-slate-400 uppercase bg-[#181820] px-2 py-0.5 rounded-md border border-[#23232D]">
                    {ex.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {ex.sets.map((s, sIdx) => (
                    <div
                      key={s.id || sIdx}
                      className={`p-2 rounded-xl border font-mono-num text-center ${
                        s.completed
                          ? 'bg-[#181820] border-[#D4FF00]/40 text-white'
                          : 'bg-[#0A0A0E] border-dashed border-[#23232D] text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">Set #{s.setNumber}</div>
                      <div className="font-black text-xs mt-0.5 text-[#D4FF00]">
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
        <div className="p-3 border-t border-[#23232D] bg-[#0A0A0E] flex justify-between items-center">
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
                  onDelete(workout.id);
                  onClose();
                }
              }}
              className="text-xs text-[#FF3B56] hover:text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#FF3B56]/20 transition-all"
            >
              기록 삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#181820] hover:bg-slate-700 border border-[#23232D] transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
