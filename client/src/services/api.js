const BASE_URL = "/api";

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem("citizen-user") || "{}");
  const headers = { "Content-Type": "application/json" };
  if (user.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }
  return headers;
};

// Helper: parse error message from response body, fall back to status text
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
    const currentUser = JSON.parse(
      localStorage.getItem("citizen-user") || "null",
    );

    if (!currentUser || !currentUser.token) {
      return {
        issues: [],
        areas: [],
        departments: [],
        labour: [],
        notifications: [],
        users: [],
        currentUser: null,
      };
    }

    const res = await fetch(`${BASE_URL}/state`, { headers: getHeaders() });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("citizen-user");
      return {
        issues: [],
        areas: [],
        departments: [],
        labour: [],
        notifications: [],
        users: [],
        currentUser: null,
      };
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
    if (existingIndex >= 0) {
      sessions[existingIndex] = user;
    } else {
      sessions.push(user);
    }
    localStorage.setItem("citizen-sessions", JSON.stringify(sessions));
  },

  logoutAll() {
    localStorage.removeItem("citizen-user");
    localStorage.removeItem("citizen-sessions");
    window.dispatchEvent(new Event("portal-state-change"));
  },

  async login({ email, password, role }) {
    // FIX: was only sending { email }, password was never sent to the backend
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password, role }),
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

    if (!res.ok)
      throw await parseError(res, "Signup failed. Please try again.");

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

    if (!res.ok)
      throw await parseError(res, "Failed to submit issue. Please try again.");
    return res.json();
  },

  async updateIssue(id, patch) {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(patch),
    });

    if (!res.ok)
      throw await parseError(res, "Failed to update issue. Please try again.");
    // Dispatch so the issue list refreshes after admin updates
    window.dispatchEvent(new Event("portal-state-change"));
    return res.json();
  },

  async addEntity(type, payload) {
    const res = await fetch(`${BASE_URL}/entities/${type}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok)
      throw await parseError(res, `Failed to add ${type}. Please try again.`);
    window.dispatchEvent(new Event("portal-state-change"));
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: getHeaders(),
    });

    if (!res.ok)
      throw await parseError(res, "Failed to mark notification as read");
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
};
