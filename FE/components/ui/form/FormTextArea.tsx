"use client";

import React, { forwardRef } from "react";
import TextField from "@mui/material/TextField";

export interface FormTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, error, helperText, className, disabled, rows = 3, ...props }, ref) => {
    return (
      <TextField
        {...(props as any)}
        multiline
        rows={rows}
        label={label}
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
