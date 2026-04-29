const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('citizen-user') || '{}');
  const headers = { 'Content-Type': 'application/json' };
  if (user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
};

export const api = {
  async getState() {
    const currentUser = JSON.parse(localStorage.getItem('citizen-user') || 'null');
    
    if (!currentUser || !currentUser.token) {
      return { issues: [], areas: [], departments: [], labour: [], notifications: [], users: [], currentUser: null };
    }

    const res = await fetch(`${BASE_URL}/state`, { headers: getHeaders() });
    
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('citizen-user');
      return { issues: [], areas: [], departments: [], labour: [], notifications: [], users: [], currentUser: null };
    }
    
    if (!res.ok) throw new Error('Failed to fetch state');
    const data = await res.json();
    console.log('Fetched State:', data);
    
    return { ...data, currentUser };
  },

  async login({ email }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const user = await res.json();
    localStorage.setItem('citizen-user', JSON.stringify(user));
    window.dispatchEvent(new Event('portal-state-change'));
    return user;
  },

  async signup(payload) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Signup failed');
    const user = await res.json();
    localStorage.setItem('citizen-user', JSON.stringify(user));
    window.dispatchEvent(new Event('portal-state-change'));
    return user;
  },

  async createIssue(payload) {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create issue');
    return res.json();
  },

  async updateIssue(id, patch) {
    const res = await fetch(`${BASE_URL}/issues/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error('Failed to update issue');
    return res.json();
  },

  async addEntity(type, payload) {
    const res = await fetch(`${BASE_URL}/entities/${type}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add entity');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  }
};
