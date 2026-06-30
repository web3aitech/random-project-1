import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { JSDOM } from 'jsdom';
globalThis.window = {};
await import('./public/assets/js/translations.js');
const dict = globalThis.window.RENUE_I18N_DICT;
const norm = s => String(s).trim().replace(/\s+/g,' ').replace(/['']/g,"'").replace(/[""]/g,'"');
const ndict = {}; for (const k in dict) ndict[norm(k)] = dict[k];
const ATTRS = ['placeholder','alt','aria-label','title','content'];
const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','TEMPLATE','SVG','HEAD']);
function walkTree(dir){ for(const n of readdirSync(dir)){const p=join(dir,n);const s=statSync(p);if(s.isDirectory())walkTree(p);else if(n==='index.html')files.push(p);} }
const files=[]; walkTree('public');
const remaining = new Map();
function add(s,page){ if(!s||!s.trim())return; const k=norm(s); if(ndict[k])return; const letters=(s.match(/[A-Za-z]/g)||[]).length; if(letters<3)return; if(/^[\w.+-]+@[\w.-]+$/.test(s))return; if(/^www\.|https?:/.test(s))return; if(/^[\d.,()/+\- ]+$/.test(s))return; if(s==='US'||s==='FR'||s==='EN')return; let e=remaining.get(k);if(!e){e={count:0,pages:new Set()};remaining.set(k,e);}e.count++;e.pages.add(page); }
for(const f of files){
  let page = relative('public',f).split(sep).join('/').replace(/\/index\.html$/,'/').replace(/^index\.html$/,'/');
  const dom = new JSDOM(readFileSync(f,'utf8'),{contentType:'text/html'});
  const {document}=dom.window;
  const t=document.querySelector('title'); if(t) add(t.textContent, page);
  for(const m of document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[property="og:title"]')) add(m.getAttribute('content'), page);
  for(const el of document.querySelectorAll('[placeholder],[alt],[aria-label],[title],[content]')){
    if(SKIP.has(el.nodeName)) continue;
    for(const a of ATTRS){ if(el.hasAttribute(a)) add(el.getAttribute(a), page); }
  }
}
const arr=[...remaining.entries()].map(([k,v])=>({text:k,count:v.count})).sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text));
console.log('REMAINING ATTR/TITLE/META:',arr.length);
arr.forEach(e=>console.log(String(e.count).padStart(3)+'|'+e.text.slice(0,120)));
