import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["../shared/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@shared/leave-validation": path.resolve(
        __dirname,
        "../shared/leave-validation/index.ts",
      ),
    },
  },
});
