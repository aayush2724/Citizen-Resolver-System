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
import { statusOrder, statusTone } from "./utils/status";

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

const fallbackImage =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80";

function getRelevantImage(title, description, department) {
  const text = `${title} ${description} ${department}`.toLowerCase();
  if (text.includes("light") || text.includes("electric") || text.includes("power")) {
    return "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80";
  }
  if (text.includes("pothole") || text.includes("road") || text.includes("street")) {
    return "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?auto=format&fit=crop&w=900&q=80";
  }
  if (text.includes("garbage") || text.includes("waste") || text.includes("sanitation") || text.includes("trash")) {
    return "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80";
  }
  if (text.includes("water") || text.includes("drain") || text.includes("pipe")) {
    return "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80";
  }
  return fallbackImage;
}

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

      setAuthError("");
      setToast(`${user.name} signed in.`);
      setNotification({
        type: "success",
        message: `Welcome${authMode === "signup" ? "" : " back"}, ${user.name}!`,
      });
      // Reset to a completely empty form — no pre-filled demo values
      setAuthForm({ name: "", email: "", password: "", city: "", block: "", area: "" });
      setActivePage("home");
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
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">✓</div>
          <h1 className="text-2xl font-black text-slate-950">Report Sent!</h1>
          <p className="mt-2 text-slate-600">
            Thank you for your feedback. Our developers have received your report and will look into it.
          </p>
          <button
            className="mt-6 rounded-lg bg-teal-700 px-6 py-2.5 font-bold text-white hover:bg-teal-800 transition"
            type="button"
            onClick={() => setSubmitted(false)}
          >
            Submit another report
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
        <p className="text-sm font-black uppercase text-teal-700">Developer feedback</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Report a Website Issue</h1>
        <p className="mt-2 text-slate-500">Found a bug or have a suggestion? Let us know and we'll fix it.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div className="mt-6 grid gap-4">
          <Select
            label="Category"
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
            <span className="text-sm font-black text-slate-700">Description</span>
            <textarea
              className="min-h-36 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue in detail. What did you expect vs what happened?"
              required
            />
          </label>
          <Field
            label="Contact email (optional)"
            type="email"
            value={form.email}
            onChange={(email) => setForm({ ...form, email })}
            placeholder="We'll reply here if we need more details"
          />
          <button className="rounded-lg bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 transition" type="submit">
            Send report to developers
          </button>
        </div>
      </form>

      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft h-fit">
        <h2 className="text-lg font-black text-slate-950">What can you report?</h2>
        <ul className="mt-4 grid gap-3">
          {[
            ["🐛", "Bug", "Something broken or not working as expected"],
            ["🎨", "UI Issue", "Invisible text, broken layout, or display problem"],
            ["⚡", "Performance", "Page is slow or takes too long to load"],
            ["💡", "Feature Request", "A suggestion to improve the system"],
            ["📝", "General", "Any other feedback for our team"],
          ].map(([emoji, title, desc]) => (
            <li key={title} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <span className="text-xl">{emoji}</span>
              <div>
                <p className="font-bold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-lg bg-teal-50 border border-teal-200 p-4">
          <p className="text-sm font-bold text-teal-800">🔒 Your report is confidential</p>
          <p className="mt-1 text-xs text-teal-700">Reports are only visible to developers and administrators.</p>
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
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-black uppercase text-teal-700">Access</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Login or create a citizen account
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Use a citizen account to report and track issues. Admin accounts are
          created by the system administrator.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            className="rounded-lg border border-slate-200 p-4 text-left font-bold hover:bg-slate-50 transition"
            type="button"
            onClick={() =>
              setAuthForm({
                ...authForm,
                email: "admin@helpline.local",
                password: "password",
              })
            }
          >
            Admin demo: admin@helpline.local
          </button>
          <button
            className="rounded-lg border border-slate-200 p-4 text-left font-bold hover:bg-slate-50 transition"
            type="button"
            onClick={() =>
              setAuthForm({
                ...authForm,
                email: "aarav@example.com",
                password: "password",
              })
            }
          >
            Citizen demo: aarav@example.com
          </button>
        </div>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft"
        onSubmit={onSubmit}
      >
        <div className="mb-5 flex gap-2">
          {["login", "signup"].map((mode) => (
            <button
              className={`rounded-lg px-4 py-2 font-black ${authMode === mode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
            >
              {mode === "login" ? "Login" : "Signup"}
            </button>
          ))}
        </div>

        {authError && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Authentication Error</p>
              <p className="mt-1">{authError}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4">
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
            <div className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Account Type</span>
              <div className="flex gap-2">
                {["citizen", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`flex-1 rounded-lg border py-2 text-sm font-bold capitalize transition ${
                      authForm.role === r
                        ? "border-teal-600 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
            className="rounded-lg bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 transition"
            type="submit"
          >
            {authMode === "login" ? "Sign in" : "Create account"}
          </button>
        </div>
      </form>
    </section>
  );
}

function ReportPage({ departmentNames, report, setReport, onSubmit }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft"
        onSubmit={onSubmit}
      >
        <p className="text-sm font-black uppercase text-teal-700">
          Citizen report
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Report Issue
        </h1>
        <div className="mt-6 grid gap-4">
          <Field
            label="Title"
            value={report.title}
            onChange={(title) => setReport({ ...report, title })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Priority"
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
            <span className="text-sm font-black text-slate-700">
              Description
            </span>
            <textarea
              className="min-h-32 rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              value={report.description}
              onChange={(event) =>
                setReport({ ...report, description: event.target.value })
              }
              required
            />
          </label>
          <Field
            label="Image URL"
            value={report.imageUrl}
            onChange={(imageUrl) => setReport({ ...report, imageUrl })}
            placeholder="Optional for demo"
            icon={<Upload size={16} />}
          />
          <button
            className="self-end rounded-lg bg-teal-700 px-5 py-3 font-black text-white"
            type="submit"
          >
            Submit issue
          </button>
        </div>
      </form>

      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-black uppercase text-teal-700">Preview</p>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <img
            className="h-56 w-full object-cover"
            src={report.imageUrl || fallbackImage}
            alt=""
          />
          <div className="p-4">
            <h2 className="text-xl font-black text-slate-950">
              {report.title || "Issue title appears here"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {report.description ||
                "Your issue description will help the department act faster."}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function MyIssuesPage({ issues, notifications, onOpen, onRead }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <IssueGrid title="My Issues" issues={issues} onOpen={onOpen} />
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black text-slate-950">Notifications</h2>
        <div className="mt-4 grid gap-3">
          {notifications.map((notification) => (
            <button
              className={`rounded-lg border p-4 text-left ${notification.read ? "border-slate-200 bg-white" : "border-teal-200 bg-teal-50"}`}
              key={notification.id}
              type="button"
              onClick={() => onRead(notification.id)}
            >
              <strong className="block text-sm text-slate-950">
                {notification.title}
              </strong>
              <span className="mt-1 block text-sm leading-6 text-slate-600">
                {notification.body}
              </span>
              <span className="mt-2 block text-xs font-bold text-slate-500">
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
    <section className="grid gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <h1 className="text-2xl font-black text-slate-950">Public Issues</h1>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Field
            label="Search"
            value={filters.q}
            onChange={(q) => setFilters({ ...filters, q })}
          />
          <Select
            label="Area"
            value={filters.area}
            options={["All", ...areaNames]}
            onChange={(area) => setFilters({ ...filters, area })}
          />
          <Select
            label="Status"
            value={filters.status}
            options={["All", ...statusOrder]}
            onChange={(status) => setFilters({ ...filters, status })}
          />
          <Select
            label="Department"
            value={filters.department}
            options={["All", ...departmentNames]}
            onChange={(department) => setFilters({ ...filters, department })}
          />
        </div>
      </div>
      <IssueGrid
        title={`${issues.length} matching issues`}
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
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-black text-slate-950 mb-4">System Overview</h2>
              <div className="grid gap-4 md:grid-cols-4">
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
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-black text-slate-950">Issue Queue</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                    <tr>
                      <th className="p-4">Issue</th>
                      <th className="p-4">Area</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Labour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr className="border-t border-slate-100" key={issue.id}>
                        <td className="p-4 font-bold text-slate-950">
                          {issue.id}
                          <span className="block font-medium text-slate-500">{issue.title}</span>
                        </td>
                        <td className="p-4 text-slate-700">{issue.area}</td>
                        <td className="p-4 text-slate-700">{issue.department}</td>
                        <td className="p-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(issue.status)}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">{issue.assignedLabour}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft h-fit" onSubmit={onAssignmentSubmit}>
              <h2 className="text-xl font-black text-slate-950">Update Assignment</h2>
              <div className="mt-4 grid gap-4">
                <Select label="Issue" value={assignment.issueId} options={issues.map((i) => i.id)} onChange={syncSelectedAssignment} />
                <Select label="Department" value={assignment.department} options={departmentNames} onChange={(department) => setAssignment({ ...assignment, department })} />
                <Select label="Labour" value={assignment.assignedLabour} options={["Unassigned", ...labour.map((l) => l.name)]} onChange={(assignedLabour) => setAssignment({ ...assignment, assignedLabour })} />
                <Select label="Status" value={assignment.status} options={statusOrder} onChange={(status) => setAssignment({ ...assignment, status })} />
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">Update note</span>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                    value={assignment.note}
                    onChange={(e) => setAssignment({ ...assignment, note: e.target.value })}
                  />
                </label>
                <button className="rounded-lg bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 transition" type="submit">
                  Save update
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Labour Tab */}
        {activeTab === "labour" && (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-black text-slate-950">Labour Teams</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {labour.map((member) => (
                    <tr className="border-t border-slate-100" key={member.id}>
                      <td className="p-4 font-bold text-slate-900">{member.name}</td>
                      <td className="p-4 text-slate-700">{member.department}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                          member.availability_status === "Available"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
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
          <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft max-w-xl" onSubmit={onEntitySubmit}>
            <h2 className="text-xl font-black text-slate-950">Manage Master Data</h2>
            <p className="mt-1 text-sm text-slate-500">Add new areas, departments, or labour to the system.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Select label="Type" value={entityForm.type} options={["areas", "departments", "labour"]} onChange={(type) => setEntityForm({ ...entityForm, type })} />
              <Field label="Name" value={entityForm.name} onChange={(name) => setEntityForm({ ...entityForm, name })} required />
              <Field
                label={entityForm.type === "areas" ? "Zone" : entityForm.type === "departments" ? "Lead" : "Department"}
                value={entityForm.extra}
                onChange={(extra) => setEntityForm({ ...entityForm, extra })}
              />
              <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800 transition" type="submit">
                <Plus size={18} /> Add record
              </button>
            </div>
          </form>
        )}

        {/* Schema Tab */}
        {activeTab === "schema" && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">Database Contract</h2>
            <p className="mt-1 text-sm text-slate-500">Live schema reference for all tables in the system.</p>
            <div className="mt-4 grid gap-2">
              {schemaPreview.map((item) => (
                <code className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-teal-100" key={item}>
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
    <section className="grid gap-6">
      <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-teal-50 to-blue-50 p-6 shadow-soft">
        <h1 className="text-3xl font-black text-slate-950">Your Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Track all your reported issues and updates in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Issues" value={analytics.total} tone="teal" />
        <StatCard label="Pending" value={analytics.pending} tone="amber" />
        <StatCard label="In Progress" value={analytics.active} tone="blue" />
        <StatCard label="Resolved" value={analytics.resolved} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <IssueGrid title="My Issues" issues={issues} onOpen={onOpen} />
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft h-fit">
          <h2 className="text-xl font-black text-slate-950">
            📬 Latest Updates
          </h2>
          <div className="mt-4 grid gap-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  className={`rounded-lg border p-4 text-left text-sm transition ${
                    notification.read
                      ? "border-slate-200 bg-white text-slate-600"
                      : "border-teal-200 bg-teal-50 text-slate-950 font-semibold hover:bg-teal-100"
                  }`}
                  key={notification.id}
                  type="button"
                  onClick={() => onRead(notification.id)}
                >
                  <strong className="block">{notification.title}</strong>
                  <span className="mt-1 block leading-5">
                    {notification.body}
                  </span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {notification.createdAt}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-4">
                No updates yet
              </p>
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
      <h1 className="mb-4 text-2xl font-black text-slate-950">{title}</h1>
      {issues.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard issue={issue} key={issue.id} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No issues found.
        </div>
      )}
    </section>
  );
}

function Field({ icon, label, onChange, type = "text", value, ...props }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <span className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          className={`w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 ${icon ? "pl-10" : ""}`}
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
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={Boolean(placeholder)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}