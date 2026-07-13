import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface DateTimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-400">
            {label}
          </label>
        )}
        <input
          type="datetime-local"
          ref={ref}
          className={twMerge(
            "w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors",
            error ? "border-red-500 focus:border-red-500" : "border-slate-850",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";
