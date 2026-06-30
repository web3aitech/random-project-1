import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { JSDOM } from 'jsdom';

const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','TEMPLATE','SVG','HEAD']);
const ATTRS = ['placeholder','alt','aria-label','title','content','value'];
function walkTree(dir){ for(const n of readdirSync(dir)){const p=join(dir,n);const s=statSync(p);if(s.isDirectory())walkTree(p);else if(n==='index.html')files.push(p);} }
const files=[]; walkTree('public');

const map=new Map(), attrMap=new Map();
function add(m,key,page){ if(!key)return; key=key.trim().replace(/\s+/g,' '); if(!key)return; let e=m.get(key); if(!e){e={count:0,pages:new Set()};m.set(key,e);} e.count++; e.pages.add(page); }

for(const f of files){
  let page=relative('public',f).split(sep).join('/').replace(/\/index\.html$/,'/').replace(/^index\.html$/,'/');
  const dom=new JSDOM(readFileSync(f,'utf8'),{contentType:'text/html'});
  const {document,NodeFilter}=dom.window;
  if(document.querySelector('title')) add(map, document.querySelector('title').textContent, page);
  const tw=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n){ const p=n.parentNode; if(!p||SKIP.has(p.nodeName)||!n.nodeValue||!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; }
  });
  let n; while(n=tw.nextNode()) add(map, n.nodeValue, page);
  for(const el of document.querySelectorAll('[placeholder],[alt],[aria-label],[title],[content],[value]')){
    for(const a of ATTRS){ if(el.hasAttribute(a)) add(attrMap, el.getAttribute(a), page); }
  }
}
function arr(m){ return [...m.entries()].map(([k,v])=>({text:k,count:v.count,pages:[...v.pages]})).sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text)); }
const textArr=arr(map), attrArr=arr(attrMap);
writeFileSync('_i18n_text.json',JSON.stringify(textArr,null,1));
writeFileSync('_i18n_attrs.json',JSON.stringify(attrArr,null,1));
console.log('PAGES:',files.length,'| UNIQUE TEXT:',textArr.length,'| UNIQUE ATTR:',attrArr.length);
console.log('\n--- Top 80 text by frequency ---');
textArr.slice(0,80).forEach(e=>console.log(String(e.count).padStart(3),'|',e.text.slice(0,110)));
console.log('\n--- Top 40 attrs by frequency ---');
attrArr.slice(0,40).forEach(e=>console.log(String(e.count).padStart(3),'|',e.text.slice(0,100)));
