// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        // Ghi đè font sans mặc định bằng Roboto
        sans: ["var(--font-roboto)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primary: "#FB9EC4",
      },
    },
  },
  // ... các cấu hình khác
};
export default config;
