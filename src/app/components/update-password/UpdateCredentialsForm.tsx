"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Lock, Mail, User } from "lucide-react";
import { clearAuth } from "@/src/lib/auth";
import { toastError, toastSuccess } from "@/src/lib/toast";
import { useAuthUser, useUpdateCredentials } from "@/src/hooks";
import PasswordInput from "@/src/components/ui/PasswordInput";

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-[#036eb6] focus:outline-none focus:ring-2 focus:ring-[#036eb6]/20";

export default function UpdateCredentialsForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthUser();

  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    currentPassword: "",
  });

  const name = nameOverride ?? user?.name ?? "";
  const email = emailOverride ?? user?.email ?? "";

  const updateCredentials = useUpdateCredentials();

  const validate = () => {
    const next = {
      name: "",
      email: "",
      password: "",
      currentPassword: "",
    };

    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address";
    }
    if (!password.trim()) next.password = "New password is required";
    else if (password.trim().length < 6) {
      next.password = "New password must be at least 6 characters";
    }
    if (!currentPassword.trim()) {
      next.currentPassword = "Current password is required";
    }

    setErrors(next);
    return !next.name && !next.email && !next.password && !next.currentPassword;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({ name: "", email: "", password: "", currentPassword: "" });

    if (!validate()) return;

    try {
      const data = await updateCredentials.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        currentPassword: currentPassword.trim(),
      });

      toastSuccess(data.message || "Credentials updated successfully");
      clearAuth();
      queryClient.clear();
      router.replace("/login");
    } catch (error) {
      toastError(error, "Failed to update credentials. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#036eb6]">
            <KeyRound className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#092151]">Update credentials</h2>
            <p className="text-sm text-[#858c93]">
              Update your profile details and password. You will be logged out after saving.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="cred-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>
          <div className="flex items-start gap-3">
            <User className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
            <div className="min-w-0 flex-1">
              <input
                id="cred-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setNameOverride(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Admin"
                className={fieldClassName}
                disabled={updateCredentials.isPending}
              />
              {errors.name ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.name}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="cred-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="flex items-start gap-3">
            <Mail className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
            <div className="min-w-0 flex-1">
              <input
                id="cred-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmailOverride(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="admin@ear.com"
                className={fieldClassName}
                disabled={updateCredentials.isPending}
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
          <label
            htmlFor="cred-current-password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Current password
          </label>
          <div className="flex items-start gap-3">
            <Lock className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
            <div className="min-w-0 flex-1">
              <PasswordInput
                id="cred-current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, currentPassword: "" }));
                }}
                placeholder="Enter current password"
                inputClassName={fieldClassName}
                disabled={updateCredentials.isPending}
                autoComplete="current-password"
              />
              {errors.currentPassword ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.currentPassword}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="cred-new-password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            New password
          </label>
          <div className="flex items-start gap-3">
            <KeyRound className="mt-3 h-5 w-5 shrink-0 text-[#036eb6]" aria-hidden />
            <div className="min-w-0 flex-1">
              <PasswordInput
                id="cred-new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="Enter new password"
                inputClassName={fieldClassName}
                disabled={updateCredentials.isPending}
                autoComplete="new-password"
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
        disabled={updateCredentials.isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#024081] to-[#036eb6] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
      >
        {updateCredentials.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Updating...
          </>
        ) : (
          "Update credentials"
        )}
      </button>
    </form>
  );
}
