import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always cached
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // PDF generation — only needed in resume editor
          "vendor-pdf": ["jspdf", "html2canvas", "pdfjs-dist"],
          // Charts — only needed in dashboard/analytics
          "vendor-charts": ["recharts"],
          // Form & validation utilities
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
    // Increase chunk size warning threshold (jsPDF is legitimately large)
    chunkSizeWarningLimit: 600,
  },
}));
