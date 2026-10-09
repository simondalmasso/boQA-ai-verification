'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'output', 'browser-smoke');
const BACKEND_PORT = 7070;
const EDGE_PORT = 8787;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const EDGE_URL = `http://localhost:${EDGE_PORT}`;
const HEAD_SHA = process.env.BOQA_HEAD_SHA || process.env.GITHUB_SHA || 'local';
const startedAt = new Date().toISOString();

fs.rmSync(OUTPUT, { recursive: true, force: true });
fs.mkdirSync(OUTPUT, { recursive: true });

function secret() {
  return crypto.randomBytes(32).toString('base64url');
}

function appendLog(file, chunk) {
  fs.appendFileSync(path.join(OUTPUT, file), String(chunk));
}

function loadWorker() {
  const source = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8');
  const transformed = source.replace(/export\s+default\s+\{/, 'globalThis.__boqaWorker = {');
  if (transformed === source) throw new Error('WORKER_EXPORT_NOT_FOUND');
  const context = vm.createContext({
    console,
    crypto: crypto.webcrypto,
    TextEncoder,
    TextDecoder,
    URL,
    Request,
    Response,
    Headers,
    fetch,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(transformed, context, { filename: 'worker.js' });
  if (!context.__boqaWorker || typeof context.__boqaWorker.fetch !== 'function') {
    throw new Error('WORKER_HANDLER_UNAVAILABLE');
  }
  return context.__boqaWorker;
}

function assetResponse(request) {
  const pathname = new URL(request.url).pathname;
  const files = new Map([
    ['/', 'dashboard/index.html'],
    ['/index.html', 'dashboard/index.html'],
    ['/landing.css', 'dashboard/landing.css'],
    ['/phage-engraving.svg', 'dashboard/phage-engraving.svg'],
    ['/robots.txt', 'dashboard/robots.txt'],
    ['/sitemap.xml', 'dashboard/sitemap.xml'],
    ['/favicon.svg', 'dashboard/favicon.svg'],
    ['/og-boqa.png', 'dashboard/og-boqa.png'],
    ['/status', 'dashboard/status/index.html'],
    ['/status/', 'dashboard/status/index.html'],
    ['/style.css', 'dashboard/style.css'],
    ['/dashboard-state.js', 'dashboard/dashboard-state.js'],
    ['/app.js', 'dashboard/app.js'],
  ]);
  const relative = files.get(pathname);
  if (!relative) return new Response('not found', { status: 404 });
  const extension = path.extname(relative);
  const contentType = extension === '.html' ? 'text/html; charset=utf-8'
    : extension === '.css' ? 'text/css; charset=utf-8'
      : extension === '.js' ? 'application/javascript; charset=utf-8'
        : extension === '.svg' ? 'image/svg+xml'
          : extension === '.png' ? 'image/png'
            : 'application/octet-stream';
  return new Response(fs.readFileSync(path.join(ROOT, relative)), {
    status: 200,
    headers: { 'Content-Type': contentType },
  });
}

async function createEdgeServer(env) {
  const worker = loadWorker();
  const server = http.createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const headers = new Headers();
      for (let index = 0; index < req.rawHeaders.length; index += 2) {
        headers.append(req.rawHeaders[index], req.rawHeaders[index + 1]);
      }
      const init = { method: req.method, headers };
      if (!['GET', 'HEAD'].includes(req.method) && body.length) init.body = body;
      const request = new Request(`${EDGE_URL}${req.url}`, init);
      const response = await worker.fetch(request, env);
      res.statusCode = response.status;
      res.statusMessage = response.statusText;
      const setCookies = typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : [];
      for (const [name, value] of response.headers.entries()) {
        if (name.toLowerCase() !== 'set-cookie') res.setHeader(name, value);
      }
      if (setCookies.length) res.setHeader('Set-Cookie', setCookies);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      appendLog('edge.log', `${error.stack || error}\n`);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'edge_harness_error' }));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(EDGE_PORT, '127.0.0.1', resolve);
  });
  return server;
}

async function waitForHealthy(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let last = 'not_started';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      const payload = await response.json();
      last = `${response.status}:${JSON.stringify(payload)}`;
      if (response.ok && payload.status === 'ok' && payload.hunter?.state === 'ACTIVE') return payload;
    } catch (error) {
      last = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`BACKEND_NOT_HEALTHY:${last}`);
}

function isExpectedAuthConsoleError(text) {
  return /^Failed to load resource: the server responded with a status of (401 \(Unauthorized\)|403 \(Forbidden\))$/.test(text);
}

