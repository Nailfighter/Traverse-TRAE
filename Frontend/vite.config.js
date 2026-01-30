import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["gcp-metadata"],
  },
  server: {
    host: true,
    allowedHosts: ["traverse.shreyansh-dev.app", "localhost","desktop-q12pvon.taila346ae.ts.net"],
    port: 5173,
  },
});
