"use client";

import { Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ApiError, useApiPost } from "@/src/lib/api";
import { isAuthenticated, setAuth, type LoginPayload, type LoginResponse } from "@/src/lib/auth";

const fieldClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-0";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", form: "" });

  const loginMutation = useApiPost<LoginResponse, LoginPayload>("/auth/login");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const validate = () => {
    const nextErrors = { email: "", password: "", form: "" };

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ email: "", password: "", form: "" });

    if (!validate()) return;

    try {
      const data = await loginMutation.mutateAsync({ email, password });
      setAuth(data.token, data.user);
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? typeof error.data === "object" &&
            error.data !== null &&
            "message" in error.data &&
            typeof (error.data as { message: unknown }).message === "string"
            ? (error.data as { message: string }).message
            : error.message
          : "Login failed. Please try again.";

      setErrors((prev) => ({ ...prev, form: message }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#036eb6]">
            EAR Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#092151]">Sign in</h1>
          <p className="mt-2 text-sm text-[#858c93]">
            Enter your credentials to access the admin panel.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="flex items-start gap-3">
                <Mail className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "", form: "" }));
                    }}
                    className={fieldClassName}
                  />
                  {errors.email ? (
                    <p className="mt-1.5 text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="flex items-start gap-3">
                <Lock className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "", form: "" }));
                    }}
                    className={fieldClassName}
                  />
                  {errors.password ? (
                    <p className="mt-1.5 text-sm text-red-600" role="alert">
                      {errors.password}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {errors.form ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errors.form}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60 disabled:hover:shadow-md"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
