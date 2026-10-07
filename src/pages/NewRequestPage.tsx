import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { createRequest } from "../features/requests/request-api";
import type { RequestPriority } from "../features/requests/request.types";

const requestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must contain at least 3 characters.")
    .max(150),

  description: z
    .string()
    .min(10, "Description must contain at least 10 characters.")
    .max(3000),

  priority: z.enum(["low", "normal", "high", "urgent"]),

  dueDate: z.string().optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

export function NewRequestPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: "normal",
    },
  });

  async function onSubmit(values: RequestForm) {
    try {
      setError(null);

      const requestId = await createRequest({
        title: values.title,
        description: values.description,
        priority: values.priority as RequestPriority,
        dueDate: values.dueDate
          ? new Date(values.dueDate).toISOString()
          : null,
      });

      navigate(`/requests/${requestId}`, {
        replace: true,
      });
    } catch {
      setError("Unable to create this request.");
    }
  }

  return (
    <main className="app-page">
      <div className="page-header">
        <div>
          <h1>Create request</h1>
          <p>Create a new draft request.</p>
        </div>
      </div>

      <section className="form-panel">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Title
            <input {...register("title")} />
            {errors.title && (
              <span className="field-error">
                {errors.title.message}
              </span>
            )}
          </label>

          <label>
            Description
            <textarea rows={7} {...register("description")} />
            {errors.description && (
              <span className="field-error">
                {errors.description.message}
              </span>
            )}
          </label>

          <label>
            Priority
            <select {...register("priority")}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label>
            Due date
            <input type="date" {...register("dueDate")} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/requests")}
            >
              Cancel
            </button>

            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create draft"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}