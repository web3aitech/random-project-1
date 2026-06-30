// Localize all external Wix/flagcdn assets referenced by public/.
// Downloads each unique URL to a deterministic local path and writes
// scripts/url-map.json (original URL -> site-root-relative path).
// Idempotent: skips files already on disk.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

// Captured from: grep -rhoE "https?://...(wixstatic|flagcdn)..." public/
const WIX_IMAGES = [
  "https://static.wixstatic.com/media/301116_06e8601574fd4b68ac7ca5f9be54f668~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/16.png",
  "https://static.wixstatic.com/media/301116_0b4c4fa6dda9464b92d8ca14ac233e87~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/22.png",
  "https://static.wixstatic.com/media/301116_0b4c4fa6dda9464b92d8ca14ac233e87~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/22.png",
  "https://static.wixstatic.com/media/301116_17eaa9f345f040f587510ce2927425d7~mv2.png/v1/fill/w_183,h_92,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ramada.png",
  "https://static.wixstatic.com/media/301116_215cbf4b7f54436b995910ae59cf3c67~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10.png",
  "https://static.wixstatic.com/media/301116_215cbf4b7f54436b995910ae59cf3c67~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10.png",
  "https://static.wixstatic.com/media/301116_26ecb86fd85d45408c17ad8d8518353c~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Website%20Photos%20(1).png",
  "https://static.wixstatic.com/media/301116_26ecb86fd85d45408c17ad8d8518353c~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Website%20Photos%20(1).png",
  "https://static.wixstatic.com/media/301116_3690230690394b629dc55375f8371e1b~mv2.png/v1/fill/w_183,h_92,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Brookdale.png",
  "https://static.wixstatic.com/media/301116_48291ea0228e493bac43d1dc2ce63615~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/8.png",
  "https://static.wixstatic.com/media/301116_5ad8a5c93d8d464e85bbf5ba924740a0~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/17.png",
  "https://static.wixstatic.com/media/301116_6f37d78ff72a433581c82b7870a33773~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/8.png",
  "https://static.wixstatic.com/media/301116_6f37d78ff72a433581c82b7870a33773~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11.png",
  "https://static.wixstatic.com/media/301116_7a015d0914f64485b0bdd9dbbbc90ca9~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9.png",
  "https://static.wixstatic.com/media/301116_7a015d0914f64485b0bdd9dbbbc90ca9~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9.png",
  "https://static.wixstatic.com/media/301116_7d3b2cf3a24547628dacbbdc262b8adb~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/4.png",
  "https://static.wixstatic.com/media/301116_8ef27b6706cd4708985229421e3710b8~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/23.png",
  "https://static.wixstatic.com/media/301116_8ef27b6706cd4708985229421e3710b8~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/23.png",
  "https://static.wixstatic.com/media/301116_94b92c19f8ed42648211695e7e93773c~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Website%20Hotel%20Photos%20(9).png",
  "https://static.wixstatic.com/media/301116_94b92c19f8ed42648211695e7e93773c~mv2.png/v1/fill/w_650,h_434,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Website%20Hotel%20Photos%20(9).png",
  "https://static.wixstatic.com/media/301116_9a40c2d6a42242ce9764e24943510f90~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/18.png",
  "https://static.wixstatic.com/media/301116_9b30c3d5a5f34c0489a521a8205bd2fc~mv2.png/v1/fill/w_183,h_92,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Hyatt.png",
  "https://static.wixstatic.com/media/301116_9caca1ff18ae46e38456d530944efbdf~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Website%20Hotel%20Photos%20(8).png",
  "https://static.wixstatic.com/media/301116_9e3b32a50ebe4cc5856dc728045aeb6b~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11.png",
  "https://static.wixstatic.com/media/301116_a2ea5c0900b54affbda62f972af6dbb9~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1.png",
  "https://static.wixstatic.com/media/301116_a3e4782099cc4320acd7b98377792f44~mv2.png/v1/fill/w_650,h_434,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/15.png",
  "https://static.wixstatic.com/media/301116_a496041565be4b589493abc837fce979~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/20.png",
  "https://static.wixstatic.com/media/301116_a496041565be4b589493abc837fce979~mv2.png/v1/fill/w_650,h_434,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/20.png",
  "https://static.wixstatic.com/media/301116_ad469b9247814a2ea1b5efd2fd816a9d~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/8.png",
  "https://static.wixstatic.com/media/301116_ae3d62129c82488bbc037ddab852861f~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/21.png",
  "https://static.wixstatic.com/media/301116_ae7ba35bc97f4a73896216d98373bcd5~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/6.png",
  "https://static.wixstatic.com/media/301116_af68fa766647416eabe900ad07c135f1~mv2.png/v1/fill/w_183,h_92,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Marriott.png",
  "https://static.wixstatic.com/media/301116_c1579af5feea407f9d2170c9b7c05bc4~mv2.png/v1/fill/w_760,h_620,al_c,q_85,enc_avif,quality_auto/301116_c1579af5feea407f9d2170c9b7c05bc4~mv2.png",
  "https://static.wixstatic.com/media/301116_ca1f3afbc18d4719afda3fda89ce8359~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/7.png",
  "https://static.wixstatic.com/media/301116_d3cb0363d31547b6a88e5f86e6782aae~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/4.png",
  "https://static.wixstatic.com/media/301116_df85ec2fd9224c84bf8e7ca12d5b374d~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1.png",
  "https://static.wixstatic.com/media/301116_df85ec2fd9224c84bf8e7ca12d5b374d~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1.png",
  "https://static.wixstatic.com/media/301116_e135c6ae2a1f41198810f14cebbee5ff~mv2.png/v1/fill/w_1600,h_900,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/3.png",
  "https://static.wixstatic.com/media/301116_e135c6ae2a1f41198810f14cebbee5ff~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/3.png",
  "https://static.wixstatic.com/media/301116_e6a43955df9b4588a13199d317fc1065~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/2.png",
  "https://static.wixstatic.com/media/301116_ebbb2af767df495ba9f2028f451b331b~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Website%20Hotel%20Photos%20(11).png",
  "https://static.wixstatic.com/media/301116_ef2425c836be409b9545f0511922fd35~mv2.png/v1/fill/w_183,h_92,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ritz-Carlon.png",
  "https://static.wixstatic.com/media/301116_fac7c6e7dc9c4d53a2f1fe23344fc4f2~mv2.png/v1/fill/w_634,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/5.png",
  "https://static.wixstatic.com/media/4a897a_0dcba096cafc415590fe348c827a0464~mv2.jpg/v1/fill/w_1600,h_900,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/person%20using%20an%20at%20home%20carpet%20cleaner.jpg",
  "https://static.wixstatic.com/media/4a897a_28cb34daf3c6442399b98492d662da75~mv2.jpg/v1/crop/x_0,y_0,w_599,h_661/fill/w_900,h_680,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/carpet%20foto%20(1).jpg",
  "https://static.wixstatic.com/media/4a897a_28cb34daf3c6442399b98492d662da75~mv2.jpg/v1/fill/w_1280,h_900,al_c,q_80,enc_avif,quality_auto/carpet%20foto%20(1).jpg",
  "https://static.wixstatic.com/media/4a897a_2e9772e4244e4aed8e77806f612d3b10~mv2.jpg/v1/fill/w_1600,h_900,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/POWER%20WASHING.jpg",
  "https://static.wixstatic.com/media/4a897a_728eeb48fe5343619b4f3b4830168206~mv2.jpg/v1/fill/w_1600,h_900,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Tile-Grout-Cleaning-Img.jpg",
  "https://static.wixstatic.com/media/4a897a_cba533645e94436ab686e1efd2eb94b4~mv2.jpg/v1/fill/w_1600,h_900,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Marble%20and%20Stone%20Restoration.jpg",
  "https://static.wixstatic.com/media/4a897a_eb4633910c014b9e8eec67b5160663c4~mv2.jpg/v1/fill/w_1600,h_900,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/cleaning-a-kitchen.jpg",
  "https://static.wixstatic.com/media/4a897a_fb16ec22c3c24d0aad62d83c8beac18e~mv2.png/v1/crop/x_0,y_286,w_4001,h_1602/fill/w_320,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logo%20Renue.png",
];

