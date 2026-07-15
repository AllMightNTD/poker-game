import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          className={twMerge(
            "flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-2.5 rounded-lg border select-none transition-colors",
            error ? "border-rose-500/50 bg-rose-950/5" : "border-slate-850/60 hover:bg-slate-900/40",
            disabled ? "opacity-40 cursor-not-allowed" : "",
            className
          )}
        >
          <input
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 bg-slate-900 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />
          <span className="text-xs font-semibold text-slate-300">{label}</span>
        </label>
        {error && <p className="text-xs text-rose-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
