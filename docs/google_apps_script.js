/**
 * ==============================================================================
 * FitPulse (핏펄스) 구글 폼 & 실시간 응답 스프레드시트 연동 Google Apps Script (GAS)
 * ==============================================================================
 * 
 * [주요 기능]
 * 1. 📋 구글 폼 자동 생성 (24개 문항, 6개 섹션, 1~5점 척도, SUS 10문항, NPS 0~10점)
 * 2. 📊 실시간 응답 구글 스프레드시트 자동 생성 및 폼 연결 (form.setDestination)
 * 3. 📈 실시간 응답 대시보드(SUS 점수 환산 및 NPS 분석) 시트 자동 구성
 * 4. 🔗 관리자 편집 URL, 응답자 제출 URL, 실시간 구글 시트 URL 반환
 * 
 * [실행 시 필수 확인 사항 - 최초 1회 권한 승인]
 * - [실행] 클릭 후 멈춰있거나 스피너가 계속 돌면:
 *   1) [중지] 클릭 후 브라우저 새로고침(F5)
 *   2) [실행] 클릭 시 나타나는 "승인이 필요합니다" 팝업에서 [권한 검토] 클릭
 *   3) 계정 선택 -> 좌측 하단 [고급] -> [Healthcare(으)로 이동(안전하지 않음)] -> [허용]
 * ==============================================================================
 */

/**
 * [방법 1] Google Apps Script 콘솔에서 버튼 하나로 바로 생성 (추천)
 */
function createFitPulseSurveyDirectly() {
  Logger.log("🚀 [1/4] FitPulse 설문지 생성 프로세스를 시작합니다...");
  
  const payload = getFitPulseSurveyPayload();
  const result = buildGoogleFormAndSpreadsheet(payload);
  
  Logger.log("==================================================================");
  Logger.log("🎉 [완료] FitPulse 설문지 및 실시간 응답 시트가 성공적으로 생성되었습니다!");
  Logger.log("------------------------------------------------------------------");
  Logger.log("📌 폼 ID: " + result.formId);
  Logger.log("✏️ [관리자용] 구글 폼 편집 URL:\n" + result.editUrl);
  Logger.log("🔗 [응답자용] 설문 제출 URL:\n" + result.publishedUrl);
  Logger.log("📊 [실시간 응답] 구글 스프레드시트 URL:\n" + result.sheetUrl);
  Logger.log("==================================================================");
  
  return result;
}

/**
 * [방법 2] 외부 HTTP POST 요청을 받아 동적으로 생성하는 Web App 엔드포인트
 */
