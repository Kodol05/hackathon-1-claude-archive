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
        backgroundColor: "#4a7a68",
        borderRadius: 4,
        maxBarThickness: 48
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#e6ddd0" } }
      }
    }
  });
}

// activities를 정렬해 목록 화면에 그린다. 비어 있으면 안내 문구만 표시한다
function renderActivityList() {
  renderMonthlyChart();
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

// 기간 필터 입력을 초기화한다
function resetPeriodFilter() {
  document.getElementById("startDateInput").value = "";
  document.getElementById("endDateInput").value = "";
  renderActivityList();
}

document.getElementById("activityForm").addEventListener("submit", handleActivitySubmit);
document.getElementById("startDateInput").addEventListener("change", renderActivityList);
document.getElementById("endDateInput").addEventListener("change", renderActivityList);
document.getElementById("resetFilterButton").addEventListener("click", resetPeriodFilter);
renderActivityList();
