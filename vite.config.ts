import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
  root: "./ui-src",
  plugins: [
    reactRefresh(),
    viteSingleFile(),
    {
      name: "remove-use-client",
      transform(code, id) {
        if (id.includes("node_modules/antd")) {
          return code.replace(/"use client";/g, "");
        }
        return code;
      },
    },
    react(),
  ],
  build: {
    target: "esnext",
    sourcemap: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    outDir: "../dist",
    rollupOptions: {
      // inlineDynamicImports: true,
    },
  },
});
