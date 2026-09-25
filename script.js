/* =========================================================================
   Nova Renovations — AI Lead Qualification (100% local, no paid APIs)
   All "intelligence" below is a transparent, rules-based demo engine:
   keyword matching + weighted scoring. It is NOT a trained AI model and
   the HOT/WARM/COLD labels are demo qualification rules, not objective
   measures of a lead's real value.
   ========================================================================= */

const STORAGE_KEY = 'nova_leads_v1';

const INTENT_KEYWORDS = [
  'ready', 'book', 'quote', 'urgent', 'start', 'price', 'consultation',
  'asap', 'schedule', 'estimate', 'hire', 'today', 'this week', 'move forward'
];

const BUDGET_LABELS = {
  high: '$50,000+',
  'mid-high': '$25,000 – $50,000',
  medium: '$10,000 – $25,000',
  low: 'Under $10,000',
  unsure: 'Not sure yet'
};
const TIMELINE_LABELS = {
  immediate: 'Ready immediately',
  '1month': 'Within 1 month',
  '3-6months': '3–6 months',
  none: 'No set timeline'
};
const HIGH_VALUE_PROJECTS = ['Whole-Home Renovation', 'Kitchen Remodel', 'Home Addition'];
const MID_VALUE_PROJECTS = ['Bathroom Remodel', 'Basement Finishing', 'Roofing'];

/* ---------------------------- Scoring Engine ---------------------------- */

function scoreLead(lead) {
  const breakdown = [];
  let total = 0;

  // Budget
  let budgetPts = 0;
  if (lead.budget === 'high') budgetPts = 25;
  else if (lead.budget === 'mid-high') budgetPts = 20;
  else if (lead.budget === 'medium') budgetPts = 13;
  else if (lead.budget === 'low') budgetPts = 6;
  else budgetPts = 2;
  total += budgetPts;
  breakdown.push({ label: `Budget (${BUDGET_LABELS[lead.budget] || lead.budget})`, points: budgetPts });

  // Timeline
  let timelinePts = 0;
  if (lead.timeline === 'immediate') timelinePts = 25;
  else if (lead.timeline === '1month') timelinePts = 18;
  else if (lead.timeline === '3-6months') timelinePts = 10;
  else timelinePts = 2;
  total += timelinePts;
  breakdown.push({ label: `Timeline (${TIMELINE_LABELS[lead.timeline] || lead.timeline})`, points: timelinePts });

  // Project type
  let projectPts = 6;
  if (HIGH_VALUE_PROJECTS.includes(lead.projectType)) projectPts = 15;
  else if (MID_VALUE_PROJECTS.includes(lead.projectType)) projectPts = 10;
  total += projectPts;
  breakdown.push({ label: `Project type (${lead.projectType})`, points: projectPts });

  // Buying-intent keywords in description
  const desc = (lead.description || '').toLowerCase();
  const matched = INTENT_KEYWORDS.filter(k => desc.includes(k));
  let intentPts = Math.min(matched.length * 5, 20);
  total += intentPts;
  breakdown.push({
    label: matched.length
      ? `High-intent language (${matched.slice(0, 5).join(', ')}${matched.length > 5 ? '…' : ''})`
      : 'High-intent language (none detected)',
    points: intentPts
  });

  // Contact completeness bonus
  let contactPts = 0;
  if (lead.email) contactPts += 3;
  if (lead.phone) contactPts += 3;
  if (lead.location) contactPts += 2;
  total += contactPts;
  breakdown.push({ label: 'Profile completeness (email/phone/location)', points: contactPts });

  total = Math.min(total, 100);

  let category = 'COLD';
  if (total >= 65) category = 'HOT';
  else if (total >= 40) category = 'WARM';

  return { total, category, breakdown };
}

/* ------------------------------- Storage -------------------------------- */

function loadLeads() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ }
  }
  const seeded = seedSampleLeads();
  saveLeads(seeded);
  return seeded;
}

function saveLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

let leads = loadLeads();

/* --------------------------- Sample seed data ---------------------------- */

