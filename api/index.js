const app = require('../server/server');

function querySuffix(url) {
  const q = String(url || '').indexOf('?');
  return q === -1 ? '' : String(url).slice(q);
}

function pathOnly(url) {
  return String(url || '/').split('?')[0] || '/';
}

function withApiPrefix(url) {
  const path = pathOnly(url);
  const qs = querySuffix(url);
  if (path.startsWith('/api')) return `${path}${qs}`;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `/api${suffix === '/' ? '' : suffix}${qs}`;
}

function isRewriteDestination(path) {
  return path === '/api' || path === '/api/' || path === '/api/index' || path === '/index';
}

function resolveApiUrl(req) {
  const current = req.url || '/';
  const currentPath = pathOnly(current);
  if (currentPath.startsWith('/api/') && currentPath !== '/api/index') {
    return current;
  }

  const headers = [req.headers['x-forwarded-uri'], req.headers['x-original-uri'], req.headers['x-invoke-path']];
  for (const header of headers) {
    if (typeof header !== 'string' || !header) continue;
    const headerPath = pathOnly(header);
    if (headerPath.startsWith('/api/') && headerPath !== '/api/index') {
      return querySuffix(header) ? header : `${headerPath}${querySuffix(current)}`;
    }
  }

  if (!isRewriteDestination(currentPath) && currentPath.startsWith('/api')) {
    return current;
  }

  return withApiPrefix(current);
}

let boot;

module.exports = (req, res) => {
  if (!boot) {
    boot = typeof app.ensureMigrated === 'function' ? app.ensureMigrated() : Promise.resolve();
  }

  boot.then(() => {
    const resolved = resolveApiUrl(req);
    req.url = resolved;
    req.originalUrl = resolved;
    app(req, res);
  }).catch((err) => {
    console.error('API boot error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno' });
    }
  });
};
