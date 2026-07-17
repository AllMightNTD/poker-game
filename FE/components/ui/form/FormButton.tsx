"use client";

import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { forwardRef } from "react";

export interface FormButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ children, isLoading, disabled, startIcon, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : startIcon}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FormButton.displayName = "FormButton";
