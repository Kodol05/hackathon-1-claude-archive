const ACTIVITIES_KEY = "activities";

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
  const date = document.createElement("span");
  date.className = "activity-date";
  date.textContent = activity.date;
  main.append(title, date);

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

// activities를 정렬해 목록 화면에 그린다. 비어 있으면 안내 문구만 표시한다
function renderActivityList() {
  const listEl = document.getElementById("activityList");
  const emptyEl = document.getElementById("emptyMessage");
  const activities = sortActivitiesByDate(getActivities());

  listEl.innerHTML = "";

  if (activities.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  for (const activity of activities) {
    listEl.appendChild(createActivityListItem(activity));
  }
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환한다
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 등록 폼의 입력값을 읽어 활동 정보 객체로 만든다
function readActivityForm() {
  return {
    title: document.getElementById("titleInput").value.trim(),
    date: document.getElementById("dateInput").value,
    place: document.getElementById("placeInput").value.trim(),
    memberCount: Number(document.getElementById("memberCountInput").value),
    memo: document.getElementById("memoInput").value.trim()
  };
}

// 입력값을 검증해 오류 문구를 반환한다. 문제가 없으면 빈 문자열을 반환한다
function validateActivityInput(input) {
  if (!input.title) return "활동명을 입력해주세요.";
  if (!input.date) return "날짜를 선택해주세요.";
  if (input.date > getTodayString()) return "날짜는 오늘 이후로 입력할 수 없습니다.";
  if (!Number.isInteger(input.memberCount) || input.memberCount < 1) {
    return "참여 인원은 1 이상의 정수로 입력해주세요.";
  }
  return "";
}

// 검증을 통과한 입력값을 새 활동으로 저장한다
function addActivity(input) {
  const activities = getActivities();
  activities.push({
    id: generateId(),
    title: input.title,
    date: input.date,
    place: input.place,
    memberCount: input.memberCount,
    memo: input.memo,
    createdAt: new Date().toISOString()
  });
  saveActivities(activities);
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
  addActivity(input);
  event.target.reset();
  renderActivityList();
}

document.getElementById("activityForm").addEventListener("submit", handleActivitySubmit);
renderActivityList();
