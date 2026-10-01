const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MAX_BODY_BYTES = 512;
const DEFAULT_ORIGINS = 'https://nermingalesic10-commits.github.io,http://127.0.0.1:8766,http://localhost:8766,http://127.0.0.1:8767,http://localhost:8767';

const DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'milestones', 'skills'],
  properties: {
    summary: { type: 'string', minLength: 20, maxLength: 220 },
    milestones: {
      type: 'array',
      minItems: 7,
      maxItems: 7,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'caption', 'unlock', 'skills', 'next'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 70 },
          caption: { type: 'string', minLength: 3, maxLength: 100 },
          unlock: { type: 'string', minLength: 3, maxLength: 180 },
          skills: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string', minLength: 2, maxLength: 32 }
          },
          next: { type: 'string', minLength: 3, maxLength: 180 }
        }
      }
    },
    skills: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: { type: 'string', minLength: 2, maxLength: 34 }
    }
  }
};

const SYSTEM_PROMPT = [
  'You create a cautious learning roadmap for an early-career person.',
  'The only input is a role title, not a job post or verified market data.',
  'Return exactly seven practical milestones ordered from easy, high-priority foundations to harder proof and application readiness.',
  'Do not claim a company requirement, salary, opening, hiring outcome, certification requirement, or current market fact.',
  'Do not ask for personal information and do not include a person’s name, company, URL, or contact details.',
  'Each milestone must be achievable, specific, and concise. The plan begins at zero progress and requires human review.'
].join(' ');

export default {
  fetch: handleRequest
};

export const __test = {
  cleanRole,
  normaliseModelDraft,
  localExampleDraft,
  trustedOrigin
};

async function handleRequest(request, env) {
  const origin = trustedOrigin(request, env);
  if (request.method === 'OPTIONS') {
    return origin
      ? new Response(null, { status: 204, headers: corsHeaders(origin) })
      : errorResponse('This browser origin is not allowed.', 403);
  }

  if (!origin) return errorResponse('This browser origin is not allowed.', 403);
  if (request.method !== 'POST' || new URL(request.url).pathname !== '/v1/draft-quest') {
    return errorResponse('Not found.', 404, origin);
  }
  if (!String(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return errorResponse('Send a JSON request body.', 415, origin);
  }

  let input;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return errorResponse('Request body is too large.', 413, origin);
    input = JSON.parse(raw);
  } catch {
    return errorResponse('The request body must be valid JSON.', 400, origin);
  }

  const role = cleanRole(input && input.role);
  if (!role) return errorResponse('Enter a 3–80 character role title. Links and personal details are not accepted.', 422, origin);
  const visitorId = cleanVisitorId(input && input.visitorId);
  if (!visitorId) return errorResponse('A temporary visitor identifier is required.', 400, origin);

  let limiterResult;
  try {
    limiterResult = await checkRateLimit(env, visitorId);
  } catch {
    return errorResponse('The request safeguard is unavailable. Try again later.', 503, origin);
  }
  if (limiterResult === 'unavailable') return errorResponse('The request safeguard is unavailable. Try again later.', 503, origin);
  if (limiterResult === 'limited') return errorResponse('Too many draft requests. Please wait a minute and try again.', 429, origin);

  let draft;
  try {
    draft = env.DEMO_MODE === 'true'
      ? localExampleDraft(role)
      : await generateAIDraft(env, role);
  } catch {
    return errorResponse('The draft service could not create a usable plan. Your current map was not changed.', 502, origin);
  }

  return jsonResponse({
    ...draft,
    targetRole: role,
    generatedAt: new Date().toISOString()
  }, 200, origin);
}

function trustedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const allowedOrigins = String(env.ALLOWED_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  return allowedOrigins.includes(origin) ? origin : null;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin'
  };
}

function jsonResponse(payload, status, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(origin ? corsHeaders(origin) : {})
    }
  });
}

function errorResponse(message, status, origin) {
  return jsonResponse({ error: message }, status, origin);
}