function seedSampleLeads() {
  const raw = [
    {
      name: 'Amelia Torres', email: 'amelia.torres@email.com', phone: '(512) 555-0148',
      projectType: 'Kitchen Remodel', budget: 'high', timeline: 'immediate',
      location: 'Austin, TX', contactMethod: 'Phone',
      description: "We're ready to start ASAP — want to book a consultation this week and get a quote for a full kitchen remodel, budget is flexible for the right team.",
      daysAgo: 1, status: 'New'
    },
    {
      name: 'Derek Nguyen', email: 'derek.n@email.com', phone: '(614) 555-0192',
      projectType: 'Whole-Home Renovation', budget: 'high', timeline: '1month',
      location: 'Columbus, OH', contactMethod: 'Email',
      description: "Looking to hire a contractor to move forward with a whole-home renovation. Would like an estimate and to schedule a walkthrough soon.",
      daysAgo: 2, status: 'Contacted'
    },
    {
      name: 'Priya Shah', email: 'priya.shah@email.com', phone: '(408) 555-0117',
      projectType: 'Bathroom Remodel', budget: 'mid-high', timeline: '1month',
      location: 'San Jose, CA', contactMethod: 'Text',
      description: "Interested in a price for a bathroom remodel, hoping to start within the next month if the quote works for us.",
      daysAgo: 3, status: 'Qualified'
    },
    {
      name: 'Marcus Webb', email: 'marcus.webb@email.com', phone: '(303) 555-0163',
      projectType: 'Home Addition', budget: 'high', timeline: 'immediate',
      location: 'Denver, CO', contactMethod: 'Phone',
      description: "Urgent — need to add a room before winter. Ready to sign today if the price is right, please call me.",
      daysAgo: 0, status: 'New'
    },
    {
      name: 'Grace Kim', email: 'grace.kim@email.com', phone: '(212) 555-0184',
      projectType: 'Deck / Patio', budget: 'low', timeline: 'none',
      location: 'Brooklyn, NY', contactMethod: 'Email',
      description: "Just exploring ideas for a small patio someday, no rush at all, mostly researching options.",
      daysAgo: 6, status: 'New'
    },
    {
      name: 'Tom Baker', email: 'tom.baker@email.com', phone: '(917) 555-0155',
      projectType: 'Painting', budget: 'low', timeline: '3-6months',
      location: 'Newark, NJ', contactMethod: 'Text',
      description: "Thinking about repainting the exterior sometime in the next few months, not sure on budget yet.",
      daysAgo: 4, status: 'New'
    },
    {
      name: 'Sofia Reyes', email: 'sofia.reyes@email.com', phone: '(786) 555-0129',
      projectType: 'Basement Finishing', budget: 'medium', timeline: '3-6months',
      location: 'Miami, FL', contactMethod: 'Email',
      description: "We'd like a consultation about finishing the basement, budget is around 15k, timeline is flexible over the next few months.",
      daysAgo: 5, status: 'Proposal'
    },
    {
      name: 'James O\u2019Connor', email: 'james.oc@email.com', phone: '(617) 555-0171',
      projectType: 'Roofing', budget: 'mid-high', timeline: 'immediate',
      location: 'Boston, MA', contactMethod: 'Phone',
      description: "Roof is leaking, this is urgent, need someone to start ASAP and give me a quote today.",
      daysAgo: 0, status: 'Contacted'
    },
    {
      name: 'Lena Fischer', email: 'lena.fischer@email.com', phone: '(206) 555-0138',
      projectType: 'Flooring', budget: 'medium', timeline: '1month',
      location: 'Seattle, WA', contactMethod: 'Email',
      description: "Want new hardwood flooring throughout the first floor, would like to book an estimate visit soon.",
      daysAgo: 7, status: 'Qualified'
    },
    {
      name: 'Carlos Mendez', email: 'carlos.mendez@email.com', phone: '(210) 555-0146',
      projectType: 'Whole-Home Renovation', budget: 'high', timeline: 'immediate',
      location: 'San Antonio, TX', contactMethod: 'Phone',
      description: "Ready to move forward on a full home renovation, have financing in place, want a consultation this week and a firm quote.",
      daysAgo: 1, status: 'Won'
    },
    {
      name: 'Hannah White', email: 'hannah.white@email.com', phone: '(704) 555-0111',
      projectType: 'Other', budget: 'unsure', timeline: 'none',
      location: 'Charlotte, NC', contactMethod: 'Email',
      description: "Not sure exactly what we want to do yet, just browsing for inspiration.",
      daysAgo: 9, status: 'Lost'
    },
    {
      name: 'Ben Turner', email: 'ben.turner@email.com', phone: '(415) 555-0193',
      projectType: 'Kitchen Remodel', budget: 'medium', timeline: '3-6months',
      location: 'Oakland, CA', contactMethod: 'Text',
      description: "Interested in a quote for a mid-range kitchen remodel, timeline is around 4-5 months out.",
      daysAgo: 3, status: 'New'
    }
  ];

  return raw.map((r, i) => {
    const created = new Date(Date.now() - r.daysAgo * 86400000 - i * 3600000);
    const lead = {
      id: 'lead_' + (Date.now() - i * 999) ,
      name: r.name, email: r.email, phone: r.phone,
      projectType: r.projectType, budget: r.budget, timeline: r.timeline,
      location: r.location, contactMethod: r.contactMethod, description: r.description,
      createdAt: created.toISOString(),
      status: r.status,
      followUpDate: '',
      notes: []
    };
    const scored = scoreLead(lead);
    lead.score = scored.total;
    lead.category = scored.category;
    lead.scoreBreakdown = scored.breakdown;
    return lead;
  });
}

