import { z } from 'zod';

// Single source of truth for content structure.
// Consumers: src/content/config.ts (Astro build validation) + mcp/ worker (tool input schemas).
// Keep field definitions identical in both consumers — never duplicate here.

export const filmsSchema = z.object({
  title: z.string(),
  byline: z.string().optional(),
  genre: z.array(z.string()),
  type: z.string().optional(),
  synopsis: z.string(),
  videoUrl: z.string().optional(),
  poster: z.string().optional(),
  order: z.number().default(0),
  year: z.number().optional(),
});

export const blogSchema = z.object({
  title: z.string(),
  date: z.string(),
  draft: z.boolean().default(false),
  excerpt: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  headshot: z.string().optional(),
});


export const collections = {
  films: filmsSchema,
  blog: blogSchema,
  profile: profileSchema,
} as const;

export type CollectionName = keyof typeof collections;
export const collectionNames = Object.keys(collections) as CollectionName[];