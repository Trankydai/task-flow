import { execFileSync } from "node:child_process";

export default function globalSetup() {
  execFileSync(process.execPath, ["scripts/reset-e2e-data.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      TASKFLOW_DATA_DIR: ".playwright-data"
    },
    stdio: "inherit"
  });
}
