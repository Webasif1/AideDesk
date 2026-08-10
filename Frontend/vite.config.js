import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://backend:3000",
        secure: false,
        changeOrigin: true,
        withCredentials: true,
      },
      // Proxy Socket.IO (HTTP polling + WebSocket upgrade) to the backend so the
      // client can connect to the same origin as the app.
      "/socket.io": {
        target: "http://backend:3000",
        ws: true,
        changeOrigin: true,
      },
      // Ticket attachments are served straight from the backend's disk, not
      // built into the frontend bundle.
      "/uploads": {
        target: "http://backend:3000",
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
