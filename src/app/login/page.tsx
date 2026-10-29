"use client";

import {
  BookOpen,
  FileText,
  Loader2,
  Lock,
  Mail,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useApiPost } from "@/src/lib/api";
import { isAuthenticated, setAuth, type LoginPayload, type LoginResponse } from "@/src/lib/auth";
import { toastError, toastSuccess } from "@/src/lib/toast";
import PasswordInput from "@/src/components/ui/PasswordInput";

const fieldClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-0";

const highlights: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: BookOpen,
    title: "Journals and volumes",
    text: "Publish issues and keep the public catalogue current.",
  },
  {
    icon: FileText,
    title: "Manuscript review",
    text: "Follow submissions from intake to an editorial decision.",
  },
  {
    icon: Users,
    title: "Editorial board",
    text: "Present the scholars who guide peer review.",
  },
  {
    icon: Scale,
    title: "Publication ethics",
    text: "Share the standards that keep research fair and open.",
  },
];

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative overflow-hidden bg-[#071a3a] px-6 py-10 text-white sm:px-10 lg:flex lg:w-[54%] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.45),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(251,191,36,0.35),transparent_28%),radial-gradient(circle_at_78%_82%,rgba(244,114,182,0.32),transparent_34%),linear-gradient(160deg,#0b2a5b_0%,#024081_46%,#0e7490_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-16 -left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-rose-400 text-xs font-bold text-[#092151]">
              EAR
            </span>
            <span className="text-xs font-semibold tracking-[0.16em] uppercase">
              Einstein Academic Research
            </span>
          </div>

          <h2 className="mt-8 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.7rem] lg:leading-[1.15]">
            Publishing research with care, clarity, and an open editorial process.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-sky-50/90 sm:text-base">
            Einstein Academic Research brings journals, volumes, and peer-reviewed
            papers together for readers and scholars. This admin panel is where
            editors manage submissions, the editorial board, news, and the ethics
            that stand behind every issue.
          </p>
        </div>

        <ul className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-cyan-300 to-amber-300 text-[#092151]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-sky-50/80">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[linear-gradient(165deg,#e0f2fe_0%,#fff7ed_48%,#fce7f3_100%)] px-4 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl"
          aria-hidden
        />
        <div className="relative w-full max-w-md">
          <div className="mb-8">
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
            className="rounded-2xl border border-sky-100 bg-linear-to-br from-white via-sky-50 to-amber-50 p-6 shadow-md sm:p-8"
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
