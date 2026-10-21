// Builds the published site into dist/.
// The trip page (src/trip.html) is encrypted with TRIP_PASSWORD (set in Netlify,
// never committed). Without a password, the site publishes a "not set up" screen
// so the trip is never published unlocked.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = 'dist';
const SALT = 'peru-trip/zesty-lily/2026'; // fixed, so a remembered unlock survives updates
const ITER = 310000;
const password = (process.env.TRIP_PASSWORD || '').trim();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const f of ['manifest.json', 'sw.js', 'robots.txt', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) {
  fs.copyFileSync(f, path.join(OUT, f));
}

let payload = 'null';
if (password) {
  const key = crypto.pbkdf2Sync(password, SALT, ITER, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const html = fs.readFileSync('src/trip.html');
  const data = Buffer.concat([c.update(html), c.final(), c.getAuthTag()]);
  payload = JSON.stringify({ iv: iv.toString('base64'), data: data.toString('base64') });
  console.log('Encrypted trip page (' + html.length + ' bytes).');
} else {
  console.log('TRIP_PASSWORD is not set: publishing the "not set up" screen only.');
}

const shell = fs.readFileSync('src/lock.html', 'utf8')
  .replace('__PAYLOAD__', payload)
  .replace('__SALT__', JSON.stringify(SALT))
  .replace('__ITER__', String(ITER));
fs.writeFileSync(path.join(OUT, 'index.html'), shell);
console.log('Built dist/.');
