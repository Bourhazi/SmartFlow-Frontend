import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";
import { getDashboard } from "../features/dashboard/dashboard-api";
import type {
  Dashboard,
  RecentRequest,
  RequestPriority,
  RequestStatus,
} from "../features/dashboard/dashboard.types";

const statusLabels: Record<RequestStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  underReview: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const priorityLabels: Record<RequestPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<Dashboard | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getDashboard();

        setDashboard(data);
      } catch {
        setError(
          "Unable to load dashboard data. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="page-state">
        Loading dashboard...
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="page-state">
        <p>{error ?? "Dashboard data is unavailable."}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <strong className="logo">SmartFlow</strong>
          <p>
            Welcome, {user?.fullName}
          </p>
        </div>

        <div className="topbar-actions">
          <span className="role-badge">
            {user?.roles.join(", ")}
          </span>

          <button onClick={handleLogout} type="button">
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="page-title">
          <div>
            <h1>Dashboard</h1>
            <p>
              Overview of the requests available to you.
            </p>
          </div>
        </div>

        <section className="summary-grid">
          <SummaryCard
            label="Total requests"
            value={dashboard.totalRequests}
            color="blue"
          />

          <SummaryCard
            label="Draft"
            value={dashboard.draftRequests}
            color="gray"
          />

          <SummaryCard
            label="Submitted"
            value={dashboard.submittedRequests}
            color="yellow"
          />

          <SummaryCard
            label="Under review"
            value={dashboard.underReviewRequests}
            color="purple"
          />

          <SummaryCard
            label="Approved"
            value={dashboard.approvedRequests}
            color="green"
          />

          <SummaryCard
            label="Rejected"
            value={dashboard.rejectedRequests}
            color="red"
          />

          <SummaryCard
            label="Urgent"
            value={dashboard.urgentRequests}
            color="orange"
          />

          <SummaryCard
            label="Due within 7 days"
            value={dashboard.dueWithinSevenDays}
            color="orange"
          />

          {dashboard.activeUsers !== null && (
            <SummaryCard
              label="Active users"
              value={dashboard.activeUsers}
              color="blue"
            />
          )}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <h2>Requests by status</h2>

            <div className="status-list">
              {dashboard.requestsByStatus.map((item) => (
                <div className="status-row" key={item.status}>
                  <span>{statusLabels[item.status]}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-panel">
            <h2>Recent requests</h2>

            {dashboard.recentRequests.length === 0 ? (
              <p className="empty-state">
                No requests are available yet.
              </p>
            ) : (
              <div className="recent-requests">
                {dashboard.recentRequests.map((request) => (
                  <RecentRequestRow
                    key={request.id}
                    request={request}
                  />
                ))}
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  color: "blue" | "gray" | "yellow" | "purple" | "green" | "red" | "orange";
};

function SummaryCard({
  label,
  value,
  color,
}: SummaryCardProps) {
  return (
    <article className={`summary-card summary-${color}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function RecentRequestRow({
  request,
}: {
  request: RecentRequest;
}) {
  return (
    <div className="recent-request-row">
      <div>
        <strong>{request.title}</strong>
        <span>
          Created {formatDate(request.createdAtUtc)}
        </span>
      </div>

      <div className="request-tags">
        <span className={`status-tag status-${request.status}`}>
          {statusLabels[request.status]}
        </span>

        <span
          className={`priority-tag priority-${request.priority}`}
        >
          {priorityLabels[request.priority]}
        </span>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}