const WIX_VIDEOS = [
  "https://video.wixstatic.com/video/301116_16d270be6c9947dda7c625b304d63658/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_17948818ea8f41e1ac5dd31e472effb8/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_366010c4e71746fd9dfee1d47e027353/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_4c6ba57cccae439393d8e9f71fdf72a1/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_6059a581528f44749a721d9e63e122cf/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_ae0da606373e45a9beaa70e2f863e56d/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_b2e082b14c4440ce9db1afed1669beca/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_cbcbf624184f418e81bf1fdf1a3ccee4/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_d442e62eabb04f5dabc460ce8ada8f0e/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_de422631834e4b37bb6eaba3e6c2dcf9/720p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_f4bf11b8555e4cef8043ff073d266abc/360p/mp4/file.mp4",
  "https://video.wixstatic.com/video/301116_fab34532c2de4ceabcc61211a92fa1fd/360p/mp4/file.mp4",
];

const FLAGS = [
  "https://flagcdn.com/20x15/us.png",
  "https://flagcdn.com/20x15/fr.png",
  "https://flagcdn.com/20x15/es.png",
];

function extFromType(type, fallback) {
  if (type === 'image/avif') return 'avif';
  if (type === 'image/png') return 'png';
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg';
  if (type === 'video/mp4') return 'mp4';
  return fallback || 'bin';
}

