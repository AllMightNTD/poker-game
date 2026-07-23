"use client";

import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Custom dark theme optimized for Poker Game UI (Amber/Gold & Slate Dark)
const darkPokerTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F4B942", // Gold Accent
      contrastText: "#000000",
    },
    secondary: {
      main: "#10B981", // Emerald Green Accent
      contrastText: "#ffffff",
    },
    error: {
      main: "#EF4444", // Red Accent
    },
    warning: {
      main: "#F59E0B",
    },
    info: {
      main: "#3B82F6",
    },
    success: {
      main: "#10B981",
    },
    background: {
      default: "#050505", // Coal Dark
      paper: "#0B0F19",   // Slate-950/900 mix
    },
    text: {
      primary: "#E2E8F0",   // slate-200
      secondary: "#94A3B8", // slate-400
    },
  },
  typography: {
    fontFamily: "inherit", // Use application inherited font
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          fontWeight: 800,
          padding: "10px 20px",
          transition: "all 0.2s ease-in-out",
          "&:active": {
            transform: "scale(0.98)",
          },
          "&.MuiButton-containedPrimary": {
            background: "linear-gradient(135deg, #F4B942 0%, #D97706 100%)",
            color: "#000000",
            boxShadow: "0 4px 12px rgba(244, 185, 66, 0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, #F5C158 0%, #E88510 100%)",
              boxShadow: "0 6px 16px rgba(244, 185, 66, 0.3)",
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#0B0F19",
            borderRadius: "12px",
            transition: "border-color 0.2s, box-shadow 0.2s",
            "& fieldset": {
              borderColor: "#1E293B", // slate-800
            },
            "&:hover fieldset": {
              borderColor: "#334155", // slate-700
            },
            "&.Mui-focused fieldset": {
              borderColor: "#F4B942",
              boxShadow: "0 0 0 2px rgba(244, 185, 66, 0.15)",
            },
            "&.Mui-error fieldset": {
              borderColor: "#E23744",
            },
            "&.Mui-error:hover fieldset": {
              borderColor: "#E23744",
            },
            "&.Mui-error.Mui-focused fieldset": {
              borderColor: "#E23744",
              boxShadow: "0 0 0 2px rgba(226, 55, 68, 0.15)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#64748B", // slate-500
            "&.Mui-focused": {
              color: "#F4B942",
            },
            "&.Mui-error": {
              color: "#E23744",
            },
            "&.Mui-error.Mui-focused": {
              color: "#E23744",
            },
          },
          "& .MuiFormHelperText-root": {
            "&.Mui-error": {
              color: "#E23744",
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#475569", // slate-600
          "&.Mui-checked": {
            color: "#F4B942",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: 2,
            transitionDuration: "300ms",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: "#10B981",
                opacity: 1,
                border: 0,
              },
            },
          },
          "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            width: 22,
            height: 22,
          },
          "& .MuiSwitch-track": {
            borderRadius: 26 / 2,
            backgroundColor: "#334155",
            opacity: 1,
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#10B981", // Emerald theme for in-game slider
          height: 6,
        },
        thumb: {
          height: 20,
          width: 20,
          backgroundColor: "#fff",
          border: "2px solid currentColor",
          "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
            boxShadow: "inherit",
          },
          "&:before": {
            display: "none",
          },
        },
        track: {
          height: 6,
          borderRadius: 3,
        },
        rail: {
          height: 6,
          borderRadius: 3,
          backgroundColor: "#334155",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#0B0F19",
          borderRadius: "12px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1E293B",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#334155",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F4B942",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Disable default MUI overlay
        },
      },
    },
  },
});

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={darkPokerTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
