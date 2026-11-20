// Leonida Trophy Guide — offline tracker for the 55 PS5 trophies of GTA VI.
// Progress saves in localStorage; export/import moves it between browsers.
// No network requests are made beyond loading the local data/trophies.json.
const KEY = 'leonida-trophies-v1';
const SPOILER_KEY = 'leonida-trophies-spoiler';

const SOURCES = {
  powerpyx: { label: 'PowerPyx — GTA 6 Trophy Guide & Roadmap', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
  pushsquare: { label: 'Push Square — GTA 6 Trophy Guide and Roadmap', url: 'https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap' },
  gtabase: { label: 'GTABase — GTA 6 Achievements & Trophies List (PS5 / Xbox)', url: 'https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series' },
  keengamer: { label: 'KeenGamer — GTA 6 Trophy Guide: Platinum Roadmap', url: 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/' },
  sixshore: { label: 'Sixshore — GTA 6 Trophies and Achievements', url: 'https://sixshore.com/gta-6/guides/trophies-and-achievements/' },
};

const KIND_LABELS = {
  story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', strangers: 'Strangers', misc: 'Misc', online: 'Online',
  completion: 'Completion', platinum: 'Platinum',
};
const CHIP_KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'strangers', 'misc', 'online'];

const STAGES = [
  {
    title: 'Stage 1 — Story, one playthrough',
    hours: '60–80 hours',
    text: 'Play the story as Jason and Lucia. Do optional missions as they appear — they stay available later, but the quests that matter most are the ones that unlock tools and systems.',
    bullets: [
      'Do the Chapter 1 balcony meditation with Lucia right after “Down to Earth” — the one possibly missable step.',
      'Finish “Clonin’ Keys, Makin’ GS” (Key Cloner) and “Credit Check” (Dye Pack Jammer) in Chapter 3.',
      'Keep manual saves at the start and end of each chapter.',
      'Never turn cheats on — they disable trophies and saving.',
    ],
  },
  {
    title: 'Stage 2 — 100% completion',
    hours: '~100 hours',
    text: 'After the story, the 100% checklist opens under Progress > Stats > 100% Completion. It is closer to 60% true completion, and most rows only ask for 70–80% of their totals.',
    bullets: [
      'Shooting Range challenges (42 across 12 ranges) and Top Fun drone races (42 across 14 spots).',
      'WAiNK scans (100), vehicles discovered (200 of 277 base models), stunts (300 of 397), challenges (70 of 80).',
      '39 gang operations across 9 gangs, 8 bank vaults (5 needed here), 15 Target Decks.',
      '100 optional missions of the 200–300+ on offer, and 3 of 18 card sets.',
    ],
  },
  {
    title: 'Stage 3 — Strangers & cleanup',
    hours: '~10 hours',
    text: 'Character questlines for Andy, Billy, Kenton, Randy, Tyrone, Moses and Bret, plus stranger strands, collectibles and the misc trophies — all of it stays available in free-roam after the story.',
    bullets: [
      '8 stranger strands for Strangers & Freaks (Kirk, Kyle, Yago and Pilot Pete confirmed).',
      'Meditations (18 spots), garages (8), Scooter Bros registrations (10).',
      'Misc trophies: bowling, the Banshee showroom, the UFO, the balcony drink, the Payday Loans return.',
    ],
  },
  {
    title: 'Stage 4 — Platinum',
    hours: 'Pops when the rest are done',
    text: '“Vice Got a Price!” unlocks automatically once the other 54 trophies are earned. Total: about 200 hours at a relaxed pace.',
    bullets: [
      'Check the tracker — any trophy still unticked is listed under “Still to earn”.',
      'Export your progress before switching devices.',
    ],
  },
];

const COMPLETION_ROWS = [
  ['Shooting Range challenges', '42 of 42', 'All 12 ranges'],
  ['Top Fun drone races', '42 of 42', '14 locations'],
  ['Meditations', '15 of 18', 'Not all 18 needed'],
  ['WAiNK scans', '100', 'Any 100 spots'],
  ['Vehicles discovered', '200 of 277', 'Base models only'],
  ['Stunts', '300 of 397', 'About three quarters'],
  ['Challenges', '70 of 80', 'Skip the hardest 10'],
  ['Collectible card sets', '3 of 18', 'Any 3 sets'],
  ['Races', '20 of 40', 'Any 20'],
  ['Bank vaults', '5 of 8', 'All 8 pay more'],
  ['Gang operations', '39 of 39', 'All 9 gangs'],
  ['Target Decks', '15 of 15', 'Bret’s hunting list'],
  ['Optional missions', '100 of 200–300+', 'Plenty to spare'],
];

const DEMO_EARNED = [2, 3, 4, 5, 8, 16, 20, 21, 44];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

const params = new URLSearchParams(location.search);
const state = {
  earned: new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')),
  spoiler: localStorage.getItem(SPOILER_KEY) === '1' || params.get('spoiler') === '1',
  kind: params.get('filter') || 'all',
  grade: 'all',
  earnedFilter: 'all',
  query: '',
  view: params.get('view') || 'list',
};

if (params.get('demo') === '1') {
  state.earned = new Set(DEMO_EARNED);
  save();
}

const $ = (id) => document.getElementById(id);
const els = {
  progressText: $('progressText'), progressPct: $('progressPct'), progressFill: $('progressFill'),
  gradeCounts: $('gradeCounts'), search: $('search'), chips: $('kindChips'), grade: $('grade'),
  earnedFilter: $('earnedFilter'), spoilerToggle: $('spoilerToggle'), cards: $('cards'),
  resultsLine: $('resultsLine'), emptyState: $('emptyState'),
  detail: $('detail'), detailCard: $('detailCard'),
};

function save() {
  localStorage.setItem(KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
}

function isStoryHidden(t) {
  return state.spoiler && t.kind.includes('story') && !state.earned.has(t.id);
}

function kindLabel(k) { return KIND_LABELS[k] || k; }

function gradeBadge(t) {
  const s = document.createElement('span');
  s.className = `badge ${t.grade}`;
  s.textContent = t.grade;
  return s;
}

function tagsFor(t) {
  const wrap = document.createElement('div');
  wrap.className = 'tags';
  for (const k of t.kind) {
    if (k === 'missable') continue;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = kindLabel(k);
    wrap.append(tag);
  }
  if (t.missable) {
    const tag = document.createElement('span');
    tag.className = 'tag missable';
    tag.textContent = '⚠ Possibly missable';
    wrap.append(tag);
  }
  if (t.count) {
    const tag = document.createElement('span');
    tag.className = 'tag count';
    tag.textContent = `× ${t.count.toLocaleString('en-US')}`;
    wrap.append(tag);
  }
  return wrap;
}

function guideBlock(t) {
  const div = document.createElement('div');
  div.className = 'guide';
  const p = document.createElement('p');
  p.textContent = t.guide;
  div.append(p);
  if (t.steps && t.steps.length) {
    const ol = document.createElement('ol');
    for (const s of t.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      ol.append(li);
    }
    div.append(ol);
  }
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = 'Sources: ';
  for (const key of t.sources) {
    const s = SOURCES[key];
    if (!s) continue;
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label.split(' — ')[0];
    src.append(a);
  }
  div.append(src);
  return div;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (state.earned.has(t.id) ? ' earned' : '');
  const hidden = isStoryHidden(t);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', (e) => {
    e.stopPropagation();
    toggleEarned(t.id);
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'card-title';
  const h3 = document.createElement('h3');
  h3.textContent = hidden ? 'Hidden story trophy' : t.name;
  title.append(h3);
  const desc = document.createElement('p');
  if (hidden) {
    desc.className = 'spoiler-note';
    desc.textContent = 'Hidden until earned — turn off the spoiler setting to reveal it.';
  } else {
    desc.textContent = t.description;
  }
  title.append(desc);
  head.append(title);
  head.append(gradeBadge(t));
  card.append(head);
  card.append(tagsFor(t));

  if (!hidden) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-toggle';
    btn.textContent = 'Guide & sources ▸';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDetail(t.id);
    });
    card.append(btn);
  }
  card.addEventListener('click', () => openDetail(t.id));
  return card;
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind !== 'all' && !t.kind.includes(state.kind)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedFilter === 'earned' && !state.earned.has(t.id)) return false;
    if (state.earnedFilter === 'remaining' && state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const n = state.earned.size;
  const total = trophies.length;
  els.progressText.textContent = `${n} of ${total} earned`;
  els.progressPct.textContent = `${Math.round((n / total) * 100)}%`;
  els.progressFill.style.width = `${(n / total) * 100}%`;
  const byGrade = {};
  for (const t of trophies) if (state.earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] || 0) + 1;
  els.gradeCounts.innerHTML = '';
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const span = document.createElement('span');
    span.textContent = `${g}: ${byGrade[g] || 0}/${totals[g]}`;
    els.gradeCounts.append(span);
  }
}

