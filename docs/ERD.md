# FitPulse 데이터 모델 및 ERD (Entity Relationship Diagram) 명세서

본 문서는 FitPulse 서비스의 관계형 데이터베이스(PostgreSQL / MySQL) 및 클라이언트 캐시/저장 계층(IndexedDB / LocalStorage)을 위한 **엔티티 관계 다이어그램(ERD)**과 테이블 스키마 명세서입니다.

---

## 1. 개체-관계 다이어그램 (ERD - Mermaid Diagram)

```mermaid
erDiagram
    USERS ||--o{ WORKOUT_SESSIONS : "performs"
    USERS ||--o{ INBODY_RECORDS : "measures"
    USERS ||--o{ USER_ROUTINE_PLANS : "configures"

    WORKOUT_SESSIONS ||--|{ EXERCISE_LOGS : "contains"
    EXERCISE_LOGS ||--|{ EXERCISE_SETS : "has"
    
    EXERCISES ||--o{ EXERCISE_LOGS : "referenced_by"
    EXERCISES ||--o{ ROUTINE_EXERCISES : "configured_in"

    USER_ROUTINE_PLANS ||--|{ ROUTINE_DAYS : "includes (7 days)"
    ROUTINE_DAYS ||--o{ ROUTINE_EXERCISES : "schedules"

    USERS {
        uuid id PK "사용자 고유 UUID"
        varchar email "이메일"
        varchar nickname "닉네임"
        varchar experience_level "경력 (beginner, intermediate, advanced)"
        varchar theme_mode "다크/라이트 테마 (dark, light)"
        timestamp created_at "가입 일시"
        timestamp updated_at "수정 일시"
    }

    INBODY_RECORDS {
        uuid id PK "인바디 기록 UUID"
        uuid user_id FK "사용자 참조"
        varchar gender "성별 (male, female)"
        decimal weight "체중 (kg)"
        decimal muscle_mass "골격근량 (kg)"
        decimal body_fat_percent "체지방률 (%)"
        decimal ffm "제지방량 Fat-Free Mass (kg)"
        date measured_date "측정 일자"
        timestamp created_at "등록 일시"
    }

    EXERCISES {
        varchar exercise_id PK "운동 고유 식별자 (예: bench-press)"
        varchar name "운동 종목명 (한글)"
        varchar english_name "운동 종목명 (영문)"
        varchar category "부위 (chest, back, legs, shoulders, arms, core)"
        decimal default_1rm_ratio "체중 대비 1RM 기본 비율"
        boolean is_compound "다관절 복합운동 여부"
        varchar equipment "장비 (barbell, dumbbell, machine, cable)"
    }

    WORKOUT_SESSIONS {
        uuid id PK "운동 세션 UUID"
        uuid user_id FK "사용자 참조"
        date session_date "운동 수행 일자 (YYYY-MM-DD)"
        varchar title "세션 명칭 (예: 화요일 등 & 이두)"
        int duration_minutes "소요 시간 (분)"
        decimal total_volume "세션 총 볼륨 sum(weight*reps) (kg)"
        text memo "운동 특이사항 및 메모"
        timestamp created_at "기록 일시"
        timestamp updated_at "수정 일시"
    }

    EXERCISE_LOGS {
        uuid id PK "종목 수행 로그 UUID"
        uuid session_id FK "운동 세션 참조"
        varchar exercise_id FK "운동 종목 참조"
        varchar exercise_name "수행 종목명 스냅샷"
        varchar category "타겟 부위"
        int display_order "종목 수행 순서 (1, 2, ...)"
    }

    EXERCISE_SETS {
        uuid id PK "세트 고유 UUID"
        uuid exercise_log_id FK "종목 로그 참조"
        int set_number "세트 번호 (1, 2, 3...)"
        decimal weight "수행 중량 (kg)"
        int reps "반복 횟수 (회)"
        boolean is_warmup "웜업 세트 여부"
        boolean completed "세트 수행 완료 플래그"
        decimal rpe "운동자각도 (RPE 6.0~10.0)"
        decimal calculated_1rm "Epley 추정 1RM (kg)"
        decimal volume "세트 볼륨 (weight * reps)"
    }

    USER_ROUTINE_PLANS {
        uuid id PK "루틴 플랜 UUID"
        uuid user_id FK "사용자 참조"
        varchar title "플랜 명칭 (예: 4분할 점진과부하 루틴)"
        boolean is_active "현재 적용 중 여부"
        timestamp created_at "생성 일시"
    }

    ROUTINE_DAYS {
        uuid id PK "요일별 루틴 UUID"
        uuid routine_plan_id FK "루틴 플랜 참조"
        varchar day_of_week "요일 (mon, tue, wed, thu, fri, sat, sun)"
        int day_number "요일 인덱스 (0:일, 1:월 ... 6:토)"
        varchar title "타겟 부위 (예: 가슴 & 삼두 Push)"
        varchar subtitle "훈련 요약 설명"
        boolean is_rest_day "휴식일 여부"
        json target_muscles "타겟 근육 배열"
    }

    ROUTINE_EXERCISES {
        uuid id PK "루틴 종목 설정 UUID"
        uuid routine_day_id FK "요일 루틴 참조"
        varchar exercise_id FK "운동 종목 참조"
        varchar exercise_name "종목명"
        int target_sets "목표 세트 수"
        int target_reps "목표 반복 수"
        decimal target_weight "목표 중량 (kg)"
        int rest_seconds "세트 간 권장 휴식 시간(초)"
        int display_order "순서"
    }
```

