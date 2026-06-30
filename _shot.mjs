import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox','--window-size=1280,1500']
});
const page = await browser.newPage();
await page.setViewport({width:1280, height:1500});
const errors = [];
page.on('console', m => { if (m.type()==='error') errors.push('CONSOLE: '+m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
await page.goto('http://localhost:4321/contact-us/', {waitUntil:'networkidle2', timeout:30000});
await page.evaluate(() => document.querySelector('#office-map')?.scrollIntoView({block:'center'}));
await new Promise(r=>setTimeout(r,1800));
const pinCount = await page.evaluate(() => document.querySelectorAll('.office-pin').length);
console.log('pins:', pinCount);
const map = await page.$('#office-map');
const box = await map.boundingBox();
await page.screenshot({path:'_tmp_map1.png', clip:{x:0,y:Math.max(0,box.y-30),width:1280,height:Math.min(700,box.height+60)}});
// hover a pin and screenshot tooltip
const p = await page.evaluate(()=>{ const pins=document.querySelectorAll('.office-pin'); if(!pins.length) return null; const r=pins[Math.floor(pins.length/2)].getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
if(p){ await page.mouse.move(p.x,p.y); await new Promise(r=>setTimeout(r,600));
  const tip = await page.$('.office-tooltip');
  let tipBox = null; if(tip){ tipBox = await tip.boundingBox(); }
  if(tipBox){ await page.screenshot({path:'_tmp_map2.png', clip:{x:Math.max(0,tipBox.x-40),y:Math.max(0,tipBox.y-20),width:Math.min(460,tipBox.width+120),height:tipBox.height+40}}); }
  else { await page.screenshot({path:'_tmp_map2.png', clip:{x:Math.max(0,p.x-260),y:Math.max(0,p.y-200),width:520,height:400}}); }
}
console.log('errors:', JSON.stringify(errors));
await browser.close();
