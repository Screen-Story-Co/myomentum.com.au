import type { McpServer } from '@modelcontextprotocol/server';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import { z } from 'zod';
import {
  filmsSchema,
  blogSchema,
  profileSchema,
} from '../../src/content/schemas';

// Content-editing tools for yiapanis.co, generated from the same zod schemas
// that validate the Astro build. All writes go to main via the GitHub
// contents API; CI auto-deploys the preview ~2min later. Production untouched.

export interface McpEnv {
  REPO: string; // e.g. "Screen-Story-Co/yiapanis.co"
  PREVIEW_BASE: string; // https://yiapanis-co.preview.screenstory.co
  GITHUB_TOKEN: string;
}

// ponytail: schema typed `any` because schemas.ts is typed by the root zod
// instance while the worker bundles its own — parse()/shape are the only uses.
interface CollectionDef {
  plural: string;
  singular: string;
  dir: string;
  schema: any;
  page: (slug: string) => string;
}

const COLLECTIONS: CollectionDef[] = [
  {
    plural: 'films',
    singular: 'film',
    dir: 'films',
    schema: filmsSchema,
    page: () => '/films',
  },
  {
    plural: 'blog_posts',
    singular: 'blog_post',
    dir: 'blog',
    schema: blogSchema,
    page: (slug) => `/blog/${slug}`,
  },
  {
    plural: 'profile',
    singular: 'profile',
    dir: 'profile',
    schema: profileSchema,
    page: () => '/',
  },
];

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const MAX_BODY = 65536;

// Media: base64 commit to public/images/, served straight from Pages.
// ponytail: 5 MB ceiling (GitHub contents API limit); Cloudflare Images or
// Stream is the upgrade path if clients need bigger or optimized media.
const IMG_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
};

function b64encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 4096) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 4096));
  }
  return btoa(bin);
}

function b64decode(s: string): string {
  return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));
}

function parseDoc(raw: string): { data: any; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('file has no frontmatter block');
  return { data: yamlLoad(m[1]), body: m[2] };
}

function serializeDoc(data: any, body: string): string {
  return `---\n${yamlDump(data, { lineWidth: -1 })}---\n${body}`;
}

