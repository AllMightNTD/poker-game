"use client";

import React, { forwardRef } from "react";
import Slider from "@mui/material/Slider";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";

export interface FormSliderProps {
  label?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (e: { target: { name?: string; value: number } }) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const FormSlider = forwardRef<HTMLSpanElement, FormSliderProps>(
  ({ label, name, min = 0, max = 100, step = 1, value, defaultValue, onChange, disabled, error, className }, ref) => {
    
    const handleSliderChange = (event: Event, newValue: number | number[]) => {
      if (onChange) {
        onChange({
          target: {
            name,
            value: newValue as number,
          },
        });
      }
    };

    return (
      <FormControl error={!!error} fullWidth className={className}>
        {label && (
          <FormLabel className="text-xs font-semibold text-slate-400 mb-1 select-none">
            {label}
          </FormLabel>
        )}
        <Slider
          ref={ref}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          onChange={handleSliderChange}
          disabled={disabled}
          valueLabelDisplay="auto"
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }
);

FormSlider.displayName = "FormSlider";
