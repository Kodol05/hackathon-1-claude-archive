# 프로젝트 개요
동아리 활동 기록 관리 웹앱 (게임 개발 동아리 운영 콘솔).
동아리 임원이 활동 내역을 등록하고 조회·삭제할 수 있다. (필수)
여기에 회원·팀 관리, 일정 관리, 기간 필터, 월별 통계 차트를 추가로 구현했다. (박재웅 기획서 `ideas/재웅.md` 참고)

팀: 1 / 클로드 아카이브
팀원: 박재웅, 김현민, 이정호

# 기술 스택
- HTML / CSS / JavaScript (프레임워크 없음)
- 데이터 저장: 브라우저 localStorage
- 외부 라이브러리: Chart.js 4.5.0 (CDN) — 월별 활동 횟수 막대차트에 사용
  https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js

# 파일 구조
- index.html : 화면 구조
- style.css  : 스타일
- app.js     : 기능 로직
- tools/extract_prompts.py : 보고서용 프롬프트 추출 스크립트
- docs/ : 실행 화면 스크린샷

화면은 파일을 나누지 않고 index.html 안에서 `data-screen` 속성으로 구분한다.
대시보드 / 활동 / 일정 / 회원·팀 네 화면을 상단 탭으로 전환한다.

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

공통 저장 함수 (김현민 구현, 이정호는 이 함수 시그니처를 기준으로 목록·삭제를 개발한다):
- getActivities() : activities 배열을 localStorage에서 읽어 반환
- saveActivities(list) : activities 배열 전체를 localStorage에 저장
- generateId() : 고유 id 문자열 생성

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

## 필수 (1단계, 김현민·이정호 개발 — 박재웅은 기획/보고서 담당)
- [x] 공통 저장 함수: getActivities / saveActivities / generateId (김현민)
- [x] 활동 등록 + 입력값 검증 (김현민)
- [x] 활동 목록 조회 (이정호)
- [x] 활동 삭제 (이정호)

## 추가 (2단계, `ideas/재웅.md` 7장 우선순위 참고)
진행 중 — 각자 자기 담당 구역 주석 안에서만 작업한다. 커밋 전 반드시 `git pull` 한다.
- [x] 회원·팀 관리, 정원 초과 경고 (김현민)
- [x] 일정 등록 및 D-day 정렬 (이정호)

- [x] 기간 필터 (김현민)
- [x] 월별 활동 횟수 통계 + Chart.js (김현민)
- [x] 반응형 레이아웃 (김현민) — 600px 이하에서 폼·필터·목록 한 열 배치

## 3단계 (목표: 16:30까지 최대한 완성)

### 협업 방식
파일을 나누지 않는다. 대신 서로 무엇을 건드리는지 말하고, 충돌 전에 확인한다.
- 작업 시작 전 무엇을 만들지 팀에 공유한다
- 작업 전과 커밋 전에 반드시 `git pull` 한다
- 같은 파일을 건드려도 괜찮다. 대신 커밋 전에 AI에게 충돌 가능성과 기존 기능이 깨지지 않는지 확인받는다
- 기존에 동작하던 기능을 고쳐야 한다면 먼저 팀에 알린다

### 남은 작업 (재웅.md 7장 순서)
- [x] 4단계 출석: 회원별 출석 상태 입력, `memberCount` 자동 계산 (김현민)
- [x] 5단계 잔여: 일정 → 활동 전환, 중복 변환 방지 (김현민)
- [x] 활동·일정 대상 팀 지정과 팀별 출석 대상 필터링 (김현민)
- [x] 7단계 주간 통계: 이번 주 팀별·개인별 활동량 (김현민)
- [x] 활동 기록 히트맵(기여도 그래프 형식) (김현민)
- [x] 6단계 위험 판정: 연속 노쇼 계산과 근거 표시 (김현민)
- [x] 8단계 대시보드: 다음 일정·정원 초과·노쇼 위험 통합 (김현민)
- [ ] 보고서 (박재웅)
