import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue 				from '@vitejs/plugin-vue'
import tailwindcss 		from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      // L'HMR parziale su questo modulo lascia il King's Codex in uno stato inconsistente
      // (il pannello sparisce e non si ripopola). Finche' non e' chiara la causa lato Vue,
      // un cambio ai dati del codex ricarica l'intera pagina: e' lo stesso Ctrl+R, automatico.
      name: 'codex-full-reload',
      handleHotUpdate({ file, server })
      {
        if (!file.endsWith('PiecesCodex.js'))
          return;
        (server.hot ?? server.ws).send({ type: 'full-reload' });
        return [];
      },
    },
  ],
  server: {
    allowedHosts: ['edraccan-transcendence.duckdns.org', 'chessz.duckdns.org'],
    // Il dev server gira in container con ./frontend_dir bind-montato: gli eventi
    // inotify dell'host non arrivano sempre dentro Docker, quindi l'HMR non scatta.
    watch: { usePolling: true, interval: 300 }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
