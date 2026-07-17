"use client";

import React, { forwardRef } from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";

export interface FormSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, error, helperText, className, disabled, checked, defaultChecked, onChange, name, value, ...props }, ref) => {
    return (
      <FormControl error={!!error} className={className} component="fieldset" variant="standard" fullWidth>
        <FormControlLabel
          control={
            <Switch
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
          label={
            <div className="flex flex-col ml-1 select-none">
              <span className="text-xs font-semibold text-slate-300">{label}</span>
              {helperText && <span className="text-[10px] text-slate-500">{helperText}</span>}
            </div>
          }
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    );
  }
);

FormSwitch.displayName = "FormSwitch";
