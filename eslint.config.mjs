import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".agents/**",
    ".docx_chuong_8_9_work/**",
    ".playwright-data/**",
    ".next/**",
    "blob-report/**",
    "node_modules/**",
    "out/**",
    "playwright-report/**",
    "test-results/**",
    "tmp/**",
    "dist/**",
    "prisma/**",
    "next-env.d.ts"
  ])
]);
