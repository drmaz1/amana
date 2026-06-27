import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Pure-logic unit tests run under Node by default (fast, no DOM).
    // Component tests can opt into jsdom with `// @vitest-environment jsdom`.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "tests/unit/**/*.test.{ts,tsx}",
      // DB integration tests; they self-skip when no database is reachable.
      "tests/integration/**/*.test.{ts,tsx}",
    ],
    passWithNoTests: true,
  },
});
