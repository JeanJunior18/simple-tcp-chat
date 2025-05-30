import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  root: "src/renderer",
  base: "./",
  build: {
    outDir: "../../dist/renderer", // Mude para uma subpasta específica
    emptyOutDir: true, // Limpe apenas a pasta dist/renderer
    target: "esnext",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