function cleanRole(value) {
  const role = String(value || '').replace(/\s+/g, ' ').trim();
  if (role.length < 3 || role.length > 80) return null;
  if (/(https?:\/\/|www\.)/i.test(role)) return null;
  if (!/^[\p{L}\p{N}\s&/(),.'+#-]+$/u.test(role)) return null;
  return role;
}

function cleanVisitorId(value) {
  const visitorId = String(value || '').trim();
  return /^[a-z0-9-]{16,72}$/i.test(visitorId) ? visitorId : null;
}

async function checkRateLimit(env, visitorId) {
  if (!env.DRAFT_QUEST_LIMITER || typeof env.DRAFT_QUEST_LIMITER.limit !== 'function') {
    return env.DEMO_MODE === 'true' ? 'allowed' : 'unavailable';
  }
  const result = await env.DRAFT_QUEST_LIMITER.limit({ key: 'draft-quest:' + visitorId });
  return result && result.success ? 'allowed' : 'limited';
}

async function generateAIDraft(env, role) {
  if (!env.AI || typeof env.AI.run !== 'function') throw new Error('Workers AI binding is not configured.');
  const output = await env.AI.run(MODEL, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Create a role-learning draft for this role title only: ' + JSON.stringify(role) }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'orbitpath_quest_draft',
        schema: DRAFT_SCHEMA
      }
    },
    max_tokens: 1700,
    temperature: 0.2
  });
  const raw = output && typeof output.response === 'string'
    ? JSON.parse(output.response)
    : (output && output.response ? output.response : output);
  return {
    source: 'ai',
    ...normaliseModelDraft(raw)
  };
}

function normaliseModelDraft(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.milestones) || raw.milestones.length !== 7) {
    throw new Error('Model response is not a seven-stop draft.');
  }

  const milestones = raw.milestones.map((milestone, index) => {
    const title = cleanField(milestone && milestone.title, 70);
    const caption = cleanField(milestone && milestone.caption, 100);
    const unlock = cleanField(milestone && milestone.unlock, 180);
    const next = cleanField(milestone && milestone.next, 180);
    const skills = Array.isArray(milestone && milestone.skills)
      ? milestone.skills.map(skill => cleanField(skill, 32)).filter(Boolean).slice(0, 4)
      : [];
    if (!title || !caption || !unlock || !next || skills.length < 2) {
      throw new Error('Model response contains an incomplete milestone at index ' + index + '.');
    }
    return { title, caption, unlock, skills, next };
  });

  const skills = Array.isArray(raw.skills)
    ? raw.skills.map(skill => cleanField(skill, 34)).filter(Boolean).slice(0, 4)
    : [];
  if (skills.length < 3) throw new Error('Model response contains too few skills.');

  const summary = cleanField(raw.summary, 220);
  if (!summary) throw new Error('Model response is missing a summary.');
  return { summary, milestones, skills };
}

function cleanField(value, maximum) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

function localExampleDraft(role) {
  return {
    source: 'local-example',
    summary: 'This local example shows the review-and-accept flow for ' + role + '. It is not an AI result or verified hiring advice.',
    milestones: [
      { title: 'Clarify the role direction', caption: 'Name the work you want to learn', unlock: 'A focused starting point for choosing practice work.', skills: ['Role research', 'Goal setting'], next: 'Write a two-sentence description of the work you hope to do.' },
      { title: 'Build one core skill', caption: 'Start with a useful foundation', unlock: 'A small proof of steady practice.', skills: ['Fundamentals', 'Practice routine'], next: 'Schedule three short practice sessions this week.' },
      { title: 'Practice a realistic task', caption: 'Turn theory into a small exercise', unlock: 'A concrete example you can discuss.', skills: ['Problem solving', 'Documentation'], next: 'Complete one guided exercise and note what you learned.' },
      { title: 'Create a mini-project', caption: 'Answer a small question with your skills', unlock: 'A portfolio-ready work sample.', skills: ['Project planning', 'Execution'], next: 'Choose a small dataset or brief and define the result you want.' },
      { title: 'Explain your process', caption: 'Show how you made decisions', unlock: 'A clear story for applications and conversations.', skills: ['Communication', 'Reflection'], next: 'Write a short project summary using problem, process, and result.' },
      { title: 'Practice your story', caption: 'Connect the work to your goals', unlock: 'More confidence describing your progress.', skills: ['Interview practice', 'Storytelling'], next: 'Record a one-minute explanation of your project.' },
      { title: 'Prepare an application-ready packet', caption: 'Collect your evidence in one place', unlock: 'A thoughtful next step toward applying.', skills: ['Applications', 'Portfolio review'], next: 'Match one project example to a manual application entry.' }
    ],
    skills: ['Role research', 'Project practice', 'Communication', 'Application preparation']
  };
}

