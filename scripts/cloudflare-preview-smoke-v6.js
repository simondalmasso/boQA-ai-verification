'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'output', 'cloudflare-preview-v6', 'browser');
const PREVIEW_URL = String(process.env.BOQA_PREVIEW_URL || '').replace(/\/$/, '');
const HEAD_SHA = process.env.BOQA_HEAD_SHA || process.env.GITHUB_SHA || 'unknown';

if (!/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)+\.workers\.dev$/i.test(PREVIEW_URL)) {
  throw new Error('INVALID_OR_MISSING_PREVIEW_URL');
}

fs.mkdirSync(OUTPUT, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseObject(body) {
  try {
    const value = JSON.parse(body);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch (_) {
    return null;
  }
}

async function request(pathname) {
  const response = await fetch(`${PREVIEW_URL}${pathname}`, {
    cache: 'no-store',
    redirect: 'manual',
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  const body = await response.text();
  return { response, body, json: parseObject(body) };
}

async function waitForPreview(evidence, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  let attempt = 0;
  let last = null;
  while (Date.now() < deadline) {
    attempt += 1;
    try {
      const result = await request('/health');
      last = { status: result.response.status, error: null };
      if (result.response.status === 200 && result.json?.status === 'ok' && result.json?.worker === 'boqa') {
        evidence.preview_readiness = { ready: true, attempt_count: attempt, last_status: 200 };
        return;
      }
    } catch (error) {
      last = { status: null, error: error.cause?.code || error.code || error.message || 'fetch_failed' };
    }
    await sleep(3_000);
  }
  evidence.preview_readiness = {
    ready: false,
    attempt_count: attempt,
    last_status: last?.status ?? null,
    last_error: last?.error ?? null,
  };
  throw new Error(`PREVIEW_NOT_READY:${JSON.stringify(evidence.preview_readiness)}`);
}

async function verifyConcealment(evidence) {
  const paths = [
    '/cobros', '/COBROS', '/%2563obros', '/cobros.html', '/cobros.js', '/private.css',
    '/api/private/billing', '/api/private/billing/data', '/api/%255cprivate%255cbilling%255cdata',
    '/api/runtime/metrics', '/api/defensive/status', '/api/bugs', '/api/findings', '/api/metrics',
  ];
  evidence.concealed_paths = [];
  for (const pathname of paths) {
    const { response, body } = await request(pathname);
    assert.equal(response.status, 404, `${pathname}:NOT_CONCEALED`);
    assert.match(response.headers.get('cache-control') || '', /no-store/, `${pathname}:CACHE_POLICY`);
    assert.equal(response.headers.get('location'), null, `${pathname}:REDIRECT_LEAK`);
    assert(!/centro de cobros|movimientos|saldo|monto|ingreso|billing|payment|pago|finanz|finding|metric|defensive/i.test(body), `${pathname}:PURPOSE_LEAK`);
    evidence.concealed_paths.push({ pathname, status: 404, generic_body: true });
  }
}

async function classifyBackend(evidence) {
  const edge = await request('/health');
  assert.equal(edge.response.status, 200);
  assert.equal(edge.json?.status, 'ok');
  assert.equal(edge.json?.worker, 'boqa');
  assert.equal(edge.json?.backend_configured, true);
  evidence.worker_health = {
    status: edge.json.status,
    mode: edge.json.mode,
    backend_configured: edge.json.backend_configured,
  };

  const health = await request('/api/health');
  if (health.response.status !== 200) {
    const unavailableStatuses = new Set([502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 530]);
    assert(unavailableStatuses.has(health.response.status), `/api/health:${health.response.status}`);
    evidence.classification = 'BLOCKED_BACKEND_UNAVAILABLE';
    evidence.promotion_ready = false;
    evidence.blocker = 'BACKEND_UNAVAILABLE';
    evidence.backend_health = {
      status: health.response.status,
      version: null,
      release_sha: null,
    };
    evidence.hunter = {
      status: null,
      state: null,
      timestamp_present: false,
    };
    return;
  }

  assert.equal(health.json?.status, 'ok');
  evidence.backend_health = {
    status: health.json.status,
    version: health.json.version || null,
    release_sha: health.json.release_sha || null,
  };

  const hunter = await request('/api/hunter/status');
  if (hunter.response.status === 200) {
    assert(hunter.json, 'HUNTER_JSON_REQUIRED');
    assert(['STOPPED', 'STARTING', 'ACTIVE', 'DEGRADED', 'BLOCKED', 'ERROR'].includes(hunter.json.state), 'HUNTER_STATE_INVALID');
    assert(Number.isFinite(Date.parse(hunter.json.timestamp)), 'HUNTER_TIMESTAMP_INVALID');
    evidence.classification = 'PROMOTION_READY';
    evidence.promotion_ready = true;
    evidence.hunter = {
      status: 200,
      state: hunter.json.state,
      timestamp_present: true,
    };
    return;
  }

  if (hunter.response.status === 404) {
    evidence.classification = 'BLOCKED_BACKEND_CONTRACT';
    evidence.promotion_ready = false;
    evidence.blocker = 'BACKEND_HUNTER_CONTRACT_MISSING';
    evidence.hunter = {
      status: 404,
      content_type: (hunter.response.headers.get('content-type') || '').split(';')[0] || null,
      body_recorded: false,
    };
    return;
  }

  throw new Error(`UNEXPECTED_HUNTER_STATUS:${hunter.response.status}`);
}

function wireDiagnostics(page, result, expectedStatuses = []) {
  const expected = new Set(expectedStatuses.map(String));
  page.on('pageerror', (error) => result.page_errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const value = message.text();
    if (/Failed to load resource/.test(value) && [...expected].some((status) => value.includes(status))) {
      result.expected_console_errors.push(value);
      return;
    }
    result.console_errors.push(value);
  });
  page.on('requestfailed', (request) => {
    result.failed_requests.push({ path: new URL(request.url()).pathname, error: request.failure()?.errorText || 'unknown' });
  });
}

async function smokeLanding(browser, viewport, label) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const result = {
    label,
    viewport,
    page_errors: [],
    console_errors: [],
    expected_console_errors: [],
    failed_requests: [],
  };
  wireDiagnostics(page, result);

  const response = await page.goto(PREVIEW_URL, { waitUntil: 'networkidle', timeout: 60_000 });
  assert(response && response.ok(), `${label}:LANDING_NAVIGATION_FAILED`);
  assert.equal(await page.locator('h1').count(), 1, `${label}:H1_COUNT`);
  const heroTitle = (await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim();
  assert.equal(heroTitle, 'Verification infrastructure for AI-assisted software work.');
  const thesis = (await page.locator('.thesis').innerText()).replace(/\s+/g, ' ').trim();
  assert.equal(thesis, 'Codex proposes. BOQA verifies.');
  assert.equal(await page.getByText('MODEL_OUTPUT != AUTHORIZATION', { exact: true }).isVisible(), true);
  assert.equal(await page.getByRole('link', { name: 'View GitHub', exact: true }).isVisible(), true);
  assert.equal(await page.getByRole('link', { name: 'Run safe demo', exact: true }).isVisible(), true);
  assert.equal(await page.getByRole('link', { name: 'System status', exact: true }).first().isVisible(), true);
  assert.equal(await page.locator('#safe-demo').count(), 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${label}:HORIZONTAL_OVERFLOW`);

  const invariant = await page.locator('.invariant').boundingBox();
  assert(invariant && invariant.y < viewport.height, `${label}:INVARIANT_OUTSIDE_FIRST_VIEWPORT`);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), true, `${label}:SKIP_LINK_NOT_FOCUSABLE`);
  assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true, `${label}:REDUCED_MOTION_NOT_EMULATED`);

  const overflowAtDoubleText = await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    const ok = document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    document.documentElement.style.fontSize = '';
    return ok;
  });
  assert.equal(overflowAtDoubleText, true, `${label}:HORIZONTAL_OVERFLOW_200_PERCENT_TEXT`);

  assert.equal(result.page_errors.length, 0, `${label}:PAGE_ERRORS:${result.page_errors.join('|')}`);
  assert.equal(result.console_errors.length, 0, `${label}:CONSOLE_ERRORS:${result.console_errors.join('|')}`);
  assert.equal(result.failed_requests.length, 0, `${label}:FAILED_REQUESTS:${JSON.stringify(result.failed_requests)}`);
  await page.screenshot({ path: path.join(OUTPUT, `landing-${label}.png`), fullPage: true });
  result.first_viewport = true;
  result.horizontal_overflow = false;
  result.horizontal_overflow_200_percent = false;
  result.reduced_motion = true;
  await context.close();
  return result;
}

async function smokeStatus(browser, viewport, label, classification, backendStatus) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const expectedStatuses = [];
  if (classification === 'BLOCKED_BACKEND_CONTRACT') expectedStatuses.push(404);
  if (classification === 'BLOCKED_BACKEND_UNAVAILABLE' && Number.isInteger(backendStatus)) expectedStatuses.push(backendStatus);
  const result = {
    label,
    viewport,
    page_errors: [],
    console_errors: [],
    expected_console_errors: [],
    failed_requests: [],
  };
  wireDiagnostics(page, result, expectedStatuses);

  const response = await page.goto(`${PREVIEW_URL}/status/`, { waitUntil: 'networkidle', timeout: 60_000 });
  assert(response && response.ok(), `${label}:STATUS_NAVIGATION_FAILED`);
  await page.waitForFunction(() => {
    const value = document.getElementById('overall-state')?.textContent;
    return value && value !== 'LOADING';
  }, null, { timeout: 30_000 });

  if (classification === 'PROMOTION_READY') {
    assert.equal(await page.locator('#overall-state').textContent(), 'FRESH');
    assert.equal(await page.locator('#hunter-view-state').textContent(), 'FRESH');
    assert.equal(await page.locator('#health-view-state').textContent(), 'FRESH');
    assert.equal(await page.locator('#health-status').textContent(), 'ok');
  } else if (classification === 'BLOCKED_BACKEND_CONTRACT') {
    assert.equal(await page.locator('#overall-state').textContent(), 'DEGRADED');
    assert.equal(await page.locator('#hunter-view-state').textContent(), 'UNAVAILABLE');
    assert.equal(await page.locator('#health-view-state').textContent(), 'FRESH');
    assert.equal(await page.locator('#health-status').textContent(), 'ok');
    assert.equal(await page.locator('#hunter-reason').textContent(), 'Respuesta HTTP 404');
  } else if (classification === 'BLOCKED_BACKEND_UNAVAILABLE') {
    assert.equal(await page.locator('#overall-state').textContent(), 'UNAVAILABLE');
    assert.equal(await page.locator('#hunter-view-state').textContent(), 'UNAVAILABLE');
    assert.equal(await page.locator('#health-view-state').textContent(), 'UNAVAILABLE');
    const healthReason = await page.locator('#health-reason').textContent();
    const hunterReason = await page.locator('#hunter-reason').textContent();
    const allowedUnavailableReasons = new Set([
      `Respuesta HTTP ${backendStatus}`,
      'Tiempo de espera agotado',
      'Error de red',
    ]);
    assert(allowedUnavailableReasons.has(healthReason), `${label}:HEALTH_UNAVAILABLE_REASON:${healthReason}`);
    assert(allowedUnavailableReasons.has(hunterReason), `${label}:HUNTER_UNAVAILABLE_REASON:${hunterReason}`);
    result.health_reason = healthReason;
    result.hunter_reason = hunterReason;
  } else {
    throw new Error(`UNKNOWN_CLASSIFICATION:${classification}`);
  }

  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${label}:HORIZONTAL_OVERFLOW`);
  if (viewport.width <= 520) {
    const sourceBoxes = await page.locator('.source-card').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
    const secondaryBoxes = await page.locator('.unavailable-panel').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
    assert.equal(sourceBoxes.length, 2);
    assert.equal(secondaryBoxes.length, 2);
    assert(Math.abs(sourceBoxes[0].top - sourceBoxes[1].top) < 2, `${label}:SOURCE_CARDS_NOT_COMPACT`);
    assert(Math.abs(secondaryBoxes[0].top - secondaryBoxes[1].top) < 2, `${label}:SECONDARY_PANELS_NOT_COMPACT`);
  }

  await page.waitForTimeout(200);
  if (classification === 'BLOCKED_BACKEND_UNAVAILABLE') {
    result.expected_failed_requests = result.failed_requests.filter((item) =>
      ['/api/health', '/api/hunter/status'].includes(item.path) && /ERR_ABORTED/.test(item.error)
    );
    result.failed_requests = result.failed_requests.filter((item) =>
      !(['/api/health', '/api/hunter/status'].includes(item.path) && /ERR_ABORTED/.test(item.error))
    );
    assert(result.expected_failed_requests.length >= 1, `${label}:EXPECTED_BACKEND_ABORT_MISSING`);
  }
  assert.equal(result.page_errors.length, 0, `${label}:PAGE_ERRORS:${result.page_errors.join('|')}`);
  assert.equal(result.console_errors.length, 0, `${label}:CONSOLE_ERRORS:${result.console_errors.join('|')}`);
  assert.equal(result.failed_requests.length, 0, `${label}:FAILED_REQUESTS:${JSON.stringify(result.failed_requests)}`);
  if (classification === 'BLOCKED_BACKEND_CONTRACT') {
    assert(result.expected_console_errors.length >= 1, `${label}:EXPECTED_HTTP_CONSOLE_MISSING`);
  }

  await page.screenshot({ path: path.join(OUTPUT, `status-${label}.png`), fullPage: true });
  result.overall_state = await page.locator('#overall-state').textContent();
  result.horizontal_overflow = false;
  await context.close();
  return result;
}

async function main() {
  const evidence = {
    schema_version: 1,
    head_sha: HEAD_SHA,
    preview_url: PREVIEW_URL,
    production_accessed: false,
    production_changed: false,
    deploy_performed: false,
    rollback_executed: false,
    started_at: new Date().toISOString(),
  };

  let browser;
  try {
    await waitForPreview(evidence);
    await classifyBackend(evidence);
    await verifyConcealment(evidence);
    browser = await chromium.launch({ headless: true });
    evidence.landing_viewports = [];
    evidence.landing_viewports.push(await smokeLanding(browser, { width: 1440, height: 900 }, 'desktop-1440'));
    evidence.landing_viewports.push(await smokeLanding(browser, { width: 430, height: 900 }, 'mobile-430'));
    evidence.landing_viewports.push(await smokeLanding(browser, { width: 390, height: 844 }, 'mobile-390'));
    evidence.landing_viewports.push(await smokeLanding(browser, { width: 360, height: 800 }, 'mobile-360'));
    evidence.status_viewports = [];
    const backendStatus = Number.isInteger(evidence.backend_health?.status) ? evidence.backend_health.status : null;
    evidence.status_viewports.push(await smokeStatus(browser, { width: 1440, height: 900 }, 'desktop-1440', evidence.classification, backendStatus));
    evidence.status_viewports.push(await smokeStatus(browser, { width: 390, height: 844 }, 'mobile-390', evidence.classification, backendStatus));
    evidence.status_viewports.push(await smokeStatus(browser, { width: 360, height: 800 }, 'mobile-360', evidence.classification, backendStatus));
    evidence.gate_status = 'PASS';
  } catch (error) {
    evidence.gate_status = 'FAIL';
    evidence.error = error.message || String(error);
    throw error;
  } finally {
    if (browser) await browser.close().catch(() => {});
    evidence.completed_at = new Date().toISOString();
    fs.writeFileSync(path.join(OUTPUT, 'preview-smoke-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
