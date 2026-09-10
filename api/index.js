const app = require('../server/server');

function querySuffix(url) {
  const q = String(url || '').indexOf('?');
  return q === -1 ? '' : String(url).slice(q);
}

function asPath(url) {
  const raw = String(url || '/');
  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch (_) {
    /* keep raw */
  }
  return raw;
}

function pathOnly(url) {
  return asPath(url).split('?')[0] || '/';
}

function withApiPrefix(url) {
  const path = pathOnly(url);
  const qs = querySuffix(asPath(url));
  if (path.startsWith('/api')) return `${path}${qs}`;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `/api${suffix === '/' ? '' : suffix}${qs}`;
}

function isRewriteDestination(path) {
  return path === '/api' || path === '/api/' || path === '/api/index' || path === '/index';
}

function resolveApiUrl(req) {
  const current = asPath(req.url || '/');
  const currentPath = pathOnly(current);
  if (currentPath.startsWith('/api/') && currentPath !== '/api/index') {
    return current;
  }

  const headers = [
    req.headers['x-forwarded-uri'],
    req.headers['x-original-uri'],
    req.headers['x-invoke-path'],
  ];
  for (const header of headers) {
    if (typeof header !== 'string' || !header) continue;
    const normalized = asPath(header);
    const headerPath = pathOnly(normalized);
    if (headerPath.startsWith('/api/') && headerPath !== '/api/index') {
      return querySuffix(normalized) ? normalized : `${headerPath}${querySuffix(current)}`;
    }
  }

  if (!isRewriteDestination(currentPath) && currentPath.startsWith('/api')) {
    return current;
  }

  return withApiPrefix(current);
}

module.exports = (req, res) => {
  const resolved = resolveApiUrl(req);
  req.url = resolved;
  req.originalUrl = resolved;
  return app(req, res);
};
