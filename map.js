(() => {
  const initialMilestones = [
    { id: 'direction', step: 1, icon: '✦', priority: 'High priority', effort: 'Easy start', x: 16, y: 78, title: 'Choose your target role', caption: 'Pick one internship direction', status: 'Completed', reviewed: 'Sep 10, 2026', color: '#6646d8', soft: '#f0edff', progress: 100, unlock: 'A focused target role and a short list of skill priorities.', skills: ['Career research', 'Role comparison'], next: 'Save one role description and highlight the skills that repeat.' },
    { id: 'excel', step: 2, icon: '▦', priority: 'High priority', effort: 'Easy starter win', x: 32, y: 61, title: 'Build an Excel dashboard', caption: 'Show one clear insight', status: 'In progress', reviewed: 'Sep 26, 2026', color: '#3478f6', soft: '#e8f0ff', progress: 68, unlock: 'A portfolio-ready reporting example for applications.', skills: ['Pivot tables', 'Formulas', 'Data visualization'], next: 'Finish a one-page dashboard and explain two decisions you made.' },
    { id: 'sql', step: 3, icon: '⌘', priority: 'High priority', effort: 'Core skill', x: 50, y: 70, title: 'Complete a SQL query lab', caption: 'Join and summarize clean data', status: 'In progress', reviewed: 'Sep 24, 2026', color: '#0d9b88', soft: '#e0f7f2', progress: 45, unlock: 'The ability to discuss joins and analysis with more confidence.', skills: ['SELECT', 'JOIN', 'GROUP BY'], next: 'Practice two joins and save an annotated query example.' },
    { id: 'python', step: 4, icon: '⌁', priority: 'Build next', effort: 'Medium challenge', x: 65, y: 52, title: 'Ship a Python mini-project', caption: 'Answer a real data question', status: 'Planned', reviewed: 'Sep 21, 2026', color: '#ef6b63', soft: '#fff0ee', progress: 15, unlock: 'An additional proof point for data-focused roles.', skills: ['Pandas', 'Charts', 'Documentation'], next: 'Pick a small public practice dataset and define one question to answer.' },
    { id: 'portfolio', step: 5, icon: '◈', priority: 'Build next', effort: 'Medium challenge', x: 49, y: 36, title: 'Publish a portfolio case study', caption: 'Package your strongest work', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#f09b25', soft: '#fff3d9', progress: 5, unlock: 'A simple link you can share with applications and conversations.', skills: ['Writing', 'Project framing', 'Reflection'], next: 'Outline one case study using problem, process, and result sections.' },
    { id: 'interview', step: 6, icon: '◌', priority: 'Stretch goal', effort: 'Harder proof', x: 67, y: 18, title: 'Practice your interview story', caption: 'Explain your work with confidence', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#b03b99', soft: '#ffeaf8', progress: 0, unlock: 'A practiced story that connects skills to the internship role.', skills: ['Communication', 'Reflection', 'Storytelling'], next: 'Record a two-minute explanation of your dashboard or project.' },
    { id: 'ready', step: 7, icon: '★', priority: 'Finish', effort: 'Final checkpoint', x: 85, y: 18, title: 'Apply internship-ready', caption: 'Use evidence in each application', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#2e5ad7', soft: '#e7edff', progress: 0, unlock: 'A recurring routine for thoughtful, well-matched applications.', skills: ['Applications', 'Networking', 'Interview stories'], next: 'Connect your completed projects to a first set of manual applications.' }
  ];

  const initialSkills = [
    { name: 'Excel', percent: 68, status: 'In progress', reviewed: 'Sep 26, 2026', color: '#3478f6' },
    { name: 'SQL', percent: 45, status: 'In progress', reviewed: 'Sep 24, 2026', color: '#0d9b88' },
    { name: 'Python', percent: 15, status: 'Planned', reviewed: 'Sep 21, 2026', color: '#ef6b63' }
  ];

  const boardLayout = initialMilestones.map(({ id, step, icon, priority, effort, x, y, color, soft }) => ({ id, step, icon, priority, effort, x, y, color, soft }));
  const skillColors = ['#3478f6', '#0d9b88', '#ef6b63', '#f09b25'];
  const statusClass = { 'Planned': 'planned', 'In progress': 'progress', 'Submitted': 'submitted', 'Completed': 'completed' };
  const list = document.querySelector('#milestoneList');
  const detail = document.querySelector('#milestoneDetail');
  const allView = document.querySelector('#allView');
  const mapShell = document.querySelector('#career-map');
  const totalProgressLabel = document.querySelector('#totalProgress');
  const roleForm = document.querySelector('#roleDraftForm');
  const roleInput = document.querySelector('#roleInput');
  const generateDraft = document.querySelector('#generateDraft');
  const plannerStatus = document.querySelector('#plannerStatus');
  const draftReview = document.querySelector('#draftReview');
  const goalRole = document.querySelector('#goalRole');
  const goalMeta = document.querySelector('#goalMeta');
  const dataNotice = document.querySelector('#dataNotice');
  const config = window.ORBITPATH_CONFIG || {};
  const draftEndpoint = normaliseEndpoint(config.questApiUrl);

  let milestones = initialMilestones.map(item => ({ ...item, skills: [...item.skills] }));
  let skills = initialSkills.map(item => ({ ...item }));
  let selectedId = null;
  let activeRole = 'Data & Analytics Intern';
  let journeySource = 'sample';
  let pendingDraft = null;

  if (!list || !detail || !allView || !mapShell || !totalProgressLabel) return;

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function cleanText(value, maximum, fallback) {
    const cleaned = String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maximum);
    return cleaned || fallback;
  }

  function clamp(value, minimum, maximum) {
    const number = Number(value);
    if (!Number.isFinite(number)) return minimum;
    return Math.min(maximum, Math.max(minimum, number));
  }

  function normaliseEndpoint(value) {
    const endpoint = String(value || '').trim().replace(/\/+$/, '');
    return /^https?:\/\/[^\s/]+(?::\d+)?(?:\/[^?#]*)?$/i.test(endpoint) ? endpoint : '';
  }

  function formatDate(value = Date.now()) {
    const date = new Date(value);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(safeDate);
  }

  function roleIsValid(role) {
    return role.length >= 3 && role.length <= 80 && !/(https?:\/\/|www\.)/i.test(role) && /^[\p{L}\p{N}\s&/(),.'+#-]+$/u.test(role);
  }

  function totalProgress() {
    return Math.round(milestones.reduce((sum, milestone) => sum + clamp(milestone.progress, 0, 100), 0) / Math.max(1, milestones.length));
  }

  function latestReview() {
    return milestones.reduce((latest, milestone) => {
      const latestTime = Date.parse(latest.reviewed);
      const candidateTime = Date.parse(milestone.reviewed);
      return candidateTime > latestTime ? milestone : latest;
    }, milestones[0]).reviewed;
  }

  function statusSummary(status) {
    return milestones.filter(milestone => milestone.status === status).length;
  }

  function currentSource() {
    if (journeySource === 'ai') {
      return {
        label: 'AI-generated draft',
        notice: 'This is an AI-generated draft based only on the role title you entered. It is not job-market or hiring data; review it before acting.',
        detail: 'AI-generated draft · verify before treating this as career guidance.',
        skill: 'AI draft skill suggestion',
        achievement: 'Quest draft accepted locally'
      };
    }

    if (journeySource === 'local-example') {
      return {
        label: 'Local example draft',
        notice: 'This is a local example draft for testing the review flow. It did not call an AI service and is not hiring advice.',
        detail: 'Local example draft · not an AI recommendation or verified career guidance.',
        skill: 'local example skill suggestion',
        achievement: 'Local quest example accepted'
      };
    }

    return {
      label: 'Fictional roadmap',
      notice: 'This board is an illustrative career path, not verified hiring advice. Every stop and skill signal shows its status and last-reviewed date.',
      detail: 'Fictional sample milestone · not verified career progress.',
      skill: 'illustrative skill signal',
      achievement: 'Direction set'
    };
  }

  function updateJourneyLabels() {
    const source = currentSource();
    const reviewed = latestReview();

    if (goalRole) goalRole.textContent = activeRole;
    if (goalMeta) goalMeta.textContent = source.label + ' · Last reviewed ' + reviewed;
    if (dataNotice) {
      const title = dataNotice.querySelector('strong');
      const copy = dataNotice.querySelector('span');
      if (title) title.textContent = journeySource === 'sample' ? 'Sample data' : 'Draft data';
      if (copy) copy.textContent = source.notice;
    }
  }

  function node(milestone) {
    const selected = milestone.id === selectedId;
    const status = statusClass[milestone.status] ? milestone.status : 'Planned';
    return '<button class="board-stop" type="button" data-milestone="' + escapeHTML(milestone.id) + '" aria-label="Stop ' + milestone.step + ': ' + escapeHTML(milestone.title) + '. ' + escapeHTML(milestone.priority) + ', ' + escapeHTML(milestone.effort) + '. ' + status + '. Last reviewed: ' + escapeHTML(milestone.reviewed) + '" aria-pressed="' + selected + '" style="--node:' + milestone.color + ';--node-soft:' + milestone.soft + ';--x:' + milestone.x + ';--y:' + milestone.y + '">' +
      '<span class="stop-number">' + milestone.step + '</span>' +
      '<span class="stop-top"><span class="priority">' + escapeHTML(milestone.priority) + '</span><span class="status ' + statusClass[status] + '">' + status + '</span></span>' +
      '<strong>' + escapeHTML(milestone.title) + '</strong><span class="reviewed">Last reviewed: ' + escapeHTML(milestone.reviewed) + '</span>' +
    '</button>';
  }

  function skillCard(skill) {
    const status = statusClass[skill.status] ? skill.status : 'Planned';
    const percent = clamp(skill.percent, 0, 100);
    return '<article class="skill"><div class="skill-top"><strong>' + escapeHTML(skill.name) + '</strong><span class="status ' + statusClass[status] + '">' + status + '</span></div>' +
      '<div class="progress-wrap"><div class="progress-info"><span>' + (journeySource === 'sample' ? 'Sample progress' : 'Draft progress') + '</span><b>' + percent + '%</b></div><div class="bar" style="--bar:' + skill.color + '"><span style="width:' + percent + '%"></span></div></div>' +
      '<small>Last reviewed: ' + escapeHTML(skill.reviewed) + ' · ' + currentSource().skill + '</small></article>';
  }

  function overviewItem(milestone) {
    const status = statusClass[milestone.status] ? milestone.status : 'Planned';
    return '<button class="overview-item" type="button" data-milestone="' + escapeHTML(milestone.id) + '" aria-label="Open stop ' + milestone.step + ': ' + escapeHTML(milestone.title) + '">' +
      '<span class="overview-step">Stop ' + milestone.step + '</span><strong>' + escapeHTML(milestone.title) + '</strong>' +
      '<span class="overview-meta"><span class="status ' + statusClass[status] + '">' + status + '</span><b>' + clamp(milestone.progress, 0, 100) + '%</b></span>' +
      '<span class="reviewed">Last reviewed: ' + escapeHTML(milestone.reviewed) + '</span></button>';
  }

  function renderOverview() {
    const overall = totalProgress();
    const source = currentSource();
    const firstPlanned = milestones.find(milestone => milestone.progress < 100) || milestones[milestones.length - 1];
    detail.style.setProperty('--accent', '#6646d8');
    detail.innerHTML = '<div class="detail-top overview-top"><p class="detail-kicker">Journey home · all view</p><h2>' + overall + '% total progress</h2><p>One combined view across all seven ' + (journeySource === 'sample' ? 'sample milestones' : 'draft milestones') + '.</p></div>' +
      '<div class="detail-body"><p class="rule-line"><b>' + escapeHTML(source.label) + '</b> · Latest review: <b>' + escapeHTML(latestReview()) + '</b><br>Total progress is the equal-weight average of every milestone percentage.</p>' +
      '<div class="progress-wrap overview-bar"><div class="progress-info"><span>Combined journey progress</span><b>' + overall + '%</b></div><div class="bar" style="--bar:#6646d8"><span style="width:' + overall + '%"></span></div></div>' +
      '<div class="overview-counts"><span><b>' + statusSummary('Completed') + '</b> completed</span><span><b>' + statusSummary('In progress') + '</b> in progress</span><span><b>' + statusSummary('Planned') + '</b> planned</span></div>' +
      '<p class="detail-label">Every checkpoint</p><div class="overview-grid">' + milestones.map(overviewItem).join('') + '</div>' +
      '<p class="detail-label">Next focus</p><p class="detail-copy">' + escapeHTML(firstPlanned.next) + '</p>' +
      '<p class="detail-label">Skill signals</p><div class="skills">' + skills.map(skillCard).join('') + '</div></div>';
  }

  function renderMilestone(milestone) {
    const status = statusClass[milestone.status] ? milestone.status : 'Planned';
    const source = currentSource();
    const progress = clamp(milestone.progress, 0, 100);
    detail.style.setProperty('--accent', milestone.color);
    detail.innerHTML = '<div class="detail-top"><p class="detail-kicker">' + escapeHTML(milestone.priority) + ' · ' + escapeHTML(milestone.effort) + '</p><h2>' + escapeHTML(milestone.title) + '</h2><p>' + escapeHTML(milestone.caption) + '</p></div>' +
      '<div class="detail-body"><p class="rule-line"><b>' + status + '</b> · Last reviewed: <b>' + escapeHTML(milestone.reviewed) + '</b><br>' + escapeHTML(source.detail) + '</p>' +
      '<div class="progress-wrap"><div class="progress-info"><span>' + (journeySource === 'sample' ? 'Sample completion' : 'Draft completion') + '</span><b>' + progress + '%</b></div><div class="bar" style="--bar:' + milestone.color + '"><span style="width:' + progress + '%"></span></div></div>' +
      '<p class="detail-label">Why it matters</p><p class="detail-copy">' + escapeHTML(milestone.unlock) + '</p><p class="detail-label">Skills to practice</p><div class="chip-row">' + milestone.skills.map(skill => '<span class="chip">' + escapeHTML(skill) + '</span>').join('') + '</div><p class="detail-label">Next useful step</p><p class="detail-copy">' + escapeHTML(milestone.next) + '</p>' +
      '<p class="detail-label">Skill signals</p><div class="skills">' + skills.map(skillCard).join('') + '</div>' +
      '<p class="detail-label">Achievements</p>' + achievementMarkup(source) + '</div>';
  }

  function achievementMarkup(source) {
    const reviewed = escapeHTML(latestReview());
    if (journeySource === 'sample') {
      return '<div class="achievement-grid"><article class="achievement"><span class="badge">✦</span><strong>Direction set</strong><small>Completed · Last reviewed: Sep 10</small></article><article class="achievement"><span class="badge">▦</span><strong>Dashboard starter</strong><small>In progress · Last reviewed: Sep 26</small></article></div>';
    }
    return '<div class="achievement-grid"><article class="achievement"><span class="badge">✦</span><strong>' + escapeHTML(source.achievement) + '</strong><small>Planned · Last reviewed: ' + reviewed + '</small></article><article class="achievement"><span class="badge">◌</span><strong>Review before action</strong><small>Planned · Last reviewed: ' + reviewed + '</small></article></div>';
  }

  function render() {
    const isAllView = selectedId === null;
    const overall = totalProgress();
    list.innerHTML = milestones.map(node).join('');
    allView.setAttribute('aria-pressed', String(isAllView));
    mapShell.classList.toggle('all-view', isAllView);
    totalProgressLabel.textContent = overall + '% total progress · ' + statusSummary('Completed') + ' of ' + milestones.length + ' complete';

    if (isAllView) {
      renderOverview();
      return;
    }

    const milestone = milestones.find(item => item.id === selectedId) || milestones[0];
    renderMilestone(milestone);
  }

  function selectMilestone(id) {
    selectedId = id;
    render();
  }

  function setPlannerStatus(message, tone = 'info') {
    if (!plannerStatus) return;
    plannerStatus.textContent = message;
    plannerStatus.dataset.tone = tone;
  }

  function visitorId() {
    const key = 'orbitpath-draft-session';
    try {
      const existing = window.sessionStorage.getItem(key);
      if (/^[a-z0-9-]{16,72}$/i.test(existing || '')) return existing;
      const created = window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : 'visitor-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
      window.sessionStorage.setItem(key, created);
      return created;
    } catch {
      return 'visitor-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    }
  }

  function normaliseDraft(payload, requestedRole) {
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.milestones) || payload.milestones.length !== boardLayout.length) {
      throw new Error('The draft response did not include seven usable milestones.');
    }

    const draftSkills = Array.isArray(payload.skills) ? payload.skills : [];
    const source = payload.source === 'local-example' ? 'local-example' : 'ai';
    const role = cleanText(payload.targetRole, 80, requestedRole);
    const reviewed = formatDate(payload.generatedAt);
    const draftMilestones = payload.milestones.map((milestone, index) => ({
      title: cleanText(milestone && milestone.title, 70, 'Draft checkpoint ' + (index + 1)),
      caption: cleanText(milestone && milestone.caption, 100, 'Practice a useful skill for this role.'),
      skills: Array.isArray(milestone && milestone.skills)
        ? milestone.skills.slice(0, 4).map(skill => cleanText(skill, 32, 'Skill')).filter(Boolean)
        : ['Skill practice'],
      next: cleanText(milestone && milestone.next, 180, 'Choose one small next action for this checkpoint.'),
      unlock: cleanText(milestone && milestone.unlock, 180, 'A practical proof point for your career journey.')
    }));

    const safeSkills = draftSkills.slice(0, 4).map(skill => cleanText(skill, 34, '')).filter(Boolean);
    if (safeSkills.length < 3) {
      draftMilestones.forEach(milestone => {
        milestone.skills.forEach(skill => {
          if (safeSkills.length < 4 && !safeSkills.includes(skill)) safeSkills.push(skill);
        });
      });
    }
    if (safeSkills.length < 3) throw new Error('The draft did not include enough skill suggestions.');

    return {
      source,
      targetRole: role,
      summary: cleanText(payload.summary, 220, 'Review this draft and adjust the milestones before you accept it.'),
      reviewed,
      milestones: draftMilestones,
      skills: safeSkills
    };
  }

  function renderDraftReview() {
    if (!draftReview || !pendingDraft) return;
    const sourceLabel = pendingDraft.source === 'local-example' ? 'Local example · not AI' : 'AI draft · review required';
    draftReview.hidden = false;
    draftReview.innerHTML = '<div class="draft-review-head"><div><p class="detail-kicker">Review before replacing the map</p><h2>' + escapeHTML(pendingDraft.targetRole) + ' quest draft</h2><p>' + escapeHTML(pendingDraft.summary) + '</p></div><span class="draft-meta">' + escapeHTML(sourceLabel) + '</span></div>' +
      '<form id="draftEditForm" class="draft-review-body"><p class="draft-rule"><b>Planned</b> · Last reviewed: <b>' + escapeHTML(pendingDraft.reviewed) + '</b><br>Edit anything below. Accepting replaces only this browser session’s map; it does not save an account or progress.</p>' +
      '<div class="draft-grid">' + pendingDraft.milestones.map((milestone, index) => '<article class="draft-stop"><div class="draft-stop-top"><b>Stop ' + (index + 1) + '</b><span class="status planned">Planned</span></div><label class="field">Milestone title<input name="draft-title-' + index + '" maxlength="70" value="' + escapeHTML(milestone.title) + '"></label><label class="field">Skills (comma-separated)<input name="draft-skills-' + index + '" maxlength="140" value="' + escapeHTML(milestone.skills.join(', ')) + '"></label><label class="field">Next useful step<textarea name="draft-next-' + index + '" maxlength="180">' + escapeHTML(milestone.next) + '</textarea></label><span class="reviewed">Last reviewed: ' + escapeHTML(pendingDraft.reviewed) + '</span></article>').join('') + '</div>' +
      '<div class="draft-actions"><button class="button" type="submit">Accept this quest</button><button class="button secondary" type="button" data-draft-action="discard">Discard draft</button><p class="form-hint">Acceptance does not affect your Applications page or any saved account.</p></div></form>';
  }

  function applyDraft(draft) {
    const source = draft.source === 'local-example' ? 'local-example' : 'ai';
    milestones = draft.milestones.map((milestone, index) => {
      const layout = boardLayout[index];
      return {
        ...layout,
        title: cleanText(milestone.title, 70, 'Draft checkpoint ' + (index + 1)),
        caption: cleanText(milestone.caption, 100, 'Practice a useful skill for this role.'),
        status: 'Planned',
        reviewed: draft.reviewed,
        progress: 0,
        unlock: cleanText(milestone.unlock, 180, 'A practical proof point for your career journey.'),
        skills: Array.isArray(milestone.skills) ? milestone.skills.slice(0, 4).map(skill => cleanText(skill, 32, 'Skill')) : ['Skill practice'],
        next: cleanText(milestone.next, 180, 'Choose one small next action for this checkpoint.')
      };
    });
    skills = draft.skills.slice(0, 4).map((name, index) => ({
      name: cleanText(name, 34, 'Skill'),
      percent: 0,
      status: 'Planned',
      reviewed: draft.reviewed,
      color: skillColors[index % skillColors.length]
    }));
    activeRole = draft.targetRole;
    journeySource = source;
    selectedId = null;
    updateJourneyLabels();
    render();
  }

  async function requestDraft(event) {
    event.preventDefault();
    const role = cleanText(roleInput ? roleInput.value : '', 80, '');

    if (!roleIsValid(role)) {
      setPlannerStatus('Enter a 3–80 character role title. Links and personal details are not accepted.', 'error');
      if (roleInput) roleInput.focus();
      return;
    }
    if (!draftEndpoint) {
      setPlannerStatus('The role-draft service is not configured for this Pages preview. Follow worker/README.md after human review.', 'error');
      return;
    }

    if (generateDraft) {
      generateDraft.disabled = true;
      generateDraft.textContent = 'Creating draft…';
    }
    setPlannerStatus('Creating a draft from the role title only…', 'info');

    try {
      const response = await fetch(draftEndpoint + '/v1/draft-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, visitorId: visitorId() })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(cleanText(payload && payload.error, 180, 'The draft service could not create a plan.'));
      pendingDraft = normaliseDraft(payload, role);
      renderDraftReview();
      setPlannerStatus(pendingDraft.source === 'local-example' ? 'Local example draft is ready to review. It did not call AI.' : 'AI draft is ready to review and edit.', 'success');
      draftReview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setPlannerStatus(error instanceof Error ? error.message : 'The draft service could not be reached. Your map was not changed.', 'error');
    } finally {
      if (generateDraft) {
        generateDraft.disabled = false;
        generateDraft.textContent = 'Create draft quest';
      }
    }
  }

  function acceptPendingDraft(event) {
    event.preventDefault();
    if (!pendingDraft) return;
    const form = event.target;
    const edited = {
      ...pendingDraft,
      milestones: pendingDraft.milestones.map((milestone, index) => ({
        ...milestone,
        title: cleanText(form.elements['draft-title-' + index].value, 70, milestone.title),
        skills: form.elements['draft-skills-' + index].value.split(',').map(skill => cleanText(skill, 32, '')).filter(Boolean).slice(0, 4),
        next: cleanText(form.elements['draft-next-' + index].value, 180, milestone.next)
      }))
    };
    applyDraft(edited);
    pendingDraft = null;
    draftReview.hidden = true;
    draftReview.innerHTML = '';
    setPlannerStatus('Draft accepted locally. It is not saved after a refresh.', 'success');
    mapShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-milestone]');
    if (button) selectMilestone(button.dataset.milestone);
  });

  detail.addEventListener('click', event => {
    const button = event.target.closest('[data-milestone]');
    if (button) selectMilestone(button.dataset.milestone);
  });

  allView.addEventListener('click', () => {
    selectedId = null;
    render();
  });

  if (roleForm) roleForm.addEventListener('submit', requestDraft);
  if (draftReview) {
    draftReview.addEventListener('submit', event => {
      if (event.target && event.target.id === 'draftEditForm') acceptPendingDraft(event);
    });
    draftReview.addEventListener('click', event => {
      const action = event.target.closest('[data-draft-action]');
      if (!action || action.dataset.draftAction !== 'discard') return;
      pendingDraft = null;
      draftReview.hidden = true;
      draftReview.innerHTML = '';
      setPlannerStatus('Draft discarded. Your current map was not changed.', 'info');
    });
  }

  updateJourneyLabels();
  if (draftEndpoint) {
    setPlannerStatus('Local Worker preview is configured. It creates a clearly labeled local example draft, not an AI result.', 'info');
  }
  render();
})();