function renderChips() {
  els.chips.replaceChildren();
  for (const k of CHIP_KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.kind === k ? ' active' : '');
    b.textContent = k === 'all' ? 'All' : kindLabel(k);
    b.addEventListener('click', () => {
      state.kind = k;
      render();
    });
    els.chips.append(b);
  }
}

function renderList() {
  const list = visibleTrophies();
  els.cards.replaceChildren();
  for (const t of list) els.cards.append(trophyCard(t));
  els.emptyState.hidden = list.length > 0;
  const kindWord = state.kind === 'all' ? 'trophies' : `${kindLabel(state.kind)} trophies`;
  els.resultsLine.textContent = `Showing ${list.length} of ${trophies.length} ${kindWord} — ${state.earned.size} earned so far.`;
}

function renderRoadmap() {
  const stats = $('roadmapStats');
  stats.replaceChildren();
  const statData = [
    ['55', 'trophies in total'],
    ['~200 h', 'to the platinum'],
    ['4 / 10', 'difficulty'],
    ['0', 'online trophies'],
    ['1', 'playthrough needed'],
    ['1', 'possibly missable'],
  ];
  for (const [v, l] of statData) {
    const d = document.createElement('div');
    d.className = 'stat';
    const b = document.createElement('b');
    b.textContent = v;
    const s = document.createElement('span');
    s.textContent = l;
    d.append(b, s);
    stats.append(d);
  }
  const stages = $('roadmapStages');
  stages.replaceChildren();
  for (const st of STAGES) {
    const d = document.createElement('div');
    d.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = st.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = st.hours;
    const text = document.createElement('p');
    text.textContent = st.text;
    const ul = document.createElement('ul');
    for (const b of st.bullets) {
      const li = document.createElement('li');
      li.textContent = b;
      ul.append(li);
    }
    d.append(h, hours, text, ul);
    stages.append(d);
  }
  const table = $('completionTable');
  table.replaceChildren();
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  for (const h of ['What the checklist wants', 'Needed', 'Note']) {
    const th = document.createElement('th');
    th.textContent = h;
    tr.append(th);
  }
  thead.append(tr);
  const tbody = document.createElement('tbody');
  for (const row of COMPLETION_ROWS) {
    const r = document.createElement('tr');
    for (const cell of row) {
      const td = document.createElement('td');
      td.textContent = cell;
      r.append(td);
    }
    tbody.append(r);
  }
  table.append(thead, tbody);
}