/* -------------------------------- Views ---------------------------------- */

const views = ['dashboard', 'leads', 'new-lead'];
function showView(name) {
  views.forEach(v => {
    document.getElementById('view-' + v).hidden = v !== name;
  });
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  const titles = {
    dashboard: ['Dashboard', 'Overview of every lead captured by the qualification engine.'],
    leads: ['All Leads', 'Browse, filter, sort, and manage every lead in your pipeline.'],
    'new-lead': ['New Lead Intake', 'Add a lead and see it scored instantly by the local engine.']
  };
  document.getElementById('view-title').textContent = titles[name][0];
  document.getElementById('view-subtitle').textContent = titles[name][1];
  if (name === 'dashboard') renderDashboard();
  if (name === 'leads') renderLeadTable();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});
document.getElementById('newLeadBtn').addEventListener('click', () => showView('new-lead'));

/* ------------------------------ Dashboard --------------------------------- */

function renderDashboard() {
  const total = leads.length;
  const hot = leads.filter(l => l.category === 'HOT').length;
  const warm = leads.filter(l => l.category === 'WARM').length;
  const cold = leads.filter(l => l.category === 'COLD').length;
  const avg = total ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total) : 0;
  const followup = leads.filter(l => needsFollowUp(l)).length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statHot').textContent = hot;
  document.getElementById('statWarm').textContent = warm;
  document.getElementById('statCold').textContent = cold;
  document.getElementById('statAvg').textContent = avg;
  document.getElementById('statFollowup').textContent = followup;

  const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
  const maxCount = Math.max(1, ...statuses.map(s => leads.filter(l => l.status === s).length));
  const barsHtml = statuses.map(s => {
    const count = leads.filter(l => l.status === s).length;
    const pct = Math.round((count / maxCount) * 100);
    return `<div class="pipeline-row">
      <span>${s}</span>
      <div class="pipeline-track"><div class="pipeline-fill" style="width:${pct}%"></div></div>
      <span>${count}</span>
    </div>`;
  }).join('');
  document.getElementById('pipelineBars').innerHTML = barsHtml;

  const hotList = [...leads].filter(l => l.category === 'HOT')
    .sort((a, b) => b.score - a.score).slice(0, 5);
  document.getElementById('recentHotList').innerHTML = hotList.length
    ? hotList.map(l => `<div class="recent-item" data-id="${l.id}">
        <span>${escapeHtml(l.name)} — ${escapeHtml(l.projectType)}</span>
        <span class="small">${l.score} pts</span>
      </div>`).join('')
    : '<p class="detail-sub">No hot leads yet.</p>';

  document.querySelectorAll('#recentHotList .recent-item').forEach(el => {
    el.addEventListener('click', () => openLeadModal(el.dataset.id));
  });
}

function needsFollowUp(lead) {
  if (!lead.followUpDate) return false;
  if (['Won', 'Lost'].includes(lead.status)) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(lead.followUpDate) <= today;
}

/* ------------------------------ Lead Table -------------------------------- */

