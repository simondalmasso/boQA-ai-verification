'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { EventBus } = require('./bus');
const { DefensiveValidationService } = require('./lib/defensive-validation');
const { HunterRuntime } = require('./lib/hunter-runtime');
const { HumanGateBus } = require('./cuore');
const { createHealthHandler } = require('./lib/health');
const { CONFIG, OUTPUT_DIR } = require('./lib/config');
const {
  errorHandler,
  requireApiKey,
  requireStrongProxyAuth,
  rateLimiter,
  verifyHmac,
  attachRawBodyCapture,
} = require('./lib/middleware');

const bus = new EventBus({
  target: null,
  ndjsonPath: path.join(OUTPUT_DIR, 'sessions', 'events.ndjson'),
});
const ctx = {
  CONFIG,
  OUTPUT_DIR,
  bus,
  serverStartTime: Date.now(),
  agent: null,
  agentInitError: 'browser_executor_requires_explicit_scope',
};
ctx.defensiveValidation = new DefensiveValidationService();
ctx.cuore = {
  humanGateBus: new HumanGateBus({ filePath: path.join(OUTPUT_DIR, 'cuore', 'human-gates.jsonl') }),
};

function provideHunterPolicy() {
  try {
    const assets = ctx.defensiveValidation.loadAssets();
    const authorizedAssets = assets.filter((asset) => ctx.defensiveValidation.authorize(asset).allowed);
    if (authorizedAssets.length === 0) {
      return { status: 'BLOCKED', reason: 'NO_AUTHORIZED_ASSETS', authorized_assets: [] };
    }
    return { status: 'READY', authorized_assets: authorizedAssets };
  } catch (error) {
    return {
      status: 'BLOCKED',
      reason: error.code || error.message || 'INVALID_POLICY',
      authorized_assets: [],
    };
  }
}

ctx.hunterRuntime = new HunterRuntime({
  cycleRunner: () => ctx.defensiveValidation.runCycle(),
  policyProvider: provideHunterPolicy,
  statePath: path.join(OUTPUT_DIR, 'hunter-state.json'),
  lockPath: path.join(OUTPUT_DIR, 'hunter-runtime.lock'),
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json(attachRawBodyCapture({ limit: process.env.BOQA_JSON_LIMIT || '256kb' })));

const server = http.createServer(app);
ctx.server = server;

app.use(express.static(path.join(__dirname, 'dashboard')));

const healthHandler = createHealthHandler(ctx);
app.get('/health', healthHandler);
app.get('/api/defensive/status', requireStrongProxyAuth, rateLimiter, (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(ctx.hunterRuntime.publicStatus());
});

app.get('/api/private/human-gates', requireStrongProxyAuth, rateLimiter, (_req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    return res.json({ gates: ctx.cuore.humanGateBus.readQueue() });
  } catch (error) {
    if (error.code === 'HUMAN_GATE_READ_UNAVAILABLE') {
      return res.status(503).json({ error: 'human_gate_read_unavailable' });
    }
    throw error;
  }
});

const PUBLIC_READ_PATHS = new Set(['/health', '/hunter/status']);
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && PUBLIC_READ_PATHS.has(req.path)) return next();
  verifyHmac(req, res, (hmacError) => {
    if (hmacError) return next(hmacError);
    rateLimiter(req, res, (rateError) => {
      if (rateError) return next(rateError);
      requireApiKey(req, res, next);
    });
  });
});

app.get('/api/health', healthHandler);
require('./routes/hunter-v1').registerRoutes(app, ctx);

let shutdownPromise = null;
function shutdown(signal) {
  if (shutdownPromise) return shutdownPromise;
  shutdownPromise = (async () => {
    console.log('[Server] ' + signal + ' — shutting down');
    await ctx.hunterRuntime.stop(signal);
    ctx.defensiveValidation.stop();
    await bus.flush();
    await new Promise((resolve) => server.close(() => resolve()));
  })();
  return shutdownPromise;
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGHUP', () => console.log('[Server] SIGHUP received — ignoring'));
app.use(errorHandler);

async function main() {
  console.log('[BOQA] lean kernel — browser execution disabled until explicit scoped invocation');
  server.listen(CONFIG.port, '0.0.0.0', () => {
    console.log('[Server] Dashboard: http://localhost:' + CONFIG.port);
  });
  const hunter = await ctx.hunterRuntime.start();
  console.log('[Hunter] state=' + hunter.state + ' reason=' + (hunter.reason || 'none'));
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[Server] Fatal bootstrap error:', error.message);
    void shutdown('BOOTSTRAP_ERROR');
  });
}

module.exports = { app, server, ctx, shutdown, main };
