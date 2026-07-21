"use client";

/**
 * FormInput
 *
 * Bọc MUI TextField — đây là component CONTROLLED. Phải dùng với
 * react-hook-form `Controller` (không dùng `register()`), vì register()
 * không truyền `value` xuống nên input sẽ không hiển thị đúng giá trị
 * khi load/edit dữ liệu (ví dụ khi gọi `reset()`).
 *
 * Cách dùng đúng:
 *   <Controller
 *     control={control}
 *     name="title"
 *     render={({ field, fieldState }) => (
 *       <FormInput {...field} label="Tiêu đề" error={fieldState.error?.message} />
 *     )}
 *   />
 */

import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { Eye, EyeOff, Search } from "lucide-react";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";

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
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const isSearch = type === "search";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    // Chỉ dùng để hiển thị mượt trong lúc debounce đang chờ bắn onChange lên
    // cha. KHÔNG dùng để "mirror" value như bản cũ (tránh xung đột khi cha
    // cập nhật lại value, ví dụ form.reset()).
    const [pendingDisplayValue, setPendingDisplayValue] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Bất kỳ khi nào giá trị từ cha (react-hook-form) thay đổi, hủy buffer
    // tạm để value hiển thị luôn đồng bộ với nguồn sự thật (form state).
    useEffect(() => {
      setPendingDisplayValue(null);
    }, [value]);

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

      if (debounceTime > 0) {
        setPendingDisplayValue(sanitizedValue);
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

    // Luôn controlled theo `value` do cha truyền vào (qua Controller).
    // pendingDisplayValue chỉ "che" tạm trong lúc debounce chưa kịp bắn lên.
    const displayValue = pendingDisplayValue ?? (value ?? "");

    return (
      <TextField
        {...(props as any)}
        type={actualType}
        label={label}
        value={displayValue}
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