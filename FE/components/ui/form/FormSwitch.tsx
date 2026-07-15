import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface FormSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, error, helperText, className, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          className={twMerge(
            "flex items-center justify-between gap-4 cursor-pointer bg-slate-950 px-4 py-3 rounded-lg border border-slate-850/60 select-none transition-colors hover:bg-slate-900/40",
            disabled ? "opacity-40 cursor-not-allowed" : "",
            className
          )}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-300">{label}</span>
            {helperText && <p className="text-[10px] text-slate-500 leading-normal">{helperText}</p>}
          </div>

          <div className="relative inline-flex items-center shrink-0">
            <input
              type="checkbox"
              ref={ref}
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-slate-100 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 transition-colors" />
          </div>
        </label>
        {error && <p className="text-xs text-rose-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

FormSwitch.displayName = "FormSwitch";
