"use client";

import React, { forwardRef } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className, disabled, checked, defaultChecked, onChange, name, value, ...props }, ref) => {
    return (
      <FormControl error={!!error} className={className} component="fieldset" variant="standard">
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              defaultChecked={defaultChecked}
              onChange={onChange as any}
              name={name}
              value={value}
              disabled={disabled}
              slotProps={{
                input: {
                  ref,
                },
              }}
              {...(props as any)}
            />
          }
          label={<span className="text-xs font-semibold text-slate-300 select-none">{label}</span>}
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
