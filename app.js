const ACTIVITIES_KEY = "activities";

let monthlyChart = null;

// localStorage에서 activities 배열을 읽어온다
function getActivities() {
  const raw = localStorage.getItem(ACTIVITIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

// activities 배열 전체를 localStorage에 저장한다
function saveActivities(list) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
}

// 고유 id 문자열을 생성한다
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// 활동 배열을 화면 표시 순서(날짜 내림차순, 동률이면 생성 시각 내림차순)로 정렬한다
function sortActivitiesByDate(activities) {
  return activities.slice().sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

// 활동 하나를 목록에 표시할 <li> 요소로 만든다
function createActivityListItem(activity) {
  const li = document.createElement("li");
  li.className = "activity-item";
  li.dataset.id = activity.id;

  const main = document.createElement("div");
  main.className = "activity-main";
  const title = document.createElement("span");
  title.className = "activity-title";
  title.textContent = activity.title;

  const actions = document.createElement("div");
  actions.className = "activity-actions";
  const date = document.createElement("span");
  date.className = "activity-date";
  date.textContent = activity.date;
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "삭제";
  deleteButton.setAttribute("aria-label", `${activity.title} 삭제`);
  deleteButton.addEventListener("click", () => deleteActivity(activity.id));
  actions.append(date, deleteButton);

  main.append(title, actions);

  const sub = document.createElement("div");
  sub.className = "activity-sub";
  const place = document.createElement("span");
  place.className = "activity-place";
  place.textContent = activity.place;
  const memberCount = document.createElement("span");
  memberCount.className = "activity-member-count";
  memberCount.textContent = `참여 ${activity.memberCount}명`;
  sub.append(place, memberCount);

  li.append(main, sub);

  if (activity.memo) {
    const memo = document.createElement("p");
    memo.className = "activity-memo";
    memo.textContent = activity.memo;
    li.appendChild(memo);
  }

  return li;
}

// 기간 필터 입력값에 맞는 활동만 남긴다. 입력이 비어 있으면 전체를 반환한다
function filterActivitiesByPeriod(activities) {
  const start = document.getElementById("startDateInput").value;
  const end = document.getElementById("endDateInput").value;

  return activities.filter((activity) => {
    if (start && activity.date < start) return false;
    if (end && activity.date > end) return false;
    return true;
  });
}

// 활동을 월(YYYY-MM)별로 세어 오름차순으로 반환한다
function countActivitiesByMonth(activities) {
  const counts = {};
  for (const activity of activities) {
    const month = activity.date.slice(0, 7);
    counts[month] = (counts[month] || 0) + 1;
  }
  return Object.keys(counts).sort().map((month) => ({ month, count: counts[month] }));
}

// 월별 활동 횟수를 막대차트로 그린다. 데이터가 없으면 안내 문구만 표시한다
function renderMonthlyChart() {
  const canvas = document.getElementById("monthlyChart");
  const emptyEl = document.getElementById("chartEmptyMessage");
  const rows = countActivitiesByMonth(filterActivitiesByPeriod(getActivities()));

  if (monthlyChart) {
    monthlyChart.destroy();
    monthlyChart = null;
  }

  canvas.hidden = rows.length === 0;
  emptyEl.hidden = rows.length > 0;
  if (rows.length === 0) return;

  monthlyChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: rows.map((row) => row.month),
      datasets: [{
        label: "활동 횟수",
        data: rows.map((row) => row.count),
        backgroundColor: "#3fbf9a",
        borderRadius: 4,
        maxBarThickness: 48
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#94a1b2" } },
        y: { beginAtZero: true, ticks: { precision: 0, color: "#94a1b2" }, grid: { color: "#2e3746" } }
      }
    }
  });
}