function getFilteredSortedLeads() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const cat = document.getElementById('filterCategory').value;
  const status = document.getElementById('filterStatus').value;
  const sort = document.getElementById('sortBy').value;

  let list = leads.filter(l => {
    const matchesQ = !q || [l.name, l.email, l.projectType, l.location].join(' ').toLowerCase().includes(q);
    const matchesCat = cat === 'all' || l.category === cat;
    const matchesStatus = status === 'all' || l.status === status;
    return matchesQ && matchesCat && matchesStatus;
  });

  list.sort((a, b) => {
    switch (sort) {
      case 'score-asc': return a.score - b.score;
      case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return b.score - a.score;
    }
  });
  return list;
}

function renderLeadTable() {
  const list = getFilteredSortedLeads();
  const body = document.getElementById('leadTableBody');
  document.getElementById('emptyState').hidden = list.length !== 0;

  body.innerHTML = list.map(l => `
    <tr data-id="${l.id}">
      <td>
        <div class="lead-name">${escapeHtml(l.name)}</div>
        <div class="lead-sub">${escapeHtml(l.email)}</div>
      </td>
      <td>${escapeHtml(l.projectType)}<div class="lead-sub">${escapeHtml(l.location || '')}</div></td>
      <td>${BUDGET_LABELS[l.budget] || l.budget}</td>
      <td>${TIMELINE_LABELS[l.timeline] || l.timeline}</td>
      <td><strong>${l.score}</strong></td>
      <td><span class="badge badge-${l.category}">${l.category}</span></td>
      <td><span class="status-pill status-${l.status}">${l.status}</span></td>
      <td>${needsFollowUp(l) ? '<span class="badge badge-HOT">Due</span>' : (l.followUpDate || '—')}</td>
      <td><button class="btn btn-ghost btn-sm view-btn" data-id="${l.id}">View</button></td>
    </tr>
  `).join('');

  body.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-btn')) return;
      openLeadModal(tr.dataset.id);
    });
  });
  body.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => openLeadModal(btn.dataset.id));
  });
}

['searchInput', 'filterCategory', 'filterStatus', 'sortBy'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderLeadTable);
  document.getElementById(id).addEventListener('change', renderLeadTable);
});

/* -------------------------------- Modal ----------------------------------- */

