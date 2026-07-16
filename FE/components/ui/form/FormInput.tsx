import React, { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  preventPaste?: boolean;
  preventCopy?: boolean;
  debounceTime?: number; // debounce time in milliseconds
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Shake animation for input errors
const shakeVariants = {
  shake: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    transition: { duration: 0.4, ease: "easeInOut" }
  }
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      isLoading,
      type = "text",
      className,
      leftIcon,
      rightIcon,
      disabled,
      preventPaste = false,
      preventCopy = false,
      debounceTime = 0,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState<string>(
      String(props.value ?? props.defaultValue ?? "")
    );

    const isPassword = type === "password";
    const isSearch = type === "search";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Synchronize state when value changes externally
    useEffect(() => {
      if (props.value !== undefined) {
        setLocalValue(String(props.value));
      }
    }, [props.value]);

    // Clean up debounce timeout on unmount
    useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    // Debounced onChange execution
    const triggerDebouncedChange = useCallback(
      (val: string, originalEvent: React.ChangeEvent<HTMLInputElement>) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        originalEvent.persist();

        debounceTimeoutRef.current = setTimeout(() => {
          if (onChange) {
            // Re-create event with sanitized value
            const eventClone = {
              ...originalEvent,
              target: {
                ...originalEvent.target,
                value: val
              }
            };
            onChange(eventClone as any);
          }
        }, debounceTime);
      },
      [debounceTime, onChange]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      // Client-side XSS Sanitization: filter out potential script tags and HTML markup
      const sanitizedValue = rawValue.replace(/<script[^>]*>([\S\s]*?)<\/script>|<[^>]*>/gi, "");

      setLocalValue(sanitizedValue);

      if (debounceTime > 0) {
        triggerDebouncedChange(sanitizedValue, e);
      } else if (onChange) {
        const eventClone = {
          ...e,
          target: {
            ...e.target,
            value: sanitizedValue
          }
        };
        onChange(eventClone as any);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (preventPaste) {
        e.preventDefault();
      } else if (props.onPaste) {
        props.onPaste(e);
      }
    };

    const handleCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (preventCopy) {
        e.preventDefault();
      } else if (props.onCopy) {
        props.onCopy(e);
      }
    };

    const hasLeftIcon = isSearch || !!leftIcon;
    const isLabelFloating =
      isFocused ||
      localValue !== "" ||
      (props.placeholder && props.placeholder !== " ");

    const inputPadding = label ? "pt-5.5 pb-1.5" : "py-2.5";

    return (
      <motion.div
        animate={error ? "shake" : ""}
        variants={shakeVariants as any}
        className="space-y-1.5 w-full relative"
      >
        <div className="relative flex items-center w-full">
          {/* Left Icon */}
          {isSearch && !leftIcon && (
            <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
          )}
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            {...props}
            type={actualType}
            ref={ref}
            value={localValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
            onCopy={handleCopy}
            disabled={disabled || isLoading}
            placeholder={label ? " " : props.placeholder} // space allows peer-placeholder-shown checking if needed
            className={twMerge(
              "w-full bg-slate-950 border rounded-lg px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              inputPadding,
              hasLeftIcon ? "pl-9" : "",
              isPassword || rightIcon || isLoading ? "pr-10" : "",
              error ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-slate-850",
              className
            )}
          />

          {/* Floating Label */}
          {label && (
            <label
              className={twMerge(
                "absolute left-3 text-slate-500 pointer-events-none transition-all duration-200 ease-out origin-top-left",
                hasLeftIcon ? "left-9" : "left-3",
                isLabelFloating
                  ? "top-1 text-[10px] text-indigo-400 font-semibold"
                  : "top-1/2 -translate-y-1/2 text-sm",
                error ? "text-rose-400" : ""
              )}
            >
              {label}
              {props.required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
          )}

          {/* Right Actions */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}

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
              <div className="flex items-center justify-center text-slate-500">{rightIcon}</div>
            )}
          </div>
        </div>

        {/* Helper text or error message */}
        {error ? (
          <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        )}
      </motion.div>
    );
  }
);

FormInput.displayName = "FormInput";
