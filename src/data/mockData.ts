import { InBodyData, WorkoutSession } from '../types/fitness';

export const INITIAL_INBODY_DATA: InBodyData = {
  gender: 'male',
  weight: 75.0,
  muscleMass: 35.2,
  bodyFatPercent: 15.8,
  experienceLevel: 'intermediate',
  updatedAt: '2026-09-01',
};

// 최근 60일 간의 샘플 운동 기록 생성기
export function generateMockWorkouts(): WorkoutSession[] {
  const workouts: WorkoutSession[] = [];
  const today = new Date();

  // 날짜 오프셋 도우미 (YYYY-MM-DD)
  const getDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // 과거 운동 시나리오 (점진적 과부하 반영)
  const historyConfigs = [
    {
      daysAgo: 28,
      title: '가슴 & 삼두 루틴',
      durationMinutes: 65,
      exercises: [
        {
          id: 'ex-1',
          exerciseId: 'bench-press',
          exerciseName: '바벨 벤치프레스',
          category: 'chest' as const,
          sets: [
            { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true },
            { id: 's2', setNumber: 2, weight: 70, reps: 8, completed: true },
            { id: 's3', setNumber: 3, weight: 75, reps: 6, completed: true },
            { id: 's4', setNumber: 4, weight: 75, reps: 5, completed: true },
          ]
        },
        {
          id: 'ex-2',
          exerciseId: 'incline-db-press',
          exerciseName: '인클라인 덤벨 프레스',
          category: 'chest' as const,
          sets: [
            { id: 's5', setNumber: 1, weight: 22, reps: 12, completed: true },
            { id: 's6', setNumber: 2, weight: 24, reps: 10, completed: true },
            { id: 's7', setNumber: 3, weight: 24, reps: 8, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 26,
      title: '하체 파워 루틴',
      durationMinutes: 75,
      exercises: [
        {
          id: 'ex-3',
          exerciseId: 'squat',
          exerciseName: '바벨 백스쿼트',
          category: 'legs' as const,
          sets: [
            { id: 's8', setNumber: 1, weight: 80, reps: 10, completed: true },
            { id: 's9', setNumber: 2, weight: 100, reps: 6, completed: true },
            { id: 's10', setNumber: 3, weight: 105, reps: 5, completed: true },
            { id: 's11', setNumber: 4, weight: 105, reps: 5, completed: true },
          ]
        },
        {
          id: 'ex-4',
          exerciseId: 'leg-press',
          exerciseName: '레그 프레스',
          category: 'legs' as const,
          sets: [
            { id: 's12', setNumber: 1, weight: 160, reps: 12, completed: true },
            { id: 's13', setNumber: 2, weight: 180, reps: 10, completed: true },
            { id: 's14', setNumber: 3, weight: 200, reps: 8, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 24,
      title: '등 & 이두 당기기',
      durationMinutes: 70,
      exercises: [
        {
          id: 'ex-5',
          exerciseId: 'deadlift',
          exerciseName: '컨벤셔널 데드리프트',
          category: 'back' as const,
          sets: [
            { id: 's15', setNumber: 1, weight: 100, reps: 8, completed: true },
            { id: 's16', setNumber: 2, weight: 120, reps: 5, completed: true },
            { id: 's17', setNumber: 3, weight: 130, reps: 4, completed: true },
          ]
        },
        {
          id: 'ex-6',
          exerciseId: 'barbell-row',
          exerciseName: '바벨 로우',
          category: 'back' as const,
          sets: [
            { id: 's18', setNumber: 1, weight: 60, reps: 10, completed: true },
            { id: 's19', setNumber: 2, weight: 65, reps: 8, completed: true },
            { id: 's20', setNumber: 3, weight: 65, reps: 8, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 21,
      title: '어깨 & 삼두 집중',
      durationMinutes: 55,
      exercises: [
        {
          id: 'ex-7',
          exerciseId: 'ohp',
          exerciseName: '오버헤드 프레스 (OHP)',
          category: 'shoulders' as const,
          sets: [
            { id: 's21', setNumber: 1, weight: 40, reps: 10, completed: true },
            { id: 's22', setNumber: 2, weight: 45, reps: 8, completed: true },
            { id: 's23', setNumber: 3, weight: 50, reps: 5, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 19,
      title: '가슴 & 삼두 루틴 (중간 점검)',
      durationMinutes: 65,
      exercises: [
        {
          id: 'ex-8',
          exerciseId: 'bench-press',
          exerciseName: '바벨 벤치프레스',
          category: 'chest' as const,
          sets: [
            { id: 's24', setNumber: 1, weight: 65, reps: 10, completed: true },
            { id: 's25', setNumber: 2, weight: 72.5, reps: 8, completed: true },
            { id: 's26', setNumber: 3, weight: 77.5, reps: 6, completed: true },
            { id: 's27', setNumber: 4, weight: 80, reps: 4, completed: true },
          ]
        },
        {
          id: 'ex-9',
          exerciseId: 'incline-db-press',
          exerciseName: '인클라인 덤벨 프레스',
          category: 'chest' as const,
          sets: [
            { id: 's28', setNumber: 1, weight: 24, reps: 12, completed: true },
            { id: 's29', setNumber: 2, weight: 26, reps: 10, completed: true },
            { id: 's30', setNumber: 3, weight: 26, reps: 8, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 16,
      title: '하체 폭격 루틴',
      durationMinutes: 80,
      exercises: [
        {
          id: 'ex-10',
          exerciseId: 'squat',
          exerciseName: '바벨 백스쿼트',
          category: 'legs' as const,
          sets: [
            { id: 's31', setNumber: 1, weight: 90, reps: 10, completed: true },
            { id: 's32', setNumber: 2, weight: 105, reps: 6, completed: true },
            { id: 's33', setNumber: 3, weight: 110, reps: 5, completed: true },
            { id: 's34', setNumber: 4, weight: 115, reps: 3, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 14,
      title: '등 스트렝스 데이',
      durationMinutes: 70,
      exercises: [
        {
          id: 'ex-11',
          exerciseId: 'deadlift',
          exerciseName: '컨벤셔널 데드리프트',
          category: 'back' as const,
          sets: [
            { id: 's35', setNumber: 1, weight: 110, reps: 6, completed: true },
            { id: 's36', setNumber: 2, weight: 130, reps: 5, completed: true },
            { id: 's37', setNumber: 3, weight: 140, reps: 3, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 11,
      title: '어깨 볼륨업',
      durationMinutes: 60,
      exercises: [
        {
          id: 'ex-12',
          exerciseId: 'ohp',
          exerciseName: '오버헤드 프레스 (OHP)',
          category: 'shoulders' as const,
          sets: [
            { id: 's38', setNumber: 1, weight: 42.5, reps: 10, completed: true },
            { id: 's39', setNumber: 2, weight: 47.5, reps: 7, completed: true },
            { id: 's40', setNumber: 3, weight: 52.5, reps: 5, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 8,
      title: '지난 가슴 세션 (비교 기준)',
      durationMinutes: 70,
      memo: '자세 안정적, 80kg 수월하게 성공',
      exercises: [
        {
          id: 'ex-13',
          exerciseId: 'bench-press',
          exerciseName: '바벨 벤치프레스',
          category: 'chest' as const,
          sets: [
            { id: 's41', setNumber: 1, weight: 70, reps: 10, completed: true },
            { id: 's42', setNumber: 2, weight: 75, reps: 8, completed: true },
            { id: 's43', setNumber: 3, weight: 80, reps: 6, completed: true },
            { id: 's44', setNumber: 4, weight: 80, reps: 5, completed: true },
          ]
        },
        {
          id: 'ex-14',
          exerciseId: 'incline-db-press',
          exerciseName: '인클라인 덤벨 프레스',
          category: 'chest' as const,
          sets: [
            { id: 's45', setNumber: 1, weight: 26, reps: 10, completed: true },
            { id: 's46', setNumber: 2, weight: 26, reps: 10, completed: true },
            { id: 's47', setNumber: 3, weight: 28, reps: 8, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 6,
      title: '하체 헤비 데이',
      durationMinutes: 75,
      exercises: [
        {
          id: 'ex-15',
          exerciseId: 'squat',
          exerciseName: '바벨 백스쿼트',
          category: 'legs' as const,
          sets: [
            { id: 's48', setNumber: 1, weight: 95, reps: 8, completed: true },
            { id: 's49', setNumber: 2, weight: 110, reps: 6, completed: true },
            { id: 's50', setNumber: 3, weight: 120, reps: 4, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 4,
      title: '등 & 데드리프트 신기록 달성',
      durationMinutes: 70,
      memo: '145kg 1회 성공!',
      exercises: [
        {
          id: 'ex-16',
          exerciseId: 'deadlift',
          exerciseName: '컨벤셔널 데드리프트',
          category: 'back' as const,
          sets: [
            { id: 's51', setNumber: 1, weight: 110, reps: 8, completed: true },
            { id: 's52', setNumber: 2, weight: 130, reps: 5, completed: true },
            { id: 's53', setNumber: 3, weight: 145, reps: 2, completed: true },
          ]
        }
      ]
    },
    {
      daysAgo: 1,
      title: '최근 가슴 운동 (점진적 과부하 성공)',
      durationMinutes: 75,
      memo: '지난번 대비 벤치 82.5kg 세트 증량 성공! 펌핑감 최상',
      exercises: [
        {
          id: 'ex-17',
          exerciseId: 'bench-press',
          exerciseName: '바벨 벤치프레스',
          category: 'chest' as const,
          sets: [
            { id: 's54', setNumber: 1, weight: 70, reps: 10, completed: true },
            { id: 's55', setNumber: 2, weight: 77.5, reps: 8, completed: true },
            { id: 's56', setNumber: 3, weight: 82.5, reps: 6, completed: true },
            { id: 's57', setNumber: 4, weight: 82.5, reps: 5, completed: true },
          ]
        },
        {
          id: 'ex-18',
          exerciseId: 'incline-db-press',
          exerciseName: '인클라인 덤벨 프레스',
          category: 'chest' as const,
          sets: [
            { id: 's58', setNumber: 1, weight: 26, reps: 12, completed: true },
            { id: 's59', setNumber: 2, weight: 28, reps: 10, completed: true },
            { id: 's60', setNumber: 3, weight: 30, reps: 8, completed: true },
          ]
        },
        {
          id: 'ex-19',
          exerciseId: 'cable-fly',
          exerciseName: '케이블 크로스오버 플라이',
          category: 'chest' as const,
          sets: [
            { id: 's61', setNumber: 1, weight: 15, reps: 15, completed: true },
            { id: 's62', setNumber: 2, weight: 17.5, reps: 12, completed: true },
          ]
        }
      ]
    }
  ];

  historyConfigs.forEach(cfg => {
    let totalVolume = 0;
    cfg.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) totalVolume += s.weight * s.reps;
      });
    });

    workouts.push({
      id: `workout-${cfg.daysAgo}`,
      date: getDateStr(cfg.daysAgo),
      title: cfg.title,
      durationMinutes: cfg.durationMinutes,
      memo: cfg.memo,
      exercises: cfg.exercises,
      totalVolume
    });
  });

  return workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
