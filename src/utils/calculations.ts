import { ExerciseLog, InBodyData, RecommendedWeight, WorkoutSession } from '../types/fitness';

/**
 * 1RM 추정 (Epley 공식)
 * 1RM = Weight * (1 + Reps / 30)
 */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * 단일 운동 로그의 총 볼륨 계산
 */
export function calculateExerciseVolume(exercise: ExerciseLog): number {
  return exercise.sets.reduce((total, set) => {
    if (!set.completed) return total;
    return total + set.weight * set.reps;
  }, 0);
}

/**
 * 세션 전체 총 볼륨 계산
 */
export function calculateSessionVolume(exercises: ExerciseLog[]): number {
  return exercises.reduce((acc, ex) => acc + calculateExerciseVolume(ex), 0);
}

/**
 * 잔디 히트맵 레벨 계산 (0 ~ 4)
 */
export function getHeatmapLevel(volume: number): number {
  if (!volume || volume === 0) return 0;
  if (volume < 5000) return 1;
  if (volume < 12000) return 2;
  if (volume < 20000) return 3;
  return 4;
}

/**
 * 인바디 데이터 기반 운동별 추천 중량 산출 알고리즘
 */
export function calculateInBodyRecommendations(inbody: InBodyData): RecommendedWeight[] {
  const { gender, weight, muscleMass, experienceLevel } = inbody;

  // 근육 충실도 지수 (골격근량 / 체중)
  // 일반 성인 남성 평균: 약 0.42~0.46, 여성: 0.32~0.36
  const standardRatio = gender === 'male' ? 0.44 : 0.34;
  const currentRatio = weight > 0 ? muscleMass / weight : standardRatio;
  const muscleBonus = Math.max(-0.2, Math.min(0.3, (currentRatio - standardRatio) * 1.5));

  // 경력 계수
  const expMultiplier = {
    beginner: 0.85,
    intermediate: 1.0,
    advanced: 1.25,
  }[experienceLevel];

  // 성별 기본 계수 (여성은 상체는 남성의 약 60%, 하체는 약 75~80%)
  const genderMultiplier = {
    chest: gender === 'male' ? 1.0 : 0.6,
    legs: gender === 'male' ? 1.0 : 0.78,
    back: gender === 'male' ? 1.0 : 0.7,
    shoulders: gender === 'male' ? 1.0 : 0.55,
  };

  // 체중 대비 종목별 1RM 기준비율 (중급자 기준 남성: 벤치 1.0x, 스쿼트 1.4x, 데드 1.6x, OHP 0.65x)
  const exercisesConfig = [
    {
      exerciseId: 'bench-press',
      exerciseName: '바벨 벤치프레스',
      category: 'chest' as const,
      baseRatio: 1.0,
      part: 'chest' as const,
      desc: '가슴/삼두의 핵심 복합 운동'
    },
    {
      exerciseId: 'squat',
      exerciseName: '바벨 백스쿼트',
      category: 'legs' as const,
      baseRatio: 1.4,
      part: 'legs' as const,
      desc: '하체 근력 및 전신 파워의 척도'
    },
    {
      exerciseId: 'deadlift',
      exerciseName: '컨벤셔널 데드리프트',
      category: 'back' as const,
      baseRatio: 1.6,
      part: 'back' as const,
      desc: '후면 사슬 전체와 척추 기립근 강화'
    },
    {
      exerciseId: 'ohp',
      exerciseName: '오버헤드 프레스 (OHP)',
      category: 'shoulders' as const,
      baseRatio: 0.65,
      part: 'shoulders' as const,
      desc: '어깨와 코어 밸런스의 정석'
    },
    {
      exerciseId: 'barbell-row',
      exerciseName: '바벨 로우',
      category: 'back' as const,
      baseRatio: 0.9,
      part: 'back' as const,
      desc: '등 두께감과 광배근 견인력 향상'
    }
  ];

  return exercisesConfig.map(cfg => {
    const raw1RM = weight * cfg.baseRatio * expMultiplier * genderMultiplier[cfg.part] * (1 + muscleBonus);
    // 2.5kg 단위 반올림 (헬스장 원판 최소단위 보통 1.25kg 쌍 = 2.5kg)
    const roundToPlate = (val: number) => Math.max(20, Math.round(val / 2.5) * 2.5);

    const estimated1RM = roundToPlate(raw1RM);
    const warmupWeight = roundToPlate(estimated1RM * 0.5);
    const hypertrophyWeight = roundToPlate(estimated1RM * 0.72);
    const strengthWeight = roundToPlate(estimated1RM * 0.82);

    return {
      exerciseId: cfg.exerciseId,
      exerciseName: cfg.exerciseName,
      category: cfg.category,
      estimated1RM,
      warmupSet: { weight: warmupWeight, reps: 12 },
      hypertrophySet: { weight: hypertrophyWeight, reps: 8 },
      strengthSet: { weight: strengthWeight, reps: 5 },
      rationale: `골격근량 ${muscleMass}kg(${Math.round(currentRatio * 100)}%) 및 ${
        experienceLevel === 'beginner' ? '초급' : experienceLevel === 'intermediate' ? '중급' : '고급'
      } 기준 산출 (${cfg.desc})`,
    };
  });
}

/**
 * 연속 운동 일수 (Streak) 계산
 */
export function calculateStreak(sessions: WorkoutSession[]): { currentStreak: number; maxStreak: number } {
  if (!sessions || sessions.length === 0) return { currentStreak: 0, maxStreak: 0 };

  const dates = Array.from(new Set(sessions.map(s => s.date))).sort();
  if (dates.length === 0) return { currentStreak: 0, maxStreak: 0 };

  // Calculate streaks
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  // Check if current streak extends to today or yesterday
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
 * 숫자 세 자리 콤마 포맷팅
 */
export function formatKg(val: number): string {
  return `${val.toLocaleString()} kg`;
}
