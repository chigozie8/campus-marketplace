import puppeteer from 'puppeteer-core';
const EXEC = '/tmp/chrome/chrome-headless-shell/linux-147.0.7727.57/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await puppeteer.launch({ executablePath: EXEC, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
await page.goto('http://localhost:5000/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r=>setTimeout(r, 5000));
const info = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('iframe').forEach(f => out.push({ tag:'iframe', id: f.id, cls: f.className, src: f.src, style: f.getAttribute('style') }));
  document.querySelectorAll('[id*="livechat" i], [class*="livechat" i], [id*="chat" i]').forEach(e => out.push({ tag:e.tagName, id:e.id, cls:e.className, style:e.getAttribute('style') }));
  // Any fixed bottom element
  document.querySelectorAll('body > *').forEach(e => {
    const cs = getComputedStyle(e);
    if (cs.position === 'fixed' && (parseInt(cs.bottom) < 150 || cs.bottom === '0px')) {
      out.push({ tag:e.tagName, id:e.id, cls:e.className, pos:'fixed-bottom', bottom: cs.bottom, right: cs.right, zIndex: cs.zIndex });
    }
  });
  return out;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
