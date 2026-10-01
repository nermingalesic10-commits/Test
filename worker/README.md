# OrbitPath role-draft Worker

This folder contains the separate Cloudflare Worker for the optional Dream Role to draft quest flow. It is source only: it has **not** been deployed, connected to the Pages site, or given any account credentials.

The GitHub Pages front end stays static. When a human later deploys this Worker, the browser sends only a role title and a temporary anonymous session identifier to the POST /v1/draft-quest endpoint. The Worker uses its Cloudflare Workers AI binding to return a draft; it does not accept job-post URLs, resumes, company details, accounts, or personal records.

## Local interactive preview

From the project root, run these commands in separate terminals:

    node worker/test/dev-server.mjs
    node worker/test/static-preview.mjs

Open the static preview on port 8767. The committed runtime-config.js recognizes that local preview and calls the demo Worker at port 8787. Its result is explicitly labeled **Local example · not AI**. The adapter runs the same Worker route with DEMO_MODE=true; it makes no network or model call.

## Checks

Run the Worker tests without installing dependencies:

    node --test worker/test/index.test.mjs

## Deploy after human review

1. Install a current Wrangler 4 release (rate-limit bindings require 4.36.0 or later) and sign in to the intended Cloudflare account.
2. In worker/wrangler.jsonc, replace namespace_id 1001 with an unused positive integer for that account if it is already in use.
3. From this worker directory, deploy with Wrangler. The AI binding is configured in the Worker file; no browser API key or checked-in secret is needed.
4. Copy the resulting workers.dev base URL into ../runtime-config.js as questApiUrl, then review and publish that separate static-file change only when approved.

Keep ALLOWED_ORIGINS limited to the registered Pages origin and the chosen local development origins. The Worker applies a five-requests-per-minute rate-limit binding, but CORS and rate limiting are not authentication; add Turnstile or account-based controls before opening the endpoint broadly.

Workers AI usage can be metered. Review the Cloudflare account’s current Workers AI pricing and usage controls before deployment.

