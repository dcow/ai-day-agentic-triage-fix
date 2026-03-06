#!/usr/bin/env node
import { execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const chromePath = require("puppeteer").executablePath();

execSync(
  `marp slides/slides.md --pdf --allow-local-files --no-stdin --browser-path="${chromePath}" -o public/slides.pdf`,
  {
    stdio: "inherit",
    env: { ...process.env, CHROME_NO_SANDBOX: "1" },
  }
);
