import { useEffect, useMemo, useState } from "react";
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

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [state, setState] = useState(null);
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
    email: "aarav@example.com",
    city: "Mysore",
    block: "Vijayanagar",
    area: "Stage 1",
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
    const load = () => api.getState().then(setState);
    load();
    window.addEventListener("portal-state-change", load);
    return () => window.removeEventListener("portal-state-change", load);
  }, []);

  useEffect(() => {
    if (!state?.issues.length) return;
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

  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 font-black text-slate-700">
        Loading portal...
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

    // Validation
    if (authMode === "signup" && !authForm.name.trim()) {
      setAuthError("Full name is required for signup");
      setNotification({
        type: "error",
        message: "Please enter your full name",
      });
      return;
    }

    if (!authForm.email.trim()) {
      setAuthError("Email is required");
      setNotification({ type: "error", message: "Please enter a valid email" });
      return;
    }

    if (!authForm.city || !authForm.block || !authForm.area) {
      setAuthError("Please select city, block, and area");
      setNotification({
        type: "error",
        message: "Location details are required",
      });
      return;
    }

    try {
      const user =
        authMode === "login"
          ? await api.login(authForm)
          : await api.signup(authForm);

      setAuthError("");
      setToast(`${user.name} is now active.`);
      setNotification({
        type: "success",
        message: `Welcome ${user.name}! Signed in successfully.`,
      });
      setAuthForm({
        name: "",
        email: "aarav@example.com",
        city: "Mysore",
        block: "Vijayanagar",
        area: "Stage 1",
        role: "citizen",
      });
    } catch (error) {
      const errorMessage =
        error?.message || "Invalid credentials. Please try again.";
      setAuthError(errorMessage);
      setNotification({ type: "error", message: errorMessage });
    }
  }

  async function handleReport(event) {
    event.preventDefault();

    if (!report.city || !report.block || !report.area) {
      setNotification({
        type: "error",
        message: "Please select city, block, and area for the issue location.",
      });
      return;
    }

    const created = await api.createIssue({
      ...report,
      imageUrl: report.imageUrl || fallbackImage,
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
  }

  async function handleAssignment(event) {
    event.preventDefault();
    const updated = await api.updateIssue(assignment.issueId, {
      department: assignment.department,
      assignedLabour: assignment.assignedLabour || "Unassigned",
      status: assignment.status,
      note: assignment.note || "Status updated by admin.",
    });
    setToast(`${updated.id} updated.`);
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
    await api.addEntity(entityForm.type, payload);
    setToast(`${entityForm.name} added.`);
    setEntityForm({ ...entityForm, name: "", extra: "" });
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

  return (
    <Shell
      activePage={activePage}
      setActivePage={setActivePage}
      currentUser={state.currentUser}
      unreadCount={unreadCount}
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
        <ReportPage
          departmentNames={departmentNames}
          report={report}
          setReport={setReport}
          onSubmit={handleReport}
        />
      ) : null}

      {activePage === "my" ? (
        <MyIssuesPage
          issues={myIssues}
          notifications={state.notifications}
          onOpen={setSelectedIssue}
          onRead={(id) => api.markNotificationRead(id)}
        />
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

      <IssueModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </Shell>
  );
}

function HomePage({ analytics, setActivePage, currentUser }) {
  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-lg">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80"
          alt=""
        />
        <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:p-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-teal-100">
              Welcome to civic services
            </p>
            <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg">
              Citizen Resolver System
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-50">
              Report local issues with ease. Get transparent updates on every
              step. Citizens submit issues, admins assign teams, everyone sees
              live progress—no phone calls, no guesswork.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                className="rounded-lg bg-white px-6 py-3 font-black text-teal-700 shadow-md hover:shadow-lg transition"
                type="button"
                onClick={() => setActivePage("report")}
              >
                Report an Issue
              </button>
              <button
                className="rounded-lg border-2 border-white px-6 py-3 font-black text-white hover:bg-white/10 transition"
                type="button"
                onClick={() => setActivePage("public")}
              >
                View Public Issues
              </button>
            </div>
          </div>

          <div className="grid content-end gap-3">
            <StatCard
              label="Total Issues"
              value={analytics.total}
              detail="Across all areas"
              tone="teal"
            />
            <StatCard
              label="Active Work"
              value={analytics.active}
              detail="Assigned or in progress"
              tone="blue"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["1", "Submit", "Add title, description, image, location and area."],
          ["2", "Review", "Admin triages the issue and checks department fit."],
          ["3", "Assign", "Department and labour owner are recorded."],
          ["4", "Resolve", "Progress and feedback stay visible to you."],
        ].map(([step, title, body]) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            key={step}
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 font-black text-white">
              {step}
            </span>
            <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Pending Review"
          value={analytics.pending}
          tone="amber"
        />
        <StatCard label="Urgent Issues" value={analytics.urgent} tone="rose" />
        <StatCard label="Resolved" value={analytics.resolved} tone="emerald" />
        <StatCard label="Departments" value="5" tone="blue" />
      </section>
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
          Use a citizen account to report and track issues, or switch to admin
          to assign work and update progress.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            className="rounded-lg border border-slate-200 p-4 text-left font-bold hover:bg-slate-50 transition"
            type="button"
            onClick={() =>
              setAuthForm({
                ...authForm,
                email: "admin@helpline.local",
                role: "admin",
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
                role: "citizen",
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
              <p className="font-bold">Invalid Credentials</p>
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
            label="Email"
            type="email"
            value={authForm.email}
            onChange={(email) => setAuthForm({ ...authForm, email })}
            required
          />
          <LocationSelector
            selectedCity={authForm.city}
            selectedBlock={authForm.block}
            selectedArea={authForm.area}
            onCityChange={(city) => setAuthForm({ ...authForm, city })}
            onBlockChange={(block) => setAuthForm({ ...authForm, block })}
            onAreaChange={(area) => setAuthForm({ ...authForm, area })}
          />
          <Select
            label="Role"
            value={authForm.role}
            options={["citizen", "admin"]}
            onChange={(role) => setAuthForm({ ...authForm, role })}
          />
          <button
            className="rounded-lg bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 transition"
            type="submit"
          >
            Continue
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
              className="min-h-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
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
  return (
    <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-soft">
        <h1 className="text-2xl font-black">Admin Dashboard</h1>
        <div className="mt-6 grid gap-3">
          {[
            [BarChart3, "Analytics"],
            [Wrench, "Assignments"],
            [UsersRound, "Labour"],
            [Database, "Schema-ready UI"],
            [ShieldCheck, "Role controls"],
          ].map(([Icon, label]) => (
            <div
              className="flex items-center gap-3 rounded-lg bg-white/10 p-3 font-bold"
              key={label}
            >
              <Icon size={18} />
              {label}
            </div>
          ))}
        </div>
      </aside>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Pending" value={analytics.pending} tone="amber" />
          <StatCard label="Active" value={analytics.active} tone="blue" />
          <StatCard
            label="Resolved"
            value={analytics.resolved}
            tone="emerald"
          />
          <StatCard label="Urgent" value={analytics.urgent} tone="rose" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-black text-slate-950">Issue Queue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Issue</th>
                    <th className="p-4">Area</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Labour</th>
                    <th className="p-4">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr className="border-t border-slate-100" key={issue.id}>
                      <td className="p-4 font-bold text-slate-950">
                        {issue.id}
                        <span className="block font-medium text-slate-500">
                          {issue.title}
                        </span>
                      </td>
                      <td className="p-4">{issue.area}</td>
                      <td className="p-4">{issue.department}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(issue.status)}`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="p-4">{issue.assignedLabour}</td>
                      <td className="p-4">{issue.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <form
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            onSubmit={onAssignmentSubmit}
          >
            <h2 className="text-xl font-black text-slate-950">
              Update Assignment
            </h2>
            <div className="mt-4 grid gap-4">
              <Select
                label="Issue"
                value={assignment.issueId}
                options={issues.map((issue) => issue.id)}
                onChange={syncSelectedAssignment}
              />
              <Select
                label="Department"
                value={assignment.department}
                options={departmentNames}
                onChange={(department) =>
                  setAssignment({ ...assignment, department })
                }
              />
              <Select
                label="Labour"
                value={assignment.assignedLabour}
                options={["Unassigned", ...labour.map((item) => item.name)]}
                onChange={(assignedLabour) =>
                  setAssignment({ ...assignment, assignedLabour })
                }
              />
              <Select
                label="Status"
                value={assignment.status}
                options={statusOrder}
                onChange={(status) => setAssignment({ ...assignment, status })}
              />
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">
                  Update note
                </span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  value={assignment.note}
                  onChange={(event) =>
                    setAssignment({ ...assignment, note: event.target.value })
                  }
                />
              </label>
              <button
                className="rounded-lg bg-teal-700 px-5 py-3 font-black text-white"
                type="submit"
              >
                Save update
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            onSubmit={onEntitySubmit}
          >
            <h2 className="text-xl font-black text-slate-950">
              Manage Master Data
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select
                label="Type"
                value={entityForm.type}
                options={["areas", "departments", "labour"]}
                onChange={(type) => setEntityForm({ ...entityForm, type })}
              />
              <Field
                label="Name"
                value={entityForm.name}
                onChange={(name) => setEntityForm({ ...entityForm, name })}
                required
              />
              <Field
                label={
                  entityForm.type === "areas"
                    ? "Zone"
                    : entityForm.type === "departments"
                      ? "Lead"
                      : "Department"
                }
                value={entityForm.extra}
                onChange={(extra) => setEntityForm({ ...entityForm, extra })}
              />
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-black text-white"
                type="submit"
              >
                <Plus size={18} /> Add record
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">
              Database Contract
            </h2>
            <div className="mt-4 grid gap-2">
              {schemaPreview.map((item) => (
                <code
                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-teal-100"
                  key={item}
                >
                  {item}
                </code>
              ))}
            </div>
          </section>
        </div>
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
          className={`w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 ${icon ? "pl-10" : ""}`}
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
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
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
