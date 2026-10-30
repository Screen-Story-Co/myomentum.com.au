// Cloudflare Pages Function: /api/decap/git-gateway
// Proxies Decap CMS git operations to GitHub API
// Authenticated via Studio JWT (HS256) — ZERO Clerk references

const GITHUB_API = 'https://api.github.com';
const REPO = 'screenstory-co/yiapanis.co';

const ALLOWED_ORIGINS = ['https://yiapanis-co.preview.screenstory.co'];

function b64d(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function importKey(secret) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
}

async function verifyJWT(token, secret) {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const data = new TextEncoder().encode(`${header}.${body}`);
    const key = await importKey(secret);
    const expectedSig = Uint8Array.from(b64d(signature).split('').map(c => c.charCodeAt(0)));
    const valid = await crypto.subtle.verify('HMAC', key, expectedSig, data);
    if (!valid) return null;
    const payload = JSON.parse(b64d(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function githubRequest(path, method, body, env) {
  const url = `${GITHUB_API}/repos/${REPO}${path}`;
  const headers = {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'screenstory-cms/2.0',
  };
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Forward GitHub's status verbatim: Decap triages 401/404 in hasWriteAccess()
  // and walks Link headers for pagination — wrapping errors in 500 breaks both.
  return res;
}

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ msg: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return new Response(JSON.stringify({ msg: 'Invalid session' }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  }

  // Validate site scope (defense-in-depth: identity.js already checked, but verify here too)
  const expectedSite = 'yiapanis-co';
  if (payload.site !== expectedSite) {
    return new Response(JSON.stringify({ msg: 'Token not authorized for this repository' }), {
      status: 403, headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  }

  const url = new URL(request.url);
  // Decap's GitHubAPI builds apiRoot as `${gateway_url}/github` and sends
  // `<apiRoot>/<github-api-path>`, so strip only that prefix — what remains is
  // the literal GitHub path. Query string (pagination, ?ref=) must survive.
  let path = url.pathname.replace('/api/decap/git-gateway', '');
  if (path.startsWith('/github/')) {
    path = path.slice('/github'.length);
  } else if (path === '/github') {
    path = '/';
  }

  try {
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.json().catch(() => null);
    }

    const ghRes = await githubRequest(path + url.search, request.method, body, env);
    const ghBody = await ghRes.text();

    // Pass through GitHub's status + Content-Type + Link (pagination) verbatim.
    // Link URLs are rewritten from GitHub-absolute to gateway-relative: Decap's
    // nextUrlProcessor otherwise mangles the owner segment out of the absolute
    // URL and the follow-up fetch 404s. Relative URLs skip that rewrite.
    const headers = { ...cors(origin) };
    const ghType = ghRes.headers.get('Content-Type');
    if (ghType) headers['Content-Type'] = ghType;
    const ghLink = ghRes.headers.get('Link');
    if (ghLink) {
      headers['Link'] = ghLink.replaceAll(
        `${GITHUB_API}/repos/${REPO}`,
        '/api/decap/git-gateway/github'
      );
    }

    return new Response(ghBody || null, {
      status: ghRes.status,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  }
}