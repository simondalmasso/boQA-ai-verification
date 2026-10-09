'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const landing = fs.readFileSync(path.join(root, 'dashboard', 'index.html'), 'utf8');
const status = fs.readFileSync(path.join(root, 'dashboard', 'status', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dashboard', 'landing.css'), 'utf8');
const smoke = fs.readFileSync(path.join(root, 'scripts', 'browser-smoke-v1.js'), 'utf8');
const previewSmoke = fs.readFileSync(path.join(root, 'scripts', 'cloudflare-preview-smoke-v6.js'), 'utf8');
const browserWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'boqa-browser-smoke-v1.yml'), 'utf8');
const favicon = fs.readFileSync(path.join(root, 'dashboard', 'favicon.svg'), 'utf8');
const phageArt = fs.readFileSync(path.join(root, 'dashboard', 'phage-engraving.svg'), 'utf8');
const og = fs.readFileSync(path.join(root, 'dashboard', 'og-boqa.png'));
const ogSource = fs.readFileSync(path.join(root, 'dashboard', 'og-boqa-source.svg'), 'utf8');
const robots = fs.readFileSync(path.join(root, 'dashboard', 'robots.txt'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'dashboard', 'sitemap.xml'), 'utf8');

assert.match(landing, /<html\s+lang=["']en["']/i);
assert.match(landing, /<title>BOQA — Evidence before acceptance<\/title>/);
assert.match(landing, /rel=["']canonical["'][^>]+href=["']https:\/\/boqa\.simondalmasso44\.workers\.dev\/["']/);
assert.match(landing, /name=["']robots["'][^>]+content=["']index,follow["']/);
assert.match(landing, /release candidate<\/dt>/);
assert.match(landing, /v1\.5\.1 release candidate, not yet published/);
assert.doesNotMatch(landing, /current release<\/dt>/);
assert.match(landing, /name=["']description["'][^>]+content=["']BOQA verifies software changes with bounded scope, deterministic checks, HumanGate and reproducible evidence\.["']/i);
assert.match(landing, /rel=["']icon["'][^>]+href=["']\/favicon\.svg["']/i);
assert.match(landing, /property=["']og:image["'][^>]+content=["']https:\/\/boqa\.simondalmasso44\.workers\.dev\/og-boqa\.png["']/i);
assert.match(landing, /property=["']og:image:width["'][^>]+content=["']1200["']/i);
assert.match(landing, /property=["']og:image:height["'][^>]+content=["']630["']/i);
assert.match(landing, /name=["']twitter:card["'][^>]+content=["']summary_large_image["']/i);

assert.match(landing, />BOQA<\/span>/);
assert.match(landing, /Evidence before(?:<br>|\s+)acceptance\./);
assert.match(landing, /Codex proposes\.(?:<br>|\s*)BOQA verifies\./);
assert.match(landing, /Software changes pass through bounded scope, deterministic checks and HumanGate\./);
assert.match(landing, /Every accepted result points back to the revision and evidence that support it\./);
assert.match(landing, /MODEL_OUTPUT\s*!=\s*AUTHORIZATION/);

for (const label of ['How it works', 'Evidence', 'Safe demo', 'GitHub', 'v1.5.1']) {
  assert(landing.includes(`>${label}<`), 'missing header navigation label: ' + label);
}
assert.match(landing, /href=["']#how-it-works["']/);
assert.match(landing, /href=["']#evidence["']/);
assert.match(landing, /href=["']#safe-demo["']/);

for (const [label, href] of [
  ['View GitHub', 'https://github.com/simondalmasso/boqa'],
  ['Run safe demo', '#safe-demo'],
  ['System status', '/status/'],
  ['v1.5.1', 'https://github.com/simondalmasso/boqa/releases/tag/v1.5.1'],
]) {
  assert(landing.includes(`>${label}<`), 'missing visible link label: ' + label);
  assert(landing.includes(`href="${href}"`), 'missing href: ' + href);
}

const traceStart = landing.indexOf('class="verification-trace"');
const traceEnd = landing.indexOf('</aside>', traceStart);
assert(traceStart >= 0 && traceEnd > traceStart, 'verification trace must remain in the method section');
const trace = landing.slice(traceStart, traceEnd);
for (const label of ['MODEL', 'CUORE', 'POLICY / SCOPE', 'HUMANGATE', 'EXECUTE', 'VERIFY', 'EVIDENCE']) {
  assert(trace.includes(label), 'missing trace stage: ' + label);
}
for (const evidence of ['v1.5.1', 'exact-head', 'target_asset_network_requests=0']) {
  assert(trace.includes(evidence), 'missing verified evidence: ' + evidence);
}
assert.match(trace, /browser[\s\S]*PASS/i, 'missing browser PASS evidence');
assert.match(trace, /docker[\s\S]*PASS/i, 'missing docker PASS evidence');

assert.match(landing, /A result needs a record\. Not a promise\./);
for (const label of ['BOUND AUTHORITY', 'FAIL CLOSED', 'PROVE THE RESULT']) {
  assert(landing.includes(label), 'missing Why BOQA block: ' + label);
}
assert.match(landing, /id=["']how-it-works["']/);
assert.match(landing, /id=["']evidence["']/);
assert.match(landing, /npm ci/);
assert.match(landing, /npm run demo:cuore/);
assert.match(landing, /Fixture-only/);
assert.match(landing, /No external targets/);
assert.match(landing, /No submission/);
assert.match(landing, /No signing/);
assert.match(landing, /No spend/);
assert.match(landing, /target_asset_network_requests=0/);
assert(landing.includes('Read the demo source'), 'missing demo source CTA');

for (const boundary of [
  'expand its own scope',
  'scan unauthorized targets',
  'treat model output as proof',
  'auto-submit sensitive findings',
  'sign or spend without explicit authority',
]) {
  assert(landing.toLowerCase().includes(boundary), 'missing safety boundary: ' + boundary);
}

for (const href of [
  'https://github.com/simondalmasso/boqa',
  'https://github.com/simondalmasso/boqa/blob/main/README.md',
  'https://github.com/simondalmasso/boqa/blob/main/SECURITY.md',
  'https://github.com/simondalmasso/boqa/blob/main/CONTRIBUTING.md',
  'https://github.com/simondalmasso/boqa/blob/main/LICENSE',
  'https://github.com/simondalmasso/boqa/blob/main/scripts/demo-cuore-fixtures.js',
  'https://github.com/simondalmasso/boqa/releases/tag/v1.5.1',
  '/status/',
]) {
  assert(landing.includes(`href="${href}"`), 'missing project link: ' + href);
}

assert.doesNotMatch(landing, /<script\b/i, 'landing must not require client JavaScript');
assert.doesNotMatch(landing, /bounty hunter|money-making|autonomous pentester|trading\/payment|users served|uptime percentage/i);
assert.match(landing, /href=["']\/landing\.css["']/);
assert.match(landing, /src=["']\/phage-engraving\.svg["']/);
assert.match(landing, /class=["']phage-figure["']/);
assert.match(landing, /class=["']hero-band["']/);
assert.doesNotMatch(landing, /10\+|3\s*[×x]|100%|terapias|eficacia|AI-powered/i, 'no invented scientific/product claims');

assert.match(status, /id=["']overall-state["']/);
assert.match(status, /id=["']hunter-state["']/);
assert.match(status, /<script\s+src=["']\/dashboard-state\.js["']\s+defer><\/script>/);
assert.match(status, /<script\s+src=["']\/app\.js["']\s+defer><\/script>/);

assert.doesNotMatch(css, /@import|https?:\/\//i, 'landing must not load remote visual dependencies');
assert.match(css, /prefers-reduced-motion:\s*reduce/i);
assert.match(css, /:focus-visible/);
assert.match(css, /overflow-wrap:\s*anywhere|word-break:\s*break-word/i);
assert.match(css, /@media\s*\(max-width:\s*640px\)/i);
assert.match(css, /\.verification-trace/);
assert.match(css, /@keyframes\s+authority-progress/i);
assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none/i);

assert.match(favicon, /<svg[^>]+viewBox=["']0 0 32 32["']/);
assert.doesNotMatch(favicon, /(?:href|src)=["']https?:\/\//i, 'favicon must not load remote resources');
assert.match(phageArt, /<svg[^>]+viewBox=["']0 0 680 680["']/);
assert.match(phageArt, /Bacteriophage technical drawing/);
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Disallow: \/api\//);
assert.match(robots, /Sitemap: https:\/\/boqa\.simondalmasso44\.workers\.dev\/sitemap\.xml/);
assert.match(sitemap, /<loc>https:\/\/boqa\.simondalmasso44\.workers\.dev\/<\/loc>/);
assert.doesNotMatch(sitemap, /https:\/\/[^<]*\/(?:api|private|cobros)/i);
assert.doesNotMatch(phageArt, /(?:href|src)=["']https?:\/\//i, 'phage illustration must be local');
assert.match(css, /--bg:\s*#fbfbfa/i, 'light monochrome color system required');

assert.equal(og[0], 0x89);
assert.equal(og.toString('ascii', 1, 4), 'PNG');
assert.equal(og.readUInt32BE(16), 1200, 'OG image width must be 1200');
assert.equal(og.readUInt32BE(20), 630, 'OG image height must be 630');
assert.match(ogSource, /v1\.5\.1/);
assert.doesNotMatch(ogSource, /v1\.5\.0/);
assert.doesNotMatch(ogSource, /v1\.4\.0/);
assert.match(ogSource, /MODEL_OUTPUT != AUTHORIZATION/);
assert.match(ogSource, /Codex proposes\./);
assert.match(ogSource, /BOQA verifies\./);

assert.match(smoke, /\['\/status',\s*'dashboard\/status\/index\.html'\]/);
assert.match(smoke, /\['\/status\/',\s*'dashboard\/status\/index\.html'\]/);
assert.match(smoke, /async function landingSmoke\(/);
assert.match(smoke, /async function statusSmoke\(/);
assert.match(smoke, /Evidence before acceptance\./);
assert.match(smoke, /width:\s*430,\s*height:\s*900/);
assert.match(previewSmoke, /Evidence before acceptance\./);
assert.match(previewSmoke, /width:\s*430,\s*height:\s*900/);
assert.match(smoke, /og-boqa\.png/);
assert.match(smoke, /naturalWidth[\s\S]*1200/);
assert.match(smoke, /naturalHeight[\s\S]*630/);
assert.match(browserWorkflow, /mobile-430\.png/);

console.log('OSS landing polish contract: PASS');
