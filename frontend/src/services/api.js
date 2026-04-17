import {
  areas,
  departments,
  issues,
  labour,
  notifications,
  roles,
  users,
} from "../data/mockData";

const storageKey = "citizen-helpline-portal";

const delay = (payload) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(payload)), 180);
  });

const baseState = {
  users,
  issues,
  areas,
  departments,
  labour,
  notifications,
  currentUser: users[0],
};

function readState() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(baseState));
    return structuredClone(baseState);
  }

  try {
    const parsedSaved = JSON.parse(saved);
    // Only merge baseState for non-user fields; users must be from saved state
    return {
      users: parsedSaved.users || [],
      issues: parsedSaved.issues || baseState.issues,
      areas: parsedSaved.areas || baseState.areas,
      departments: parsedSaved.departments || baseState.departments,
      labour: parsedSaved.labour || baseState.labour,
      notifications: parsedSaved.notifications || baseState.notifications,
      currentUser: parsedSaved.currentUser || null,
    };
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(baseState));
    return structuredClone(baseState);
  }
}

function writeState(nextState) {
  localStorage.setItem(storageKey, JSON.stringify(nextState));
  window.dispatchEvent(new Event("portal-state-change"));
}

export const api = {
  async getState() {
    return delay(readState());
  },

  async login({ email, role }) {
    const state = readState();
    const user = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      throw new Error(
        "No account found with this email. Please sign up first.",
      );
    }

    state.currentUser = user;
    writeState(state);
    return delay(user);
  },

  async signup({ name, email, city, block, area }) {
    const state = readState();
    const nextUser = {
      id: Date.now(),
      name,
      email,
      role: roles.citizen,
      city,
      block,
      area,
    };

    state.users = [nextUser, ...state.users];
    state.currentUser = nextUser;
    writeState(state);
    return delay(nextUser);
  },

  async createIssue(payload) {
    const state = readState();
    const nextIssue = {
      ...payload,
      id: `CHP-${1001 + state.issues.length}`,
      status: "Pending",
      assignedLabour: "Unassigned",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      note: "Issue received. Waiting for admin review.",
    };

    state.issues = [nextIssue, ...state.issues];
    state.notifications = [
      {
        id: Date.now(),
        title: `${nextIssue.id} submitted`,
        body: "Your report has entered the admin review queue.",
        read: false,
        createdAt: new Date().toLocaleString(),
      },
      ...state.notifications,
    ];
    writeState(state);
    return delay(nextIssue);
  },

  async updateIssue(id, patch) {
    const state = readState();
    state.issues = state.issues.map((issue) =>
      issue.id === id
        ? {
            ...issue,
            ...patch,
            updatedAt: new Date().toISOString().slice(0, 10),
          }
        : issue,
    );
    state.notifications = [
      {
        id: Date.now(),
        title: `${id} updated`,
        body: patch.note || `Status changed to ${patch.status}.`,
        read: false,
        createdAt: new Date().toLocaleString(),
      },
      ...state.notifications,
    ];
    writeState(state);
    return delay(state.issues.find((issue) => issue.id === id));
  },

  async addEntity(type, payload) {
    const state = readState();
    const next = { id: Date.now(), ...payload };
    state[type] = [next, ...state[type]];
    writeState(state);
    return delay(next);
  },

  async markNotificationRead(id) {
    const state = readState();
    state.notifications = state.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    writeState(state);
    return delay(state.notifications);
  },
};
