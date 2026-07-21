"use client";

/**
 * FormTextArea
 *
 * Bọc MUI TextField (multiline) — CONTROLLED component. Dùng với
 * react-hook-form `Controller`, không dùng `register()`:
 *
 *   <Controller
 *     control={control}
 *     name="description"
 *     render={({ field, fieldState }) => (
 *       <FormTextArea {...field} label="Mô tả" error={fieldState.error?.message} />
 *     )}
 *   />
 */

import TextField from "@mui/material/TextField";
import React, { forwardRef } from "react";

export interface FormTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, error, helperText, className, disabled, rows = 3, value, ...props }, ref) => {
    return (
      <TextField
        {...(props as any)}
        multiline
        rows={rows}
        label={label}
        // Fallback về "" để tránh input nhảy giữa controlled/uncontrolled
        // khi value ban đầu là undefined (ví dụ trước khi form.reset() chạy).
        value={value ?? ""}
        disabled={disabled}
        error={!!error}
        helperText={error || helperText}
        fullWidth
        variant="outlined"
        inputRef={ref}
        className={className}
      />
    );
  }
);

FormTextArea.displayName = "FormTextArea";