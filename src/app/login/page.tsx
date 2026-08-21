"use client";

import { Loader2, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useApiPost } from "@/src/lib/api";
import { isAuthenticated, setAuth, type LoginPayload, type LoginResponse } from "@/src/lib/auth";
import { toastError, toastSuccess } from "@/src/lib/toast";
import PasswordInput from "@/src/components/ui/PasswordInput";

const fieldClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-0";

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const loginMutation = useApiPost<LoginResponse, LoginPayload>("/auth/login");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(nextPath);
    }
  }, [router, nextPath]);

  const validate = () => {
    const nextErrors = { email: "", password: "" };

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
    setErrors({ email: "", password: "" });

    if (!validate()) return;

    try {
      const data = await loginMutation.mutateAsync({ email, password });
      setAuth(data.token, data.user);
      toastSuccess("Logged in successfully.");
      router.replace(nextPath);
    } catch (error) {
      toastError(error, "Login failed. Please try again.");
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
                      setErrors((prev) => ({ ...prev, email: "" }));
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
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    inputClassName={fieldClassName}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-[#858c93]">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
