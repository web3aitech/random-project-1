import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
function walk(d){let r=[];for(const n of readdirSync(d)){const p=join(d,n);const s=statSync(p);if(s.isDirectory())r=r.concat(walk(p));else if(n==='index.html')r.push(p);}return r;}
const tokens=new Set();
for(const f of walk('public')){
  const t=readFileSync(f,'utf8');
  const m=t.match(/[^\x00-\x7F]+/g)||[];
  m.forEach(x=>{ if(x.length<20) tokens.add(x); });
}
[...tokens].sort().forEach(x=>console.log(JSON.stringify(x), Buffer.from(x,'utf8').toString('hex')));
