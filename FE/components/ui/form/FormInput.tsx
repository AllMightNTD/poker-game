"use client";

import React, { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { Eye, EyeOff, Search } from "lucide-react";

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  preventPaste?: boolean;
  preventCopy?: boolean;
  debounceTime?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: "small" | "medium";
}

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
      size = "medium",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [localValue, setLocalValue] = useState<string>(
      String(props.value ?? props.defaultValue ?? "")
    );

    const isPassword = type === "password";
    const isSearch = type === "search";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync external value changes
    useEffect(() => {
      if (props.value !== undefined) {
        setLocalValue(String(props.value));
      }
    }, [props.value]);

    useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    const triggerDebouncedChange = useCallback(
      (val: string, originalEvent: React.ChangeEvent<HTMLInputElement>) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        originalEvent.persist();

        debounceTimeoutRef.current = setTimeout(() => {
          if (onChange) {
            const eventClone = {
              ...originalEvent,
              target: {
                ...originalEvent.target,
                value: val,
              },
            };
            onChange(eventClone as any);
          }
        }, debounceTime);
      },
      [debounceTime, onChange]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Client-side XSS Sanitization
      const sanitizedValue = rawValue.replace(/<script[^>]*>([\S\s]*?)<\/script>|<[^>]*>/gi, "");

      setLocalValue(sanitizedValue);

      if (debounceTime > 0) {
        triggerDebouncedChange(sanitizedValue, e);
      } else if (onChange) {
        const eventClone = {
          ...e,
          target: {
            ...e.target,
            value: sanitizedValue,
          },
        };
        onChange(eventClone as any);
      }
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

    const startAdornment = (isSearch || leftIcon) ? (
      <InputAdornment position="start">
        {isSearch ? <Search className="w-4 h-4 text-slate-500" /> : leftIcon}
      </InputAdornment>
    ) : null;

    const endAdornment = (isPassword || rightIcon || isLoading) ? (
      <InputAdornment position="end">
        {isLoading && <CircularProgress size={16} color="inherit" className="mr-2" />}
        {isPassword && !isLoading && (
          <IconButton
            onClick={() => setShowPassword((prev) => !prev)}
            edge="end"
            size="small"
            tabIndex={-1}
            className="text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </IconButton>
        )}
        {!isPassword && rightIcon && !isLoading && rightIcon}
      </InputAdornment>
    ) : null;

    return (
      <TextField
        {...(props as any)}
        type={actualType}
        label={label}
        value={localValue}
        onChange={handleInputChange}
        onPaste={handlePaste}
        onCopy={handleCopy}
        disabled={disabled || isLoading}
        error={!!error}
        helperText={error || helperText}
        fullWidth
        size={size}
        variant="outlined"
        inputRef={ref}
        className={className}
        slotProps={{
          input: {
            startAdornment,
            endAdornment,
          },
        }}
      />
    );
  }
);

FormInput.displayName = "FormInput";
