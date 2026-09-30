(() => {
  const milestones = [
    { id: 'direction', icon: '✦', title: 'Choose a direction', caption: 'Data & analytics exploration', status: 'Completed', reviewed: 'Sep 10, 2026', color: '#6646d8', soft: '#f0edff', progress: 100, unlock: 'A focused target role and a short list of skill priorities.', skills: ['Career research', 'Role comparison'], next: 'Keep this target role as a hypothesis and revisit it after each project.' },
    { id: 'excel', icon: '▦', title: 'Excel reporting', caption: 'Build one clear dashboard', status: 'In progress', reviewed: 'Sep 26, 2026', color: '#3478f6', soft: '#e8f0ff', progress: 68, unlock: 'A portfolio-ready reporting example for applications.', skills: ['Pivot tables', 'Formulas', 'Data visualization'], next: 'Finish a one-page dashboard and explain two decisions you made.' },
    { id: 'sql', icon: '⌘', title: 'SQL foundations', caption: 'Query a clean dataset', status: 'In progress', reviewed: 'Sep 24, 2026', color: '#0d9b88', soft: '#e0f7f2', progress: 45, unlock: 'The ability to discuss joins and analysis with more confidence.', skills: ['SELECT', 'JOIN', 'GROUP BY'], next: 'Practice two joins and save an annotated query example.' },
    { id: 'python', icon: '⌁', title: 'Python mini-project', caption: 'Analyze a small dataset', status: 'Planned', reviewed: 'Sep 21, 2026', color: '#ef6b63', soft: '#fff0ee', progress: 15, unlock: 'An additional proof point for data-focused roles.', skills: ['Pandas', 'Charts', 'Documentation'], next: 'Pick a small public practice dataset and define one question to answer.' },
    { id: 'portfolio', icon: '◈', title: 'Portfolio sprint', caption: 'Package the strongest work', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#f09b25', soft: '#fff3d9', progress: 5, unlock: 'A simple link you can share with applications and conversations.', skills: ['Writing', 'Project framing', 'Reflection'], next: 'Outline one case study using problem, process, and result sections.' },
    { id: 'ready', icon: '★', title: 'Internship-ready', caption: 'Apply with evidence', status: 'Planned', reviewed: 'Sep 18, 2026', color: '#2e5ad7', soft: '#e7edff', progress: 0, unlock: 'A recurring routine for thoughtful, well-matched applications.', skills: ['Applications', 'Networking', 'Interview stories'], next: 'Connect the completed projects to a first set of manual applications.' }
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

  function node(milestone) {
    const selected = milestone.id === selectedId;
    return `<button class="milestone" type="button" data-milestone="${milestone.id}" aria-pressed="${selected}" style="--node:${milestone.color};--node-soft:${milestone.soft}">
      <span class="node-top"><span class="node-icon">${milestone.icon}</span><span class="status ${statusClass[milestone.status]}">${milestone.status}</span></span>
      <strong>${milestone.title}</strong><small>${milestone.caption}</small><span class="reviewed">Last reviewed: ${milestone.reviewed}</span>
    </button>`;
  }
  function skillCard(skill) {
    return `<article class="skill"><div class="skill-top"><strong>${skill.name}</strong><span class="status ${statusClass[skill.status]}">${skill.status}</span></div><div class="progress-wrap"><div class="progress-info"><span>Sample progress</span><b>${skill.percent}%</b></div><div class="bar" style="--bar:${skill.color}"><span style="width:${skill.percent}%"></span></div></div><small>Last reviewed: ${skill.reviewed} · illustrative skill signal</small></article>`;
  }
  function render() {
    list.innerHTML = milestones.map(node).join('');
    const milestone = milestones.find(item => item.id === selectedId) || milestones[0];
    detail.style.setProperty('--accent', milestone.color);
    detail.innerHTML = `<div class="detail-top"><p class="detail-kicker">${milestone.status} milestone</p><h2>${milestone.title}</h2><p>${milestone.caption}</p></div>
      <div class="detail-body"><p class="rule-line"><b>${milestone.status}</b> · Last reviewed: <b>${milestone.reviewed}</b><br>Fictional sample milestone · not verified career progress.</p>
      <div class="progress-wrap"><div class="progress-info"><span>Sample completion</span><b>${milestone.progress}%</b></div><div class="bar" style="--bar:${milestone.color}"><span style="width:${milestone.progress}%"></span></div></div>
      <p class="detail-label">What this unlocks</p><p class="detail-copy">${milestone.unlock}</p><p class="detail-label">Skills to practice</p><div class="chip-row">${milestone.skills.map(skill => `<span class="chip">${skill}</span>`).join('')}</div><p class="detail-label">Next useful step</p><p class="detail-copy">${milestone.next}</p>
      <p class="detail-label">Skill signals</p><div class="skills">${skills.map(skillCard).join('')}</div>
      <p class="detail-label">Sample achievements</p><div class="achievement-grid"><article class="achievement"><span class="badge">✦</span><strong>Direction set</strong><small>Completed · reviewed Sep 10</small></article><article class="achievement"><span class="badge">▦</span><strong>Dashboard starter</strong><small>In progress · reviewed Sep 26</small></article></div></div>`;
  }
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-milestone]');
    if (!button) return;
    selectedId = button.dataset.milestone;
    render();
  });
  render();
})();

