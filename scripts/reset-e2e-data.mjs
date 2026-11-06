import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const fixtureDirectory = path.join(projectRoot, "tests", "fixtures", "data");
const configuredDataDirectory = process.env.TASKFLOW_DATA_DIR?.trim();
const dataDirectory = configuredDataDirectory
  ? path.resolve(projectRoot, configuredDataDirectory)
  : path.join(projectRoot, ".playwright-data");
const relativeDataDirectory = path.relative(projectRoot, dataDirectory);

if (
  relativeDataDirectory === "" ||
  relativeDataDirectory.startsWith(`..${path.sep}`) ||
  path.isAbsolute(relativeDataDirectory)
) {
  throw new Error(
    "TASKFLOW_DATA_DIR của E2E phải là một thư mục con trong dự án."
  );
}

await mkdir(dataDirectory, { recursive: true });

for (const fileName of ["users.json", "tasks.json"]) {
  await copyFile(
    path.join(fixtureDirectory, fileName),
    path.join(dataDirectory, fileName)
  );
}

console.log(`Đã đặt lại dữ liệu E2E tại ${dataDirectory}`);
