/**
 * SOLID - Single Responsibility Principle (SRP)
 * 볼륨 및 1RM 연산 전담 서비스
 */
import { IExerciseLog, IExerciseSet, IWorkoutSession, IVolumeComparison } from '../../models/fitness';

export class VolumeService {
  /**
   * Epley 공식을 통한 1RM 추정
   * 1RM = Weight * (1 + Reps / 30)
   */
  static estimate1RM(weight: number, reps: number): number {
    if (reps <= 0 || weight <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  /**
   * 단일 세트 볼륨: 중량(kg) x 반복수(reps)
   */
  static calculateSetVolume(set: IExerciseSet): number {
    if (!set.completed) return 0;
    return Math.max(0, set.weight) * Math.max(0, set.reps);
  }

  /**
   * 단일 종목 총 볼륨
   */
  static calculateExerciseVolume(exercise: IExerciseLog): number {
    return exercise.sets.reduce((sum, s) => sum + this.calculateSetVolume(s), 0);
  }

  /**
   * 세션 전체 총 볼륨
   */
  static calculateSessionVolume(exercises: IExerciseLog[]): number {
    return exercises.reduce((sum, ex) => sum + this.calculateExerciseVolume(ex), 0);
  }

  /**
   * 지난 세션 대비 볼륨 증감 비교
   */
  static compareVolume(currentSession: IWorkoutSession, previousSession: IWorkoutSession): IVolumeComparison {
    const currVol = currentSession.totalVolume;
    const prevVol = previousSession.totalVolume;
    const delta = currVol - prevVol;
    const percent = prevVol > 0 ? (delta / prevVol) * 100 : 0;

    return {
      currentVolume: currVol,
      previousVolume: prevVol,
      volumeDelta: delta,
      percentDelta: Math.round(percent * 10) / 10,
      isOverload: delta > 0,
      isDeload: delta < -500 && percent < -5,
    };
  }

  /**
   * GitHub 히트맵 레벨 (0~4) 산정
   */
  static getHeatmapLevel(volume: number): number {
    if (!volume || volume <= 0) return 0;
    if (volume < 5000) return 1;
    if (volume < 12000) return 2;
    if (volume < 20000) return 3;
    return 4;
  }

  /**
   * 연속 운동일수 (Streak) 계산
   */
  static calculateStreak(sessions: IWorkoutSession[]): { currentStreak: number; maxStreak: number } {
    if (!sessions || sessions.length === 0) return { currentStreak: 0, maxStreak: 0 };

    const dates = Array.from(new Set(sessions.map(s => s.date))).sort();
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }

    const lastDate = new Date(dates[dates.length - 1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    const diffFromToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const activeCurrentStreak = diffFromToday <= 1 ? currentStreak : 0;

    return {
      currentStreak: activeCurrentStreak,
      maxStreak: Math.max(maxStreak, activeCurrentStreak)
    };
  }

  /**
   * 통일된 단위 표기
   */
  static formatKg(val: number): string {
    return `${Math.round(val).toLocaleString()} kg`;
  }

  // ─── RPE (Rate of Perceived Exertion) 유틸리티 ────────────────────────────

  /**
   * RIR(Reps in Reserve) 계산: RIR = 10 - RPE
   */
  static rpeToRIR(rpe: number): number {
    return Math.max(0, 10 - rpe);
  }

  /**
   * RPE 체감 강도 피드백 텍스트 (헬스장 한 손 조작 UX용)
   */
  static getRPEFeedback(rpe: number): string {
    if (rpe >= 10) return '올아웃 🔥';
    if (rpe >= 9)  return '여유 1개 미만';
    if (rpe >= 8)  return '여유 1~2개';
    if (rpe >= 7)  return '여유 3개 내외';
    if (rpe >= 6)  return '여유 있음';
    return '';
  }

  /**
   * 세션 내 완료된 세트들의 평균 RPE 산출
   */
  static getAverageRPE(sets: IExerciseSet[]): number | null {
    const rpeValues = sets
      .filter(s => s.completed && s.rpe !== undefined && s.rpe !== null)
      .map(s => s.rpe as number);
    if (rpeValues.length === 0) return null;
    const avg = rpeValues.reduce((sum, r) => sum + r, 0) / rpeValues.length;
    return Math.round(avg * 10) / 10;
  }
}
