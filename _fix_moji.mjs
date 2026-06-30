import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
// Mojibake em-dash variants found in the HTML (as UTF-8 byte sequences).
const DOUBLE = Buffer.from('c383c692c382c2a2c383c2a2c3a2e282acc5a1c382c2acc383c2a2c3a2e2809ac2acc382c29d', 'hex').toString('utf8');
const SINGLE = Buffer.from('c3a2e282ace2809d', 'hex').toString('utf8'); // â€"
const EM = '—'; // —
function walk(d){let r=[];for(const n of readdirSync(d)){const p=join(d,n);const s=statSync(p);if(s.isDirectory())r=r.concat(walk(p));else if(n==='index.html')r.push(p);}return r;}
let touched=0;
for(const f of walk('public')){
  let t=readFileSync(f,'utf8');
  const before=t;
  t=t.split(DOUBLE).join(EM);
  t=t.split(SINGLE).join(EM);
  if(t!==before){ writeFileSync(f,t); touched++; console.log('fixed:',f); }
}
console.log('files fixed:',touched);
