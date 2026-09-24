import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const logo = (await readFile('public/icon-192.png')).toString('base64');
const font = (await readFile('src/assets/fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2')).toString('base64');
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:Satoshi;src:url(data:font/woff2;base64,${font}) format('woff2')}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#faf8f5;color:#172b40;font-family:Satoshi,Arial,sans-serif;padding:56px 72px;border-bottom:12px solid #1e90ff}
    header{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:750}img{width:60px;height:60px}header span{margin-left:auto;font-size:18px;background:#e2efff;color:#006bc7;padding:12px 22px;border-radius:30px;font-weight:600}
    h1{font-size:72px;line-height:1.08;letter-spacing:-3px;margin:44px 0 22px;font-weight:700}h1 strong{color:#087de0;font-weight:700}p{font-size:25px;max-width:900px;line-height:1.4;margin:0}footer{font-size:19px;color:#526477;margin-top:32px}
  </style></head><body><header><img src="data:image/png;base64,${logo}" alt="">Naitrust<span>Coming soon · Join early access</span></header><h1>Escrow payments.<br><strong>More confidence in every deal.</strong></h1><p>Clear terms, shared evidence and controlled payment release<br>for buyers and sellers in Nigeria.</p><footer>naitrust.com</footer></body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'public/og-image.png'});
} finally {await browser.close();}
