import { defineConfig } from 'astro/config';

// Preview before DNS cutover lives on ScreenStory infra; prod is myomentum.com.au (still Weebly).
export default defineConfig({
  output: 'static',
  site: 'https://myomentum.com.au',
});
