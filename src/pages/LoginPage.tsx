import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../features/auth/auth-context";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginForm) {
    try {
      setError(null);

      await login(values);

      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="brand">SmartFlow</p>
        <h1>Sign in</h1>
        <p className="subtitle">
          Manage your business requests and approvals.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <span className="field-error">
                {errors.email.message}
              </span>
            )}
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <span className="field-error">
                {errors.password.message}
              </span>
            )}
          </label>

          {error && (
            <p className="form-error">{error}</p>
          )}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}