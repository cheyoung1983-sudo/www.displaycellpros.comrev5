import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const disablePreviewHmrClient = (): Plugin => ({
  name: 'disable-preview-hmr-client',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replace(/\s*<script[^>]+src=["']\/@vite\/client[^>]*><\/script>/, '');
    },
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), disablePreviewHmrClient()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Vite is mounted as Express middleware, so there is no WebSocket upgrade
      // path for the dev server. Keep the middleware fully non-HMR in preview.
      hmr: false,
      watch: null,
    },
  };
});
