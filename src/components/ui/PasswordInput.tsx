"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  inputClassName?: string;
};

export default function PasswordInput({
  inputClassName = "",
  className = "",
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={`${inputClassName} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        disabled={disabled}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
