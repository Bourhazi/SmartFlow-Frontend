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

export type RequestListItem = {
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

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type Attachment = {
  id: string;
  originalFileName: string;
  contentType: string;
  size: number;
  uploadedById: string;
  createdAtUtc: string;
};

export type Comment = {
  id: string;
  content: string;
  authorId: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type ApprovalHistory = {
  id: string;
  oldStatus: RequestStatus;
  newStatus: RequestStatus;
  performedById: string;
  comment: string | null;
  createdAtUtc: string;
};

export type RequestDetails = {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  dueDate: string | null;
  submittedAtUtc: string | null;
  decisionAtUtc: string | null;
  creatorId: string;
  assignedManagerId: string | null;
  rejectionReason: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  version: number;
  attachments: Attachment[];
  comments: Comment[];
  approvalHistories: ApprovalHistory[];
};

export type RequestFilters = {
  page?: number;
  pageSize?: number;
  status?: RequestStatus;
  priority?: RequestPriority;
  search?: string;
};

export type CreateRequestPayload = {
  title: string;
  description: string;
  priority: RequestPriority;
  dueDate: string | null;
};