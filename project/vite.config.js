import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host:'0.0.0.0',
    port: 5173,
    // port: 10000, // Set the default port to 3000
    strictPort: true, // This ensures Vite does not try to use a different port
  },
});
