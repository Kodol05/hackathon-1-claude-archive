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

renderActivityList();
