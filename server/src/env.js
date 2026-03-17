// Loads .env from the project root regardless of working directory.
// Import this as the FIRST import in any file that needs env vars.
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
