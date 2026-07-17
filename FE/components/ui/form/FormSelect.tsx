"use client";

import React, { forwardRef, useMemo } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  searchable?: boolean;
  placeholder?: string;
  size?: "small" | "medium";
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, children, className, disabled, placeholder, onChange, value, defaultValue, name, size, ...props }, ref) => {
    // Parse options from either prop or children
    const parsedOptions = useMemo(() => {
      if (options) return options;
      if (!children) return [];

      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as any;
          if (child.type === "option" || childProps.value !== undefined) {
            opts.push({
              value: childProps.value,
              label: childProps.children ? String(childProps.children) : String(childProps.value),
            });
          }
        }
      });
      return opts;
    }, [options, children]);

    // Handle default/empty values gracefully
    const selectValue = value ?? defaultValue ?? "";

    return (
      <FormControl error={!!error} fullWidth className={className} variant="outlined" size={size}>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          label={label}
          value={selectValue}
          onChange={onChange as any}
          disabled={disabled}
          name={name}
          inputRef={ref}
          displayEmpty={!!placeholder}
          size={size}
          {...(props as any)}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <span className="text-slate-500">{placeholder}</span>
            </MenuItem>
          )}
          {parsedOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {(error || helperText) && (
          <FormHelperText>{error || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

FormSelect.displayName = "FormSelect";