function wixImagePath(url) {
  // /media/{MEDIA}/v1/.../fill/w_{W},h_{H},.../enc_avif,.../{NAME}
  const mediaMatch = url.match(/\/media\/([^/]+~mv2)\.(png|jpg|jpeg)/i);
  const sizeMatch = url.match(/fill\/w_(\d+),h_(\d+)/);
  if (!mediaMatch || !sizeMatch) {
    throw new Error(`cannot parse wix image url: ${url}`);
  }
  const id = mediaMatch[1];
  const w = sizeMatch[1];
  const h = sizeMatch[2];
  const encAvif = /enc_avif/.test(url);
  const ext = encAvif ? 'avif' : mediaMatch[2].toLowerCase().replace('jpeg', 'jpg');
  return `/assets/images/wix/${id}_${w}x${h}.${ext}`;
}

function wixVideoPath(url) {
  // /video/{ID}/{quality}/mp4/file.mp4
  const m = url.match(/\/video\/([^/]+)\/([^/]+)\/mp4\/file\.mp4/);
  if (!m) throw new Error(`cannot parse wix video url: ${url}`);
  return `/assets/videos/wix/${m[1]}_${m[2]}.mp4`;
}

function flagPath(url) {
  const m = url.match(/flagcdn\.com\/[^/]+\/([a-z]+)\.png/);
  if (!m) throw new Error(`cannot parse flag url: ${url}`);
  return `/assets/images/flags/${m[1]}.png`;
}

function publicPath(siteRel) { return resolve(PUBLIC, '.' + siteRel); }

async function fetchOne(url) {
  let res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('content-type') || '';
  return { buf, type };
}

async function ensure(url, siteRel, fallbackExt) {
  const disk = publicPath(siteRel);
  if (existsSync(disk)) return siteRel;
  mkdirSync(dirname(disk), { recursive: true });
  const { buf, type } = await fetchOne(url);
  // Re-derive ext from content-type if possible to be accurate.
  let final = siteRel;
  if (/\.(avif|png|jpg|mp4)$/.test(siteRel) === false || (type && extFromType(type) !== siteRel.split('.').pop())) {
    const got = extFromType(type, siteRel.split('.').pop());
    if (got !== siteRel.split('.').pop()) {
      final = siteRel.replace(/\.[^.]+$/, '.' + got);
    }
  }
  writeFileSync(publicPath(final), buf);
  return final;
}

const map = {};
const failures = [];

async function run(list, pathFn, label) {
  for (const url of list) {
    let siteRel;
    try { siteRel = pathFn(url); }
    catch (e) { failures.push({ url, error: e.message }); continue; }
    try {
      const final = await ensure(url, siteRel);
      map[url] = final;
      console.log(`OK  ${label}  ${url}\n -> ${final}`);
    } catch (e) {
      failures.push({ url, error: e.message });
      console.error(`FAIL ${label} ${url}: ${e.message}`);
    }
  }
}

await run(WIX_IMAGES, wixImagePath, 'img');
await run(WIX_VIDEOS, wixVideoPath, 'vid');
await run(FLAGS, flagPath, 'flag');

writeFileSync(resolve(__dirname, 'url-map.json'), JSON.stringify(map, null, 2));

console.log(`\nMapped ${Object.keys(map).length} URLs.`);
if (failures.length) {
  console.error(`\n${failures.length} failures:`);
  for (const f of failures) console.error(`  ${f.url} -> ${f.error}`);
  process.exit(1);
}
