import { defineConfig, mergeConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"
import viteConfig from "./vite.config"

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/cypress/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "tests/e2e/**",
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
  }),
)
