import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { JSDOM } from 'jsdom';

// Load the dictionary the same way the browser does (global), then mimic the
// i18n.js walker to find English text nodes that would NOT be translated.
global.window = {};
await import('./public/assets/js/translations.js');
// translations.js sets window.RENUE_I18N_DICT in a browser; under node, it
// assigns to global.window — re-fetch it.
const dict = (global.window.RENUE_I18N_DICT);
const norm = s => String(s).trim().replace(/\s+/g,' ').replace(/[‘’‚‛]/g,"'").replace(/[“”„‟]/g,'"');
const ndict = {}; for (const k in dict) ndict[norm(k)] = dict[k];
const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','TEMPLATE','SVG','HEAD']);

function walkTree(dir){ for(const n of readdirSync(dir)){const p=join(dir,n);const s=statSync(p);if(s.isDirectory())walkTree(p);else if(n==='index.html')files.push(p);} }
const files=[]; walkTree('public');

// heuristic: a string is "English copy worth translating" if it has >=2
// consecutive ASCII letters and isn't pure data. We flag text nodes whose
// normalized value isn't a dict key.
function isEnglishCopy(s){
  if(!s) return false;
  if(ndict[s]) return false;
  // skip if mostly digits / punctuation / single tokens
  const letters = (s.match(/[A-Za-zA-zÀ-ÿ]/g)||[]).length;
  if(letters < 3) return false;
  // skip language names
  if(s==='English'||s==='Français') return false;
  // skip emails, urls, phones, addresses (heuristic)
  if(/^[\w.+-]+@[\w.-]+$/.test(s)) return false;
  if(/^www\./.test(s) || /^https?:/.test(s)) return false;
  if(/^\+?[\d (),\-./]+$/.test(s) && letters < 5) return false;
  // skip street addresses (contain a number then road/street/ave/blvd/etc.)
  if(/^\d+ .*(Road|Street|Avenue|Ave|Blvd|Boulevard|Drive|Dr|Lane|Ln|Court|Ct|Square|Sq|Highway|Hwy|Park|Way|Bend|Ridge)/.test(s)) return false;
  if(/^P\.?O\.? Box/.test(s)) return false;
  // skip person-name-only strings (2-3 capitalized words, no lowercase words)
  const words = s.split(' ');
  if(words.length>=2 && words.length<=4 && words.every(w=>/^[A-Z][a-zA-Z.'-]+$/.test(w)) ) return false;
  return true;
}

const remaining = new Map();
for(const f of files){
  let page = relative('public',f).split(sep).join('/').replace(/\/index\.html$/,'/').replace(/^index\.html$/,'/');
  const dom = new JSDOM(readFileSync(f,'utf8'),{contentType:'text/html'});
  const {document,NodeFilter}=dom.window;
  const tw=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n){ const p=n.parentNode; if(!p||SKIP.has(p.nodeName)||!n.nodeValue||!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; }
  });
  let n; while(n=tw.nextNode()){
    const k = norm(n.nodeValue);
    if(isEnglishCopy(k)){
      let e = remaining.get(k); if(!e){e={count:0,pages:new Set()};remaining.set(k,e);}
      e.count++; e.pages.add(page);
    }
  }
}
const arr=[...remaining.entries()].map(([k,v])=>({text:k,count:v.count,pages:[...v.pages]})).sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text));
console.log('REMAINING UNTRANSLATED ENGLISH STRINGS:',arr.length);
arr.forEach(e=>console.log(String(e.count).padStart(3)+"|"+e.text));
