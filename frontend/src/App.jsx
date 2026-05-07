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
  ClipboardList,
  Bell,
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
            className="mt-8 rounded-xl bg-teal-600 px-8 py-3.5 font-bold text-white hover:bg-primary transition-all active:scale-[0.98]"
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Developer Feedback</p>
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
              className="min-h-40 w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all leading-relaxed"
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
          <button className="rounded-xl bg-teal-600 px-6 py-4 font-bold text-white hover:bg-primary transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20" type="submit">
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
        <div className="mt-8 rounded-xl bg-primary/5 border border-primary/10 p-5">
          <p className="text-xs font-bold text-primary flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span>
            Your report is confidential
          </p>
          <p className="mt-2 text-[11px] text-primary/70 leading-relaxed">Reports are only visible to our core development and admin teams.</p>
        </div>
      </aside>
    </section>
  );
}

function ProblemShowcase() {
  const problems = [
    { title: "Pothole Repair", img: "/images/Roads.jpg", dept: "Roads" },
    { title: "Street Lighting", img: "/images/StreetLights.jpg", dept: "Electrical" },
    { title: "Waste Management", img: "/images/Sanitation.jpg", dept: "Sanitation" },
    { title: "Water Leakage", img: "/images/WaterSupply.jpg", dept: "Water Board" },
    { title: "Park Maintenance", img: "/images/PublicParks.jpg", dept: "Gardening" },
  ];

  return (
    <div className="relative w-full py-24 overflow-hidden bg-white/50 border-y border-black/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Interactive Problem View</h2>
        <h3 className="text-4xl font-black text-text-dark tracking-tight">Common Civic Challenges</h3>
      </div>
      
      <div className="flex gap-4 px-4 overflow-x-auto pb-8 scrollbar-hide no-scrollbar snap-x snap-mandatory">
        {problems.map((p, i) => (
          <div 
            key={i}
            className="relative flex-none w-[350px] h-[500px] rounded-[3rem] overflow-hidden group snap-center transition-all duration-700 hover:w-[450px]"
            style={{ 
               transform: `skewX(${i % 2 === 0 ? '-3deg' : '3deg'})`,
               marginLeft: i === 0 ? '0' : '-40px'
            }}
          >
            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110" style={{ transform: `skewX(${i % 2 === 0 ? '3deg' : '-3deg'})` }}>
              <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            
            <div className="absolute bottom-10 left-10 right-10 z-10" style={{ transform: `skewX(${i % 2 === 0 ? '3deg' : '-3deg'})` }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-[10px] font-black text-white uppercase tracking-widest mb-4">
                {p.dept}
              </span>
              <h4 className="text-3xl font-black text-white leading-tight">
                {p.title}
              </h4>
              <button className="mt-6 flex items-center gap-3 text-white/60 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                Explore Issue <div className="h-0.5 w-8 bg-primary"></div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage({ analytics, setActivePage, currentUser }) {
  return (
    <div className="flex flex-col w-full bg-[#f4eee0] h-[calc(100vh-80px)] overflow-hidden relative">
      {/* Background Image - Bottom 1/3 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 bg-[url('/images/silhouette_hands.png')] bg-contain bg-no-repeat bg-bottom opacity-40 mix-blend-multiply pointer-events-none"
        style={{ backgroundSize: '100% auto' }}
      ></div>
      
      {/* Gradient overlay for smoother blending */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#f4eee0] to-transparent pointer-events-none z-0"></div>
      
      {/* Centered Hero Section */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-10 inline-flex items-center gap-3 rounded-full bg-white px-6 py-2.5 border border-black/5 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-primary pulse-glow"></span>
          <span className="text-[11px] font-[900] tracking-[0.4em] text-text-dark uppercase">
            Official Civic Platform
          </span>
        </div>
                <h1 className="flex flex-col items-center justify-center max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="text-6xl font-[900] tracking-tighter text-text-dark sm:text-7xl lg:text-[100px] leading-tight">
              Citizen
            </span>
            <span className="text-6xl font-[900] tracking-tighter text-primary sm:text-7xl lg:text-[100px] leading-tight">
              Resolver
            </span>
          </div>
          <span className="text-6xl font-[900] tracking-tighter text-text-dark sm:text-7xl lg:text-[100px] leading-tight -mt-4">
            System
          </span>
        </h1>
        
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-700 font-bold mx-auto px-4">
          Bridging the gap between citizens and administration with 
          unprecedented transparency and efficiency.
        </p>
        
        <div className="mt-12 flex flex-wrap justify-center gap-6 px-4">
          <button
            className="btn-premium px-12 py-5 text-sm"
            type="button"
            onClick={() => setActivePage(currentUser ? "report" : "auth")}
          >
            Report an Issue
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-12 py-5 text-[12px] font-black uppercase tracking-[0.2em] text-text-dark shadow-sm transition-all hover:bg-black/5 hover:scale-105 active:scale-95"
            type="button"
            onClick={() => setActivePage("public")}
          >
            Public Board
          </button>
        </div>

        {/* Floating Quick Stats */}
        <div className="mt-16 flex flex-wrap gap-4 w-full max-w-4xl justify-center px-4">
           {[
             { label: "Solved Cases", value: analytics.resolved || "2.4k", tone: "bg-white/70" },
             { label: "Total Reports", value: analytics.total || "2.8k", tone: "bg-primary text-white shadow-lg shadow-primary/20" },
             { label: "Active Tasks", value: analytics.active || "142", tone: "bg-white/70" }
           ].map((stat, idx) => (
             <div key={idx} className={`flex flex-col items-center px-10 py-6 rounded-[2.5rem] border border-white/80 backdrop-blur-md shadow-sm transition-transform hover:scale-105 ${stat.tone}`}>
                <span className="text-3xl font-black">{stat.value}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-70`}>{stat.label}</span>
             </div>
           ))}
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
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start max-w-6xl mx-auto">
      <div className="rounded-3xl border border-black/5 bg-white p-10 shadow-premium">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Access Portal</p>
        <h1 className="text-3xl font-black text-text-dark leading-tight">
          Join the community or sign in
        </h1>
        <p className="mt-4 leading-relaxed text-slate-500 font-medium">
          Use a citizen account to report and track issues. Admin accounts are managed by the department leads.
        </p>
        <div className="mt-8 grid gap-4">
          <button
            className="group rounded-2xl border border-black/5 bg-slate-50 p-6 text-left transition-all hover:bg-black/5 hover:border-black/10"
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
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 group-hover:text-primary transition-colors">Admin Demo</span>
            <span className="block font-bold text-text-dark text-lg">admin@helpline.local</span>
          </button>
          <button
            className="group rounded-2xl border border-black/5 bg-slate-50 p-6 text-left transition-all hover:bg-black/5 hover:border-black/10"
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
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 group-hover:text-primary transition-colors">Citizen Demo</span>
            <span className="block font-bold text-text-dark text-lg">aarav@example.com</span>
          </button>
        </div>
      </div>

      <form
        className="rounded-3xl border border-black/5 bg-white p-10 shadow-premium"
        onSubmit={onSubmit}
      >
        <div className="mb-8 flex gap-3 p-2 bg-slate-100 rounded-2xl w-fit border border-black/5">
          {["login", "signup"].map((mode) => (
            <button
              className={`rounded-xl px-8 py-3 text-sm font-black transition-all ${authMode === mode ? "bg-white text-text-dark shadow-sm" : "text-slate-400 hover:text-text-dark"}`}
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
            >
              {mode === "login" ? "Login" : "Signup"}
            </button>
          ))}
        </div>

        {authError && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-500">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p className="font-black">Authentication Error</p>
              <p className="mt-1 font-medium">{authError}</p>
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
          <div className="grid gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Account Type</span>
            <div className="flex gap-4">
              {["citizen", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`flex-1 rounded-2xl border-2 py-4 text-sm font-black capitalize transition-all ${
                    authForm.role === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-black/5 bg-slate-50 text-slate-400 hover:border-black/10 hover:text-text-dark"
                  }`}
                  onClick={() => setAuthForm({ ...authForm, role: r })}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            className="mt-6 btn-premium w-full"
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
        className="rounded-[3.5rem] border border-black/5 bg-white p-12 shadow-premium"
        onSubmit={onSubmit}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
          Citizen Reporting
        </p>
        <h1 className="text-4xl font-black text-text-dark tracking-tight">
          New Case Record
        </h1>
        <div className="mt-10 grid gap-8">
          <Field
            label="Issue Title"
            value={report.title}
            onChange={(title) => setReport({ ...report, title })}
            placeholder="e.g. Major pothole on Sector 4 main road"
            required
          />
          <div className="grid gap-8 sm:grid-cols-2">
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
          <label className="grid gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Description of Problem
            </span>
            <textarea
              className="min-h-40 w-full rounded-[2.5rem] border border-black/5 bg-slate-50 text-text-dark px-6 py-5 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all leading-relaxed font-medium"
              value={report.description}
              onChange={(event) =>
                setReport({ ...report, description: event.target.value })
              }
              placeholder="Please provide specific landmarks and severity details..."
              required
            />
          </label>
          <Field
            label="Visual Evidence URL"
            value={report.imageUrl}
            onChange={(imageUrl) => setReport({ ...report, imageUrl })}
            placeholder="Link to photo or video..."
            icon={<Upload size={16} />}
          />
          <button
            className="btn-premium w-full"
            type="submit"
          >
            Submit Official Report
          </button>
        </div>
      </form>

      <aside className="rounded-[3.5rem] border border-black/5 bg-secondary/50 p-10 shadow-premium sticky top-24">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Case Preview</p>
        <div className="overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-xl">
          <img
            className="h-72 w-full object-cover"
            src={report.imageUrl || fallbackImage}
            alt=""
          />
          <div className="p-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase text-primary border border-primary/20">
                {report.priority || "Normal"}
              </span>
              {report.department && (
                <span className="rounded-full bg-black/5 px-4 py-1.5 text-[10px] font-black uppercase text-text-dark border border-black/5">
                  {report.department}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-text-dark leading-tight">
              {report.title || "Report title will appear here"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500 font-medium">
              {report.description ||
                "Enter details to see how your report will look to the administration."}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function MyIssuesPage({ issues, notifications, onOpen, onRead }) {
  return (
    <section className="grid gap-12 lg:grid-cols-[1fr_400px] items-start">
      <IssueGrid title="Official Case Records" issues={issues} onOpen={onOpen} />
      <aside className="rounded-[3rem] border border-black/5 bg-white p-10 shadow-premium h-fit sticky top-24">
        <div className="flex items-center gap-4 mb-8">
           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
             <Bell size={20} />
           </div>
           <h2 className="text-2xl font-black text-text-dark tracking-tight">Updates</h2>
        </div>
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <button
              className={`rounded-2xl border p-6 text-left transition-all duration-500 ${notification.read ? "border-black/5 bg-slate-50 opacity-60" : "border-primary/20 bg-primary/5 shadow-sm"}`}
              key={notification.id}
              type="button"
              onClick={() => onRead(notification.id)}
            >
              <strong className={`block text-base mb-2 font-black ${notification.read ? "text-slate-500" : "text-text-dark"}`}>
                {notification.title}
              </strong>
              <p className="text-sm leading-relaxed text-slate-500 font-medium">
                {notification.body}
              </p>
              <span className="mt-6 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
    <section className="grid gap-12">
      <div className="rounded-[3.5rem] border border-black/5 bg-white p-12 shadow-premium">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Filter size={24} />
          </div>
          <h1 className="text-3xl font-[900] text-text-dark tracking-tight">Board Filters</h1>
        </div>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          <Field
            label="Search Query"
            value={filters.q}
            onChange={(q) => setFilters({ ...filters, q })}
            placeholder="Keywords..."
          />
          <Select
            label="By Area"
            value={filters.area}
            options={["All Areas", ...areaNames]}
            onChange={(area) => setFilters({ ...filters, area })}
          />
          <Select
            label="By Status"
            value={filters.status}
            options={["All Statuses", ...statusOrder]}
            onChange={(status) => setFilters({ ...filters, status })}
          />
          <Select
            label="By Department"
            value={filters.department}
            options={["All Units", ...departmentNames]}
            onChange={(department) => setFilters({ ...filters, department })}
          />
        </div>
      </div>
      <IssueGrid
        title={`${issues.length} Results Found`}
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
      <aside className="rounded-2xl border border-black/5 bg-white p-6 shadow-premium h-fit sticky top-24">
        <h1 className="text-xl font-black text-text-dark tracking-tight mb-8 px-2">Admin Dashboard</h1>
        <nav className="grid gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 rounded-xl p-3.5 text-left font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-text-dark"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Panel */}
      <div className="grid gap-8 content-start">
        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid gap-8">
            <div className="rounded-[3rem] border border-black/5 bg-white p-10 shadow-premium">
              <h2 className="text-2xl font-black text-text-dark mb-8 tracking-tight">System Performance</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Pending" value={analytics.pending} tone="amber" detail="Awaiting initial review" />
                <StatCard label="Active" value={analytics.active} tone="blue" detail="Work in progress" />
                <StatCard label="Resolved" value={analytics.resolved} tone="emerald" detail="Completed successfully" />
                <StatCard label="Urgent" value={analytics.urgent} tone="rose" detail="Immediate attention required" />
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="grid gap-8 xl:grid-cols-[1fr_400px] items-start">
            <section className="overflow-hidden rounded-[3rem] border border-black/5 bg-white shadow-premium">
              <div className="border-b border-black/5 p-8 bg-slate-50/50">
                <h2 className="text-2xl font-black text-text-dark tracking-tight">Live Issue Queue</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="px-8 py-5 border-b border-black/5">Identifier</th>
                      <th className="px-8 py-5 border-b border-black/5">Urgency</th>
                      <th className="px-8 py-5 border-b border-black/5">Raised On</th>
                      <th className="px-8 py-5 border-b border-black/5">Location Info</th>
                      <th className="px-8 py-5 border-b border-black/5 text-center">Current Status</th>
                      <th className="px-8 py-5 border-b border-black/5">Workforce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {issues.map((issue) => (
                      <tr className="group transition-all hover:bg-slate-50/80" key={issue.id}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-black text-text-dark group-hover:text-primary transition-colors">{issue.id}</span>
                            <span className="text-xs font-bold text-slate-400 truncate max-w-[200px]">{issue.title}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border transition-all ${priorityTone(issue.priority)}`}>
                             {issue.priority}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                             {new Date(issue.created_at).toLocaleDateString()}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-600">{issue.area}</span>
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{issue.department}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-flex items-center justify-center rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all ${statusTone(issue.status)}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${issue.assignedLabour !== "Unassigned" ? "bg-primary shadow-[0_0_8px_rgba(20,184,166,0.3)]" : "bg-slate-300"}`} />
                              <span className={`font-black text-[11px] uppercase tracking-wider ${issue.assignedLabour !== "Unassigned" ? "text-slate-600" : "text-slate-400 italic"}`}>
                                {issue.assignedLabour}
                              </span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <form className="rounded-[3rem] border border-black/5 bg-white p-8 shadow-premium h-fit sticky top-24" onSubmit={onAssignmentSubmit}>
              <h2 className="text-2xl font-black text-text-dark mb-8 tracking-tight">Assignment Control</h2>
              <div className="grid gap-6">
                <Select label="Selected Issue" value={assignment.issueId} options={issues.map((i) => i.id)} onChange={syncSelectedAssignment} />
                <Select label="Department Unit" value={assignment.department} options={departmentNames} onChange={(department) => setAssignment({ ...assignment, department })} />
                <Select 
                  label="Assigned Labour" 
                  value={assignment.assignedLabour} 
                  options={[
                    "Unassigned", 
                    ...Array.from(new Set(labour
                      .filter(l => !assignment.department || l.department === assignment.department)
                      .map(l => JSON.stringify({ value: l.name, label: `${l.name} (${l.phone || 'N/A'})` }))))
                      .map(s => JSON.parse(s))
                  ]} 
                  onChange={(assignedLabour) => setAssignment({ ...assignment, assignedLabour })} 
                />
                <Select label="Workflow Status" value={assignment.status} options={statusOrder} onChange={(status) => setAssignment({ ...assignment, status })} />
                <label className="grid gap-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Official Update Note</span>
                  <textarea
                    className="min-h-32 w-full rounded-2xl border border-black/5 bg-slate-50 text-text-dark px-6 py-4 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-medium text-sm leading-relaxed"
                    value={assignment.note}
                    placeholder="Enter progress details for the citizen..."
                    onChange={(e) => setAssignment({ ...assignment, note: e.target.value })}
                  />
                </label>
                <button className="btn-premium w-full mt-4" type="submit">
                  Dispatch Update
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Labour Tab */}
        {activeTab === "labour" && (
          <section className="overflow-hidden rounded-[3rem] border border-black/5 bg-white shadow-premium max-w-5xl">
            <div className="border-b border-black/5 p-8 bg-slate-50/50">
              <h2 className="text-2xl font-black text-text-dark tracking-tight">Personnel Directory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-8 py-5 border-b border-black/5">Full Name</th>
                    <th className="px-8 py-5 border-b border-black/5">Department</th>
                    <th className="px-8 py-5 border-b border-black/5 text-center">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labour.map((member) => (
                    <tr className="group transition-all hover:bg-slate-50/80" key={member.id}>
                      <td className="px-8 py-6 font-black text-text-dark">{member.name}</td>
                      <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.department}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center justify-center rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all ${
                          member.availability_status === "Available"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
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
          <form className="rounded-[3rem] border border-black/5 bg-white p-10 shadow-premium max-w-3xl" onSubmit={onEntitySubmit}>
            <h2 className="text-2xl font-black text-text-dark tracking-tight">System Configuration</h2>
            <p className="mt-2 text-sm font-black text-slate-400 uppercase tracking-widest">Append new logistical entities to the master database.</p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Select label="Entity Category" value={entityForm.type} options={["areas", "departments", "labour"]} onChange={(type) => setEntityForm({ ...entityForm, type })} />
              <Field label="Formal Name" value={entityForm.name} onChange={(name) => setEntityForm({ ...entityForm, name })} required />
              <Field
                label={entityForm.type === "areas" ? "Zone Identifier" : entityForm.type === "departments" ? "Lead Coordinator" : "Department Link"}
                value={entityForm.extra}
                onChange={(extra) => setEntityForm({ ...entityForm, extra })}
              />
              <button className="btn-premium w-full mt-auto" type="submit">
                <Plus size={18} /> Register Record
              </button>
            </div>
          </form>
        )}

        {/* Schema Tab */}
        {activeTab === "schema" && (
          <section className="rounded-[3rem] border border-black/5 bg-white p-10 shadow-premium max-w-4xl">
            <h2 className="text-2xl font-black text-text-dark tracking-tight">Core Infrastructure</h2>
            <p className="mt-2 text-sm font-black text-slate-400 uppercase tracking-widest">Technical specification for the integrated data layer.</p>
            <div className="mt-10 grid gap-4">
              {schemaPreview.map((item) => (
                <code className="rounded-2xl bg-slate-50 px-6 py-4 text-xs font-black text-primary border border-black/5 group hover:border-primary/30 transition-colors" key={item}>
                  <span className="text-slate-400 mr-4">DB::</span> {item}
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
    <section className="grid gap-12">
      <div className="relative overflow-hidden rounded-[3.5rem] border border-black/5 bg-gradient-to-br from-primary/10 via-teal-50 to-white p-12 shadow-premium">
        <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="relative z-10">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Central Portal</p>
           <h1 className="text-5xl font-[900] text-text-dark tracking-tighter">GREETINGS, CITIZEN</h1>
           <p className="mt-6 text-lg font-bold text-slate-500 max-w-xl leading-relaxed">
             This is your personal mission control for a cleaner, safer community. 
             Track your reports, receive official updates, and see the impact of your voice.
           </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reports" value={analytics.total} tone="primary" detail="All time submissions" />
        <StatCard label="Pending Review" value={analytics.pending} tone="amber" detail="Awaiting processing" />
        <StatCard label="In Resolution" value={analytics.active} tone="blue" detail="Teams dispatched" />
        <StatCard label="Resolved Cases" value={analytics.resolved} tone="emerald" detail="Completed issues" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px] items-start">
        <IssueGrid title="Your Active Records" issues={issues} onOpen={onOpen} />
        <aside className="rounded-[3rem] border border-black/5 bg-white p-8 shadow-premium h-fit sticky top-24">
          <h2 className="text-2xl font-black text-text-dark mb-8 flex items-center gap-4 tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
               <Bell size={20} />
            </div>
            Direct Updates
          </h2>
          <div className="grid gap-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  className={`group rounded-2xl border p-6 text-left transition-all duration-500 ${
                    notification.read
                      ? "border-black/5 bg-slate-50 opacity-60"
                      : "border-primary/20 bg-primary/5 shadow-sm"
                  }`}
                  key={notification.id}
                  type="button"
                  onClick={() => onRead(notification.id)}
                >
                  <strong className={`block text-base mb-2 font-black ${notification.read ? "text-slate-500" : "text-text-dark"}`}>
                    {notification.title}
                  </strong>
                  <p className="text-sm leading-relaxed text-slate-500 font-medium">
                    {notification.body}
                  </p>
                  <span className="mt-6 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
        <h1 className="text-2xl font-black text-text-dark">{title}</h1>
        {issues.length > 0 && (
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-black text-slate-400 border border-black/5">
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
        <div className="rounded-[3rem] border-2 border-dashed border-black/5 bg-white p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-lg font-black text-text-dark mb-2">No Issues Found</h3>
          <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any issues matching your current filters or account.</p>
        </div>
      )}
    </section>
  );
}

function Field({ icon, label, onChange, type = "text", value, ...props }) {
  return (
    <label className="grid gap-3">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <span className="relative group">
        {icon ? (
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        ) : null}
        <input
          className={`w-full rounded-full border border-black/5 bg-slate-50 text-text-dark px-6 py-4 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-medium ${icon ? "pl-14" : ""}`}
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
    <label className="grid gap-3">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <select
        className="w-full rounded-full border border-black/5 bg-slate-50 text-text-dark px-6 py-4 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all appearance-none font-medium"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={Boolean(placeholder)}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1.5rem center',
          backgroundSize: '1rem',
        }}
      >
        {placeholder ? <option value="" className="bg-white">{placeholder}</option> : null}
        {options.map((option) => {
          const val = typeof option === 'object' ? option.value : option;
          const labelText = typeof option === 'object' ? option.label : option;
          return (
            <option key={val} value={val} className="bg-white">
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}