import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
	root: "./ui-src",
	plugins: [reactRefresh(), viteSingleFile()],
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