function doPost(e) {
  try {
    let payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = getFitPulseSurveyPayload();
    }

    const responseData = buildGoogleFormAndSpreadsheet(payload);

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("❌ 오류 발생: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 공통 폼 & 스프레드시트 빌더 엔진
 */
function buildGoogleFormAndSpreadsheet(payload) {
  // 1. 폼 생성 및 기본 메타데이터 설정
  const title = payload.title || "FitPulse(핏펄스) 사용자 경험(UX) 및 제품 만족도 설문지";
  Logger.log("📋 [2/4] 구글 폼 생성 중: " + title);
  const form = FormApp.create(title);

  if (payload.description) {
    form.setDescription(payload.description);
  }
  form.setProgressBar(true);
  form.setIsQuiz(false);

  // 2. 질문 파싱 및 항목 추가 (초고속 setChoiceValues 사용)
  if (Array.isArray(payload.questions)) {
    Logger.log("📝 [3/4] " + payload.questions.length + "개 설문 항목을 폼에 구성 중...");
    
    payload.questions.forEach((q) => {
      let item;

      switch (q.type) {
        case "PAGE_BREAK":
          item = form.addPageBreakItem();
          break;

        case "SECTION_HEADER":
          item = form.addSectionHeaderItem();
          break;

        case "TEXT":
          item = form.addTextItem();
          break;

        case "PARAGRAPH":
          item = form.addParagraphTextItem();
          break;

        case "CHOICE":
          item = form.addMultipleChoiceItem();
          if (Array.isArray(q.choices)) {
            item.setChoiceValues(q.choices);
          }
          if (q.hasOtherOption) item.showOtherOption(true);
          break;

        case "CHECKBOX":
          item = form.addCheckboxItem();
          if (Array.isArray(q.choices)) {
            item.setChoiceValues(q.choices);
          }
          if (q.hasOtherOption) item.showOtherOption(true);
          break;

        case "SCALE":
          item = form.addScaleItem();
          const min = q.min !== undefined ? q.min : 1;
          const max = q.max !== undefined ? q.max : 5;
          item.setBounds(min, max);
          if (q.minLabel || q.maxLabel) {
            item.setLabels(q.minLabel || "", q.maxLabel || "");
          }
          break;

        default:
          item = form.addTextItem();
      }

      if (q.title) item.setTitle(q.title);
      if (q.helpText) item.setHelpText(q.helpText);
      if (q.required !== undefined && typeof item.setRequired === "function") {
        item.setRequired(Boolean(q.required));
      }
    });
  }

  // 3. 응답 저장용 새 구글 스프레드시트 생성 및 폼 연결
  Logger.log("📊 [4/4] 실시간 응답 구글 스프레드시트 생성 및 폼 연결 중...");
  const sheetTitle = title + " (응답 및 분석)";
  const spreadsheet = SpreadsheetApp.create(sheetTitle);

  // 폼과 스프레드시트 공식 연동
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  // 대시보드 안내 탭 구성
  try {
    setupAnalysisDashboard(spreadsheet);
  } catch (dashErr) {
    Logger.log("⚠️ 대시보드 탭 생성 안내: " + dashErr.toString());
  }

  return {
    status: "success",
    formId: form.getId(),
    editUrl: form.getEditUrl(),
    publishedUrl: form.getPublishedUrl(),
    sheetId: spreadsheet.getId(),
    sheetUrl: spreadsheet.getUrl()
  };
}

/**
 * 구글 시트에 분석 대시보드 템플릿 세팅
 */
function setupAnalysisDashboard(spreadsheet) {
  const sheet = spreadsheet.getActiveSheet();
  sheet.setName("📊 분석 대시보드 안내");

  // 헤더 타이틀 배너 (Toss Blue #3182F6)
  sheet.getRange("A1:E1").merge();
  const titleCell = sheet.getRange("A1");
  titleCell.setValue("⚡ FitPulse 베타테스터 실시간 응답 및 SUS / NPS 분석 가이드");
  titleCell.setBackground("#3182F6");
  titleCell.setFontColor("#FFFFFF");
  titleCell.setFontWeight("bold");
  titleCell.setFontSize(13);
  titleCell.setHorizontalAlignment("center");
  titleCell.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 44);

  sheet.getRange("A2:E2").merge();
  const subCell = sheet.getRange("A2");
  subCell.setValue("ℹ️ 사용자가 폼을 제출하면 구글 폼이 자동으로 생성하는 '설문지 응답 1' 탭에 실시간으로 기록됩니다.");
  subCell.setBackground("#F2F4F6");
  subCell.setFontColor("#4E5968");
  subCell.setFontSize(10);
  subCell.setHorizontalAlignment("center");
  sheet.setRowHeight(2, 28);

  const headers = [["분석 항목", "측정 척도", "목표 기준", "집계 및 분석 방식"]];
  sheet.getRange("A4:D4").setValues(headers).setBackground("#E5E8EB").setFontWeight("bold").setFontColor("#191F28");

  const rows = [
    ["TDS UI/UX 디자인 만족도 (Q7)", "1~5점 척도", "4.5점 이상", "토스 블루 및 클린 화이트 시인성 평균"],
    ["한 손 조작성 & 퀵 중량 칩 (Q9)", "1~5점 척도", "4.5점 이상", "44px+ 터치 타겟 및 스테퍼 조작감 평균"],
    ["점진적 과부하 볼륨 델타 동기부여 (Q14)", "1~5점 척도", "4.2점 이상", "지난 세션 대비 +kg, +% 체감 만족도"],
    ["16주 토스 블루 잔디 히트맵 (Q15)", "1~5점 척도", "4.2점 이상", "5단계 잔디 스트릭 동기부여 평균"],
    ["국제 표준 시스템 사용성 척도 (SUS)", "100점 만점", "80.3점 이상 (A등급)", "(홀수합-5 + 25-짝수합) × 2.5 공식 환산"],
    ["순추천고객지수 (NPS Q19)", "0~10점 척도", "+40점 이상", "%Promoter(9-10) - %Detractor(0-6)"]
  ];
  sheet.getRange("A5:D10").setValues(rows).setVerticalAlignment("middle").setFontSize(10);

  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 300);
}

/**
 * FitPulse v2.0.0 전체 설문 데이터 정의 (TDS Mobile 반영)
 */
