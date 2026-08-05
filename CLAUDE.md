# 프로젝트 개요
동아리 활동 기록 관리 웹앱 (게임 개발 동아리 운영 콘솔).
동아리 임원이 활동 내역을 등록하고 조회·삭제할 수 있다. (필수)
추가로 회원·팀 관리, 일정 관리, 출석·연속 노쇼 위험 판정, 주간 통계 대시보드까지 확장하는 것을 목표로 한다. (추가, 시간이 되면 진행 — 박재웅 기획서 `ideas/재웅.md` 참고)

팀: 1 / 클로드 아카이브
팀원: 박재웅, 김현민, 이정호

# 기술 스택
- HTML / CSS / JavaScript (프레임워크 없음)
- 데이터 저장: 브라우저 localStorage
- 외부 라이브러리: Chart.js (CDN) — 추가 기능인 주간 통계 차트 구현 시에만 사용. 미사용 시 "없음"으로 간주

# 파일 구조
- index.html : 화면 구조
- style.css  : 스타일
- app.js     : 기능 로직
<추가 기능(일정/회원·팀/대시보드)을 구현하면서 구조를 바꿨다면 실제 구조로 수정>

# 코딩 규칙
- 함수와 변수 이름은 영어 camelCase, 의미가 드러나게 작성
- 주요 함수 위에는 한 줄 한글 주석을 단다
- 하나의 함수는 하나의 일만 한다
- 들여쓰기는 스페이스 2칸

# 데이터 구조

## 필수
활동 1건은 다음 형태로 저장한다.
{ id, title, date, place, memberCount, memo, createdAt }
localStorage 키: "activities"

## 추가 (선택 구현, `ideas/재웅.md` 기획 참고)
아래는 추가 기능을 구현할 때만 사용한다. 필수 필드(id, title, date, place, memberCount, memo, createdAt)는 이름을 바꾸거나 제거하지 않고, 아래 필드만 덧붙인다.

- activities 추가 필드: teamId, attendance(회원별 출석 상태 배열), sourceScheduleId
- members: { id, name, role, teamId, createdAt } — localStorage 키 "members"
- teams: { id, name, capacity, createdAt } — localStorage 키 "teams"
- schedules: { id, title, date, category, place, targetTeamId, memo, convertedActivityId, createdAt } — localStorage 키 "schedules"

# 작업 방식
- 코드를 작성하기 전에 무엇을 어떤 순서로 만들지 먼저 제안한다
- 한 번에 하나의 기능만 구현한다. 여러 기능을 동시에 만들지 않는다
- 기존에 동작하던 코드를 요청 없이 수정하거나 삭제하지 않는다
- 확실하지 않은 부분은 추측하지 말고 먼저 질문한다
- 필수 기능(등록·조회·삭제·검증)을 먼저 완성한 뒤에만 추가 기능을 진행한다

# 하지 말 것
- 서버, 데이터베이스, 빌드 도구 도입 금지
- 요청하지 않은 파일 새로 생성 금지
- 사용하지 않는 예시 코드나 더미 데이터 대량 생성 금지
- 한 번에 100줄 넘는 코드를 통째로 출력하지 않기

# 커밋 규칙
- 기능 하나가 동작하면 바로 커밋한다
- 커밋 메시지 형식: <기능명>: <무엇을 했는지>
  예) 활동등록: 입력 폼과 저장 기능 구현

# 현재 진행 상황

## 필수
- [ ] 활동 등록 (김현민)
- [ ] 활동 목록 조회 (이정호)
- [ ] 활동 삭제 (박재웅)
- [ ] 입력값 검증

## 추가 (시간이 되면 진행, `ideas/재웅.md` 7장 우선순위 참고)
- [ ] 회원·팀 관리, 정원 초과 경고
- [ ] 일정 등록 및 활동으로 전환
- [ ] 출석 기록 및 연속 노쇼 위험 판정
- [ ] 기간 필터
- [ ] 주간 통계 (팀별/개인별) + Chart.js
- [ ] 대시보드 통합
- [ ] 반응형 레이아웃
