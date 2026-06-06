const BASE_URL = "/api";

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem("citizen-user") || "{}");
  const headers = { "Content-Type": "application/json" };
  if (user.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }
  return headers;
};

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("citizen-user") || "{}");
  return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const parseError = async (res, fallback) => {
  try {
    const body = await res.json();
    return new Error(body?.error || body?.message || fallback);
  } catch {
    return new Error(fallback);
  }
};

export const api = {
  async getState() {
    const currentUser = JSON.parse(localStorage.getItem("citizen-user") || "null");
    if (!currentUser || !currentUser.token) {
      return { issues: [], areas: [], departments: [], labour: [], notifications: [], users: [], currentUser: null };
    }
    const res = await fetch(`${BASE_URL}/state`, { headers: getHeaders() });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("citizen-user");
      return { issues: [], areas: [], departments: [], labour: [], notifications: [], users: [], currentUser: null };
    }
    if (!res.ok) throw new Error("Failed to fetch portal data");
    const data = await res.json();
    if (data.currentUser) {
      localStorage.setItem("citizen-user", JSON.stringify({ ...currentUser, ...data.currentUser }));
    }
    return { ...data, currentUser: data.currentUser || currentUser };
  },

  getSessions() {
    return JSON.parse(localStorage.getItem("citizen-sessions") || "[]");
  },

  switchAccount(token) {
    const sessions = this.getSessions();
    const user = sessions.find(s => s.token === token);
    if (user) {
      localStorage.setItem("citizen-user", JSON.stringify(user));
      window.dispatchEvent(new Event("portal-state-change"));
    }
  },

  _saveSession(user) {
    localStorage.setItem("citizen-user", JSON.stringify(user));
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(s => s.email === user.email);
    if (existingIndex >= 0) sessions[existingIndex] = user;
    else sessions.push(user);
    localStorage.setItem("citizen-sessions", JSON.stringify(sessions));
  },

  logoutAll() {
    localStorage.removeItem("citizen-user");
    localStorage.removeItem("citizen-sessions");
    window.dispatchEvent(new Event("portal-state-change"));
  },

  logout() {
    const current = JSON.parse(localStorage.getItem("citizen-user") || "null");
    if (!current) return;
    const sessions = this.getSessions();
    const remaining = sessions.filter(s => s.email !== current.email);
    if (remaining.length > 0) localStorage.setItem("citizen-user", JSON.stringify(remaining[0]));
    else localStorage.removeItem("citizen-user");
    localStorage.setItem("citizen-sessions", JSON.stringify(remaining));
    window.dispatchEvent(new Event("portal-state-change"));
  },

  logoutSession(email) {
    if (!email) return;
    const sessions = this.getSessions();
    const remaining = sessions.filter(s => s.email !== email);
    localStorage.setItem("citizen-sessions", JSON.stringify(remaining));
    const current = JSON.parse(localStorage.getItem("citizen-user") || "null");
    if (current && current.email === email) {
      if (remaining.length > 0) localStorage.setItem("citizen-user", JSON.stringify(remaining[0]));
      else localStorage.removeItem("citizen-user");
      window.dispatchEvent(new Event("portal-state-change"));
    }
  },

  async login({ email, password, role }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });
    if (!res.ok) throw await parseError(res, "Invalid email or password");
    const user = await res.json();
    this._saveSession(user);
    window.dispatchEvent(new Event("portal-state-change"));
    return user;
  },

  async signup(payload) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, "Signup failed. Please try again.");
    const user = await res.json();
    this._saveSession(user);
    window.dispatchEvent(new Event("portal-state-change"));
    return user;
  },

  async createIssue(payload) {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, "Failed to submit issue. Please try again.");
    return res.json();
  },

  async updateIssue(id, patch) {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw await parseError(res, "Failed to update issue. Please try again.");
    window.dispatchEvent(new Event("portal-state-change"));
    return res.json();
  },

  async addEntity(type, payload) {
    const res = await fetch(`${BASE_URL}/entities/${type}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, `Failed to add ${type}. Please try again.`);
    window.dispatchEvent(new Event("portal-state-change"));
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseError(res, "Failed to mark notification as read");
    window.dispatchEvent(new Event("portal-state-change"));
    return res.json();
  },

  async submitBugReport(data) {
    const res = await fetch(`${BASE_URL}/bug-reports`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseError(res, "Failed to submit bug report");
    return res.json();
  },

  async getMessages(issueId) {
    const res = await fetch(`${BASE_URL}/messages/${issueId}`, { headers: getHeaders() });
    if (!res.ok) throw await parseError(res, "Failed to fetch messages");
    return res.json();
  },

  async sendMessage(issueId, message) {
    const res = await fetch(`${BASE_URL}/messages/${issueId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw await parseError(res, "Failed to send message");
    return res.json();
  },

  async classifyIssue(title, description) {
    const res = await fetch(`${BASE_URL}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });
    if (!res.ok) throw await parseError(res, "Failed to upload image");
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`, { headers: getHeaders() });
    if (!res.ok) throw await parseError(res, "Failed to load analytics");
    return res.json();
  },
};