async function gh(
  env: McpEnv,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const r = await fetch(
    `https://api.github.com/repos/${env.REPO}/contents/${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'yiapanis-mcp',
        ...(init.headers || {}),
      },
    },
  );
  return r;
}

function ghError(status: number, body: string): string {
  if (status === 401 || status === 403)
    return `GitHub rejected the token (${status}). Worker secret GITHUB_TOKEN needs contents read/write on ${'the site repo'}.`;
  if (status === 409)
    return 'GitHub conflict (409) — the file changed during this edit; retry the update.';
  return `GitHub error ${status}: ${body.slice(0, 300)}`;
}

function filePath(def: CollectionDef, slug: string): string {
  return `src/content/${def.dir}/${slug}.md`;
}

function ok(text: string, data: Record<string, unknown> = {}) {
  return {
    content: [{ type: 'text' as const, text }],
    structuredContent: data,
  };
}

export function registerContentTools(server: McpServer, env: McpEnv): void {
  // Media upload — one tool, all collections use it via poster/headshot fields.
  server.registerTool(
    'upload_image',
    {
      description:
        'Upload an image to yiapanis.co and get a public URL. Use the returned URL in poster/headshot fields. Supported: jpg, png, webp, gif, svg, avif. Max ~5MB.',
      inputSchema: {
        name: z.string().regex(SLUG_RE, 'lowercase letters, numbers, dashes'),
        extension: z.enum(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif']),
        base64: z.string().max(7_000_000).describe('Raw base64 of image bytes — no data: prefix'),
      },
    },
    async ({ name, extension, base64 }: any) => {
      const type = IMG_TYPES[extension];
      if (!type) throw new Error(`Unsupported type: ${extension}`);
      const clean = base64.replace(/\s+/g, '');
      const bytes = (clean.length * 3) / 4;
      if (bytes > 5_000_000)
        throw new Error('Image too large — 5MB max (GitHub contents API limit).');
      const path = `public/images/${name}.${extension}`;
      const r = await gh(env, path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `mcp: upload image ${name}.${extension}`,
          content: clean,
          branch: 'main',
        }),
      });
      if (r.status === 422)
        throw new Error(
          `"${name}.${extension}" already exists — pick a new name or ask for a versioned name.`,
        );
      if (!r.ok) throw new Error(ghError(r.status, await r.text()));
      const res = (await r.json()) as any;
      const url = `${env.PREVIEW_BASE}/images/${name}.${extension}`;
      return ok(
        `✅ Uploaded image (commit ${res.commit.sha.slice(0, 7)}).\nURL: ${url}\nUse it in poster/headshot fields; live on preview in ~2 min.`,
        { url, path, commit: res.commit.sha },
      );
    },
  );

  for (const def of COLLECTIONS) {
    const S = def.schema;
    const dirNote = `Content file: src/content/${def.dir}/<slug>.md`;

    server.registerTool(
      `list_${def.plural}`,
      {
        description: `List the ${def.plural} on yiapanis.co (slugs only). Use get_${def.singular} to read one.`,
      },
      async () => {
        const r = await gh(env, `src/content/${def.dir}`);
        if (!r.ok) throw new Error(ghError(r.status, await r.text()));
        const files = (await r.json()) as any[];
        const slugs = files
          .filter((f: any) => f.name.endsWith('.md'))
          .map((f: any) => f.name.replace(/\.md$/, ''));
        return ok(
          `${def.plural} (${slugs.length}): ${slugs.join(', ') || 'none'}\nPreview page: ${env.PREVIEW_BASE}${def.page('')}`,
          { slugs },
        );
      },
    );

    server.registerTool(
      `get_${def.singular}`,
      {
        description: `Read one ${def.singular} from yiapanis.co — frontmatter and full body text.`,
        inputSchema: {
          slug: z.string().regex(SLUG_RE, 'lowercase letters, numbers, dashes'),
        },
      },
      async ({ slug }: any) => {
        const r = await gh(env, filePath(def, slug));
        if (r.status === 404)
          throw new Error(`No ${def.singular} "${slug}". Run list_${def.plural} first.`);
        if (!r.ok) throw new Error(ghError(r.status, await r.text()));
        const file = (await r.json()) as any;
        const { data, body } = parseDoc(b64decode(file.content));
        return ok(
          `--- frontmatter ---\n${yamlDump(data, { lineWidth: -1 })}--- body ---\n${body}`,
          { slug, frontmatter: data, body },
        );
      },
    );

    server.registerTool(
      `create_${def.singular}`,
      {
        description: `Create a new ${def.singular} on yiapanis.co. ${dirNote}. Fails if the slug already exists. The change goes live on the preview site ~2 minutes after the commit.`,
        inputSchema: {
          slug: z.string().regex(SLUG_RE, 'lowercase letters, numbers, dashes'),
          body: z.string().max(MAX_BODY).optional().describe('Markdown body below the frontmatter'),
          ...S.shape,
        },
      },
      async (input: any) => {
        const { slug, body, ...fields } = input;
        const existing = await gh(env, filePath(def, slug));
        if (existing.ok)
          throw new Error(`"${slug}" already exists — use update_${def.singular} instead.`);
        if (existing.status !== 404)
          throw new Error(ghError(existing.status, await existing.text()));

        let doc: any;
        try {
          doc = S.parse(fields);
        } catch (e: any) {
          throw new Error(`Validation failed: ${e.message}`);
        }
        const content = serializeDoc(doc, body ?? '');
        const r = await gh(env, filePath(def, slug), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `mcp: create ${def.dir}/${slug}`,
            content: b64encode(content),
            branch: 'main',
          }),
        });
        if (!r.ok) throw new Error(ghError(r.status, await r.text()));
        const res = (await r.json()) as any;
        return ok(
          `✅ Created ${def.singular} "${slug}" (commit ${res.commit.sha.slice(0, 7)}).\nLive on preview in ~2 min: ${env.PREVIEW_BASE}${def.page(slug)}`,
          { slug, commit: res.commit.sha, previewUrl: env.PREVIEW_BASE + def.page(slug) },
        );
      },
    );

    server.registerTool(
      `update_${def.singular}`,
      {
        description: `Update an existing ${def.singular} on yiapanis.co. Provide ONLY the fields to change — omitted fields keep their current values. ${dirNote}. The change goes live on the preview site ~2 minutes after the commit.`,
        inputSchema: {
          slug: z.string().regex(SLUG_RE, 'lowercase letters, numbers, dashes'),
          body: z.string().max(MAX_BODY).optional().describe('Replaces the entire markdown body if provided'),
          ...S.partial().shape,
        },
      },
      async (input: any) => {
        const { slug, body, ...fields } = input;
        const r = await gh(env, filePath(def, slug));
        if (r.status === 404)
          throw new Error(`No ${def.singular} "${slug}". Run list_${def.plural} first.`);
        if (!r.ok) throw new Error(ghError(r.status, await r.text()));
        const file = (await r.json()) as any;
        const { data: current, body: currentBody } = parseDoc(b64decode(file.content));

        const merged = { ...current, ...fields };
        let doc: any;
        try {
          doc = S.parse(merged);
        } catch (e: any) {
          throw new Error(
            `Validation failed: ${e.message}\nCurrent frontmatter for reference:\n${yamlDump(current)}`,
          );
        }
        const content = serializeDoc(doc, body ?? currentBody);
        const put = await gh(env, filePath(def, slug), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `mcp: update ${def.dir}/${slug}`,
            content: b64encode(content),
            sha: file.sha,
            branch: 'main',
          }),
        });
        if (!put.ok) throw new Error(ghError(put.status, await put.text()));
        const res = (await put.json()) as any;
        return ok(
          `✅ Updated ${def.singular} "${slug}" (commit ${res.commit.sha.slice(0, 7)}).\nLive on preview in ~2 min: ${env.PREVIEW_BASE}${def.page(slug)}`,
          { slug, commit: res.commit.sha, previewUrl: env.PREVIEW_BASE + def.page(slug) },
        );
      },
    );
  }
}