---

## 2. 테이블별 상세 스키마 정의 (DDL Specification)

### 2.1 `WORKOUT_SESSIONS` (운동 세션)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :---: | :--- |
| `id` | UUID | PK, NOT NULL | 세션 고유 식별자 |
| `user_id` | UUID | FK -> USERS(id) | 사용자 외래키 (인덱스) |
| `session_date` | DATE | NOT NULL | 세션 일자 (인덱스: 히트맵 잔디 추출용) |
| `title` | VARCHAR(100) | NOT NULL | 운동 명칭 |
| `duration_minutes` | INT | DEFAULT 0 | 운동 소요 시간 |
| `total_volume` | DECIMAL(10,2)| DEFAULT 0 | 완료된 세트의 총 볼륨 $\sum(weight \times reps)$ |
| `memo` | TEXT | NULL | 메모 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성 일시 |

### 2.2 `EXERCISE_LOGS` (운동 종목 수행 로그)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :---: | :--- |
| `id` | UUID | PK, NOT NULL | 종목 로그 식별자 |
| `session_id` | UUID | FK -> WORKOUT_SESSIONS(id) | 운동 세션 외래키 (CASCADE) |
| `exercise_id` | VARCHAR(50) | FK -> EXERCISES(exercise_id)| 표준 운동 종목 ID |
| `exercise_name` | VARCHAR(100) | NOT NULL | 기록 당시 종목명 스냅샷 |
| `category` | VARCHAR(20) | NOT NULL | `chest`, `back`, `legs`, `shoulders`, `arms`, `core` |
| `display_order` | INT | DEFAULT 1 | 세션 내 종목 순서 |

### 2.3 `EXERCISE_SETS` (세부 세트 및 중량/반복수)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :---: | :--- |
| `id` | UUID | PK, NOT NULL | 세트 식별자 |
| `exercise_log_id`| UUID | FK -> EXERCISE_LOGS(id) | 종목 외래키 (CASCADE) |
| `set_number` | INT | NOT NULL | 1세트, 2세트... |
| `weight` | DECIMAL(6,2) | NOT NULL | 중량 (kg, 2.5kg 단위 권장) |
| `reps` | INT | NOT NULL | 반복 횟수 |
| `completed` | BOOLEAN | DEFAULT FALSE | 세트 완료 체크 (볼륨 산입 기준) |
| `is_warmup` | BOOLEAN | DEFAULT FALSE | 웜업 세트 여부 |
| `rpe` | DECIMAL(3,1) | NULL | 운동자각도 (Rate of Perceived Exertion) |
| `calculated_1rm`| DECIMAL(6,2) | GENERATED ALWAYS | Epley 공식: $Weight \times (1 + Reps/30)$ |

### 2.4 `ROUTINE_DAYS` & `ROUTINE_EXERCISES` (요일별 분할 루틴)
- **7-Day Strip**과 1:1 매핑되어 사용자가 요일을 누르면 해당 요일에 사전 설정된 `target_weight`, `target_sets`, `target_reps`를 즉각 로드.
- `is_rest_day = true`일 경우 휴식 및 근합성 리커버리 모드로 UI 전환.

### 2.5 `INBODY_RECORDS` (체성분 및 추천 엔진 소스)
- `weight`, `muscle_mass`, `body_fat_percent`를 기반으로 제지방량(FFM)과 근육충실도(MF)를 연산하여 `EXERCISES`의 부위별 계수와 결합, 3대 운동(SBD) 및 보조 종목의 **웜업 / 본세트 / 스트렝스 중량(2.5kg 반올림)**을 산출.

---

## 3. 주요 인덱스 및 쿼리 최적화 전략
1. **히트맵 (Heatmap) 조회**:
   ```sql
   CREATE INDEX idx_workout_sessions_user_date ON WORKOUT_SESSIONS(user_id, session_date DESC);
   ```
   16주(112일)간의 날짜별 볼륨 집계를 `session_date BETWEEN ... AND ...`로 $O(\log N)$ 인덱스 스캔.
2. **지난 세션 대비 점진적 과부하 (Progressive Overload) 볼륨 비교**:
   ```sql
   SELECT total_volume, session_date 
   FROM WORKOUT_SESSIONS 
   WHERE user_id = $1 AND title LIKE '%등%' AND session_date < $2 
   ORDER BY session_date DESC LIMIT 1;
   ```
