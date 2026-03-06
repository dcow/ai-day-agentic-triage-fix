#!/usr/bin/env node
import { execSync } from "child_process";
import { writeFileSync, chmodSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const realChrome = require("puppeteer").executablePath();

// marp-cli has no way to pass arbitrary Chrome flags, so wrap the binary.
// --no-sandbox: required in containers where setuid sandbox is unavailable.
// --disable-dev-shm-usage: /dev/shm is tiny in most CI/serverless envs;
//   without this Chrome crashes immediately writing its IPC socket.
const wrapper = join(tmpdir(), "chrome-wrapper.sh");
writeFileSync(
  wrapper,
  `#!/bin/sh\nexec "${realChrome}" --no-sandbox --disable-dev-shm-usage "$@"\n`
);
chmodSync(wrapper, 0o755);

execSync(
  `marp slides/slides.md --pdf --allow-local-files --no-stdin --browser-path="${wrapper}" -o public/slides.pdf`,
  { stdio: "inherit" }
);
