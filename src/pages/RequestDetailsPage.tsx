import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";
import {
  addComment,
  downloadAttachment,
  getRequestById,
  removeAttachment,
  removeComment,
  submitRequest,
  updateComment,
  updateRequest,
  uploadAttachment,
} from "../features/requests/request-api";
import { getRequestActionError } from "../features/requests/request-error";
import type {
  Comment,
  RequestDetails,
  RequestPriority,
} from "../features/requests/request.types";
import {
  formatDate,
  PriorityBadge,
  StatusBadge,
} from "./RequestsPage";

export function RequestDetailsPage() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadRequest = useCallback(async () => {
    if (!requestId) return;

    try {
      setIsLoading(true);
      setError(null);
      setRequest(await getRequestById(requestId));
    } catch {
      setError("Unable to load this request.");
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  async function execute(action: () => Promise<void>) {
    try {
      setIsWorking(true);
      setError(null);
      await action();
      await loadRequest();
    } catch (actionError) {
      setError(getRequestActionError(actionError));
    } finally {
      setIsWorking(false);
    }
  }

  if (isLoading) return <main className="app-page">Loading request...</main>;

  if (!request) {
    return (
      <main className="app-page">
        <p className="form-error">{error ?? "Request not found."}</p>
        <Link to="/requests">Back to requests</Link>
      </main>
    );
  }

  const isOwner = request.creatorId === user?.userId;
  const canEdit = isOwner && request.status === "draft";
  const canSubmit = canEdit;

  return (
    <main className="app-page">
      <Link className="back-link" to="/requests">← Back to requests</Link>

      <div className="page-header request-header">
        <div>
          <h1>{request.title}</h1>
          <div className="request-tags">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
        </div>

        <div className="action-row">
          {canEdit && (
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit draft
            </button>
          )}
          {canSubmit && (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void execute(() => submitRequest(request.id, request.version))}
            >
              Submit request
            </button>
          )}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {isEditing ? (
        <RequestEditForm
          request={request}
          isWorking={isWorking}
          onCancel={() => setIsEditing(false)}
          onSave={(payload) => void execute(async () => {
            await updateRequest(request.id, payload, request.version);
            setIsEditing(false);
          })}
        />
      ) : (
        <section className="details-grid">
          <article className="dashboard-panel">
            <h2>Description</h2>
            <p className="description">{request.description}</p>
          </article>
          <article className="dashboard-panel">
            <h2>Information</h2>
            <dl className="details-list">
              <div><dt>Created at</dt><dd>{formatDate(request.createdAtUtc)}</dd></div>
              <div><dt>Due date</dt><dd>{formatDate(request.dueDate)}</dd></div>
              <div><dt>Submitted at</dt><dd>{formatDate(request.submittedAtUtc)}</dd></div>
              <div><dt>Assigned manager</dt><dd>{request.assignedManagerId ?? "Not assigned"}</dd></div>
            </dl>
          </article>
        </section>
      )}

      {request.rejectionReason && (
        <section className="dashboard-panel">
          <h2>Rejection reason</h2>
          <p>{request.rejectionReason}</p>
        </section>
      )}

      <section className="dashboard-panel">
        <h2>Comments</h2>
        <form className="inline-form" onSubmit={(event) => {
          event.preventDefault();
          if (!commentContent.trim()) return;
          void execute(async () => {
            await addComment(request.id, commentContent.trim(), request.version);
            setCommentContent("");
          });
        }}>
          <textarea value={commentContent} rows={3} placeholder="Write a comment" onChange={(event) => setCommentContent(event.target.value)} />
          <button disabled={isWorking || !commentContent.trim()} type="submit">Add comment</button>
        </form>

        <div className="comment-list">
          {request.comments.map((comment) => (
            <article className="comment" key={comment.id}>
              {editingComment?.id === comment.id ? (
                <CommentEditor
                  comment={comment}
                  isWorking={isWorking}
                  onCancel={() => setEditingComment(null)}
                  onSave={(content) => void execute(async () => {
                    await updateComment(request.id, comment.id, content, request.version);
                    setEditingComment(null);
                  })}
                />
              ) : (
                <>
                  <p>{comment.content}</p>
                  <small>{formatDate(comment.createdAtUtc)}</small>
                  {comment.authorId === user?.userId && (
                    <div className="action-row small-actions">
                      <button type="button" onClick={() => setEditingComment(comment)}>Edit</button>
                      <button type="button" disabled={isWorking} onClick={() => void execute(() => removeComment(request.id, comment.id, request.version))}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </article>
          ))}
          {request.comments.length === 0 && <p className="empty-state">No comments yet.</p>}
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Attachments</h2>
        <form className="attachment-form" onSubmit={(event) => {
          event.preventDefault();
          if (!selectedFile) return;
          void execute(async () => {
            await uploadAttachment(request.id, selectedFile, request.version);
            setSelectedFile(null);
          });
        }}>
          <input type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          <button disabled={isWorking || !selectedFile} type="submit">Upload file</button>
        </form>
        <div className="attachment-list">
          {request.attachments.map((attachment) => (
            <div className="attachment-row" key={attachment.id}>
              <span>{attachment.originalFileName} ({formatFileSize(attachment.size)})</span>
              <div className="action-row small-actions">
                <button type="button" onClick={() => void downloadAttachment(request.id, attachment.id, attachment.originalFileName)}>Download</button>
                {attachment.uploadedById === user?.userId && (
                  <button type="button" disabled={isWorking} onClick={() => void execute(() => removeAttachment(request.id, attachment.id, request.version))}>Delete</button>
                )}
              </div>
            </div>
          ))}
          {request.attachments.length === 0 && <p className="empty-state">No attachments yet.</p>}
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Approval history</h2>
        {request.approvalHistories.length === 0 ? <p className="empty-state">No approval action has occurred yet.</p> : (
          <div className="history-list">
            {request.approvalHistories.map((item) => <div className="history-row" key={item.id}><strong>{item.oldStatus} → {item.newStatus}</strong><span>{formatDate(item.createdAtUtc)}</span>{item.comment && <p>{item.comment}</p>}</div>)}
          </div>
        )}
      </section>
    </main>
  );
}

function RequestEditForm({ request, isWorking, onCancel, onSave }: { request: RequestDetails; isWorking: boolean; onCancel: () => void; onSave: (payload: { title: string; description: string; priority: RequestPriority; dueDate: string | null }) => void }) {
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description);
  const [priority, setPriority] = useState<RequestPriority>(request.priority);
  const [dueDate, setDueDate] = useState(request.dueDate?.slice(0, 10) ?? "");
  return <section className="form-panel"><form onSubmit={(event) => { event.preventDefault(); onSave({ title, description, priority, dueDate: dueDate ? new Date(dueDate).toISOString() : null }); }}><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Description<textarea rows={6} value={description} onChange={(event) => setDescription(event.target.value)} required /></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as RequestPriority)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><div className="form-actions"><button type="button" onClick={onCancel}>Cancel</button><button disabled={isWorking} type="submit">Save changes</button></div></form></section>;
}

function CommentEditor({ comment, isWorking, onCancel, onSave }: { comment: Comment; isWorking: boolean; onCancel: () => void; onSave: (content: string) => void }) {
  const [content, setContent] = useState(comment.content);
  return <form className="inline-form" onSubmit={(event) => { event.preventDefault(); if (content.trim()) onSave(content.trim()); }}><textarea rows={3} value={content} onChange={(event) => setContent(event.target.value)} /><div className="action-row"><button type="button" onClick={onCancel}>Cancel</button><button disabled={isWorking || !content.trim()} type="submit">Save comment</button></div></form>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}