// activities를 정렬해 목록 화면에 그린다. 비어 있으면 안내 문구만 표시한다
function renderActivityList() {
  renderMonthlyChart();
  renderWeeklyChart();
  renderDashboard();
  const listEl = document.getElementById("activityList");
  const emptyEl = document.getElementById("emptyMessage");
  const savedCount = getActivities().length;
  const activities = sortActivitiesByDate(filterActivitiesByPeriod(getActivities()));

  listEl.innerHTML = "";

  if (activities.length === 0) {
    emptyEl.textContent = savedCount === 0
      ? "등록된 활동이 없습니다. 첫 활동을 등록해보세요."
      : "선택한 기간에 해당하는 활동이 없습니다.";
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  for (const activity of activities) {
    listEl.appendChild(createActivityListItem(activity));
  }
}

// 확인 절차를 거쳐 해당 id의 활동을 삭제한다
function deleteActivity(id) {
  const activities = getActivities();
  const target = activities.find((activity) => activity.id === id);
  if (!target) return;

  const confirmed = confirm(`"${target.title}" 활동을 삭제할까요?`);
  if (!confirmed) return;

  const remaining = activities.filter((activity) => activity.id !== id);
  saveActivities(remaining);
  renderActivityList();
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환한다
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ===== 출석 기록 (담당: 김현민) =====
   회원이 등록되어 있을 때만 활동 등록 폼에 출석 입력을 표시한다.
   회원이 없으면 기존처럼 참여 인원을 직접 입력한다. */

const ATTENDANCE_LABELS = {
  unmarked: "미기록",
  present: "참석",
  excused: "사전 불참",
  noShow: "무단 불참"
};

// 회원 한 명의 출석 상태 선택 행을 만든다
function createAttendanceRow(member) {
  const row = document.createElement("div");
  row.className = "attendance-row";

  const name = document.createElement("span");
  name.className = "attendance-name";
  name.textContent = member.name;

  const select = document.createElement("select");
  select.className = "attendance-select";
  select.dataset.memberId = member.id;
  select.setAttribute("aria-label", `${member.name} 출석 상태`);

  for (const status of Object.keys(ATTENDANCE_LABELS)) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = ATTENDANCE_LABELS[status];
    select.appendChild(option);
  }

  select.addEventListener("change", syncMemberCountFromAttendance);
  row.append(name, select);
  return row;
}

// 활동 대상(전체 동아리 또는 특정 팀)에 해당하는 회원만 반환한다
function getAttendanceTargets() {
  const teamId = document.getElementById("activityTeamSelect").value;
  const members = getMembers();
  return teamId ? members.filter((member) => member.teamId === teamId) : members;
}

// 활동 대상에 해당하는 회원으로 출석 입력 목록을 다시 그린다
function renderAttendanceInputs() {
  const listEl = document.getElementById("attendanceList");
  const emptyEl = document.getElementById("attendanceEmptyMessage");
  const isTeamActivity = document.getElementById("activityTeamSelect").value !== "";
  const members = getAttendanceTargets();

  listEl.innerHTML = "";
  emptyEl.hidden = members.length > 0;
  emptyEl.textContent = isTeamActivity
    ? "이 팀에 배정된 회원이 없습니다."
    : "등록된 회원이 없습니다. 회원을 등록하면 출석을 기록할 수 있습니다.";

  for (const member of members) {
    listEl.appendChild(createAttendanceRow(member));
  }
}

// 대상 팀 선택지(활동·일정 공용)를 최신 팀 목록으로 갱신한다
function refreshTargetTeamSelect(selectId) {
  const select = document.getElementById(selectId);
  const previous = select.value;

  select.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "전체 동아리";
  select.appendChild(allOption);

  for (const team of getTeams()) {
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = team.name;
    select.appendChild(option);
  }

  select.value = previous;
}

// 활동 등록 폼의 대상 선택지를 갱신한다
function refreshActivityTeamSelect() {
  refreshTargetTeamSelect("activityTeamSelect");
  refreshTargetTeamSelect("scheduleTeamSelect");
}

// 출석 입력값을 { memberId, status } 배열로 읽어온다
function readAttendance() {
  const selects = document.querySelectorAll("#attendanceList .attendance-select");
  return [...selects].map((select) => ({
    memberId: select.dataset.memberId,
    status: select.value
  }));
}

// 참석으로 표시된 회원 수를 참여 인원 입력란에 반영한다
function syncMemberCountFromAttendance() {
  const attendance = readAttendance();
  if (attendance.length === 0) return;

  const presentCount = attendance.filter((record) => record.status === "present").length;
  document.getElementById("memberCountInput").value = presentCount > 0 ? presentCount : "";
}

// 등록 폼의 입력값을 읽어 활동 정보 객체로 만든다
function readActivityForm() {
  return {
    title: document.getElementById("titleInput").value.trim(),
    date: document.getElementById("dateInput").value,
    place: document.getElementById("placeInput").value.trim(),
    memberCount: Number(document.getElementById("memberCountInput").value),
    memo: document.getElementById("memoInput").value.trim(),
    teamId: document.getElementById("activityTeamSelect").value || null,
    attendance: readAttendance()
  };
}

// 입력값을 검증해 오류 문구를 반환한다. 문제가 없으면 빈 문자열을 반환한다
function validateActivityInput(input) {
  if (!input.title) return "활동명을 입력해주세요.";
  if (!input.date) return "날짜를 선택해주세요.";
  if (input.date > getTodayString()) return "날짜는 오늘 이후로 입력할 수 없습니다.";
  // 출석 대상이 있는데 참석자가 한 명도 없으면 저장하지 않는다
  if (input.attendance.length > 0 && !input.attendance.some((r) => r.status === "present")) {
    return "참석한 회원을 최소 한 명 선택해주세요.";
  }
  if (!Number.isInteger(input.memberCount) || input.memberCount < 1) {
    return "참여 인원은 1 이상의 정수로 입력해주세요.";
  }
  return "";
}

// 검증을 통과한 입력값을 새 활동으로 저장한다
function addActivity(input) {
  const activities = getActivities();
  const id = generateId();
  activities.push({
    id,
    title: input.title,
    date: input.date,
    place: input.place,
    memberCount: input.memberCount,
    memo: input.memo,
    teamId: input.teamId,
    attendance: input.attendance,
    sourceScheduleId: pendingScheduleId,
    createdAt: new Date().toISOString()
  });
  saveActivities(activities);
  return id;
}

// 등록 폼 제출을 처리한다
function handleActivitySubmit(event) {
  event.preventDefault();

  const input = readActivityForm();
  const errorMessage = validateActivityInput(input);
  const errorEl = document.getElementById("formError");

  if (errorMessage) {
    errorEl.textContent = errorMessage;
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  const activityId = addActivity(input);
  completeScheduleConversion(activityId);
  event.target.reset();
  renderAttendanceInputs();
  renderActivityList();
}

/* =========================================================
   회원·팀 관리  (담당: 김현민)
   localStorage 키: "teams", "members"
   teams  : { id, name, capacity, createdAt }
   members: { id, name, role, teamId, createdAt }
   ---------------------------------------------------------
   구현할 함수 (이 구역 안에만 작성한다)
   - getTeams() / saveTeams(list)
   - getMembers() / saveMembers(list)
   - addTeam(input)      팀 등록. capacity는 1 이상 정수 검증
   - addMember(input)    회원 등록. 이름 중복은 대소문자 무시하고 차단
   - countTeamMembers(teamId)  해당 팀 소속 회원 수
   - renderTeamList()    팀 카드 + 정원 초과 시 "정원 +N명" 배지 표시
                         (초과해도 저장은 허용, 경고만 표시)
   ========================================================= */

const TEAMS_KEY = "teams";
const MEMBERS_KEY = "members";

const ROLE_LABELS = {
  planning: "기획",
  programming: "프로그래밍",
  art: "아트",
  sound: "사운드",
  other: "기타"
};

// localStorage에서 teams 배열을 읽어온다
function getTeams() {
  const raw = localStorage.getItem(TEAMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// teams 배열 전체를 localStorage에 저장한다
function saveTeams(list) {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(list));
}

// localStorage에서 members 배열을 읽어온다
function getMembers() {
  const raw = localStorage.getItem(MEMBERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// members 배열 전체를 localStorage에 저장한다
function saveMembers(list) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(list));
}

// 해당 팀에 배정된 회원 수를 센다
function countTeamMembers(teamId) {
  return getMembers().filter((member) => member.teamId === teamId).length;
}

// 같은 이름이 이미 있는지 대소문자를 구분하지 않고 확인한다
function hasSameName(list, name) {
  return list.some((item) => item.name.toLowerCase() === name.toLowerCase());
}

// 팀 입력값을 검증해 오류 문구를 반환한다. 문제가 없으면 빈 문자열을 반환한다
function validateTeamInput(input) {
  if (!input.name) return "팀 이름을 입력해주세요.";
  if (hasSameName(getTeams(), input.name)) return "이미 등록된 팀 이름입니다.";
  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    return "권장 정원은 1 이상의 정수로 입력해주세요.";
  }
  return "";
}

// 검증을 통과한 입력값을 새 팀으로 저장한다
function addTeam(input) {
  const teams = getTeams();
  teams.push({
    id: generateId(),
    name: input.name,
    capacity: input.capacity,
    createdAt: new Date().toISOString()
  });
  saveTeams(teams);
}

// 회원 입력값을 검증해 오류 문구를 반환한다. 문제가 없으면 빈 문자열을 반환한다
function validateMemberInput(input) {
  if (!input.name) return "회원 이름을 입력해주세요.";
  if (hasSameName(getMembers(), input.name)) return "이미 등록된 회원 이름입니다.";
  return "";
}

// 검증을 통과한 입력값을 새 회원으로 저장한다
function addMember(input) {
  const members = getMembers();
  members.push({
    id: generateId(),
    name: input.name,
    role: input.role,
    teamId: input.teamId,
    createdAt: new Date().toISOString()
  });
  saveMembers(members);
}

// 회원 한 명을 목록에 표시할 요소로 만든다
function createMemberItem(member) {
  const li = document.createElement("li");
  li.className = "member-item";
  li.textContent = `${member.name} · ${ROLE_LABELS[member.role]}`;
  return li;
}

// 회원 배열을 담은 카드를 만든다. 정원을 넘기면 경고 배지를 붙인다
function createTeamCard(title, members, capacity) {
  const card = document.createElement("article");
  card.className = "team-card";

  const head = document.createElement("div");
  head.className = "team-head";

  const name = document.createElement("span");
  name.className = "team-name";
  name.textContent = title;

  const count = document.createElement("span");
  count.className = "team-count";
  count.textContent = capacity === null
    ? `${members.length}명`
    : `${members.length} / ${capacity}명`;

  head.append(name, count);

  const over = capacity === null ? 0 : members.length - capacity;
  if (over > 0) {
    const badge = document.createElement("span");
    badge.className = "capacity-badge";
    badge.textContent = `정원 +${over}명`;
    head.appendChild(badge);
  }

  card.appendChild(head);

  const list = document.createElement("ul");
  list.className = "member-list";

  if (members.length === 0) {
    const empty = document.createElement("li");
    empty.className = "member-item member-empty";
    empty.textContent = "배정된 회원이 없습니다.";
    list.appendChild(empty);
  } else {
    for (const member of members) {
      list.appendChild(createMemberItem(member));
    }
  }

  card.appendChild(list);
  return card;
}

// 팀 카드와 미배정 회원 카드를 화면에 그린다
function renderTeamList() {
  const listEl = document.getElementById("teamList");
  const emptyEl = document.getElementById("teamEmptyMessage");
  const teams = getTeams();
  const members = getMembers();
  const unassigned = members.filter((member) => !member.teamId);

  listEl.innerHTML = "";
  emptyEl.hidden = teams.length > 0 || members.length > 0;

  for (const team of teams) {
    const teamMembers = members.filter((member) => member.teamId === team.id);
    listEl.appendChild(createTeamCard(team.name, teamMembers, team.capacity));
  }

  if (unassigned.length > 0) {
    listEl.appendChild(createTeamCard("미배정 회원", unassigned, null));
  }
}

// 회원 등록 폼의 소속 팀 선택지를 최신 팀 목록으로 갱신한다
function refreshTeamSelect() {
  const select = document.getElementById("memberTeamSelect");
  const previous = select.value;

  select.innerHTML = "";
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "미배정";
  select.appendChild(noneOption);

  for (const team of getTeams()) {
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = team.name;
    select.appendChild(option);
  }

  select.value = previous;
}

// 팀 등록 폼 제출을 처리한다
function handleTeamSubmit(event) {
  event.preventDefault();

  const input = {
    name: document.getElementById("teamNameInput").value.trim(),
    capacity: Number(document.getElementById("teamCapacityInput").value)
  };
  const errorEl = document.getElementById("teamFormError");
  const errorMessage = validateTeamInput(input);

  if (errorMessage) {
    errorEl.textContent = errorMessage;
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  addTeam(input);
  event.target.reset();
  refreshTeamSelect();
  refreshActivityTeamSelect();
  renderTeamList();
  renderDashboard();
}

// 회원 등록 폼 제출을 처리한다
function handleMemberSubmit(event) {
  event.preventDefault();

  const input = {
    name: document.getElementById("memberNameInput").value.trim(),
    role: document.getElementById("memberRoleSelect").value,
    teamId: document.getElementById("memberTeamSelect").value || null
  };
  const errorEl = document.getElementById("memberFormError");
  const errorMessage = validateMemberInput(input);

  if (errorMessage) {
    errorEl.textContent = errorMessage;
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  addMember(input);
  event.target.reset();
  renderTeamList();
  renderAttendanceInputs();
  renderDashboard();
}


/* =========================================================
   일정 관리  (담당: 이정호)
   localStorage 키: "schedules"
   schedules: { id, title, date, category, place,
                targetTeamId, memo, convertedActivityId, createdAt }
   ---------------------------------------------------------
   구현할 함수 (이 구역 안에만 작성한다)
   - getSchedules() / saveSchedules(list)
   - addSchedule(input)  일정 등록. 날짜는 오늘 또는 미래만 허용
   - getDaysUntil(date)  D-day 계산 (오늘 기준 남은 일수)
   - renderScheduleList()
       · convertedActivityId 가 없는 일정만 D-day 가까운 순으로 표시
       · 일정이 없으면 안내 문구 표시
   ========================================================= */

// localStorage에서 schedules 배열을 읽어온다
function getSchedules() {
  const raw = localStorage.getItem("schedules");
  return raw ? JSON.parse(raw) : [];
}

// schedules 배열 전체를 localStorage에 저장한다
function saveSchedules(list) {
  localStorage.setItem("schedules", JSON.stringify(list));
}

// 오늘 기준으로 해당 날짜까지 남은 일수를 계산한다 (오늘이면 0)
function getDaysUntil(date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const [ty, tm, td] = getTodayString().split("-").map(Number);
  const [dy, dm, dd] = date.split("-").map(Number);
  const todayUTC = Date.UTC(ty, tm - 1, td);
  const targetUTC = Date.UTC(dy, dm - 1, dd);
  return Math.round((targetUTC - todayUTC) / msPerDay);
}

// 남은 일수를 "D-3", "D-DAY" 형식의 배지 문구로 바꾼다
function formatDday(daysUntil) {
  return daysUntil === 0 ? "D-DAY" : `D-${daysUntil}`;
}

// 일정 등록 폼의 입력값을 읽어 일정 정보 객체로 만든다
function readScheduleForm() {
  return {
    title: document.getElementById("scheduleTitleInput").value.trim(),
    date: document.getElementById("scheduleDateInput").value,
    category: document.getElementById("scheduleCategorySelect").value,
    place: document.getElementById("schedulePlaceInput").value.trim(),
    targetTeamId: document.getElementById("scheduleTeamSelect").value || null,
    memo: document.getElementById("scheduleMemoInput").value.trim()
  };
}

// 일정 입력값을 검증해 오류 문구를 반환한다. 문제가 없으면 빈 문자열을 반환한다
function validateScheduleInput(input) {
  if (!input.title) return "일정명을 입력해주세요.";
  if (!input.date) return "날짜를 선택해주세요.";
  if (input.date < getTodayString()) return "날짜는 오늘 또는 이후로 입력할 수 없습니다.";
  return "";
}

// 검증을 통과한 입력값을 새 일정으로 저장한다
function addSchedule(input) {
  const schedules = getSchedules();
  schedules.push({
    id: generateId(),
    title: input.title,
    date: input.date,
    category: input.category,
    place: input.place,
    targetTeamId: input.targetTeamId,
    memo: input.memo,
    convertedActivityId: null,
    createdAt: new Date().toISOString()
  });
  saveSchedules(schedules);
}

// 일정 하나를 목록에 표시할 <li> 요소로 만든다
function createScheduleListItem(schedule) {
  const li = document.createElement("li");
  li.className = "schedule-item";
  li.dataset.id = schedule.id;

  const main = document.createElement("div");
  main.className = "schedule-main";
  const title = document.createElement("span");
  title.className = "schedule-title";
  title.textContent = schedule.title;
  const ddayBadge = document.createElement("span");
  ddayBadge.className = "dday-badge";
  ddayBadge.textContent = formatDday(getDaysUntil(schedule.date));
  main.append(title, ddayBadge);

  const sub = document.createElement("div");
  sub.className = "schedule-sub";
  const category = document.createElement("span");
  category.className = "schedule-category";
  category.textContent = schedule.category;
  const date = document.createElement("span");
  date.className = "schedule-date";
  date.textContent = schedule.date;
  const place = document.createElement("span");
  place.className = "schedule-place";
  place.textContent = schedule.place;
  const target = document.createElement("span");
  target.className = "schedule-target";
  const targetTeam = getTeams().find((team) => team.id === schedule.targetTeamId);
  target.textContent = targetTeam ? targetTeam.name : "전체 동아리";
  sub.append(category, date, place, target);

  li.append(main, sub);

  if (schedule.memo) {
    const memo = document.createElement("p");
    memo.className = "schedule-memo";
    memo.textContent = schedule.memo;
    li.appendChild(memo);
  }

  // 날짜가 지났거나 오늘이면 활동으로 기록할 수 있다
  if (getDaysUntil(schedule.date) <= 0) {
    const convertButton = document.createElement("button");
    convertButton.type = "button";
    convertButton.className = "convert-button";
    convertButton.textContent = "활동으로 기록";
    convertButton.addEventListener("click", () => startScheduleConversion(schedule.id));
    li.appendChild(convertButton);
  }

  return li;
}

/* ===== 일정 → 활동 전환 (5단계) =====
   일정 값을 활동 등록 폼에 복사하고, 활동 저장이 끝난 뒤에만
   해당 일정에 convertedActivityId 를 기록해 중복 변환을 막는다. */

let pendingScheduleId = null;

// 일정 값을 활동 등록 폼에 복사하고 전환 대기 상태로 둔다
function startScheduleConversion(scheduleId) {
  const schedule = getSchedules().find((item) => item.id === scheduleId);
  if (!schedule) return;

  document.getElementById("titleInput").value = schedule.title;
  document.getElementById("dateInput").value = schedule.date;
  document.getElementById("placeInput").value = schedule.place;
  document.getElementById("memoInput").value = schedule.memo;
  document.getElementById("activityTeamSelect").value = schedule.targetTeamId || "";
  renderAttendanceInputs();

  pendingScheduleId = scheduleId;

  const notice = document.getElementById("conversionNotice");
  notice.textContent = `"${schedule.title}" 일정을 활동으로 기록하는 중입니다. 출석을 확정하고 등록하세요.`;
  notice.hidden = false;

  document.getElementById("titleInput").scrollIntoView({ behavior: "smooth", block: "center" });
}

// 활동 저장이 끝난 뒤 전환된 일정에 활동 id를 기록한다
function completeScheduleConversion(activityId) {
  if (!pendingScheduleId) return;

  const schedules = getSchedules();
  const schedule = schedules.find((item) => item.id === pendingScheduleId);
  if (schedule) {
    schedule.convertedActivityId = activityId;
    saveSchedules(schedules);
  }

  pendingScheduleId = null;
  document.getElementById("conversionNotice").hidden = true;
  renderScheduleList();
}

// 전환이 끝난 일정을 활동 연결 상태와 함께 보여주는 요소를 만든다
function createConvertedScheduleItem(schedule) {
  const li = document.createElement("li");
  li.className = "schedule-item schedule-converted";

  const main = document.createElement("div");
  main.className = "schedule-main";
  const title = document.createElement("span");
  title.className = "schedule-title";
  title.textContent = schedule.title;

  const badge = document.createElement("span");
  const linkedActivity = getActivities().find((activity) => activity.id === schedule.convertedActivityId);
  badge.className = linkedActivity ? "done-badge" : "removed-badge";
  badge.textContent = linkedActivity ? "기록 완료" : "연결된 활동이 삭제됨";

  main.append(title, badge);

  const sub = document.createElement("div");
  sub.className = "schedule-sub";
  sub.textContent = `${schedule.category} · ${schedule.date}`;

  li.append(main, sub);
  return li;
}

// 전환되지 않은 일정을 D-day 가까운 순으로 정렬해 화면에 그린다. 없으면 안내 문구만 표시한다
function renderScheduleList() {
  const listEl = document.getElementById("scheduleList");
  const emptyEl = document.getElementById("scheduleEmptyMessage");
  const schedules = getSchedules()
    .filter((schedule) => !schedule.convertedActivityId)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const converted = getSchedules().filter((schedule) => schedule.convertedActivityId);

  listEl.innerHTML = "";

  if (schedules.length === 0 && converted.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  for (const schedule of schedules) {
    listEl.appendChild(createScheduleListItem(schedule));
  }
  for (const schedule of converted) {
    listEl.appendChild(createConvertedScheduleItem(schedule));
  }
}

// 일정 등록 폼 제출을 처리한다
function handleScheduleSubmit(event) {
  event.preventDefault();

  const input = readScheduleForm();
  const errorMessage = validateScheduleInput(input);
  const errorEl = document.getElementById("scheduleFormError");

  if (errorMessage) {
    errorEl.textContent = errorMessage;
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  addSchedule(input);
  event.target.reset();
  renderScheduleList();
}


/* ===== 주간 활동량 통계 (7단계) =====
   한 주는 월요일부터 일요일까지로 본다. 현재 주 데이터만 집계한다. */

let weeklyChart = null;
let weeklyView = "team";

// Date 객체를 YYYY-MM-DD 문자열로 바꾼다
function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 이번 주(월~일)의 시작일과 종료일을 반환한다
function getCurrentWeekRange() {
  const today = new Date(`${getTodayString()}T00:00:00`);
  const weekday = today.getDay();
  const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;

  const monday = new Date(today);
  monday.setDate(today.getDate() + offsetToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { start: toDateString(monday), end: toDateString(sunday) };
}

// 이번 주에 해당하는 활동만 반환한다
function getThisWeekActivities() {
  const { start, end } = getCurrentWeekRange();
  return getActivities().filter((activity) => activity.date >= start && activity.date <= end);
}

// 회원별 이번 주 참석 횟수를 센다. 미배정 회원도 포함한다
function countWeeklyByMember() {
  const activities = getThisWeekActivities();
  return getMembers()
    .map((member) => ({
      label: member.name,
      count: activities.filter((activity) =>
        (activity.attendance || []).some((r) => r.memberId === member.id && r.status === "present")
      ).length
    }))
    .filter((row) => row.count > 0);
}

// 팀별 이번 주 활동 횟수를 센다. 한 활동은 팀마다 1회만 집계한다
function countWeeklyByTeam() {
  const activities = getThisWeekActivities();
  const members = getMembers();

  return getTeams()
    .map((team) => {
      let count = 0;
      for (const activity of activities) {
        if (activity.teamId) {
          if (activity.teamId === team.id) count += 1;
          continue;
        }
        // 전체 동아리 활동은 참석자가 있는 팀에만 1회 집계한다
        const hasPresentMember = (activity.attendance || []).some((record) => {
          if (record.status !== "present") return false;
          const member = members.find((m) => m.id === record.memberId);
          return member && member.teamId === team.id;
        });
        if (hasPresentMember) count += 1;
      }
      return { label: team.name, count };
    })
    .filter((row) => row.count > 0);
}

// 선택된 보기에 맞춰 이번 주 활동량 차트를 그린다
function renderWeeklyChart() {
  const canvas = document.getElementById("weeklyChart");
  const emptyEl = document.getElementById("weeklyEmptyMessage");
  const rangeEl = document.getElementById("weekRange");
  const { start, end } = getCurrentWeekRange();
  const rows = weeklyView === "team" ? countWeeklyByTeam() : countWeeklyByMember();

  rangeEl.textContent = `${start} ~ ${end}`;

  if (weeklyChart) {
    weeklyChart.destroy();
    weeklyChart = null;
  }

  canvas.hidden = rows.length === 0;
  emptyEl.hidden = rows.length > 0;
  if (rows.length === 0) return;

  weeklyChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: rows.map((row) => row.label),
      datasets: [{
        label: weeklyView === "team" ? "팀 활동 횟수" : "개인 참석 횟수",
        data: rows.map((row) => row.count),
        backgroundColor: "#5aa9f5",
        borderRadius: 4,
        maxBarThickness: 48
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#94a1b2" } },
        y: { beginAtZero: true, ticks: { precision: 0, color: "#94a1b2" }, grid: { color: "#2e3746" } }
      }
    }
  });
}

// 팀별·개인별 보기를 전환한다
function setWeeklyView(view) {
  weeklyView = view;
  document.getElementById("teamViewButton").classList.toggle("view-button-active", view === "team");
  document.getElementById("memberViewButton").classList.toggle("view-button-active", view === "member");
  renderWeeklyChart();
}

/* ===== 연속 노쇼 위험 판정 + 대시보드 (담당: 김현민) ===== */

// 회원 한 명의 연속 무단 불참 횟수와 근거 활동 2건을 계산한다
function findNoShowStreak(memberId) {
  const records = getActivities()
    .filter((activity) => (activity.attendance || []).some((r) => r.memberId === memberId))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.createdAt < b.createdAt ? -1 : 1;
    });

  let streak = 0;
  let evidence = [];

  for (const activity of records) {
    const status = activity.attendance.find((r) => r.memberId === memberId).status;
    if (status === "unmarked") continue;

    if (status === "noShow") {
      streak += 1;
      evidence.push(activity);
    } else {
      streak = 0;
      evidence = [];
    }
  }

  return { streak, evidence: evidence.slice(-2) };
}

// 연속 무단 불참 2회 이상인 회원 목록을 반환한다
function findNoShowRiskMembers() {
  return getMembers()
    .map((member) => ({ member, ...findNoShowStreak(member.id) }))
    .filter((row) => row.streak >= 2);
}

// 대시보드 카드 하나를 만든다
function createDashboardCard(title, lines, tone) {
  const card = document.createElement("article");
  card.className = `dashboard-card dashboard-${tone}`;

  const heading = document.createElement("h3");
  heading.className = "dashboard-title";
  heading.textContent = title;
  card.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "dashboard-lines";

  if (lines.length === 0) {
    const li = document.createElement("li");
    li.className = "dashboard-line dashboard-ok";
    li.textContent = "해당 없음";
    list.appendChild(li);
  } else {
    for (const line of lines) {
      const li = document.createElement("li");
      li.className = "dashboard-line";
      li.textContent = line;
      list.appendChild(li);
    }
  }

  card.appendChild(list);
  return card;
}

// 다음 일정, 정원 초과 팀, 노쇼 위험을 대시보드에 그린다
function renderDashboard() {
  const boardEl = document.getElementById("dashboard");
  const today = getTodayString();
  boardEl.innerHTML = "";

  const upcoming = getSchedules()
    .filter((schedule) => !schedule.convertedActivityId && schedule.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 3)
    .map((schedule) => `${schedule.title} · ${schedule.date} (D-${getDaysUntil(schedule.date)})`);

  const members = getMembers();
  const overCapacity = getTeams()
    .map((team) => ({
      team,
      over: members.filter((m) => m.teamId === team.id).length - team.capacity
    }))
    .filter((row) => row.over > 0)
    .map((row) => `${row.team.name} · 정원 +${row.over}명`);

  const risky = findNoShowRiskMembers().map((row) => {
    const titles = row.evidence.map((activity) => `${activity.title}(${activity.date})`).join(", ");
    return `${row.member.name} · 무단 불참 ${row.streak}회 연속 — ${titles}`;
  });

  boardEl.appendChild(createDashboardCard("다가오는 일정", upcoming, "info"));
  boardEl.appendChild(createDashboardCard("정원 초과 팀", overCapacity, "warn"));
  boardEl.appendChild(createDashboardCard("연속 노쇼 위험", risky, "danger"));
}

// 기간 필터 입력을 초기화한다
function resetPeriodFilter() {
  document.getElementById("startDateInput").value = "";
  document.getElementById("endDateInput").value = "";
  renderActivityList();
}

// --- 아래에 각자 담당 기능의 이벤트 리스너와 초기 렌더 호출을 추가한다 ---
// 이정호: scheduleForm submit 리스너 + renderScheduleList();

document.getElementById("teamForm").addEventListener("submit", handleTeamSubmit);
document.getElementById("memberForm").addEventListener("submit", handleMemberSubmit);
/* ===== 화면 전환 (기획서 3절: 대시보드·활동·일정·회원·팀 네 화면) ===== */

// 선택한 화면만 보여주고 나머지는 숨긴다
function showScreen(target) {
  for (const section of document.querySelectorAll("[data-screen]")) {
    section.hidden = section.dataset.screen !== target;
  }
  for (const button of document.querySelectorAll(".nav-button")) {
    button.classList.toggle("nav-button-active", button.dataset.target === target);
  }
  // 숨겨진 동안에는 차트 크기를 잡을 수 없으므로 화면을 열 때 다시 그린다
  if (target === "dashboard") {
    renderMonthlyChart();
    renderWeeklyChart();
  }
}

for (const button of document.querySelectorAll(".nav-button")) {
  button.addEventListener("click", () => showScreen(button.dataset.target));
}

document.getElementById("activityTeamSelect").addEventListener("change", renderAttendanceInputs);
document.getElementById("teamViewButton").addEventListener("click", () => setWeeklyView("team"));
document.getElementById("memberViewButton").addEventListener("click", () => setWeeklyView("member"));
refreshTeamSelect();
refreshActivityTeamSelect();
renderTeamList();
renderAttendanceInputs();
showScreen("dashboard");

document.getElementById("activityForm").addEventListener("submit", handleActivitySubmit);
document.getElementById("startDateInput").addEventListener("change", renderActivityList);
document.getElementById("endDateInput").addEventListener("change", renderActivityList);
document.getElementById("resetFilterButton").addEventListener("click", resetPeriodFilter);
renderActivityList();

document.getElementById("scheduleForm").addEventListener("submit", handleScheduleSubmit);
renderScheduleList();
