/**
 * SOLID - Single Responsibility Principle (SRP)
 * 과거 누적 볼륨 및 실시간 피로도(RPE) 기반 다음 세트 무게/반복수/쉬는시간 스마트 추천 서비스
 */
import {
  ExerciseCategory,
  IExerciseLog,
  IExerciseSet,
  INextSetRecommendation,
  WorkoutSession,
} from '../../models/fitness';
import { VolumeService } from './VolumeService';

export interface IProgressionInput {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  currentSets: IExerciseSet[];
  pastWorkouts: WorkoutSession[];
}

export class ProgressionRecommendationService {
  /**
   * 휴식시간(초)을 친근한 한국어 형식(예: 1분 30초, 2분)으로 변환
   */
  static formatRestSeconds(seconds: number): string {
    const s = Math.max(0, Math.round(seconds));
    if (s < 60) return `${s}초`;
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    return remainder > 0 ? `${mins}분 ${remainder}초` : `${mins}분`;
  }

  /**
   * 헬스장 바벨/덤벨 원판 단위(기본 2.5kg)로 반올림
   */
  static roundToPlateUnit(weight: number, step = 2.5): number {
    if (weight <= 0) return 0;
    return Math.round(weight / step) * step;
  }

  /**
   * 동일 종목의 가장 최근 과거 세션과 세트 기록 탐색
   */
  static findLatestPastExerciseLog(
    exerciseId: string,
    pastWorkouts: WorkoutSession[]
  ): { session: WorkoutSession; log: IExerciseLog } | null {
    if (!pastWorkouts || pastWorkouts.length === 0) return null;

    // 날짜 기준 최신순 정렬
    const sorted = [...pastWorkouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const session of sorted) {
      const match = session.exercises.find((ex) => ex.exerciseId === exerciseId);
      if (match && match.sets && match.sets.length > 0) {
        return { session, log: match };
      }
    }
    return null;
  }

