export type RequestStatus =
  | "draft"
  | "submitted"
  | "underReview"
  | "approved"
  | "rejected";

export type RequestPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type RecentRequest = {
  id: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  dueDate: string | null;
  creatorId: string;
  assignedManagerId: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type StatusCount = {
  status: RequestStatus;
  count: number;
};

export type Dashboard = {
  totalRequests: number;
  draftRequests: number;
  submittedRequests: number;
  underReviewRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  urgentRequests: number;
  dueWithinSevenDays: number;
  activeUsers: number | null;
  requestsByStatus: StatusCount[];
  recentRequests: RecentRequest[];
};