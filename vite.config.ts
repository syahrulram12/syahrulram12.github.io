import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/web-base-nfc",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
