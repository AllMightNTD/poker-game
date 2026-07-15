import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, error, helperText, className, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-400">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          disabled={disabled}
          className={twMerge(
            "w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed resize-none",
            error ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-slate-850",
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

FormTextArea.displayName = "FormTextArea";
