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
