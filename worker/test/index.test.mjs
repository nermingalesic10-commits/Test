import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { __test } from '../src/index.mjs';

const allowedOrigin = 'https://example.test';
const allowedEnv = {
  DEMO_MODE: 'true',
  ALLOWED_ORIGINS: allowedOrigin,
  DRAFT_QUEST_LIMITER: { limit: async () => ({ success: true }) }
};

function request(body, origin = allowedOrigin) {
  return new Request('https://worker.example/v1/draft-quest', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: origin },
    body: JSON.stringify(body)
  });
}

test('creates a clearly labeled local example draft in demo mode', async () => {
  const response = await worker.fetch(request({ role: 'Data Analyst Intern', visitorId: 'visitor-1234567890' }), allowedEnv);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(body.source, 'local-example');
  assert.equal(body.targetRole, 'Data Analyst Intern');
  assert.equal(body.milestones.length, 7);
  assert.equal(body.skills.length, 4);
});

test('does not allow a job-post URL or another browser origin', async () => {
  const urlResponse = await worker.fetch(request({ role: 'https://example.com/job', visitorId: 'visitor-1234567890' }), allowedEnv);
  const originResponse = await worker.fetch(request({ role: 'Data Analyst Intern', visitorId: 'visitor-1234567890' }, 'https://untrusted.example'), allowedEnv);
  assert.equal(urlResponse.status, 422);
  assert.equal(originResponse.status, 403);
  assert.equal(originResponse.headers.get('access-control-allow-origin'), null);
});

test('returns a safe limit response before generation', async () => {
  const limited = {
    ...allowedEnv,
    DRAFT_QUEST_LIMITER: { limit: async () => ({ success: false }) }
  };
  const response = await worker.fetch(request({ role: 'Data Analyst Intern', visitorId: 'visitor-1234567890' }), limited);
  assert.equal(response.status, 429);
  assert.match((await response.json()).error, /Too many draft requests/);
});

test('normalizes only complete model output', () => {
  assert.equal(__test.cleanRole('Data Analyst Intern'), 'Data Analyst Intern');
  assert.equal(__test.cleanRole('https://example.com/jobs'), null);
  assert.throws(() => __test.normaliseModelDraft({ milestones: [] }), /seven-stop/);
});

