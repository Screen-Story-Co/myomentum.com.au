import { defineCollection } from 'astro:content';
import {
  filmsSchema,
  blogSchema,
  profileSchema,
} from './schemas';

const films = defineCollection({ type: 'content', schema: filmsSchema });
const blog = defineCollection({ type: 'content', schema: blogSchema });
const profile = defineCollection({ type: 'content', schema: profileSchema });

export const collections = { films, blog, profile };
