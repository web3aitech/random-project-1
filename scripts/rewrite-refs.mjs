// Rewrite all external Wix/flagcdn URLs in public/** to local /assets/... paths
// using scripts/url-map.json. Literal string replacement; exact-URL match only.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const map = JSON.parse(readFileSync(resolve(__dirname, 'url-map.json'), 'utf8'));

// Collect target text files: public/**/*.html, public/assets/css/*.css, public/assets/js/*.js
const targets = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(html|css|js)$/.test(name)) targets.push(p);
  }
}
walk(PUBLIC);

let totalReplacements = 0;
const filesTouched = [];

for (const file of targets) {
  let content = readFileSync(file, 'utf8');
  let count = 0;
  for (const [url, local] of Object.entries(map)) {
    if (content.includes(url)) {
      content = content.split(url).join(local);
      count++;
    }
  }
  if (count > 0) {
    writeFileSync(file, content);
    filesTouched.push(relative(ROOT, file).replace(/\\/g, '/'));
    totalReplacements += count;
  }
}

console.log(`Rewrote references in ${filesTouched.length} files (${totalReplacements} URL groups replaced).`);
console.log(filesTouched.map(f => '  ' + f).join('\n'));
