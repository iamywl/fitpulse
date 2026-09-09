import { InBodyData, WorkoutSession } from '../types/fitness';
import { IExerciseLog } from '../models/fitness';

export const INITIAL_INBODY_DATA: InBodyData = {
  gender: 'male',
  weight: 75.0,
  muscleMass: 35.2,
  bodyFatPercent: 15.8,
  experienceLevel: 'intermediate',
  updatedAt: '2026-09-01',
};

// 최근 16주(112일)간의 풍성한 점진적 과부하 훈련 기록 생성기 (토스 블루 5단계 잔디 히트맵 완벽 대응)
export function generateMockWorkouts(): WorkoutSession[] {
  const workouts: WorkoutSession[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 날짜 문자열 계산 (YYYY-MM-DD)
  const getDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // 16주(총 112일)에 걸쳐 주 3~4회 세션 배치
  // week 15 (15주 전) -> week 0 (이번 주)
  for (let week = 15; week >= 0; week--) {
    // 성장 계수 t: 0.0 (15주 전) -> 1.0 (최근)
    const t = (15 - week) / 15;

    // 주차별 기준일 (해당 주의 시작점)
    const baseDaysAgo = week * 7;

    // 1. 월요일 (가슴 & 삼두) - 매주 수행
    const monDaysAgo = baseDaysAgo + 6;
    if (monDaysAgo >= 1) {
      const benchBase = 50 + Math.round((32.5 * t) / 2.5) * 2.5; // 50kg -> 82.5kg
      const incDbBase = 18 + Math.round((12 * t) / 2) * 2;       // 18kg -> 30kg
      const pushdownBase = 20 + Math.round((15 * t) / 5) * 5;    // 20kg -> 35kg
      const setsCount = week > 8 ? 4 : 3;

      const exercises: IExerciseLog[] = [
        {
          id: `ex-mon-1-${week}`,
          exerciseId: 'bench-press',
          exerciseName: '바벨 벤치프레스',
          category: 'chest',
          sets: Array.from({ length: setsCount }, (_, s) => ({
            id: `s-bp-${week}-${s}`,
            setNumber: s + 1,
            weight: benchBase - (setsCount - 1 - s) * 2.5,
            reps: 8 + (s % 2),
            completed: true,
            isWarmup: s === 0,
          })),
        },
        {
          id: `ex-mon-2-${week}`,
          exerciseId: 'incline-db-press',
          exerciseName: '인클라인 덤벨 프레스',
          category: 'chest',
          sets: Array.from({ length: setsCount }, (_, s) => ({
            id: `s-inc-${week}-${s}`,
            setNumber: s + 1,
            weight: incDbBase,
            reps: 10,
            completed: true,
          })),
        },
        {
          id: `ex-mon-3-${week}`,
          exerciseId: 'cable-pushdown',
          exerciseName: '케이블 트라이셉스 푸시다운',
          category: 'arms',
          sets: Array.from({ length: 3 }, (_, s) => ({
            id: `s-pd-${week}-${s}`,
            setNumber: s + 1,
            weight: pushdownBase,
            reps: 12,
            completed: true,
          })),
        },
      ];

      let vol = 0;
      exercises.forEach(e => e.sets.forEach(s => { if (s.completed) vol += s.weight * s.reps; }));

      workouts.push({
        id: `workout-mon-${week}`,
        date: getDateStr(monDaysAgo),
        title: '가슴 & 삼두 루틴',
        durationMinutes: 65,
        memo: week === 0 ? '벤치프레스 82.5kg 세트 성공! 펌핑감 최고' : undefined,
        exercises,
        totalVolume: vol,
      });
    }

    // 2. 수요일 (하체 & 코어) - 매주 수행
    const wedDaysAgo = baseDaysAgo + 4;
    if (wedDaysAgo >= 1) {
      const squatBase = 70 + Math.round((55 * t) / 2.5) * 2.5; // 70kg -> 125kg
      const legPressBase = 120 + Math.round((80 * t) / 10) * 10; // 120kg -> 200kg
      const setsCount = week > 8 ? 4 : 3;

      const exercises: IExerciseLog[] = [
        {
          id: `ex-wed-1-${week}`,
          exerciseId: 'squat',
          exerciseName: '바벨 백스쿼트',
          category: 'legs',
          sets: Array.from({ length: setsCount }, (_, s) => ({
            id: `s-sq-${week}-${s}`,
            setNumber: s + 1,
            weight: squatBase - (setsCount - 1 - s) * 5,
            reps: 6 + (s % 3),
            completed: true,
            isWarmup: s === 0,
          })),
        },
        {
          id: `ex-wed-2-${week}`,
          exerciseId: 'leg-press',
          exerciseName: '레그 프레스',
          category: 'legs',
          sets: Array.from({ length: setsCount }, (_, s) => ({
            id: `s-lp-${week}-${s}`,
            setNumber: s + 1,
            weight: legPressBase,
            reps: 10,
            completed: true,
          })),
        },
      ];

      let vol = 0;
      exercises.forEach(e => e.sets.forEach(s => { if (s.completed) vol += s.weight * s.reps; }));

      workouts.push({
        id: `workout-wed-${week}`,
        date: getDateStr(wedDaysAgo),
        title: '하체 파워 루틴',
        durationMinutes: 70,
        memo: week === 0 ? '스쿼트 125kg 4회 안정적으로 안착' : undefined,
        exercises,
        totalVolume: vol,
      });
    }

    // 3. 금요일 (등 & 이두) - 매주 수행
    const friDaysAgo = baseDaysAgo + 2;
    if (friDaysAgo >= 1) {
      const dlBase = 80 + Math.round((65 * t) / 2.5) * 2.5;     // 80kg -> 145kg
      const rowBase = 45 + Math.round((30 * t) / 2.5) * 2.5;    // 45kg -> 75kg
      const pulldownBase = 40 + Math.round((25 * t) / 5) * 5;   // 40kg -> 65kg
      const setsCount = week > 8 ? 4 : 3;

      const exercises: IExerciseLog[] = [
        {
          id: `ex-fri-1-${week}`,
          exerciseId: 'deadlift',
          exerciseName: '컨벤셔널 데드리프트',
          category: 'back',
          sets: Array.from({ length: setsCount }, (_, s) => ({
            id: `s-dl-${week}-${s}`,
            setNumber: s + 1,
            weight: dlBase - (setsCount - 1 - s) * 5,
            reps: 5,
            completed: true,
            isWarmup: s === 0,
          })),
        },
        {
          id: `ex-fri-2-${week}`,
          exerciseId: 'barbell-row',
          exerciseName: '바벨 벤트오버 로우',
          category: 'back',
          sets: Array.from({ length: setsCount }, (_, s) => ({
            id: `s-row-${week}-${s}`,
            setNumber: s + 1,
            weight: rowBase,
            reps: 8,
            completed: true,
          })),
        },
        {
          id: `ex-fri-3-${week}`,
          exerciseId: 'lat-pulldown',
          exerciseName: '랫풀다운',
          category: 'back',
          sets: Array.from({ length: 3 }, (_, s) => ({
            id: `s-lat-${week}-${s}`,
            setNumber: s + 1,
            weight: pulldownBase,
            reps: 10,
            completed: true,
          })),
        },
      ];

      let vol = 0;
      exercises.forEach(e => e.sets.forEach(s => { if (s.completed) vol += s.weight * s.reps; }));

      workouts.push({
        id: `workout-fri-${week}`,
        date: getDateStr(friDaysAgo),
        title: '등 & 데드리프트 루틴',
        durationMinutes: 75,
        memo: week === 0 ? '데드리프트 145kg 성공! PR 달성' : undefined,
        exercises,
        totalVolume: vol,
      });
    }

    // 4. 토요일 (어깨 & 팔) - 격주 또는 중후반부(week <= 10) 추가 수행
    const satDaysAgo = baseDaysAgo + 1;
    if (satDaysAgo >= 1 && (week <= 10 || week % 2 === 0)) {
      const ohpBase = 35 + Math.round((22.5 * t) / 2.5) * 2.5; // 35kg -> 57.5kg
      const latRaiseBase = 8 + Math.round((8 * t) / 2) * 2;    // 8kg -> 16kg

      const exercises: IExerciseLog[] = [
        {
          id: `ex-sat-1-${week}`,
          exerciseId: 'ohp',
          exerciseName: '오버헤드 프레스 (OHP)',
          category: 'shoulders',
          sets: Array.from({ length: 4 }, (_, s) => ({
            id: `s-ohp-${week}-${s}`,
            setNumber: s + 1,
            weight: ohpBase - (3 - s) * 2.5,
            reps: 7,
            completed: true,
            isWarmup: s === 0,
          })),
        },
        {
          id: `ex-sat-2-${week}`,
          exerciseId: 'lateral-raise',
          exerciseName: '사이드 레터럴 레이즈',
          category: 'shoulders',
          sets: Array.from({ length: 4 }, (_, s) => ({
            id: `s-lr-${week}-${s}`,
            setNumber: s + 1,
            weight: latRaiseBase,
            reps: 15,
            completed: true,
          })),
        },
      ];

      let vol = 0;
      exercises.forEach(e => e.sets.forEach(s => { if (s.completed) vol += s.weight * s.reps; }));

      workouts.push({
        id: `workout-sat-${week}`,
        date: getDateStr(satDaysAgo),
        title: '어깨 & 삼각근 집중',
        durationMinutes: 55,
        exercises,
        totalVolume: vol,
      });
    }
  }

  // 날짜 오름차순 정렬
  return workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