function renderMissables() {
  const wrap = $('missableCards');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = trophyCard(t);
    const g = guideBlock(t);
    card.append(g);
    wrap.append(card);
  }
}

function renderSources() {
  const ul = $('sourceList');
  ul.replaceChildren();
  for (const s of Object.values(SOURCES)) {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = s.label;
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.url;
    const span = document.createElement('span');
    span.append(a);
    li.append(b, span);
    ul.append(li);
  }
  const extra = document.createElement('li');
  const b = document.createElement('b');
  b.textContent = 'Exophase & PSNProfiles — GTA VI trophy lists';
  const span = document.createElement('span');
  span.textContent = 'Official trophy names, descriptions and grades as listed on Exophase and PSNProfiles — the two lists agree on all 55 trophies. No official Rockstar trophy list has been published.';
  extra.append(b, span);
  ul.append(extra);
}

function showView(view) {
  state.view = view;
  for (const v of ['list', 'roadmap', 'missables', 'sources']) {
    $(`view-${v}`).hidden = v !== view;
    $(`tab-${v}`).classList.toggle('active', v === view);
  }
}

function openDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  const hidden = isStoryHidden(t);
  const card = els.detailCard;
  card.replaceChildren();
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-close';
  close.textContent = 'Close ✕';
  close.addEventListener('click', closeDetail);
  card.append(close);
  const h2 = document.createElement('h2');
  h2.id = 'detailTitle';
  h2.textContent = hidden ? 'Hidden story trophy' : t.name;
  card.append(h2);
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(gradeBadge(t));
  meta.append(tagsFor(t));
  card.append(meta);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden
    ? 'This is a story trophy. Turn off the spoiler setting to see its name, description and guide.'
    : t.description;
  card.append(desc);
  if (!hidden) card.append(guideBlock(t));
  const row = document.createElement('div');
  row.className = 'earn-row';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = state.earned.has(t.id) ? '✓ Earned — unmark' : 'Mark as earned';
  btn.addEventListener('click', () => {
    toggleEarned(t.id);
    openDetail(t.id);
  });
  row.append(btn);
  const note = document.createElement('span');
  note.textContent = 'Progress saves automatically in this browser.';
  row.append(note);
  card.append(row);
  els.detail.hidden = false;
}

function closeDetail() {
  els.detail.hidden = true;
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  save();
  render();
}

function render() {
  renderProgress();
  renderChips();
  renderList();
  showView(state.view);
}

els.search.addEventListener('input', () => {
  state.query = els.search.value;
  renderList();
});
els.grade.addEventListener('change', () => {
  state.grade = els.grade.value;
  renderList();
});
els.earnedFilter.addEventListener('change', () => {
  state.earnedFilter = els.earnedFilter.value;
  renderList();
});
els.spoilerToggle.addEventListener('change', () => {
  state.spoiler = els.spoilerToggle.checked;
  localStorage.setItem(SPOILER_KEY, state.spoiler ? '1' : '0');
  render();
});
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}
$('export').addEventListener('click', () => {
  const data = { game: 'Grand Theft Auto VI', platform: 'PS5', earned: [...state.earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    state.earned = new Set(ids.filter((id) => valid.has(id)));
    save();
    render();
  } catch {
    alert('That file is not a valid trophy progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    state.earned = new Set();
    save();
    render();
  }
});
els.detail.addEventListener('click', (e) => {
  if (e.target === els.detail) closeDetail();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});

els.spoilerToggle.checked = state.spoiler;
renderRoadmap();
renderMissables();
renderSources();
render();
if (params.get('trophy')) openDetail(Number(params.get('trophy')));
