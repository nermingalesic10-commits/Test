/* Public runtime settings only. Never place credentials or secrets in this file. */
const orbitPathIsLocalPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname);

window.ORBITPATH_CONFIG = Object.freeze({
  // After Cloudflare deployment, replace the empty string with the Worker base URL.
  // The local preview expects `node worker/test/dev-server.mjs` on port 8787.
  questApiUrl: orbitPathIsLocalPreview ? 'http://127.0.0.1:8787' : ''
});

