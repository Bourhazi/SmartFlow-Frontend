import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRequests } from "../features/requests/request-api";
import type {
  PagedResult,
  RequestListItem,
  RequestPriority,
  RequestStatus,
} from "../features/requests/request.types";

const statuses: RequestStatus[] = [
  "draft",
  "submitted",
  "underReview",
  "approved",
  "rejected",
];

const priorities: RequestPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export function RequestsPage() {
  const [data, setData] =
    useState<PagedResult<RequestListItem> | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [priority, setPriority] =
    useState<RequestPriority | "">("");

  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getRequests({
          page,
          pageSize: 10,
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
        });

        setData(result);
      } catch {
        setError("Unable to load requests.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRequests();
  }, [page, priority, search, status]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setPage(1);
  }

  return (
    <main className="app-page">
      <div className="page-header">
        <div>
          <h1>Requests</h1>
          <p>View and manage the requests available to you.</p>
        </div>

        <Link className="primary-link" to="/requests/new">
          Create request
        </Link>
      </div>

      <section className="filter-panel">
        <input
          value={search}
          placeholder="Search title or description"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as RequestStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {formatStatus(item)}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => {
            setPriority(event.target.value as RequestPriority | "");
            setPage(1);
          }}
        >
          <option value="">All priorities</option>
          {priorities.map((item) => (
            <option key={item} value={item}>
              {formatPriority(item)}
            </option>
          ))}
        </select>

        <button type="button" onClick={resetFilters}>
          Reset
        </button>
      </section>

      {isLoading && <p>Loading requests...</p>}
      {error && <p className="form-error">{error}</p>}

      {!isLoading && !error && data && (
        <>
          <section className="table-panel">
            {data.items.length === 0 ? (
              <p className="empty-state">
                No requests match the current filters.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due date</th>
                    <th>Created at</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <Link to={`/requests/${request.id}`}>
                          {request.title}
                        </Link>
                      </td>

                      <td>
                        <StatusBadge status={request.status} />
                      </td>

                      <td>
                        <PriorityBadge priority={request.priority} />
                      </td>

                      <td>{formatDate(request.dueDate)}</td>
                      <td>{formatDate(request.createdAtUtc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="pagination">
            <span>
              Page {data.page} of {data.totalPages || 1} ·{" "}
              {data.totalCount} request(s)
            </span>

            <div>
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export function StatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
  return (
    <span className={`status-tag status-${status}`}>
      {formatStatus(status)}
    </span>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: RequestPriority;
}) {
  return (
    <span className={`priority-tag priority-${priority}`}>
      {formatPriority(priority)}
    </span>
  );
}

export function formatStatus(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    underReview: "Under review",
    approved: "Approved",
    rejected: "Rejected",
  };

  return labels[status];
}

export function formatPriority(
  priority: RequestPriority,
): string {
  const labels: Record<RequestPriority, string> = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  };

  return labels[priority];
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}