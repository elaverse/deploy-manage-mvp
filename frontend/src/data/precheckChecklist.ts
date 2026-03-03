import type { PrecheckChecklistItem } from "../types/deployment";

/** 이행 체크리스트 마스터 데이터 - 구분, 점검 항목, 세부 확인 질문, 확인 방법 */
export const PRECHECK_CHECKLIST_TEMPLATE: Omit<PrecheckChecklistItem, "checked">[] = [
  { category: "네트워크", check_item: "방화벽 포트 개방", question: "운영환경 방화벽 In/Out 포트가 실제로 열려 있는가", verification_method: "운영 서버 직접 접속 테스트" },
  { category: "네트워크", check_item: "IP 화이트리스트", question: "외부 API/연계 시스템에 운영 서버 IP가 등록되었는가", verification_method: "API 호출 테스트" },
  { category: "네트워크", check_item: "환경별 IP 차이", question: "개발/검증/운영 IP 대역 차이를 반영했는가", verification_method: "네트워크 구성도 확인" },
  { category: "네트워크", check_item: "SSL 인증서", question: "운영 도메인 기준 인증서가 적용되었는가", verification_method: "브라우저/openssl 확인" },
  { category: "네트워크", check_item: "VPN/전용회선", question: "운영 환경에서 실제 접속 테스트를 수행했는가", verification_method: "운영 계정 접속" },
  { category: "계정/권한", check_item: "운영 계정 생성", question: "운영 DB/서버/스토리지 계정이 생성되었는가", verification_method: "계정 목록 확인" },
  { category: "계정/권한", check_item: "개발 계정 제거", question: "개발·테스트 계정이 운영에 남아 있지 않은가", verification_method: "계정 점검" },
  { category: "계정/권한", check_item: "서비스 계정", question: "배치/API 서비스 계정 권한이 최소화되었는가", verification_method: "권한 정책 확인" },
  { category: "계정/권한", check_item: "MFA/SSO", question: "관리자 계정에 MFA/SSO가 적용되었는가", verification_method: "로그인 테스트" },
  { category: "계정/권한", check_item: "접근 로그", question: "관리자 접근 이력이 로그로 남는가", verification_method: "로그 확인" },
  { category: "데이터", check_item: "데이터 이행 완료", question: "데이터 이행이 오픈 전에 완료되었는가", verification_method: "이행 결과 리포트" },
  { category: "데이터", check_item: "연결 데이터 확인", question: "이행 하는 프로그램의 연결 데이터가 운영DB가 맞는가?", verification_method: "이행 결과 리포트" },
  { category: "데이터", check_item: "이행 범위 확정", question: "이행 대상 테이블/컬럼 범위가 확정되었는가", verification_method: "이행 명세서" },
  { category: "데이터", check_item: "정합성 검증", question: "건수/합계/샘플 검증을 수행했는가", verification_method: "SQL/리포트 검증" },
  { category: "데이터", check_item: "코드/마스터", question: "코드값·마스터 데이터가 운영 기준인가", verification_method: "화면/DB 비교" },
  { category: "데이터", check_item: "롤백 계획", question: "이행 실패 시 원복 시나리오가 있는가", verification_method: "롤백 문서 확인" },
  { category: "설정", check_item: "환경 설정 분리", question: "운영 설정파일이 개발/검증과 분리되었는가", verification_method: "Config 비교" },
  { category: "설정", check_item: "체크 로그", question: "운영기 이행시 불필요한 체크 및 로그를 삭제했는가?", verification_method: "로그 포맷 확인" },
  { category: "설정", check_item: "운영 Key 적용", question: "API Key/DB 접속정보가 운영 전용인가", verification_method: "설정 파일 확인" },
  { category: "설정", check_item: "스케줄러", question: "배치/스케줄 주기가 운영 기준인가", verification_method: "스케줄 설정" },
  { category: "설정", check_item: "테스트 플래그", question: "DEBUG/MOCK 설정이 제거되었는가", verification_method: "코드/설정 확인" },
  { category: "로그/모니터링", check_item: "로그 수집", question: "운영 서버에서 로그가 실제로 남는가", verification_method: "실시간 로그 확인" },
  { category: "로그/모니터링", check_item: "에러 구분", question: "에러/정상 로그가 구분되는가", verification_method: "로그 포맷 확인" },
  { category: "로그/모니터링", check_item: "알림", question: "장애 알림이 실제로 발송되는가", verification_method: "테스트 장애 발생" },
  { category: "로그/모니터링", check_item: "담당자", question: "1·2차 장애 대응 담당자가 명확한가", verification_method: "연락망 확인" },
  { category: "성능", check_item: "부하 테스트", question: "예상 동시접속 기준 부하 테스트를 했는가", verification_method: "테스트 결과서" },
  { category: "성능", check_item: "DB Pool", question: "DB 커넥션 풀 최대치가 설정되었는가", verification_method: "설정 확인" },
  { category: "성능", check_item: "용량 제한", question: "파일 업로드/다운로드 제한이 설정되었는가", verification_method: "설정/실험" },
  { category: "성능", check_item: "외부 API", question: "외부 API Rate Limit을 고려했는가", verification_method: "벤더 문서" },
  { category: "보안", check_item: "암호화", question: "개인정보 암호화가 운영에 적용되었는가", verification_method: "암호화 설정" },
  { category: "보안", check_item: "평문 접근", question: "운영 DB에서 개인정보 평문 조회가 제한되었는가", verification_method: "권한 테스트" },
  { category: "보안", check_item: "로그 노출", question: "로그에 개인정보가 남지 않는가", verification_method: "로그 샘플링" },
  { category: "배포", check_item: "배포 절차", question: "운영 배포 절차가 문서화되어 있는가", verification_method: "배포 가이드" },
  { category: "배포", check_item: "중단 여부", question: "배포 시 서비스 중단 여부가 명확한가", verification_method: "배포 계획" },
  { category: "배포", check_item: "롤백", question: "배포 실패 시 즉시 롤백 가능한가", verification_method: "롤백 테스트" },
  { category: "배포", check_item: "권한자", question: "운영 배포 권한자가 명확한가", verification_method: "권한 목록" },
  { category: "운영 인수", check_item: "매뉴얼 검증", question: "운영 매뉴얼을 실제로 따라 해봤는가", verification_method: "리허설" },
  { category: "운영 인수", check_item: "장애 시나리오", question: "주요 장애 시나리오가 정리되었는가", verification_method: "시나리오 문서" },
  { category: "운영 인수", check_item: "철수 대응", question: "개발사 철수 후 자체 대응 가능한가", verification_method: "인수인계서" },
  { category: "최종 점검", check_item: "책임자", question: "장애 발생 시 최종 책임자는 명확한가", verification_method: "R&R 확인" },
  { category: "최종 점검", check_item: "사용자 검증", question: "기획/운영자가 직접 사용자로 사용해봤는가", verification_method: "실사용 테스트" },
  { category: "최종 점검", check_item: "연락 체계", question: "야간/휴일 장애 연락 체계가 있는가", verification_method: "연락망 확인" },
];

export function createEmptyChecklist(): PrecheckChecklistItem[] {
  return PRECHECK_CHECKLIST_TEMPLATE.map((t) => ({ ...t, checked: false }));
}

function normalizeChecked(value: unknown): boolean {
  if (value === true || value === 1 || value === "true" || value === "1")
    return true;
  return false;
}

export function mergeChecklistWithTemplate(
  saved: PrecheckChecklistItem[] | undefined | null
): PrecheckChecklistItem[] {
  if (!saved?.length) return createEmptyChecklist();
  const byKey = new Map(
    saved.map((s) => [`${String(s.category)}|${String(s.check_item)}`, s])
  );
  return PRECHECK_CHECKLIST_TEMPLATE.map((t) => {
    const key = `${t.category}|${t.check_item}`;
    const existing = byKey.get(key);
    if (existing) {
      return {
        ...t,
        ...existing,
        checked: normalizeChecked(existing.checked),
      };
    }
    return { ...t, checked: false };
  });
}
