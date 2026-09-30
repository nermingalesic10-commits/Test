(() => {
  const milestones = [
    { id: 'direction', step: 1, icon: '✦', priority: 'High priority', effort: 'Easy start', x: 16, y: 78, title: 'Choose your target role', caption: 'Pick one internship direction', status: 'Completed', reviewed: 'Sep 10, 2026', color: '#6646d8', soft: '#f0edff', progress: 100, unlock: 'A focused target role and a short list of skill priorities.', skills: ['Career research', 'Role comparison'], next: 'Save one role description and highlight the skills that repeat.' },
    { id: 'excel', step: 2, icon: '▦', priority: 'High priority', effort: 'Easy starter win', x: 32, y: 61, title: 'Build an Excel dashboard', caption: 'Show one clear insight', status: 'In progress', reviewed: 'Sep 26, 2026', color: '#3478f6', soft: '#e8f0ff', progress: 68, unlock: 'A portfolio-ready reporting example for applications.', skills: ['Pivot tables', 'Formulas', 'Data visualization'], next: 'Finish a one-page dashboard and explain two decisions you made.' },
    { id: 'sql', step: 3, icon: '⌘', priority: 'High priority', effort: 'Core skill', x: 50, y: 70, title: 'Complete a SQL query lab', caption: 'Join and summarize clean data', status: 'In progress', reviewed: 'Sep 24, 2026', color: '#0d9b88', soft: '#e0f7f2', progress: 45, unlock: 'The ability to discuss joins and analysis with more confidence.', skills: ['SELECT', 'JOIN', 'GROUP BY'], next: 'Practice two joins and save an annotated query example.' },
    { id: 'python', step: 4, icon: '⌁', priority: 'Build next', effort: 'Medium challenge', x: 65, y: 52, title: 'Ship a Python mini-project', caption: 'Answer a real data question', status: 'Planned', reviewed: 'Sep 21, 2026', color: '#ef6b63', soft: '#fff0ee', progress: 15, unlock: 'An additional proof point for data-focused roles.', skills: ['Pandas', 'Charts', 'Documentation'], next: 'Pick a small public practice dataset and define one question to answer.' },
    { id: 'portfolio', step: 5, icon: '◈', priority: 'Build next', effort: 'Medium challenge', x: 49, y: 36, title: 'Publish a portfolio case study', caption: 'Package your strongest work', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#f09b25', soft: '#fff3d9', progress: 5, unlock: 'A simple link you can share with applications and conversations.', skills: ['Writing', 'Project framing', 'Reflection'], next: 'Outline one case study using problem, process, and result sections.' },
    { id: 'interview', step: 6, icon: '◌', priority: 'Stretch goal', effort: 'Harder proof', x: 67, y: 18, title: 'Practice your interview story', caption: 'Explain your work with confidence', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#b03b99', soft: '#ffeaf8', progress: 0, unlock: 'A practiced story that connects skills to the internship role.', skills: ['Communication', 'Reflection', 'Storytelling'], next: 'Record a two-minute explanation of your dashboard or project.' },
    { id: 'ready', step: 7, icon: '★', priority: 'Finish', effort: 'Final checkpoint', x: 85, y: 18, title: 'Apply internship-ready', caption: 'Use evidence in each application', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#2e5ad7', soft: '#e7edff', progress: 0, unlock: 'A recurring routine for thoughtful, well-matched applications.', skills: ['Applications', 'Networking', 'Interview stories'], next: 'Connect your completed projects to a first set of manual applications.' }
  ];

  const skills = [
    { name: 'Excel', percent: 68, status: 'In progress', reviewed: 'Sep 26, 2026', color: '#3478f6' },
    { name: 'SQL', percent: 45, status: 'In progress', reviewed: 'Sep 24, 2026', color: '#0d9b88' },
    { name: 'Python', percent: 15, status: 'Planned', reviewed: 'Sep 21, 2026', color: '#ef6b63' }
  ];

  const statusClass = { 'Planned': 'planned', 'In progress': 'progress', 'Submitted': 'submitted', 'Completed': 'completed' };
  const list = document.querySelector('#milestoneList');
  const detail = document.querySelector('#milestoneDetail');
  let selectedId = 'excel';

  if (!list || !detail) return;

  function node(milestone) {
    const selected = milestone.id === selectedId;
    return '<button class="board-stop" type="button" data-milestone="' + milestone.id + '" aria-label="Stop ' + milestone.step + ': ' + milestone.title + '. ' + milestone.priority + ', ' + milestone.effort + '. ' + milestone.status + '. Last reviewed: ' + milestone.reviewed + '" aria-pressed="' + selected + '" style="--node:' + milestone.color + ';--node-soft:' + milestone.soft + ';--x:' + milestone.x + ';--y:' + milestone.y + '">' +
      '<span class="stop-number">' + milestone.step + '</span>' +
      '<span class="stop-top"><span class="priority">' + milestone.priority + '</span><span class="status ' + statusClass[milestone.status] + '">' + milestone.status + '</span></span>' +
      '<strong>' + milestone.title + '</strong><span class="reviewed">Last reviewed: ' + milestone.reviewed + '</span>' +
    '</button>';
  }

  function skillCard(skill) {
    return '<article class="skill"><div class="skill-top"><strong>' + skill.name + '</strong><span class="status ' + statusClass[skill.status] + '">' + skill.status + '</span></div>' +
      '<div class="progress-wrap"><div class="progress-info"><span>Sample progress</span><b>' + skill.percent + '%</b></div><div class="bar" style="--bar:' + skill.color + '"><span style="width:' + skill.percent + '%"></span></div></div>' +
      '<small>Last reviewed: ' + skill.reviewed + ' · illustrative skill signal</small></article>';
  }

  function render() {
    list.innerHTML = milestones.map(node).join('');
    const milestone = milestones.find(item => item.id === selectedId) || milestones[0];
    detail.style.setProperty('--accent', milestone.color);
    detail.innerHTML = '<div class="detail-top"><p class="detail-kicker">' + milestone.priority + ' · ' + milestone.effort + '</p><h2>' + milestone.title + '</h2><p>' + milestone.caption + '</p></div>' +
      '<div class="detail-body"><p class="rule-line"><b>' + milestone.status + '</b> · Last reviewed: <b>' + milestone.reviewed + '</b><br>Fictional sample milestone · not verified career progress.</p>' +
      '<div class="progress-wrap"><div class="progress-info"><span>Sample completion</span><b>' + milestone.progress + '%</b></div><div class="bar" style="--bar:' + milestone.color + '"><span style="width:' + milestone.progress + '%"></span></div></div>' +
      '<p class="detail-label">Why it matters</p><p class="detail-copy">' + milestone.unlock + '</p><p class="detail-label">Skills to practice</p><div class="chip-row">' + milestone.skills.map(skill => '<span class="chip">' + skill + '</span>').join('') + '</div><p class="detail-label">Next useful step</p><p class="detail-copy">' + milestone.next + '</p>' +
      '<p class="detail-label">Skill signals</p><div class="skills">' + skills.map(skillCard).join('') + '</div>' +
      '<p class="detail-label">Sample achievements</p><div class="achievement-grid"><article class="achievement"><span class="badge">✦</span><strong>Direction set</strong><small>Completed · Last reviewed: Sep 10</small></article><article class="achievement"><span class="badge">▦</span><strong>Dashboard starter</strong><small>In progress · Last reviewed: Sep 26</small></article></div></div>';
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-milestone]');
    if (!button) return;
    selectedId = button.dataset.milestone;
    render();
  });

  render();
})();

