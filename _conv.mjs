import puppeteer from 'puppeteer-core';
import fs from 'fs';
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
const p = await b.newPage();
for (const f of fs.readdirSync('_tmp_franchise_imgs').filter(x=>x.endsWith('.avif'))) {
  const buf = fs.readFileSync('_tmp_franchise_imgs/'+f);
  const dataurl = 'data:image/avif;base64,'+buf.toString('base64');
  await p.setContent(`<img id=i src="${dataurl}"><canvas id=c></canvas>`);
  const dim = await p.evaluate(async (d)=>{const img=document.getElementById('i'); await img.decode(); const c=document.getElementById('c'); c.width=img.naturalWidth;c.height=img.naturalHeight; c.getContext('2d').drawImage(img,0,0); return {w:img.naturalWidth,h:img.naturalHeight,data:c.toDataURL('image/png')};}, dataurl);
  const png = Buffer.from(dim.data.split(',')[1],'base64');
  fs.writeFileSync('_tmp_franchise_imgs/'+f.replace('.avif','_view.png'), png);
  console.log(f, dim.w+'x'+dim.h);
}
await b.close();
