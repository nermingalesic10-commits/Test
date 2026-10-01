# OrbitPath role-draft Worker

This folder contains the separate Cloudflare Worker for the optional Dream Role to draft quest flow. It is deployed at `https://orbitpath-quest-api.nermingalesic10.workers.dev`; the build branch config points to that public endpoint. GitHub Pages is unchanged until this branch is separately reviewed and merged.

The GitHub Pages front end stays static. When a human later deploys this Worker, the browser sends only a role title and a temporary anonymous session identifier to the POST /v1/draft-quest endpoint. The Worker uses its Cloudflare Workers AI binding to return a draft; it does not accept job-post URLs, resumes, company details, accounts, or personal records.

## Local interactive preview

From the project root, run these commands in separate terminals:

    node worker/test/dev-server.mjs
    node worker/test/static-preview.mjs

Open the static preview on port 8767. The committed runtime-config.js calls the deployed Worker, so entering a role title exercises the configured AI flow. The Worker allowlist includes this local preview origin and the registered Pages origin. For an offline, non-AI demo, temporarily point `runtime-config.js` to `http://127.0.0.1:8787` while `node worker/test/dev-server.mjs` is running; do not commit that local-only setting.

## Checks

Run the Worker tests without installing dependencies:

    node --test worker/test/index.test.mjs

## Deployment configuration

The deployed Worker uses the AI binding and rate-limit binding defined in `wrangler.jsonc`; no browser API key or checked-in secret is used. Future Worker-source changes on this configured build branch automatically create a Cloudflare build. Review and merge the separate Pages-file change only when approved.

Keep ALLOWED_ORIGINS limited to the registered Pages origin and the chosen local development origins. The Worker applies a five-requests-per-minute rate-limit binding, but CORS and rate limiting are not authentication; add Turnstile or account-based controls before opening the endpoint broadly.

Workers AI usage can be metered. Review the Cloudflare account’s current Workers AI pricing and usage controls before deployment.

