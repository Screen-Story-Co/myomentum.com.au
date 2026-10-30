# yiapanis.co — Agent Context

## Key Paths

| Path | Purpose |
|------|---------|
| `src/content/config.ts` | Content collection schema definitions |
| `src/layouts/Base.astro` | Base page layout (shared HTML shell) |
| `src/components/CloudflareStream.astro` | Video embed component |
| `src/pages/index.astro` | Homepage |
| `src/pages/blog.astro` | Blog listing |
| `src/pages/blog/[...slug].astro` | Individual blog post |
| `src/pages/films.astro` | Filmography listing |
| `src/pages/in-development.astro` | In-development projects |
| `src/pages/contact.astro` | Contact page |
| `functions/api/contact.js` | Contact form handler |
| `functions/api/decap/identity.js` | Decap CMS identity |
| `functions/api/decap/git-gateway.js` | Decap CMS git-gateway |
| `public/admin/` | Decap CMS admin panel config |

## Conventions

- **Content-first**: All text content is in `src/content/` markdown, not hardcoded in pages
- **Images**: Stored in `public/images/` — referenced as `/images/...` in content
- **Films**: Each film markdown references a Cloudflare Stream video ID
- **No auth**: Public static site — no login, no middleware
- **No secrets**: Nothing sensitive in repo; contact form endpoint handles its own

## What NOT to Do

- **Don't hardcode film/video URLs**. Use the `CloudflareStream` component with video IDs
- **Don't put prose in `.astro` files**. Use content collections for all text
- **Don't add heavy JS frameworks**. Astro is the framework; keep it lightweight
- **Don't rename content collection directories**. Slugs are referenced by collection name
