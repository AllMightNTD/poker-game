"use client";

import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { forwardRef } from "react";

export interface DateTimePickerProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export const DateTimePicker = forwardRef<any, DateTimePickerProps>(
  ({ label, error, value, onChange, name, disabled, className }, ref) => {
    console.log('value', value);

    // Parse value string to dayjs object, handle invalid or empty strings gracefully
    const parsedValue = value ? dayjs(value) : null;

    return (
      <div className={className}>
        <MuiDateTimePicker
          label={label}
          value={parsedValue}
          onChange={(newValue) => {
            if (onChange) {
              onChange({
                target: {
                  name,
                  value: newValue && dayjs(newValue).isValid() ? dayjs(newValue).toISOString() : "",
                },
              });
            }
          }}
          disabled={disabled}
          slotProps={{
            textField: {
              inputRef: ref,
              fullWidth: true,
              error: !!error,
              helperText: error,
              variant: "outlined",
              size: "small",
              // Ensure clicking anywhere in the input opens the picker modal
              onClick: (e) => e.stopPropagation(),
            },
          }}
        />
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";
