import puppeteer from 'puppeteer-core';
import fs from 'fs';

const SRC = 'C:/Users/prajw/OneDrive/Desktop/Pictures/random-project-1/source/official-current-website/Franchise Opportunities ｜ Renue Systems (6_30_2026 1：39：26 AM).html';
const OUT = 'C:/Users/prajw/OneDrive/Desktop/Pictures/random-project-1/_tmp_franchise_extract.json';
const IMGDIR = 'C:/Users/prajw/OneDrive/Desktop/Pictures/random-project-1/_tmp_franchise_imgs';
fs.mkdirSync(IMGDIR, {recursive:true});

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox','--disable-javascript']
});
const page = await browser.newPage();
page.setDefaultTimeout(60000);
// load raw HTML string, strip <script> tags so no JS hydration blanks SSR
let html = fs.readFileSync(SRC,'utf8');
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
await page.setContent(html, {waitUntil:'domcontentloaded', timeout:60000});
await new Promise(r=>setTimeout(r,800));

const data = await page.evaluate(() => {
  const res = {title: document.title, blocks: []};
  const main = document.querySelector('#SITE_MAIN') || document.body;
  const walk = (el) => {
    if (!el) return;
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        const t = n.textContent.replace(/\s+/g,' ').trim();
        if (t.length > 1) res.blocks.push(t);
      } else if (n.nodeType === 1) {
        const tag = n.tagName.toLowerCase();
        if (tag === 'style' || tag === 'script') return;
        walk(n);
      }
    });
  };
  walk(main);
  return res;
});

// dedupe consecutive
const seen = new Set();
const dedup = [];
for (const b of data.blocks) { if (!seen.has(b)) { seen.add(b); dedup.push(b); } }

// images: decode data URIs to files
let raw = fs.readFileSync(SRC,'utf8');
const imgInfos = [];
const re = /data:image\/(avif|png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)/g;
let m, idx=0;
while ((m = re.exec(raw))) {
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const b64 = m[2];
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 1500) continue; // skip tiny icons
  const name = `fr_img_${String(idx).padStart(2,'0')}.${ext}`;
  fs.writeFileSync(`${IMGDIR}/${name}`, buf);
  imgInfos.push({name, bytes: buf.length});
  idx++;
}

fs.writeFileSync(OUT, JSON.stringify({title:data.title, blocks:dedup, images:imgInfos}, null, 2));
console.log('text blocks:', dedup.length, 'images saved:', imgInfos.length);
await browser.close();
