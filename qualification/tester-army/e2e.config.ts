import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';

const url = process.env.BOQA_PREVIEW_URL;
if (!url || !/^https:\/\/[a-z0-9.-]+\.workers\.dev\/?$/i.test(url)) {
  throw new Error('EXACT_CLOUDFLARE_PREVIEW_REQUIRED');
}
const app = { url, identity: 'boqa-pr71-exact-preview' };
export default {
  projectId: 'boqa.oss.v151.preview',
  output: '.e2e',
  workers: 1,
  retries: 0,
  targets: [
    { name: 'desktop-1440', engine: web({ viewport: { width: 1440, height: 900 } }), app },
    { name: 'mobile-390', engine: web({ viewport: { width: 390, height: 844 } }), app },
  ],
} satisfies E2EConfig;
