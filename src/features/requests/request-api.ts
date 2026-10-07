import api from "../../lib/api";
import type {
  CreateRequestPayload,
  PagedResult,
  RequestDetails,
  RequestFilters,
  RequestListItem,
} from "./request.types";

export async function getRequests(
  filters: RequestFilters,
): Promise<PagedResult<RequestListItem>> {
  const response = await api.get<PagedResult<RequestListItem>>(
    "/requests",
    { params: filters },
  );

  return response.data;
}

export async function getRequestById(
  requestId: string,
): Promise<RequestDetails> {
  const response = await api.get<RequestDetails>(`/requests/${requestId}`);
  return response.data;
}

export async function createRequest(
  payload: CreateRequestPayload,
): Promise<string> {
  const response = await api.post<{ id: string }>("/requests", payload);
  return response.data.id;
}

export async function updateRequest(
  requestId: string,
  payload: CreateRequestPayload,
  version: number,
): Promise<void> {
  await api.put(`/requests/${requestId}`, { ...payload, version });
}

export async function submitRequest(
  requestId: string,
  version: number,
): Promise<void> {
  await api.post(`/requests/${requestId}/submit`, { version });
}

export async function addComment(
  requestId: string,
  content: string,
  version: number,
): Promise<void> {
  await api.post(`/requests/${requestId}/comments`, { content, version });
}

export async function updateComment(
  requestId: string,
  commentId: string,
  content: string,
  version: number,
): Promise<void> {
  await api.put(`/requests/${requestId}/comments/${commentId}`, {
    content,
    version,
  });
}

export async function removeComment(
  requestId: string,
  commentId: string,
  version: number,
): Promise<void> {
  await api.delete(`/requests/${requestId}/comments/${commentId}`, {
    data: { version },
  });
}

export async function uploadAttachment(
  requestId: string,
  file: File,
  version: number,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("version", String(version));

  await api.post(`/requests/${requestId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function removeAttachment(
  requestId: string,
  attachmentId: string,
  version: number,
): Promise<void> {
  await api.delete(`/requests/${requestId}/attachments/${attachmentId}`, {
    data: { version },
  });
}

export async function downloadAttachment(
  requestId: string,
  attachmentId: string,
  fileName: string,
): Promise<void> {
  const response = await api.get(
    `/requests/${requestId}/attachments/${attachmentId}/download`,
    { responseType: "blob" },
  );

  const url = URL.createObjectURL(response.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}