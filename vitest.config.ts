import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

// Os testes E2E (tests/e2e) rodam com o Playwright, não com o Vitest.
// npm run test:unit         -> só o projeto "unit"
// npm run test:integration  -> só o projeto "integration"
// npm test                  -> os dois
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "tests/e2e/**"],
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
        },
      },
    ],
  },
});