function openLeadModal(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  const modal = document.getElementById('leadModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="detail-head">
      <div>
        <h2>${escapeHtml(lead.name)}</h2>
        <p class="detail-sub">Submitted ${new Date(lead.createdAt).toLocaleDateString()} · ${escapeHtml(lead.email)} · ${escapeHtml(lead.phone)}</p>
      </div>
      <span class="badge badge-${lead.category}">${lead.category} · ${lead.score} pts</span>
    </div>

    <div class="detail-grid">
      <div><span class="k">Project Type</span>${escapeHtml(lead.projectType)}</div>
      <div><span class="k">Budget</span>${BUDGET_LABELS[lead.budget] || lead.budget}</div>
      <div><span class="k">Timeline</span>${TIMELINE_LABELS[lead.timeline] || lead.timeline}</div>
      <div><span class="k">Location</span>${escapeHtml(lead.location || '—')}</div>
      <div><span class="k">Preferred Contact</span>${escapeHtml(lead.contactMethod || '—')}</div>
      <div><span class="k">Lead ID</span>${lead.id}</div>
    </div>

    <div class="desc-box">${escapeHtml(lead.description || 'No description provided.')}</div>

    <div class="score-panel">
      <div class="score-panel-head">
        <strong>Why this lead received this score</strong>
        <span class="score-total">${lead.score} / 100</span>
      </div>
      <div class="score-breakdown">
        ${lead.scoreBreakdown.map(b => `
          <div class="score-line">
            <span>${escapeHtml(b.label)}</span>
            <span class="pts">+${b.points}</span>
          </div>`).join('')}
      </div>
      <p class="score-note">Demo qualification rules only — generated locally, not an objective measure of lead quality.</p>
    </div>

    <div class="detail-row">
      <label>Status
        <select id="statusSelect">
          ${['New','Contacted','Qualified','Proposal','Won','Lost'].map(s =>
            `<option value="${s}" ${s === lead.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </label>
      <label>Follow-up Date
        <input type="date" id="followUpInput" value="${lead.followUpDate || ''}">
      </label>
      <label>&nbsp;
        <button id="deleteLeadBtn" class="btn btn-ghost btn-sm">Delete Lead</button>
      </label>
    </div>

    <div class="notes-box">
      <strong>Notes</strong>
      <ul class="notes-log">
        ${lead.notes.length
          ? lead.notes.map(n => `<li><span class="ts">${new Date(n.at).toLocaleString()}</span>${escapeHtml(n.text)}</li>`).join('')
          : '<li>No notes yet.</li>'}
      </ul>
      <textarea id="noteInput" rows="2" placeholder="Add a note about this lead…"></textarea>
      <button id="addNoteBtn" class="btn btn-ghost btn-sm" style="margin-top:8px;">Add Note</button>
    </div>
  `;

  document.getElementById('statusSelect').addEventListener('change', (e) => {
    lead.status = e.target.value;
    saveLeads(leads);
    renderLeadTable(); renderDashboard();
  });
  document.getElementById('followUpInput').addEventListener('change', (e) => {
    lead.followUpDate = e.target.value;
    saveLeads(leads);
    renderLeadTable(); renderDashboard();
  });
  document.getElementById('addNoteBtn').addEventListener('click', () => {
    const input = document.getElementById('noteInput');
    if (!input.value.trim()) return;
    lead.notes.push({ text: input.value.trim(), at: new Date().toISOString() });
    saveLeads(leads);
    openLeadModal(id);
  });
  document.getElementById('deleteLeadBtn').addEventListener('click', () => {
    if (!confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return;
    leads = leads.filter(l => l.id !== id);
    saveLeads(leads);
    closeModal();
    renderLeadTable(); renderDashboard();
    showToast('Lead deleted.');
  });

  modal.hidden = false;
}

function closeModal() { document.getElementById('leadModal').hidden = true; }
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('leadModal').addEventListener('click', (e) => {
  if (e.target.id === 'leadModal') closeModal();
});

/* -------------------------------- New Lead --------------------------------- */

document.getElementById('leadForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const lead = {
    id: 'lead_' + Date.now(),
    name: fd.get('name').trim(),
    email: fd.get('email').trim(),
    phone: fd.get('phone').trim(),
    contactMethod: fd.get('contactMethod'),
    projectType: fd.get('projectType'),
    budget: fd.get('budget'),
    timeline: fd.get('timeline'),
    location: fd.get('location').trim(),
    description: fd.get('description').trim(),
    createdAt: new Date().toISOString(),
    status: 'New',
    followUpDate: '',
    notes: []
  };
  const scored = scoreLead(lead);
  lead.score = scored.total;
  lead.category = scored.category;
  lead.scoreBreakdown = scored.breakdown;

  leads.unshift(lead);
  saveLeads(leads);
  e.target.reset();
  showToast(`Lead scored: ${lead.score} pts — ${lead.category}`);
  showView('leads');
  openLeadModal(lead.id);
});

document.getElementById('fillSampleBtn').addEventListener('click', () => {
  const form = document.getElementById('leadForm');
  form.name.value = 'Jordan Ellis';
  form.email.value = 'jordan.ellis@email.com';
  form.phone.value = '(555) 019-2284';
  form.location.value = 'Portland, OR';
  form.projectType.value = 'Kitchen Remodel';
  form.budget.value = 'high';
  form.timeline.value = 'immediate';
  form.description.value = "Ready to book a consultation this week — need a quote for a full kitchen remodel, want to start ASAP.";
});

/* -------------------------------- CSV Export -------------------------------- */

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  const headers = ['Name','Email','Phone','Project Type','Budget','Timeline','Location',
    'Contact Method','Description','Score','Category','Status','Follow-up Date','Created'];
  const rows = leads.map(l => [
    l.name, l.email, l.phone, l.projectType, BUDGET_LABELS[l.budget] || l.budget,
    TIMELINE_LABELS[l.timeline] || l.timeline, l.location, l.contactMethod,
    l.description, l.score, l.category, l.status, l.followUpDate, l.createdAt
  ]);
  const csv = [headers, ...rows].map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nova-renovations-leads-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported.');
});

/* --------------------------------- Utils ------------------------------------ */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* --------------------------------- Init -------------------------------------- */

showView('dashboard');
