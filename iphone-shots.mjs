import puppeteer from 'puppeteer-core';
import fs from 'fs';

const EXEC = '/tmp/chrome/chrome-headless-shell/linux-147.0.7727.57/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = process.env.BASE || 'http://localhost:5000';
const OUT = 'screenshots';
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  ['home', '/'],
  ['browse', '/browse'],
  ['categories', '/categories'],
  ['pricing', '/pricing'],
  ['help', '/help'],
  ['signup', '/signup'],
  ['login', '/login'],
  ['about', '/about'],
];

const browser = await puppeteer.launch({
  executablePath: EXEC,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();

// iPhone 15 Pro Max
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

for (const [name, path] of pages) {
  const url = BASE + path;
  console.log('→', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    await new Promise(r => setTimeout(r, 1500));
    const file = `${OUT}/iphone15pm-${name}.jpg`;
    await page.screenshot({ path: file, type: 'jpeg', quality: 85, fullPage: true });
    console.log('  saved', file);
  } catch (e) {
    console.log('  ERR', e.message);
  }
}

await browser.close();
console.log('done');
