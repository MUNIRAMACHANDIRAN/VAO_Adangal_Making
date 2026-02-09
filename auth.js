// Simple front-end authentication for offline crop tools
// Stores a small session token in localStorage only (no backend).

const CROP_AUTH_KEY = 'cropAppUser_v1';

// You can edit this list to add/remove users.
// In a real backend system you would never store passwords in plain text.
const CROP_AUTH_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user1', password: 'user123', role: 'user' },
  { username: 'user2', password: 'user456', role: 'user' },
  { username: 'guest', password: 'guest', role: 'guest' }
];

function loginUser(username, password) {
  const u = (username || '').trim();
  const p = (password || '').trim();

  const match = CROP_AUTH_USERS.find(
    (uRec) => uRec.username === u && uRec.password === p
  );

  if (!match) {
    return { ok: false, message: 'Invalid user name or password.' };
  }

  const payload = {
    username: match.username,
    role: match.role || 'user',
    loginAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(CROP_AUTH_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Unable to save auth token:', e);
  }

  return { ok: true, user: payload };
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CROP_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.username) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    // Redirect to login page if not authenticated.
    window.location.href = 'login.html';
    return;
  }
  // Optionally expose user name to the document for headers etc.
  document.documentElement.setAttribute('data-current-user', user.username);
}

function logoutUser(redirectToLogin = true) {
  try {
    localStorage.removeItem(CROP_AUTH_KEY);
  } catch (e) {
    console.warn('Unable to clear auth token:', e);
  }
  if (redirectToLogin) {
    window.location.href = 'login.html';
  }
}

// Small helper to show current user and logout in any page header if desired.
function injectUserBadge(targetSelector) {
  const container = document.querySelector(targetSelector);
  if (!container) return;
  const user = getCurrentUser();
  if (!user) return;
  const span = document.createElement('span');
  span.style.fontSize = '12px';
  span.style.color = '#444';
  span.style.marginLeft = '8px';
  span.innerHTML =
    'Signed in as <strong>' +
    user.username +
    '</strong> &nbsp; <button type="button" style="padding:3px 8px;border-radius:999px;border:1px solid #ccc;background:#f3f4f6;cursor:pointer;font-size:11px;" onclick="logoutUser(true)">Logout</button>';
  container.appendChild(span);
}


