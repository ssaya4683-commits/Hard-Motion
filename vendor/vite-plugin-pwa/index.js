export function VitePWA(options = {}) {
  return {
    name: 'vite-plugin-pwa-local',
    apply: 'build',
    generateBundle() {
      const manifest = options.manifest || {};
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: JSON.stringify(manifest, null, 2) });
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: "self.addEventListener('install',event=>self.skipWaiting());self.addEventListener('activate',event=>self.clients.claim());" });
    },
    transformIndexHtml(html) {
      return html.includes('manifest.webmanifest') ? html : html.replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"><script type="module">if(\'serviceWorker\' in navigator){window.addEventListener(\'load\',()=>navigator.serviceWorker.register(\'/sw.js\'))}</script></head>');
    }
  };
}
