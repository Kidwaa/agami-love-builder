import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@dnd-kit/core": path.resolve(__dirname, "./src/vendor/dnd-core.tsx"),
      "@dnd-kit/sortable": path.resolve(__dirname, "./src/vendor/dnd-sortable.tsx"),
      "@toast-ui/react-editor": path.resolve(__dirname, "./src/components/RichTextEditor.tsx"),
      "i18next": path.resolve(__dirname, "./src/vendor/i18next.ts"),
      "react-i18next": path.resolve(__dirname, "./src/vendor/react-i18next.tsx"),
    },
  },
}));
