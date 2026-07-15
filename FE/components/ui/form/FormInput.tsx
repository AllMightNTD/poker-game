import React, { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff, Search, Loader2 } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, isLoading, type = "text", className, leftIcon, rightIcon, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const isSearch = type === "search";
    
    // Determine the actual input type to render
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-400">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center">
          {/* Left Icon (e.g. Search icon) */}
          {isSearch && !leftIcon && (
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          )}
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            type={actualType}
            ref={ref}
            disabled={disabled || isLoading}
            className={twMerge(
              "w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              isSearch || leftIcon ? "pl-9" : "",
              isPassword || rightIcon || isLoading ? "pr-10" : "",
              error ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-slate-850",
              className
            )}
            {...props}
          />

          {/* Right actions (loading spinner or show/hide password toggle) */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            )}
            
            {isPassword && !isLoading && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}

            {!isPassword && rightIcon && !isLoading && (
              <div className="flex items-center justify-center text-slate-500">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {error ? (
          <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