function wireDiagnostics(page, result, options = {}) {
  page.on('pageerror', (error) => result.page_errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (options.allowExpectedAuthErrors && isExpectedAuthConsoleError(text)) {
      result.expected_auth_console_errors.push(text);
      return;
    }
    result.console_errors.push(text);
  });
}

async function landingSmoke(browser, viewport, label) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const result = { label, viewport, page_errors: [], console_errors: [] };
  wireDiagnostics(page, result);

  const response = await page.goto(EDGE_URL, { waitUntil: 'networkidle' });
  assert(response && response.ok(), `${label}:LANDING_NAVIGATION_FAILED`);

  assert.equal(await page.locator('h1').count(), 1, `${label}:H1_COUNT`);
  assert.equal(await page.locator('.phage-figure img').count(), 1, `${label}:PHAGE_ART_MISSING`);
  assert.equal(await page.locator('.phage-figure img').getAttribute('src'), '/phage-engraving.svg');
  const heroTitle = (await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim();
  assert.equal(heroTitle, 'Evidence before acceptance.');
  const thesis = (await page.locator('.thesis').innerText()).replace(/\s+/g, ' ').trim();
  assert.equal(thesis, 'Codex proposes. BOQA verifies.');
  assert.equal(await page.getByText('MODEL_OUTPUT != AUTHORIZATION', { exact: true }).isVisible(), true);
  assert.equal(await page.getByRole('link', { name: 'View GitHub', exact: true }).isVisible(), true);
  assert.equal(await page.getByRole('link', { name: 'Run safe demo', exact: true }).isVisible(), true);
  assert.equal(await page.getByRole('link', { name: 'System status', exact: true }).first().isVisible(), true);
  assert.equal(await page.locator('#safe-demo').count(), 1);
  const og = await page.evaluate(() => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight });
    image.onerror = () => reject(new Error('OG_IMAGE_DECODE_FAILED'));
    image.src = '/og-boqa.png?browser-smoke=1';
  }));
  assert.equal(og.naturalWidth, 1200, `${label}:OG_WIDTH`);
  assert.equal(og.naturalHeight, 630, `${label}:OG_HEIGHT`);
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('header').count() > 0, true);
  assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true, `${label}:REDUCED_MOTION_NOT_EMULATED`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${label}:HORIZONTAL_OVERFLOW`);

  const firstViewport = await page.locator('.hero').boundingBox();
  assert(firstViewport && firstViewport.y < viewport.height, `${label}:HERO_OUTSIDE_FIRST_VIEWPORT`);
  const invariant = await page.locator('.invariant').boundingBox();
  assert(invariant && invariant.y < viewport.height, `${label}:INVARIANT_OUTSIDE_FIRST_VIEWPORT`);

  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), true, `${label}:SKIP_LINK_NOT_FOCUSABLE`);

  const overflowAtDoubleText = await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    const ok = document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    document.documentElement.style.fontSize = '';
    return ok;
  });
  assert.equal(overflowAtDoubleText, true, `${label}:HORIZONTAL_OVERFLOW_200_PERCENT_TEXT`);

  assert.equal(result.page_errors.length, 0, `${label}:PAGEERROR:${result.page_errors.join('|')}`);
  assert.equal(result.console_errors.length, 0, `${label}:CONSOLE:${result.console_errors.join('|')}`);
  await page.screenshot({ path: path.join(OUTPUT, `${label}.png`), fullPage: true });

  result.first_viewport = true;
  result.github_visible = true;
  result.safe_demo_visible = true;
  result.system_status_visible = true;
  result.model_output_not_authorization_visible = true;
  result.horizontal_overflow = false;
  result.horizontal_overflow_200_percent = false;
  result.reduced_motion = true;
  await context.close();
  return result;
}

async function statusSmoke(browser, viewport, label) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const result = { label, viewport, page_errors: [], console_errors: [] };
  wireDiagnostics(page, result);
  const response = await page.goto(EDGE_URL + '/status/', { waitUntil: 'networkidle' });
  assert(response && response.ok(), `${label}:PUBLIC_NAVIGATION_FAILED`);
  await page.waitForFunction(() => document.getElementById('overall-state')?.textContent === 'FRESH', null, { timeout: 20_000 });
  assert.equal(await page.locator('#hunter-state').textContent(), 'ACTIVE');
  assert.equal(await page.locator('#health-status').textContent(), 'ok');
  assert.equal(await page.locator('#hunter-source').textContent(), '/api/hunter/status');
  assert.equal(await page.locator('#health-source').textContent(), '/api/health');
  assert.equal(await page.locator('#overall-state').getAttribute('data-state'), 'FRESH');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${label}:HORIZONTAL_OVERFLOW`);
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('header').count() > 0, true);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), true, `${label}:SKIP_LINK_NOT_FOCUSABLE`);
  assert.equal(result.page_errors.length, 0, `${label}:PAGEERROR:${result.page_errors.join('|')}`);
  assert.equal(result.console_errors.length, 0, `${label}:CONSOLE:${result.console_errors.join('|')}`);
  await page.screenshot({ path: path.join(OUTPUT, `status-${label}.png`), fullPage: true });
  result.overall_state = 'FRESH';
  result.hunter_state = 'ACTIVE';
  result.health_status = 'ok';
  result.horizontal_overflow = false;
  await context.close();
  return result;
}

