import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      host : "0.0.0.0",
      watch: {
        usePolling: true,
      },
      "/api": {
        target: "http://backend:3000",
        secure: false,
        changeOrigin: true,
        withCredentials: true,
      },
    },
  },
});
