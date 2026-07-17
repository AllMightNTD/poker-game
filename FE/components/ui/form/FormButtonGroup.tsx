"use client";

import React, { forwardRef } from "react";
import ButtonGroup, { ButtonGroupProps } from "@mui/material/ButtonGroup";

export interface FormButtonGroupProps extends ButtonGroupProps {
  children: React.ReactNode;
}

export const FormButtonGroup = forwardRef<HTMLDivElement, FormButtonGroupProps>(
  ({ children, ...props }, ref) => {
    return (
      <ButtonGroup ref={ref} {...props}>
        {children}
      </ButtonGroup>
    );
  }
);

FormButtonGroup.displayName = "FormButtonGroup";