async function main() {
  const apiKey = secret();
  const hmacSecret = secret();
  const serverLog = fs.createWriteStream(path.join(OUTPUT, 'server.log'), { flags: 'wx' });
  const backend = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      CI: 'true',
      HEADLESS: 'true',
      BOQA_PORT: String(BACKEND_PORT),
      BOQA_API_KEY: apiKey,
      BOQA_HMAC_SECRET: hmacSecret,
      BOQA_HMAC_LOG_FAILURES: 'false',
      BOQA_RELEASE_SHA: HEAD_SHA,
      BOQA_AUTO_ANALYZE: 'false',
      BOQA_HUNTER_INTERVAL_MS: '600000',
      BOQA_HUNTER_HEARTBEAT_MS: '1000',
      BOQA_HUNTER_HEARTBEAT_FRESHNESS_MS: '10000',
      BOQA_HUNTER_CYCLE_FRESHNESS_MS: '600000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  backend.stdout.pipe(serverLog);
  backend.stderr.pipe(serverLog);

  let edge;
  let browser;
  const evidence = {
    schema_version: 1,
    head_sha: HEAD_SHA,
    started_at: startedAt,
    production_accessed: false,
    deploy_performed: false,
    secrets_written: false,
  };
  try {
    const health = await waitForHealthy(`${BACKEND_URL}/api/health`);
    evidence.backend = {
      status: health.status,
      hunter_state: health.hunter.state,
      release_sha: health.release_sha,
    };
    edge = await createEdgeServer({
      BOQA_BACKEND_URL: BACKEND_URL,
      BOQA_API_KEY: apiKey,
      BOQA_HMAC_SECRET: hmacSecret,
      ASSETS: { fetch: assetResponse },
    });
    browser = await chromium.launch({ headless: true });
    evidence.public = [];
    evidence.public.push(await landingSmoke(browser, { width: 1440, height: 900 }, 'desktop-1440'));
    evidence.public.push(await landingSmoke(browser, { width: 430, height: 900 }, 'mobile-430'));
    evidence.public.push(await landingSmoke(browser, { width: 390, height: 844 }, 'mobile-390'));
    evidence.public.push(await landingSmoke(browser, { width: 360, height: 800 }, 'mobile-360'));
    evidence.status = [];
    evidence.status.push(await statusSmoke(browser, { width: 1440, height: 900 }, 'desktop-1440'));
    evidence.status.push(await statusSmoke(browser, { width: 390, height: 844 }, 'mobile-390'));
    evidence.status.push(await statusSmoke(browser, { width: 360, height: 800 }, 'mobile-360'));
    evidence.page_errors = evidence.public.reduce((sum, item) => sum + item.page_errors.length, 0)
      + evidence.status.reduce((sum, item) => sum + item.page_errors.length, 0);
    evidence.console_errors = evidence.public.reduce((sum, item) => sum + item.console_errors.length, 0)
      + evidence.status.reduce((sum, item) => sum + item.console_errors.length, 0);
    evidence.status = 'PASS';
  } catch (error) {
    evidence.status = 'FAIL';
    evidence.error = error.message;
    throw error;
  } finally {
    evidence.completed_at = new Date().toISOString();
    fs.writeFileSync(path.join(OUTPUT, 'browser-smoke-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx' });
    if (browser) await browser.close().catch(() => {});
    if (edge) await new Promise((resolve) => edge.close(resolve));
    let backendExited = backend.exitCode !== null;
    if (!backendExited) {
      backend.kill('SIGTERM');
      backendExited = await Promise.race([
        new Promise((resolve) => backend.once('exit', () => resolve(true))),
        new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
      ]);
    }
    if (!backendExited) backend.kill('SIGKILL');
    serverLog.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
