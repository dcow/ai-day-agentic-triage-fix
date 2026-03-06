#!/usr/bin/env node
import { execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const chromePath = require("puppeteer").executablePath();

execSync(
  `marp slides/slides.md --pdf --allow-local-files --no-stdin -o public/slides.pdf`,
  {
    env: { ...process.env, CHROME_PATH: chromePath },
    stdio: "inherit",
  }
);
