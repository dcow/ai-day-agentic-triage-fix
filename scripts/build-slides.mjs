import { Marp } from '@marp-team/marp-core';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const md = readFileSync(resolve(root, 'slides/slides.md'), 'utf8');

const marp = new Marp({ html: true });
const { html, css } = marp.render(md);

const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: 1280px 720px; margin: 0; }
  * { box-sizing: border-box; }
  ${css}
</style>
</head>
<body>
${html}
</body>
</html>`;

mkdirSync(resolve(root, 'public'), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });
await page.setContent(fullHtml, { waitUntil: 'networkidle' });
await page.pdf({
  path: resolve(root, 'public/slides.pdf'),
  width: '1280px',
  height: '720px',
  printBackground: true,
});
await browser.close();

console.log('Generated public/slides.pdf');
