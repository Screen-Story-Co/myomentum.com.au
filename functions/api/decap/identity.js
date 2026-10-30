// Cloudflare Pages Function: /api/decap/identity
// Validates Studio JWT tokens (HS256) and returns Decap CMS-compatible identity
// ZERO Clerk references — pure custom auth

const ALLOWED_ORIGINS = ['https://yiapanis-co.preview.screenstory.co'];

function b64e(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

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

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  // Verify Studio JWT
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return new Response(JSON.stringify({ msg: 'Invalid token' }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  }

  const email = payload.email || payload.sub || '';
  const name = payload.name || email.split('@')[0];
  const role = payload.role === 'admin' ? 'admin' : 'editor';

  // Validate site scope: token must include a 'site' claim matching this endpoint's site
  const expectedSite = 'yiapanis-co'; // This identity endpoint serves yiapanis-co
  const tokenSite = payload.site;
  if (tokenSite !== expectedSite) {
    return new Response(JSON.stringify({ msg: 'Token not authorized for this site' }), {
      status: 403, headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  }

  // Decap CMS identity format
  const identity = {
    id: payload.sub || email,
    email,
    user_metadata: { full_name: name },
    app_metadata: { roles: [role] },
    token, // Decap stores this and sends to git-gateway
  };

  return new Response(JSON.stringify(identity), {
    status: 200, headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}