function getFitPulseSurveyPayload() {
  return {
    title: "📋 FitPulse(핏펄스) 베타테스터 사용자 경험(UX) 및 제품 만족도 설문조사",
    description: "안녕하세요! 토스 디자인 시스템(TDS Mobile) 감성의 점진적 과부하 스마트 헬스 트래커 FitPulse(핏펄스) 베타테스트에 참여해 주셔서 진심으로 감사드립니다.\n\n본 설문은 헬스장 환경에서의 TDS UI/UX 사용성, 분할 루틴, 원터치 세트 기록 및 타이머 HUD, 16주 토스 블루 잔디 히트맵, 인바디 맞춤 중량 추천기의 완성도를 평가하기 위해 기획되었습니다.\n\n⏱️ 소요 시간: 약 3분 ~ 5분\n🎁 참여 혜택: 설문 응답자 중 추첨을 통해 스타벅스 아이스 아메리카노(30명) 및 Pro 무료 구독권을 증정합니다.",
    questions: [
      // [섹션 1] 응답자 운동 프로필
      {
        type: "PAGE_BREAK",
        title: "[섹션 1] 응답자 운동 프로필 (User Fitness Profile)",
        helpText: "응답자의 운동 경력과 평소 훈련 패턴을 파악하기 위한 질문입니다."
      },
      {
        type: "CHOICE",
        title: "Q1. 평소 웨이트 트레이닝(헬스) 경력은 어느 정도이신가요?",
        required: true,
        choices: [
          "6개월 미만 (헬스 입문 및 초보자)",
          "6개월 이상 ~ 2년 미만 (초중급자)",
          "2년 이상 ~ 5년 미만 (중급 리프터)",
          "5년 이상 (상급자 / 전문 피트니스 선수)"
        ]
      },
      {
        type: "CHOICE",
        title: "Q2. 일주일에 평균 몇 회 헬스장에 방문하여 운동하시나요?",
        required: true,
        choices: [
          "주 1 ~ 2회",
          "주 3 ~ 4회",
          "주 5 ~ 6회",
          "주 7회 (매일 운동)"
        ]
      },
      {
        type: "CHOICE",
        title: "Q3. 현재 주로 진행하시는 주간 훈련 분할 방식은 무엇인가요?",
        required: true,
        choices: [
          "무분할 (매 세션 전신 운동)",
          "2분할 (상체 / 하체 또는 푸시 / 풀)",
          "3분할 (가슴·삼두 / 등·이두 / 하체·어깨 등)",
          "4분할 이상 (세분화된 단일 부위 분할)",
          "특별한 분할 없이 당일 컨디션에 따른 자율 운동"
        ]
      },
      {
        type: "CHOICE",
        title: "Q4. 평소 헬스장에서 1회 운동 시 소요되는 평균 시간은 어떻게 되시나요?",
        required: true,
        choices: [
          "40분 미만",
          "40분 이상 ~ 1시간 미만",
          "1시간 이상 ~ 1시간 30분 미만",
          "1시간 30분 이상 ~ 2시간 미만",
          "2시간 이상"
        ]
      },
      {
        type: "CHECKBOX",
        title: "Q5. FitPulse를 사용하기 전, 평소 운동 기록을 어떻게 관리하셨나요? (복수 선택 가능)",
        required: true,
        hasOtherOption: true,
        choices: [
          "머릿속으로만 기억하고 별도 기록하지 않음",
          "스마트폰 기본 메모장 (iOS 메모, 삼성 노트, Notion 등)",
          "기존 피트니스 앱 (번핏, 플렉, 헤비, 스트롱 등)",
          "종이 운동 수첩 / 아날로그 다이어리",
          "카카오톡 나에게 보내기"
        ]
      },
      {
        type: "CHOICE",
        title: "Q6. 웨이트 트레이닝을 진행하는 가장 주된 목표는 무엇인가요?",
        required: true,
        choices: [
          "근비대 (Hypertrophy / 체형 변화 및 벌크업)",
          "스트렝스 (3대 운동 1RM 중량 증량)",
          "다이어트 및 체지방 감량",
          "기초 체력 증진 및 일상 활력 유지",
          "재활 및 자세 교정"
        ]
      },

      // [섹션 2] TDS 디자인 및 헬스장 조작성
      {
        type: "PAGE_BREAK",
        title: "[섹션 2] 토스 디자인 시스템(TDS) 및 헬스장 현장 조작성",
        helpText: "토스 감성의 미니멀 인터페이스와 실제 헬스장(한 손 조작, 땀, 장갑 착용) 환경에서의 조작 경험을 평가해주세요."
      },
      {
        type: "SCALE",
        title: "Q7. 토스 블루(#3182F6)와 TDS 시맨틱 컬러 및 깔끔한 플로팅 카드 디자인의 시각적 만족도는 어떠했습니까?",
        helpText: "1: 매우 불만족 ~ 5: 매우 만족 (토스처럼 눈이 편안하고 세련됨)",
        min: 1, max: 5, minLabel: "매우 불만족", maxLabel: "매우 만족", required: true
      },
      {
        type: "SCALE",
        title: "Q8. 모바일 화면(iPhone 15 Pro Max 뷰포트)에서 단어 쪼개짐 없이 깔끔하게 정돈된 마이크로카피('오늘 할 운동이에요' 등)와 텍스트 가독성은 어떠했습니까?",
        helpText: "1: 매우 나쁨 ~ 5: 매우 뛰어남 (단어 단위 줄바꿈 및 2행 분리로 명확함)",
        min: 1, max: 5, minLabel: "매우 나쁨", maxLabel: "매우 뛰어남", required: true
      },
      {
        type: "SCALE",
        title: "Q9. 한 손(엄지손가락)으로 조작할 수 있는 퀵 중량 칩(-2.5kg, +2.5kg, +5kg)과 반복수 스테퍼, 44px+ 터치 타겟의 조작 편의성은 어떠했습니까?",
        helpText: "1: 매우 불편함 ~ 5: 매우 편리함 (한 손으로 1~2초 만에 세팅 완료)",
        min: 1, max: 5, minLabel: "매우 불편", maxLabel: "매우 편리", required: true
      },
      {
        type: "SCALE",
        title: "Q10. 신규 도입된 원터치 휴식 타이머 프리셋([30초], [1분], [1분 30초], [2분], [3분]) 및 Web Audio 알림음의 실전 유용성은 어떠했습니까?",
        helpText: "1: 전혀 도움 안 됨 ~ 5: 극도로 유용함 (원클릭 프리셋 변경 및 명확한 휴식 페이스 조절)",
        min: 1, max: 5, minLabel: "전혀 도움 안 됨", maxLabel: "매우 유용함", required: true
      },
      {
        type: "CHOICE",
        title: "Q11. 상단 GNB에 제공되는 데이터 모드 스위처([✨ 샘플 둘러보기] vs [⟲ 신규(빈 상태)])를 통해 앱의 첫인상과 기능을 직관적으로 파악할 수 있었습니까?",
        required: true,
        choices: [
          "매우 직관적이었음 (풍성한 샘플과 깨끗한 빈 화면을 1초 만에 비교 체험할 수 있어 유용함)",
          "유용했으나 실제 사용 시에는 내 기록만 자동으로 남아있으면 좋겠음",
          "보통임",
          "상단 스위처가 무엇을 하는 기능인지 처음에 이해하기 어려웠음"
        ]
      },

      // [섹션 3] 주간 분할 플래너 및 점진적 과부하/완료 축하 경험
      {
        type: "PAGE_BREAK",
        title: "[섹션 3] 주간 분할 플래너 및 점진적 과부하/완료 축하 경험",
        helpText: "루틴 구성부터 당일 세션 완료, 성장 분석으로 이어지는 사용자 흐름(Flow)을 평가해주세요."
      },
      {
        type: "SCALE",
        title: "Q12. TDS Mobile 2행 표준이 적용된 종목 리스트(1행: 운동명 전체 표시, 2행: 부위 뱃지 + 세트수 + 권장 휴식)와 7-Day 요일 탭의 시인성은 어떠했습니까?",
        helpText: "1: 매우 비효율적임 ~ 5: 글자 잘림 없이 종목과 세트 정보가 시원하게 읽힘",
        min: 1, max: 5, minLabel: "매우 비효율", maxLabel: "매우 쾌적함", required: true
      },
      {
        type: "SCALE",
        title: "Q13. 모든 세트 완료 및 저장 시 나타나는 '오늘 운동 완료 축하 헤더(🎉)와 4대 핵심 지표 요약 카드'의 성취감 피드백은 어떠했습니까?",
        helpText: "1: 밋밋하여 성취감 없음 ~ 5: 운동을 끝마쳤다는 강력한 뿌듯함과 보상감을 줌",
        min: 1, max: 5, minLabel: "밋밋함", maxLabel: "강력한 성취감", required: true
      },
      {
        type: "SCALE",
        title: "Q14. 동일 부위 직전 세션 대비 총 볼륨 델타(+kg, +%) 피드백이 점진적 과부하(Progressive Overload) 달성에 동기부여가 되었습니까?",
        helpText: "1: 전혀 도움 되지 않음 ~ 5: 다음 운동 시 더 무겁게 들거나 1개라도 더 들게 만드는 강력한 자극제임",
        min: 1, max: 5, minLabel: "전혀 도움 안 됨", maxLabel: "강력한 자극", required: true
      },
      {
        type: "SCALE",
        title: "Q15. 16주(112일)간 5단계 토스 블루 강도로 채워지는 '잔디 히트맵(Activity Heatmap)'은 헬스장 연속 출석(Streak) 유지에 동기부여가 됩니까?",
        helpText: "1: 전혀 자극되지 않음 ~ 5: 빈 잔디를 채우기 위해 헬스장에 빠짐없이 가고 싶어짐",
        min: 1, max: 5, minLabel: "전혀 무관심", maxLabel: "강력한 출석 자극", required: true
      },

      // [섹션 4] 인바디 기반 맞춤 중량 추천기
      {
        type: "PAGE_BREAK",
        title: "[섹션 4] 인바디 기반 맞춤 중량 추천기 (InBody Recommender & Safety)",
        helpText: "체성분 분석(체중, 골격근량, 체지방률, 경력)을 기반으로 산출되는 추천 중량의 실전 효용성을 평가해주세요."
      },
      {
        type: "CHOICE",
        title: "Q16. 체성분 입력 시 산출되는 3대 운동(스쿼트/벤치프레스/데드리프트) 추천 중량은 본인의 실제 1RM 및 운동 수준과 얼마나 일치했습니까?",
        required: true,
        choices: [
          "실제 수행 가능한 중량보다 너무 무겁게 추천되어 부상 위험이 느껴짐",
          "실제 수행 가능한 중량보다 다소 가볍게 추천됨",
          "본인의 실제 운동 중량과 매우 흡사하게 일치함 (오차 ±5% 내외)",
          "초보자로서 시작 기준 무게를 설정하는 데 결정적인 가이드가 됨",
          "인바디 수치를 잘 알지 못해 아직 테스트해보지 못함"
        ]
      },
      {
        type: "CHOICE",
        title: "Q17. 추천 중량이 실제 헬스장 상용 바벨 원판 규격인 '2.5kg 단위'로 자동 반올림되어 표시되는 방식은 만족스러우셨습니까?",
        required: true,
        choices: [
          "매우 만족함 (암산할 필요 없이 바벨 양쪽에 꽂을 원판 조합이 바로 연상되어 쾌적함)",
          "보통임 (무난함)",
          "불만족 (0.5kg ~ 1kg 단위의 미세 마이크로 로딩 원판 옵션도 필요함)"
        ]
      },
      {
        type: "SCALE",
        title: "Q18. 웜업(50%), 근비대 본세트(72%), 스트렝스(82%) 3단계 중량 제안이 부상 방지와 점진적 증량에 적절했습니까?",
        helpText: "1: 매우 부적절/위험함 ~ 5: 완벽히 체계적이고 안전한 가이드라인임",
        min: 1, max: 5, minLabel: "부적절/위험", maxLabel: "완벽히 체계적", required: true
      },

      // [섹션 5] 국제 표준 시스템 사용성 척도 (SUS 10문항)
      {
        type: "PAGE_BREAK",
        title: "[섹션 5] 국제 표준 시스템 사용성 척도 (SUS: System Usability Scale)",
        helpText: "FitPulse 서비스의 전반적인 사용 편의성을 평가하기 위한 국제 표준 10문항입니다. (1: 전혀 동의하지 않음 ~ 5: 매우 동의함)"
      },
      {
        type: "SCALE",
        title: "SUS-01. 나는 앞으로 FitPulse를 운동할 때마다 자주 사용하고 싶다.",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-02. 나는 FitPulse가 불필요하게 복잡하다고 느꼈다. (역코딩)",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-03. 나는 FitPulse가 사용하기 매우 직관적이고 쉽다고 생각했다.",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-04. 나는 이 시스템을 원활히 쓰기 위해 전문가나 안내가 필요할 것 같다. (역코딩)",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-05. 나는 FitPulse의 다양한 기능(루틴, 세트기록, 타이머, 성장분석)이 매끄럽게 잘 통합되어 있다고 느꼈다.",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-06. 나는 이 시스템의 디자인과 조작 방식에 일관성이 부족하다고 느꼈다. (역코딩)",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-07. 나는 대부분의 사람들이 FitPulse를 매우 빠르게 익힐 수 있을 것이라 확신한다.",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-08. 나는 이 시스템을 사용하는 과정이 번거롭고 성가시다고 느꼈다. (역코딩)",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-09. 나는 운동 중 FitPulse를 조작하는 데 있어 높은 안정감과 자신감을 느꼈다.",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },
      {
        type: "SCALE",
        title: "SUS-10. 나는 이 시스템을 본격적으로 사용하기 전에 배워야 할 내용이 너무 많다고 느꼈다. (역코딩)",
        min: 1, max: 5, minLabel: "전혀 아님", maxLabel: "매우 동의", required: true
      },

      // [섹션 6] 순추천고객지수(NPS) 및 심층 정성 피드백
      {
        type: "PAGE_BREAK",
        title: "[섹션 6] 순추천고객지수(NPS) 및 심층 정성 피드백",
        helpText: "서비스 추천 의향과 개선 아이디어를 자유롭게 들려주세요."
      },
      {
        type: "SCALE",
        title: "Q19. FitPulse를 주변 헬스 동료, 지인 또는 운동 커뮤니티에 추천할 의향이 얼마나 되시나요? (NPS 0~10점)",
        helpText: "0점: 전혀 추천하지 않음 ~ 10점: 무조건 강력 추천함",
        min: 0, max: 10, minLabel: "전혀 추천 안 함", maxLabel: "무조건 강력 추천", required: true
      },
      {
        type: "PARAGRAPH",
        title: "Q20. 위 추천 점수(NPS)를 주신 가장 결정적인 이유는 무엇인가요?",
        required: false
      },
      {
        type: "PARAGRAPH",
        title: "Q21. FitPulse를 사용하시면서 가장 만족스러웠던 기능이나 디자인 요소는 무엇이었나요?",
        required: false
      },
      {
        type: "PARAGRAPH",
        title: "Q22. 실제 헬스장 운동 중 가장 불편했거나 개선이 시급하다고 느낀 점은 무엇인가요? (예: 특정 종목 누락, 사운드 볼륨, 원판 계산기 부재 등)",
        required: false
      },
      {
        type: "CHECKBOX",
        title: "Q23. 향후 정식 모바일 앱 출시 시 가장 먼저 추가되기를 희망하는 기능은 무엇인가요? (최대 3개)",
        required: false,
        hasOtherOption: true,
        choices: [
          "스마트워치(애플워치 / 갤럭시워치) 손목 실시간 세트 완료 탭 및 심박수 연동",
          "잠금화면 실시간 휴식 타이머 HUD (iOS 다이내믹 아일랜드 & 라이브 액티비티)",
          "바벨 리프팅 영상 기반 인공지능(AI) 자세 분석 및 궤적(바패스) 추적",
          "헬스 크루/친구 간 실시간 주간 볼륨 대결 및 잔디 챌린지 랭킹",
          "운동 종목 커스텀 등록 및 덤벨/케이블/머신 핀 무게 세분화",
          "RPE(운동 자각도 1~10) 및 RIR(예비 반복 횟수) 정밀 기록",
          "헬스장 플레이트(원판) 최적 조합 시각 계산기 (양쪽 20kg 바벨 기준)"
        ]
      },
      {
        type: "PARAGRAPH",
        title: "Q24. 마지막으로 FitPulse 개발팀과 디자인팀에게 전하고 싶은 말씀이나 응원 한마디를 자유롭게 남겨주세요!",
        required: false
      },

      // [보너스] 리워드 추첨 연락처
      {
        type: "SECTION_HEADER",
        title: "🎁 스타벅스 아메리카노 추첨(30명) 연락처 입력 (선택 사항)",
        helpText: "기프티콘 수신을 위한 연락처를 입력해 주세요. 수집된 정보는 발송 후 즉시 파기됩니다."
      },
      {
        type: "TEXT",
        title: "성함 또는 닉네임",
        required: false
      },
      {
        type: "TEXT",
        title: "휴대전화 번호 (010-XXXX-XXXX)",
        required: false
      },
      {
        type: "TEXT",
        title: "이메일 주소 (선택)",
        required: false
      }
    ]
  };
}