  /**
   * 실시간 세트 및 누적 볼륨 기반 다음 세트 [무게, 횟수, 쉬는시간] 추천
   */
  static getNextRecommendation(input: IProgressionInput): INextSetRecommendation {
    const { exerciseId, category, currentSets, pastWorkouts } = input;
    const isCompound = category === 'legs' || category === 'back' || category === 'chest';
    const baseRest = isCompound ? 120 : 90;

    // 1. 과거 동일 종목 세션 기록 확인
    const pastData = this.findLatestPastExerciseLog(exerciseId, pastWorkouts);
    const priorVolume = pastData ? VolumeService.calculateExerciseVolume(pastData.log) : undefined;
    const priorMaxWeight = pastData
      ? Math.max(...pastData.log.sets.filter((s) => s.completed).map((s) => s.weight), 0)
      : 0;

    // 2. 현재 세션에서 완료된 세트 분석
    const completedSets = currentSets.filter((s) => s.completed);
    const currentCompletedCount = completedSets.length;
    const lastCompleted = completedSets[currentCompletedCount - 1];

    // CASE 1: 아직 현재 세션 완료 세트가 없는 경우 (1세트 또는 웜업 준비)
    if (!lastCompleted) {
      const firstSet = currentSets[0];
      const targetWeight = priorMaxWeight > 0
        ? this.roundToPlateUnit(priorMaxWeight * 0.8) // 본세트 80%로 시작
        : firstSet ? firstSet.weight : 60;
      const targetReps = firstSet ? firstSet.reps : 10;
      const expectedSetVolume = targetWeight * targetReps;

      let reason = '첫 세트는 워밍업과 자세 집중을 권장해요.';
      if (priorVolume && priorVolume > 0) {
        reason = `지난 세션 총 볼륨(${VolumeService.formatKg(priorVolume)}) 대비 점진적 성장을 준비해볼까요?`;
      }

      return {
        targetWeight,
        targetReps,
        recommendedRestSeconds: baseRest,
        reason,
        statusBadge: 'maintain',
        statusText: '웜업 & 세팅',
        expectedSetVolume,
        restFormatted: this.formatRestSeconds(baseRest),
        priorVolume,
      };
    }

    // CASE 2: 방금 완료한 세트가 있는 경우 -> RPE 및 피로도 기반 실시간 연산
    const lastRpe = lastCompleted.rpe;
    const lastWeight = lastCompleted.weight;
    const lastReps = lastCompleted.reps;

    // 2-A: RPE 9.5 이상 또는 10 (한계 도달, 실패 지점 직전)
    if (lastRpe !== undefined && lastRpe >= 9.5) {
      const adjustedReps = Math.max(4, lastReps - 1);
      const fatigueRest = baseRest + 30; // 30초 추가 휴식
      const expectedVol = lastWeight * adjustedReps;

      return {
        targetWeight: lastWeight,
        targetReps: adjustedReps,
        recommendedRestSeconds: fatigueRest,
        reason: '방금 한계(RPE 10)까지 쥐어짰어요! 신경계 회복을 위해 쉬는 시간을 늘리고 자세에 집중하세요.',
        statusBadge: 'fatigue_care',
        statusText: '피로 관리',
        expectedSetVolume: expectedVol,
        restFormatted: this.formatRestSeconds(fatigueRest),
        priorVolume,
      };
    }

    // 2-B: RPE 9 (높은 부하 구간)
    if (lastRpe === 9) {
      const fatigueRest = baseRest + 15;
      const expectedVol = lastWeight * lastReps;

      return {
        targetWeight: lastWeight,
        targetReps: lastReps,
        recommendedRestSeconds: fatigueRest,
        reason: '강한 자극 구간이에요. 중량을 유지하고 호흡을 가다듬은 뒤 세트를 이어가세요.',
        statusBadge: 'maintain',
        statusText: '강도 유지',
        expectedSetVolume: expectedVol,
        restFormatted: this.formatRestSeconds(fatigueRest),
        priorVolume,
      };
    }

    // 2-C: RPE 7 이하 (충분한 여유가 있음 - 확실한 점진적 과부하 기회!)
    if (lastRpe !== undefined && lastRpe <= 7) {
      const targetWeight = this.roundToPlateUnit(lastWeight + 2.5);
      const expectedVol = targetWeight * lastReps;
      const overloadRest = baseRest;

      return {
        targetWeight,
        targetReps: lastReps,
        recommendedRestSeconds: overloadRest,
        reason: `직전 세트에 3회 이상 여유가 있었어요. +2.5kg 증량(${targetWeight}kg)으로 점진적 과부하를 노려보세요!`,
        statusBadge: 'overload',
        statusText: '과부하 증량',
        expectedSetVolume: expectedVol,
        restFormatted: this.formatRestSeconds(overloadRest),
        priorVolume,
      };
    }

    // 2-D: RPE 8 (적정 근비대 황금 구간) 또는 RPE 미입력 기본 로직
    // 지난 세션 볼륨과의 점진적 과부하 델타를 고려
    const currentSessionVolume = currentSets.reduce(
      (sum, s) => (s.completed ? sum + s.weight * s.reps : sum),
      0
    );

    // 아직 세트가 많이 남았고 여유가 있으면 살짝 횟수 또는 무게 도전
    let targetWeight = lastWeight;
    let targetReps = lastReps;
    let badge: 'overload' | 'maintain' = 'maintain';
    let statusText = '페이스 유지';
    let reason = '가장 이상적인 근비대 자극(RPE 8)이에요. 동일 중량과 횟수로 완주해보세요.';

    if (currentCompletedCount >= 2 && lastReps >= 10) {
      // 10회 이상 고반복 성공 시 무게 2.5kg 증량 & 8회로 조절 추천
      targetWeight = this.roundToPlateUnit(lastWeight + 2.5);
      targetReps = 8;
      badge = 'overload';
      statusText = '중량 증량';
      reason = `10회 수행을 달성했으므로 무게를 +2.5kg 올리고(${targetWeight}kg) 8회에 도전해보세요!`;
    } else if (priorVolume && currentSessionVolume < priorVolume * 0.7 && currentCompletedCount >= 3) {
      reason = `지난번 볼륨(${VolumeService.formatKg(priorVolume)}) 돌파까지 얼마 남지 않았어요! 완주해볼까요?`;
    }

    return {
      targetWeight,
      targetReps,
      recommendedRestSeconds: baseRest,
      reason,
      statusBadge: badge,
      statusText,
      expectedSetVolume: targetWeight * targetReps,
      restFormatted: this.formatRestSeconds(baseRest),
      priorVolume,
    };
  }
}
