(() => {
  const applications = [
    { id: 'datasphere', company: 'DataSphere', initials: 'DS', role: 'Data Analyst Intern', status: 'Submitted', reviewed: 'Sep 26, 2026', accent: '#3478f6', soft: '#e8f0ff', skills: ['Excel dashboards', 'SQL queries', 'Storytelling'], next: 'Prepare a concise project walkthrough for a possible interview.', note: 'Fictional sample application · Week 2 follow-up plan.' },
    { id: 'northline', company: 'Northline Systems', initials: 'NS', role: 'Business Intelligence Intern', status: 'In progress', reviewed: 'Sep 24, 2026', accent: '#0d9b88', soft: '#e0f7f2', skills: ['SQL joins', 'Data cleaning', 'Stakeholder notes'], next: 'Tailor the project examples to the role description before submitting.', note: 'Fictional sample application · Draft materials in progress.' },
    { id: 'pulse', company: 'Pulse Creative', initials: 'PC', role: 'Growth Operations Intern', status: 'Planned', reviewed: 'Sep 19, 2026', accent: '#6646d8', soft: '#f0edff', skills: ['Spreadsheet models', 'Experiment design', 'Communication'], next: 'Research the organization and choose one portfolio project to feature.', note: 'Fictional sample opportunity · Research before applying.' }
  ];

  const statusClass = { 'Planned': 'planned', 'In progress': 'progress', 'Submitted': 'submitted', 'Completed': 'completed' };
  const list = document.querySelector('#applicationList');
  const detail = document.querySelector('#applicationDetail');
  const form = document.querySelector('#entryForm');
  const showForm = document.querySelector('#showForm');
  const cancelForm = document.querySelector('#cancelForm');
  const reviewedInput = document.querySelector('#reviewed');
  let selectedId = applications[0].id;

  function setReviewDefault() {
    reviewedInput.value = new Date().toISOString().slice(0, 10);
  }

  function appCard(app) {
    const selected = app.id === selectedId;
    return `<button class="app-card" type="button" data-application="${app.id}" aria-pressed="${selected}" style="--accent:${app.accent};--soft:${app.soft}">
      <span class="company-mark">${app.initials}</span>
      <span class="app-title"><strong>${app.company}</strong><span>${app.role}</span></span>
      <span class="app-meta"><span class="status ${statusClass[app.status]}">${app.status}</span><span class="reviewed">Last reviewed: ${app.reviewed}</span></span>
    </button>`;
  }

  function render() {
    list.innerHTML = applications.map(appCard).join('');
    document.querySelector('#activeCount').textContent = applications.length;
    const app = applications.find(item => item.id === selectedId) || applications[0];
    detail.style.setProperty('--accent', app.accent);
    detail.innerHTML = `<div class="detail-top"><p class="detail-kicker">${app.status} application</p><h2>${app.company}</h2><p>${app.role}</p></div>
      <div class="detail-body"><p class="rule-line"><b>${app.status}</b> · Last reviewed: <b>${app.reviewed}</b><br>${app.note}</p>
      <p class="detail-label">Next useful step</p><p class="detail-copy">${app.next}</p>
      <p class="detail-label">Skills this opportunity supports</p><div class="chip-row">${app.skills.map(skill => `<span class="chip">${skill}</span>`).join('')}</div>
      <p class="detail-label">Data status</p><p class="detail-copy">Sample entry${app.manual ? ' created manually in this browser view' : ''}. It is not connected to a live job post or external account.</p></div>`;
  }

  function closeForm() {
    form.classList.remove('open');
    showForm.setAttribute('aria-expanded', 'false');
    form.reset();
    setReviewDefault();
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-application]');
    if (!button) return;
    selectedId = button.dataset.application;
    render();
  });

  showForm.addEventListener('click', () => {
    const open = form.classList.toggle('open');
    showForm.setAttribute('aria-expanded', String(open));
    if (open) document.querySelector('#company').focus();
  });
  cancelForm.addEventListener('click', closeForm);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const company = document.querySelector('#company').value.trim();
    const role = document.querySelector('#role').value.trim();
    if (!company || !role) { form.reportValidity(); return; }
    const status = document.querySelector('#status').value;
    const rawDate = reviewedInput.value;
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${rawDate}T12:00:00`));
    const accent = ['#ef6b63', '#3478f6', '#0d9b88', '#6646d8'][applications.length % 4];
    const soft = ['#fff0ee', '#e8f0ff', '#e0f7f2', '#f0edff'][applications.length % 4];
    const id = `manual-${Date.now()}`;
    applications.unshift({ id, company, initials: company.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase(), role, status, reviewed: date, accent, soft, skills: ['Add skills manually', 'Review opportunity'], next: 'Add notes and choose the first follow-up action for this manual entry.', note: 'Manual sample entry · Temporary browser-only data.', manual: true });
    selectedId = id;
    closeForm();
    render();
  });

  setReviewDefault();
  render();
})();

