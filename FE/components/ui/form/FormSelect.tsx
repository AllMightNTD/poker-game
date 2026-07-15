import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, children, className, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-400">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          disabled={disabled}
          className={twMerge(
            "w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
            error ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-slate-850",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-100">
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error ? (
          <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
