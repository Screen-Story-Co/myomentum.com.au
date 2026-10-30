import {
  OAuthProvider,
  AuthorizationError,
  type AuthRequest,
  type OAuthHelpers,
} from '@cloudflare/workers-oauth-provider';
import { createMcpHandler } from 'agents/mcp/server';
import { McpServer } from '@modelcontextprotocol/server';
import { registerContentTools } from './tools';

export interface Env {
  OAUTH_KV: KVNamespace;
  OAUTH_PROVIDER: OAuthHelpers;
  REPO: string;
  PREVIEW_BASE: string;
  GITHUB_TOKEN: string;
  EDITOR_KEY: string;
}

function buildServer(env: Env): McpServer {
  const server = new McpServer({ name: 'yiapanis-content', version: '0.1.0' });
  registerContentTools(server, env);
  return server;
}

async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// POC identity: pre-provisioned editor key, checked at the OAuth consent step.
// ponytail: single shared key = single editor class. Upgrade path is
// email-OTP via Cloudflare Email Service + per-editor rows before any client
// onboarding.
const CONSENT_PAGE = (error?: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>yiapanis.co editor access</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111; color: #eee;
         display: grid; place-items: center; min-height: 100vh; margin: 0; }
  .card { background: #1c1c1c; padding: 2rem 2.5rem; border-radius: 12px;
          width: 22rem; box-shadow: 0 8px 30px rgba(0,0,0,.4); }
  h1 { font-size: 1.1rem; margin: 0 0 .25rem; }
  p { color: #999; font-size: .85rem; margin: .25rem 0 1.25rem; }
  input { width: 100%; box-sizing: border-box; padding: .6rem; border-radius: 8px;
          border: 1px solid #333; background: #111; color: #eee; font-size: 1rem; }
  button { margin-top: 1rem; width: 100%; padding: .6rem; border-radius: 8px;
           border: 0; background: #e0503f; color: #fff; font-size: 1rem; }
  .err { color: #e0503f; font-size: .85rem; margin-top: .75rem; }
</style></head>
<body><form class="card" method="post">
  <h1>Screen Story Co</h1>
  <p>yiapanis.co content editing — enter your editor key to authorize this agent.</p>
  <input type="password" name="key" placeholder="Editor key" autofocus>
  ${error ? `<div class="err">${error}</div>` : ''}
  <button type="submit">Authorize</button>
</form></body></html>`;

const consentHandler: ExportedHandler<Env> = {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/authorize') return new Response('Not found', { status: 404 });

    let oauthRequest: AuthRequest;
    try {
      oauthRequest = await env.OAUTH_PROVIDER.parseAuthRequest(request);
    } catch (error) {
      if (!(error instanceof AuthorizationError)) throw error;
      if (!error.redirectUri) return new Response(error.description, { status: 400 });
      const redirect = new URL(error.redirectUri);
      redirect.searchParams.set('error', error.code);
      redirect.searchParams.set('error_description', error.description);
      if (error.state) redirect.searchParams.set('state', error.state);
      if (error.issuer) redirect.searchParams.set('iss', error.issuer);
      return Response.redirect(redirect, 302);
    }

    if (request.method === 'GET') return new Response(CONSENT_PAGE(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    // POST: check the editor key, then complete authorization.
    const form = await request.formData();
    const given = String(form.get('key') ?? '');
    const givenHash = await sha256Hex(given);
    const expectedHash = await sha256Hex(env.EDITOR_KEY);
    if (given.length === 0 || givenHash !== expectedHash) {
      return new Response(CONSENT_PAGE('Invalid editor key.'), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
      request: oauthRequest,
      userId: 'demetri',
      metadata: {},
      scope: oauthRequest.scope,
      props: { editor: 'demetri' },
    });
    return Response.redirect(redirectTo, 302);
  },
};

export default new OAuthProvider<Env>({
  apiRoute: '/mcp',
  apiHandler: {
    fetch: (request, env, ctx) =>
      createMcpHandler(() => buildServer(env), {
        onerror: (e) =>
          console.error('mcp-handler-error:', e && (e.stack || e.message || String(e))),
      })(request, env, ctx),
  },
  defaultHandler: consentHandler,
  authorizeEndpoint: '/authorize',
  tokenEndpoint: '/token',
  clientRegistrationEndpoint: '/register',
  scopesSupported: ['site:edit'],
  resourceMetadata: {
    resource: 'https://mcp.yiapanis.co/mcp',
    authorization_servers: ['https://mcp.yiapanis.co'],
    scopes_supported: ['site:edit'],
    resource_name: 'yiapanis.co content editing',
  },
  // Claude custom connectors use Client ID Metadata Documents.
  clientIdMetadataDocumentEnabled: true,
});