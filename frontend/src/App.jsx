import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Database,
  Filter,
  Plus,
  ShieldCheck,
  Upload,
  UsersRound,
  Wrench,
  AlertCircle,
} from "lucide-react";
import IssueCard from "./components/IssueCard";
import IssueModal from "./components/IssueModal";
import Shell from "./components/Shell";
import StatCard from "./components/StatCard";
import LocationSelector from "./components/LocationSelector";
import NotificationBox from "./components/NotificationBox";
import { api } from "./services/api";
import { schemaPreview } from "./data/mockData";
import { fallbackImage, getRelevantImage } from "./utils/image";
import { priorityTone, statusOrder, statusTone } from "./utils/status";

const emptyReport = {
  title: "",
  description: "",
  city: "",
  block: "",
  area: "",
  department: "",
  priority: "Normal",
  imageUrl: "",
};

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [state, setState] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({
    area: "All",
    status: "All",
    department: "All",
    q: "",
  });
  const [report, setReport] = useState(emptyReport);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    block: "",
    area: "",
    role: "citizen",
  });
  const [authError, setAuthError] = useState("");
  const [assignment, setAssignment] = useState({
    issueId: "",
    department: "",
    assignedLabour: "",
    status: "Assigned",
    note: "",
  });
  const [entityForm, setEntityForm] = useState({
    type: "areas",
    name: "",
    extra: "",
  });
  const [toast, setToast] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError(false);
        const data = await api.getState();
        setState(data);
      } catch (err) {
        console.error("Portal load error:", err);
        setLoadError(true);
      }
    };
    load();
    window.addEventListener("portal-state-change", load);
    return () => window.removeEventListener("portal-state-change", load);
  }, []);

  useEffect(() => {
    if (!state || !state.issues.length) return;
    const first = state.issues[0];
    setAssignment({
      issueId: first.id,
      department: first.department,
      assignedLabour: first.assignedLabour,
      status: first.status,
      note: first.note,
    });
  }, [state?.issues.length]);

  const analytics = useMemo(() => {
    const issues = state?.issues ?? [];
    return {
      total: issues.length,
      pending: issues.filter((issue) => issue.status === "Pending").length,
      active: issues.filter((issue) =>
        ["Assigned", "In Progress"].includes(issue.status),
      ).length,
      resolved: issues.filter((issue) => issue.status === "Resolved").length,
      urgent: issues.filter((issue) => issue.priority === "Urgent").length,
    };
  }, [state]);

  const publicIssues = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    return (state?.issues ?? []).filter((issue) => {
      const matchesArea = filters.area === "All" || issue.area === filters.area;
      const matchesStatus =
        filters.status === "All" || issue.status === filters.status;
      const matchesDepartment =
        filters.department === "All" || issue.department === filters.department;
      const matchesQuery =
        !query ||
        [
          issue.title,
          issue.description,
          issue.area,
          issue.department,
          issue.citizenName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesArea && matchesStatus && matchesDepartment && matchesQuery;
    });
  }, [filters, state]);

  const myIssues = useMemo(
    () =>
      (state?.issues ?? []).filter(
        (issue) => issue.citizenId === state?.currentUser?.id,
      ),
    [state],
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loadError) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-900 font-sans text-white">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <AlertCircle size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black">Backend Connection Failed</h1>
          <p className="mt-3 text-slate-400">
            We couldn't connect to the backend server at <code className="text-slate-200">localhost:5000</code>. 
            Please ensure your backend is running and the database is configured.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 rounded-xl bg-[#00b87c] px-6 py-3 font-bold text-white transition hover:bg-[#009665]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0a0a0a] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00b87c] border-t-transparent" />
          <p className="font-bold text-slate-400">Loading portal data...</p>
        </div>
      </div>
    );
  }

  const areaNames = state.areas.map((area) => area.name);
  const departmentNames = state.departments.map(
    (department) => department.name,
  );
  const unreadCount = state.notifications.filter(
    (notification) => !notification.read,
  ).length;

  async function handleAuth(event) {
    event.preventDefault();
    setAuthError("");

    // Client-side validation — only run the checks relevant to each mode
    if (authMode === "signup") {
      if (!authForm.name.trim()) {
        const msg = "Full name is required";
        setAuthError(msg);
        setNotification({ type: "error", message: msg });
        return;
      }
      if (!authForm.city || !authForm.block || !authForm.area) {
        const msg = "Please select city, block, and area";
        setAuthError(msg);
        setNotification({ type: "error", message: msg });
        return;
      }
    }

    if (!authForm.email.trim() && !authForm.phone.trim()) {
      const msg = authMode === "login" ? "Email or Phone is required" : "Email or Phone is required";
      setAuthError(msg);
      setNotification({ type: "error", message: msg });
      return;
    }

    if (!authForm.password) {
      const msg = "Password is required";
      setAuthError(msg);
      setNotification({ type: "error", message: msg });
      return;
    }

    try {
      const user =
        authMode === "login"
          ? await api.login(authForm)
          : await api.signup(authForm);

      console.log("Auth successful, user role:", user.role);
      setAuthError("");
      setToast(`${user.name} signed in.`);
      setNotification({
        type: "success",
        message: `Welcome${authMode === "signup" ? "" : " back"}, ${user.name}!`,
      });
      // Reset to a completely empty form — no pre-filled demo values
      setAuthForm({ name: "", email: "", password: "", city: "", block: "", area: "", role: "citizen" });
      setActivePage(user.role === "admin" ? "dashboard" : "home");
    } catch (error) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      setAuthError(errorMessage);
      setNotification({ type: "error", message: errorMessage });
    }
  }

  async function handleReport(event) {
    event.preventDefault();
    if (!state?.currentUser) {
      setNotification({
        type: "error",
        message: "Session expired. Please sign in again.",
      });
      setActivePage("auth");
      return;
    }

    if (!report.city || !report.block || !report.area) {
      setNotification({
        type: "error",
        message: "Please select city, block, and area for the issue location.",
      });
      return;
    }

    try {
      const created = await api.createIssue({
        ...report,
        imageUrl: report.imageUrl || getRelevantImage(report.title, report.description, report.department),
        citizenId: state.currentUser.id,
        citizenName: state.currentUser.name,
        slaHours:
          report.priority === "Urgent"
            ? 24
            : report.priority === "High"
              ? 36
              : 72,
      });
      setReport(emptyReport);
      setToast(`${created.id} submitted for admin review.`);
      setActivePage("my");
    } catch (error) {
      setNotification({
        type: "error",
        message: error?.message || "Failed to submit issue. Please try again.",
      });
    }
  }

  async function handleAssignment(event) {
    event.preventDefault();
    try {
      const updated = await api.updateIssue(assignment.issueId, {
        department: assignment.department,
        assignedLabour: assignment.assignedLabour || "Unassigned",
        status: assignment.status,
        note: assignment.note || "Status updated by admin.",
      });
      setToast(`${assignment.issueId} updated successfully.`);
    } catch (error) {
      setNotification({
        type: "error",
        message: error?.message || "Failed to update issue. Please try again.",
      });
    }
  }

  async function handleEntity(event) {
    event.preventDefault();
    const payload =
      entityForm.type === "areas"
        ? { name: entityForm.name, zone: entityForm.extra || "New Zone" }
        : entityForm.type === "departments"
          ? { name: entityForm.name, lead: entityForm.extra || "Unassigned" }
          : {
              name: entityForm.name,
              department: entityForm.extra || "General",
              status: "Available",
            };
    try {
      await api.addEntity(entityForm.type, payload);
      setToast(`${entityForm.name} added successfully.`);
      setEntityForm({ ...entityForm, name: "", extra: "" });
    } catch (error) {
      setNotification({
        type: "error",
        message: error?.message || "Failed to add record. Please try again.",
      });
    }
  }

  function syncSelectedAssignment(issueId) {
    const issue = state.issues.find((item) => item.id === issueId);
    if (!issue) return;
    setAssignment({
      issueId: issue.id,
      department: issue.department,
      assignedLabour: issue.assignedLabour,
      status: issue.status,
      note: issue.note,
    });
  }

  function handleLogout() {
    localStorage.removeItem("citizen-user");
    window.location.reload();
  }

  const navigate = (id) => {
    if (!state?.currentUser) {
      if (id === "report" || id === "my" || id === "dashboard") {
        setActivePage("auth");
        return;
      }
    } else {
      if (id === "dashboard" && state.currentUser.role !== "admin") {
        setActivePage("home");
        return;
      }
      if ((id === "report" || id === "my") && state.currentUser.role !== "citizen") {
        setActivePage("home");
        return;
      }
    }
    setActivePage(id);
  };

  return (
    <Shell
      activePage={activePage}
      setActivePage={navigate}
      currentUser={state.currentUser}
      unreadCount={unreadCount}
      onLogout={handleLogout}
    >
      {toast ? (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      ) : null}

      {notification && (
        <NotificationBox
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {activePage === "home" ? (
        <HomePage
          analytics={analytics}
          setActivePage={setActivePage}
          currentUser={state.currentUser}
        />
      ) : null}

      {activePage === "auth" ? (
        <AuthPage
          authForm={authForm}
          authMode={authMode}
          authError={authError}
          setAuthForm={setAuthForm}
          setAuthMode={setAuthMode}
          onSubmit={handleAuth}
        />
      ) : null}

      {activePage === "report" ? (
        state.currentUser ? (
          <ReportPage
            departmentNames={departmentNames}
            report={report}
            setReport={setReport}
            onSubmit={handleReport}
          />
        ) : (
          <AuthPage
            authError={authError}
            authForm={authForm}
            authMode={authMode}
            setAuthForm={setAuthForm}
            setAuthMode={setAuthMode}
            onSubmit={handleAuth}
          />
        )
      ) : null}

      {activePage === "my" ? (
        state.currentUser ? (
          <MyIssuesPage
            issues={myIssues}
            notifications={state.notifications}
            onOpen={setSelectedIssue}
            onRead={(id) => api.markNotificationRead(id)}
          />
        ) : (
          <AuthPage
            authError={authError}
            authForm={authForm}
            authMode={authMode}
            setAuthForm={setAuthForm}
            setAuthMode={setAuthMode}
            onSubmit={handleAuth}
          />
        )
      ) : null}

      {activePage === "public" ? (
        <PublicIssuesPage
          areaNames={areaNames}
          departmentNames={departmentNames}
          filters={filters}
          issues={publicIssues}
          setFilters={setFilters}
          onOpen={setSelectedIssue}
        />
      ) : null}

      {activePage === "dashboard" ? (
        state.currentUser?.role === "admin" ? (
          <AdminDashboard
            analytics={analytics}
            assignment={assignment}
            departmentNames={departmentNames}
            entityForm={entityForm}
            issues={state.issues}
            labour={state.labour}
            schemaPreview={schemaPreview}
            setAssignment={setAssignment}
            setEntityForm={setEntityForm}
            syncSelectedAssignment={syncSelectedAssignment}
            onAssignmentSubmit={handleAssignment}
            onEntitySubmit={handleEntity}
          />
        ) : (
          <CitizenDashboard
            analytics={analytics}
            issues={myIssues}
            notifications={state.notifications}
            onOpen={setSelectedIssue}
            onRead={(id) => api.markNotificationRead(id)}
          />
        )
      ) : null}

      {activePage === "feedback" ? (
        <BugReportPage currentUser={state.currentUser} />
      ) : null}

      <IssueModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </Shell>
  );
}

function BugReportPage({ currentUser }) {
  const [form, setForm] = React.useState({
    category: "bug",
    subject: "",
    description: "",
    email: currentUser?.email || "",
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.submitBugReport(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
    }
  }

  if (submitted) {
    return (
      <section className="grid gap-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center shadow-premium">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-4xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">✓</div>
          <h1 className="text-3xl font-black text-white">Report Sent Successfully</h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Thank you for helping us improve. Our engineering team has received your report and will investigate it shortly.
          </p>
          <button
            className="mt-8 rounded-xl bg-teal-600 px-8 py-3.5 font-bold text-white hover:bg-teal-500 transition-all active:scale-[0.98]"
            type="button"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Report
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
      <form className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8 shadow-premium" onSubmit={handleSubmit}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-3">Developer Feedback</p>
        <h1 className="text-3xl font-black text-white">Report a System Issue</h1>
        <p className="mt-3 text-slate-400">Found a bug or have a suggestion? Help us improve the Citizen Resolver System.</p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
        )}

        <div className="mt-8 grid gap-6">
          <Select
            label="Issue Category"
            value={form.category}
            options={["bug", "ui", "performance", "feature", "general"]}
            onChange={(category) => setForm({ ...form, category })}
          />
          <Field
            label="Subject"
            value={form.subject}
            onChange={(subject) => setForm({ ...form, subject })}
            placeholder="Brief summary of the issue"
            required
          />
          <label className="grid gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Detailed Description</span>
            <textarea
              className="min-h-40 w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all leading-relaxed"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened? What did you expect to happen? Steps to reproduce?"
              required
            />
          </label>
          <Field
            label="Contact Email (Optional)"
            type="email"
            value={form.email}
            onChange={(email) => setForm({ ...form, email })}
            placeholder="We'll notify you here once it's fixed"
          />
          <button className="rounded-xl bg-teal-600 px-6 py-4 font-bold text-white hover:bg-teal-500 transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20" type="submit">
            Send Feedback to Developers
          </button>
        </div>
      </form>

      <aside className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6 shadow-premium h-fit sticky top-24">
        <h2 className="text-lg font-bold text-white mb-6">What can you report?</h2>
        <ul className="grid gap-4">
          {[
            ["🐛", "Bug", "Functional issues or errors"],
            ["🎨", "UI Issue", "Visual bugs or layout problems"],
            ["⚡", "Performance", "Slow loading or laggy interactions"],
            ["💡", "Feature Request", "Ideas for new functionality"],
            ["📝", "General", "Any other feedback or questions"],
          ].map(([emoji, title, desc]) => (
            <li key={title} className="flex items-start gap-4 rounded-xl bg-white/[0.02] p-4 transition-colors hover:bg-white/5">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-bold text-white text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-xl bg-teal-500/5 border border-teal-500/10 p-5">
          <p className="text-xs font-bold text-teal-400 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span>
            Your report is confidential
          </p>
          <p className="mt-2 text-[11px] text-teal-500/70 leading-relaxed">Reports are only visible to our core development and admin teams.</p>
        </div>
      </aside>
    </section>
  );
}

function HomePage({ analytics, setActivePage, currentUser }) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#0a0a0a] overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          className="h-full w-full object-cover opacity-30"
          src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80"
          alt="City street background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Left Content */}
        <div className="flex flex-col justify-center">
          <div className="mb-8 inline-flex items-center gap-2 w-fit rounded-full bg-white/5 border border-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#00b87c]"></span>
            <span className="text-xs font-bold tracking-wider text-[#00b87c]">
              WELCOME TO CIVIC SERVICES
            </span>
          </div>
          
          <h1 className="flex flex-col w-full">
            <span className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-[72px] leading-[0.9]">
              Citizen
            </span>
            <div className="flex items-center gap-6 w-full">
              <span className="text-6xl font-black tracking-tight text-[#00b87c] sm:text-7xl lg:text-[88px] leading-[0.85]">
                Resolver
              </span>
              <span className="hidden sm:block h-[3px] flex-1 rounded-full bg-gradient-to-r from-[#00b87c]/50 to-transparent"></span>
            </div>
            <div className="flex items-end gap-6 w-full mt-1">
              <span className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-[72px] leading-[0.9]">
                System
              </span>
              
            </div>
          </h1>
          
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
            Report local issues with ease. Get transparent updates on every
            step from submission to final resolution. No phone calls, no
            guesswork—just progress.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              className="flex items-center gap-2 rounded-xl bg-[#00b87c] px-6 py-3.5 font-bold text-white transition hover:bg-[#009665]"
              type="button"
              onClick={() => setActivePage(currentUser ? "report" : "auth")}
            >
              Report an Issue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
            <button
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              type="button"
              onClick={() => setActivePage("public")}
            >
              View Public Issues
            </button>
          </div>
        </div>

        {/* Right Content - Bento Grid */}
        <div className="flex flex-col justify-center gap-4">
          {/* Big Card */}
          <div className="rounded-3xl border border-white/10 bg-[#141414]/80 p-8 backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-400">Total Reported Issues</h3>
                <div className="mt-2 text-5xl font-black text-white sm:text-6xl">
                  {analytics.total.toLocaleString() || "2,481"}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm font-bold text-[#00b87c]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  +12% from last month
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#00b87c]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="21" x2="12" y2="17"></line><line x1="8" y1="21" x2="8" y2="14"></line><line x1="16" y1="21" x2="16" y2="10"></line></svg>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Small Card 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#141414]/80 p-6 backdrop-blur-md">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ACTIVE WORK</h3>
                <div className="mt-2 text-4xl font-black text-white">{analytics.active || "142"}</div>
              </div>
              <div className="mt-8">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-[#00b87c]" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>

            {/* Small Card 2 */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#141414]/80 p-6 backdrop-blur-md">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">RESOLVED THIS WEEK</h3>
                <div className="mt-2 text-4xl font-black text-white">{analytics.resolved || "89"}</div>
              </div>
              <div className="mt-8">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-[#00b87c]" style={{ width: "80%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPage({
  authForm,
  authMode,
  authError,
  setAuthForm,
  setAuthMode,
  onSubmit,
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8 shadow-premium">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500 mb-3">Access Portal</p>
        <h1 className="text-3xl font-black text-white leading-tight">
          Join the community or sign in
        </h1>
        <p className="mt-4 leading-relaxed text-slate-400">
          Use a citizen account to report and track issues. Admin accounts are managed by the department leads.
        </p>
        <div className="mt-8 grid gap-4">
          <button
            className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left transition-all hover:bg-white/5 hover:border-white/10"
            type="button"
            onClick={() =>
              setAuthForm({
                ...authForm,
                email: "admin@helpline.local",
                password: "password",
                role: "admin",
              })
            }
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 group-hover:text-teal-400 transition-colors">Admin Demo</span>
            <span className="block font-bold text-white">admin@helpline.local</span>
          </button>
          <button
            className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left transition-all hover:bg-white/5 hover:border-white/10"
            type="button"
            onClick={() =>
              setAuthForm({
                ...authForm,
                email: "aarav@example.com",
                password: "password",
                role: "citizen",
              })
            }
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 group-hover:text-teal-400 transition-colors">Citizen Demo</span>
            <span className="block font-bold text-white">aarav@example.com</span>
          </button>
        </div>
      </div>

      <form
        className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8 shadow-premium"
        onSubmit={onSubmit}
      >
        <div className="mb-8 flex gap-3 p-1.5 bg-black rounded-xl w-fit border border-white/5">
          {["login", "signup"].map((mode) => (
            <button
              className={`rounded-lg px-6 py-2 text-xs font-bold transition-all ${authMode === mode ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
            >
              {mode === "login" ? "Login" : "Signup"}
            </button>
          ))}
        </div>

        {authError && (
          <div className="mb-6 flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <p className="font-bold">Authentication Error</p>
              <p className="mt-1 opacity-80">{authError}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {authMode === "signup" ? (
            <Field
              label="Full name"
              value={authForm.name}
              onChange={(name) => setAuthForm({ ...authForm, name })}
              required
            />
          ) : null}
          <Field
            label={authMode === "login" ? "Email or Phone" : "Email"}
            type="text"
            value={authForm.email}
            onChange={(email) => setAuthForm({ ...authForm, email })}
            required
          />
          {authMode === "signup" ? (
            <Field
              label="Phone number"
              type="tel"
              value={authForm.phone}
              onChange={(phone) => setAuthForm({ ...authForm, phone })}
              placeholder="e.g. 9876543210"
              required={!authForm.email}
            />
          ) : null}
          <Field
            label="Password"
            type="password"
            value={authForm.password}
            onChange={(password) => setAuthForm({ ...authForm, password })}
            required
          />
          {authMode === "signup" ? (
            <LocationSelector
              selectedCity={authForm.city}
              selectedBlock={authForm.block}
              selectedArea={authForm.area}
              onCityChange={(city) => setAuthForm({ ...authForm, city, block: "", area: "" })}
              onBlockChange={(block) => setAuthForm({ ...authForm, block, area: "" })}
              onAreaChange={(area) => setAuthForm({ ...authForm, area })}
            />
          ) : null}
          {authMode === "signup" ? (
            <div className="grid gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Type</span>
              <div className="flex gap-3">
                {["citizen", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`flex-1 rounded-xl border py-3 text-sm font-bold capitalize transition-all ${
                      authForm.role === r
                        ? "border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                        : "border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:text-white"
                    }`}
                    onClick={() => setAuthForm({ ...authForm, role: r })}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <button
            className="mt-4 rounded-xl bg-teal-600 px-6 py-4 font-bold text-white hover:bg-teal-500 transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20"
            type="submit"
          >
            {authMode === "login" ? "Sign in to Dashboard" : "Create Citizen Account"}
          </button>
        </div>
      </form>
    </section>
  );
}

function ReportPage({ departmentNames, report, setReport, onSubmit }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
      <form
        className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8 shadow-premium"
        onSubmit={onSubmit}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500 mb-3">
          Citizen Reporting
        </p>
        <h1 className="text-3xl font-black text-white">
          Report New Issue
        </h1>
        <div className="mt-8 grid gap-6">
          <Field
            label="Short Title"
            value={report.title}
            onChange={(title) => setReport({ ...report, title })}
            placeholder="e.g. Pothole on Main St"
            required
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Select
              label="Priority Level"
              value={report.priority}
              options={["Normal", "High", "Urgent"]}
              onChange={(priority) => setReport({ ...report, priority })}
            />
            <Select
              label="Department"
              value={report.department}
              options={departmentNames}
              placeholder="Select department"
              onChange={(department) => setReport({ ...report, department })}
            />
          </div>
          <LocationSelector
            selectedCity={report.city}
            selectedBlock={report.block}
            selectedArea={report.area}
            onCityChange={(city) =>
              setReport({ ...report, city, block: "", area: "" })
            }
            onBlockChange={(block) => setReport({ ...report, block, area: "" })}
            onAreaChange={(area) => setReport({ ...report, area })}
          />
          <label className="grid gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Detailed Description
            </span>
            <textarea
              className="min-h-36 w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all leading-relaxed"
              value={report.description}
              onChange={(event) =>
                setReport({ ...report, description: event.target.value })
              }
              placeholder="Provide as much detail as possible to help our teams resolve this faster."
              required
            />
          </label>
          <Field
            label="Reference Image URL"
            value={report.imageUrl}
            onChange={(imageUrl) => setReport({ ...report, imageUrl })}
            placeholder="https://images.unsplash.com/..."
            icon={<Upload size={16} />}
          />
          <button
            className="rounded-xl bg-teal-600 px-8 py-4 font-bold text-white hover:bg-teal-500 transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20"
            type="submit"
          >
            Submit Report
          </button>
        </div>
      </form>

      <aside className="rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-premium sticky top-24">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Live Preview</p>
        <div className="overflow-hidden rounded-xl border border-white/5 bg-black/40">
          <img
            className="h-60 w-full object-cover opacity-80"
            src={report.imageUrl || fallbackImage}
            alt=""
          />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${priorityTone(report.priority)}`}>
                {report.priority}
              </span>
              {report.department && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-400 border border-white/5">
                  {report.department}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {report.title || "Issue title will appear here"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {report.description ||
                "A detailed description helps the assigned department understand the severity and location of the issue."}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function MyIssuesPage({ issues, notifications, onOpen, onRead }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
      <IssueGrid title="My Reported Issues" issues={issues} onOpen={onOpen} />
      <aside className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6 shadow-premium h-fit">
        <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <button
              className={`rounded-xl border p-5 text-left transition-all duration-300 ${notification.read ? "border-white/5 bg-white/[0.02] opacity-60" : "border-teal-500/20 bg-teal-500/5 shadow-lg shadow-teal-500/5"}`}
              key={notification.id}
              type="button"
              onClick={() => onRead(notification.id)}
            >
              <strong className={`block text-sm mb-1 ${notification.read ? "text-slate-400" : "text-white"}`}>
                {notification.title}
              </strong>
              <span className="block text-sm leading-relaxed text-slate-500">
                {notification.body}
              </span>
              <span className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {notification.createdAt}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}

function PublicIssuesPage({
  areaNames,
  departmentNames,
  filters,
  issues,
  setFilters,
  onOpen,
}) {
  return (
    <section className="grid gap-8">
      <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8 shadow-premium">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
            <Filter size={20} />
          </div>
          <h1 className="text-2xl font-black text-white">Public Resolution Board</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <Field
            label="Search Query"
            value={filters.q}
            onChange={(q) => setFilters({ ...filters, q })}
            placeholder="Title, area, or ID..."
          />
          <Select
            label="Filter by Area"
            value={filters.area}
            options={["All", ...areaNames]}
            onChange={(area) => setFilters({ ...filters, area })}
          />
          <Select
            label="Filter by Status"
            value={filters.status}
            options={["All", ...statusOrder]}
            onChange={(status) => setFilters({ ...filters, status })}
          />
          <Select
            label="Filter by Dept"
            value={filters.department}
            options={["All", ...departmentNames]}
            onChange={(department) => setFilters({ ...filters, department })}
          />
        </div>
      </div>
      <IssueGrid
        title={`${issues.length} Matching Reports`}
        issues={issues}
        onOpen={onOpen}
      />
    </section>
  );
}


function AdminDashboard({
  analytics,
  assignment,
  departmentNames,
  entityForm,
  issues,
  labour,
  schemaPreview,
  setAssignment,
  setEntityForm,
  syncSelectedAssignment,
  onAssignmentSubmit,
  onEntitySubmit,
}) {
  const [activeTab, setActiveTab] = React.useState("analytics");

  const tabs = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "assignments", label: "Assignments", icon: Wrench },
    { id: "labour", label: "Labour", icon: UsersRound },
    { id: "manage", label: "Manage Data", icon: Database },
    { id: "schema", label: "Database", icon: ShieldCheck },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-soft h-fit">
        <h1 className="text-2xl font-black">Admin Dashboard</h1>
        <nav className="mt-6 grid gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 rounded-lg p-3 text-left font-bold transition ${
                activeTab === id
                  ? "bg-[#00b87c] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="grid gap-6 content-start">
        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-premium">
              <h2 className="text-xl font-bold text-white mb-6">System Overview</h2>
              <div className="grid gap-6 md:grid-cols-4">
                <StatCard label="Pending" value={analytics.pending} tone="amber" />
                <StatCard label="Active" value={analytics.active} tone="blue" />
                <StatCard label="Resolved" value={analytics.resolved} tone="emerald" />
                <StatCard label="Urgent" value={analytics.urgent} tone="rose" />
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-premium">
              <div className="border-b border-white/5 p-6 bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white">Issue Queue</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm border-collapse">
                  <thead className="bg-white/[0.02] text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-6 py-4 border-b border-white/5">Issue ID</th>
                      <th className="px-6 py-4 border-b border-white/5">Location</th>
                      <th className="px-6 py-4 border-b border-white/5">Department</th>
                      <th className="px-6 py-4 border-b border-white/5 text-center">Status</th>
                      <th className="px-6 py-4 border-b border-white/5">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {issues.map((issue) => (
                      <tr className="group transition-colors hover:bg-white/[0.02]" key={issue.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{issue.id}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[180px]">{issue.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium">{issue.area}</td>
                        <td className="px-6 py-4 text-slate-400 font-medium">{issue.department}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-all ${statusTone(issue.status)}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium">
                          {issue.assignedLabour || <span className="text-slate-600 italic">Unassigned</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <form className="rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-premium h-fit" onSubmit={onAssignmentSubmit}>
              <h2 className="text-xl font-bold text-white mb-6">Update Assignment</h2>
              <div className="mt-4 grid gap-5">
                <Select label="Issue" value={assignment.issueId} options={issues.map((i) => i.id)} onChange={syncSelectedAssignment} />
                <Select label="Department" value={assignment.department} options={departmentNames} onChange={(department) => setAssignment({ ...assignment, department })} />
                <Select label="Labour" value={assignment.assignedLabour} options={["Unassigned", ...labour.filter(l => !assignment.department || l.department === assignment.department).map((l) => l.name)]} onChange={(assignedLabour) => setAssignment({ ...assignment, assignedLabour })} />
                <Select label="Status" value={assignment.status} options={statusOrder} onChange={(status) => setAssignment({ ...assignment, status })} />
                <label className="grid gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Update note</span>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                    value={assignment.note}
                    onChange={(e) => setAssignment({ ...assignment, note: e.target.value })}
                  />
                </label>
                <button className="rounded-xl bg-teal-600 px-5 py-3.5 font-bold text-white hover:bg-teal-500 transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20" type="submit">
                  Save update
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Labour Tab */}
        {activeTab === "labour" && (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-premium">
            <div className="border-b border-white/5 p-6 bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white">Labour Teams</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4 border-b border-white/5">Name</th>
                    <th className="px-6 py-4 border-b border-white/5">Department</th>
                    <th className="px-6 py-4 border-b border-white/5">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {labour.map((member) => (
                    <tr className="group transition-colors hover:bg-white/[0.02]" key={member.id}>
                      <td className="px-6 py-4 font-bold text-white">{member.name}</td>
                      <td className="px-6 py-4 text-slate-400 font-medium">{member.department}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-all ${
                          member.availability_status === "Available"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {member.availability_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Manage Data Tab */}
        {activeTab === "manage" && (
          <form className="rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-premium max-w-2xl" onSubmit={onEntitySubmit}>
            <h2 className="text-xl font-bold text-white">Manage Master Data</h2>
            <p className="mt-2 text-sm text-slate-500">Add new areas, departments, or labour to the system.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Select label="Type" value={entityForm.type} options={["areas", "departments", "labour"]} onChange={(type) => setEntityForm({ ...entityForm, type })} />
              <Field label="Name" value={entityForm.name} onChange={(name) => setEntityForm({ ...entityForm, name })} required />
              <Field
                label={entityForm.type === "areas" ? "Zone" : entityForm.type === "departments" ? "Lead" : "Department"}
                value={entityForm.extra}
                onChange={(extra) => setEntityForm({ ...entityForm, extra })}
              />
              <button className="flex items-center justify-center gap-2 rounded-xl bg-white text-black px-5 py-3.5 font-bold hover:bg-slate-200 transition-all active:scale-[0.98]" type="submit">
                <Plus size={18} /> Add record
              </button>
            </div>
          </form>
        )}

        {/* Schema Tab */}
        {activeTab === "schema" && (
          <section className="rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-premium">
            <h2 className="text-xl font-bold text-white">Database Contract</h2>
            <p className="mt-2 text-sm text-slate-500">Live schema reference for all tables in the system.</p>
            <div className="mt-6 grid gap-3">
              {schemaPreview.map((item) => (
                <code className="rounded-xl bg-black px-4 py-3 text-xs font-medium text-teal-400 border border-white/5" key={item}>
                  {item}
                </code>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function CitizenDashboard({
  analytics,
  issues,
  notifications,
  onOpen,
  onRead,
}) {
  return (
    <section className="grid gap-8">
      <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-teal-500/10 to-blue-500/10 p-8 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <LayoutDashboard size={120} />
        </div>
        <h1 className="text-3xl font-black text-white">Your Dashboard</h1>
        <p className="mt-2 text-slate-400 max-w-lg">
          Track all your reported issues and updates in one place. Real-time status updates from city administrators.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Total Issues" value={analytics.total} tone="teal" />
        <StatCard label="Pending" value={analytics.pending} tone="amber" />
        <StatCard label="In Progress" value={analytics.active} tone="blue" />
        <StatCard label="Resolved" value={analytics.resolved} tone="emerald" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <IssueGrid title="My Issues" issues={issues} onOpen={onOpen} />
        <aside className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6 shadow-premium h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell size={20} className="text-teal-500" /> Latest Updates
          </h2>
          <div className="grid gap-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  className={`group rounded-xl border p-4 text-left text-sm transition-all duration-300 ${
                    notification.read
                      ? "border-white/5 bg-white/[0.02] text-slate-500"
                      : "border-teal-500/20 bg-teal-500/5 text-white font-semibold hover:bg-teal-500/10"
                  }`}
                  key={notification.id}
                  type="button"
                  onClick={() => onRead(notification.id)}
                >
                  <strong className={`block mb-1 group-hover:text-teal-400 transition-colors ${notification.read ? "" : "text-white"}`}>
                    {notification.title}
                  </strong>
                  <span className="block leading-relaxed opacity-80 font-normal">
                    {notification.body}
                  </span>
                  <span className="mt-3 block text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                    {notification.createdAt}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
                  <Bell size={20} />
                </div>
                <p className="text-sm text-slate-500 font-medium">No updates yet</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function IssueGrid({ title, issues, onOpen }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">{title}</h1>
        {issues.length > 0 && (
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-500 border border-white/5">
            {issues.length} Items
          </span>
        )}
      </div>
      {issues.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard issue={issue} key={issue.id} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-6">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Issues Found</h3>
          <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any issues matching your current filters or account.</p>
        </div>
      )}
    </section>
  );
}

function Field({ icon, label, onChange, type = "text", value, ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="relative group">
        {icon ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors">
            {icon}
          </span>
        ) : null}
        <input
          className={`w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all ${icon ? "pl-11" : ""}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...props}
        />
      </span>
    </label>
  );
}

function Select({ label, onChange, options, placeholder, value }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <select
        className="w-full rounded-xl border border-white/10 bg-[#151515] text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={Boolean(placeholder)}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1.25rem',
        }}
      >
        {placeholder ? <option value="" className="bg-[#151515]">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#151515]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}