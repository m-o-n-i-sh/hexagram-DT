/* ============================================
   HexaGram — JSON-driven routing & rendering
   ============================================ */
window.HG = (function () {
  const TEAM = [
    { name: 'Akash',    id: 'SE24UCSE220', role: 'Group Leader', initial: 'A', leader: true },
    { name: 'Ayushman', id: 'SE24UCSE258', role: 'Member',       initial: 'A' },
    { name: 'Aniket',   id: 'SE24UCSE188', role: 'Member',       initial: 'A' },
    { name: 'Monish',   id: 'SE24UCSE153', role: 'Member',       initial: 'M' },
    { name: 'Sushanth', id: 'SE24UCSE168', role: 'Member',       initial: 'S' },
    { name: 'Shiven',   id: 'SE24UCSE187', role: 'Member',       initial: 'S' }
  ];

  let _filterItems = [];
  let _filterType  = '';

  async function loadContent() {
    const res = await fetch('content/content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load content.json');
    return res.json();
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  async function renderHome(catSel, teamSel) {
    // Team
    const teamEl = document.querySelector(teamSel);
    if (teamEl) {
      teamEl.innerHTML = TEAM.map(m => `
        <div class="member-card">
          <div class="member-avatar">${m.initial}</div>
          <div class="member-name">
            ${escapeHtml(m.name)}
            ${m.leader ? '<span class="leader-badge">LEAD</span>' : ''}
          </div>
          <div class="member-role">${escapeHtml(m.role)}</div>
          <div class="member-id">${escapeHtml(m.id)}</div>
        </div>
      `).join('');
    }

    // Categories
    const catEl = document.querySelector(catSel);
    if (!catEl) return;
    try {
      const data = await loadContent();
      const cats = data.categories || [];
      catEl.innerHTML = cats.map((c, i) => `
        <a class="cat-card" href="project-template.html?id=${encodeURIComponent(c.id)}">
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <div class="cat-icon">${c.icon || '◇'}</div>
            <h3>${escapeHtml(c.title)}</h3>
            <p>${escapeHtml(c.summary || '')}</p>
          </div>
          <span class="arrow">View →</span>
        </a>
      `).join('');
    } catch (e) {
      catEl.innerHTML = `<div class="loading">Could not load categories. ${escapeHtml(e.message)}</div>`;
    }
  }

  async function renderTemplate() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const titleEl = document.getElementById('pageTitle');
    const crumbEl = document.getElementById('crumbTitle');
    const descEl  = document.getElementById('pageDesc');
    const body    = document.getElementById('pageContent');

    if (!id) {
      titleEl.textContent = 'No category selected';
      crumbEl.textContent = '—';
      body.innerHTML = '<p class="empty">Add a ?id=&lt;category-id&gt; parameter to the URL.</p>';
      return;
    }

    try {
      const data = await loadContent();
      const cat = (data.categories || []).find(c => c.id === id);
      if (!cat) {
        titleEl.textContent = 'Not found';
        crumbEl.textContent = 'Not found';
        body.innerHTML = `<p class="empty">No category with id "${escapeHtml(id)}" in content.json.</p>`;
        return;
      }
      document.title = `${cat.title} — HexaGram`;
      titleEl.textContent = cat.title;
      crumbEl.textContent = cat.title;
      descEl.textContent  = cat.description || '';

      const blocks = (cat.blocks || []).map(renderBlock).join('');
      body.classList.remove('loading');
      body.innerHTML = blocks || '<p class="empty">No content yet. Add blocks to this category in content.json.</p>';
      _setupPersonFilter();
    } catch (e) {
      body.innerHTML = `<p class="empty">Failed to load content: ${escapeHtml(e.message)}</p>`;
    }
  }

  function _personPickerHtml(items, type, heading, singular) {
    _filterItems = items;
    _filterType  = type;
    const people       = [...new Set(items.map(it => it.person).filter(Boolean))];
    const noPersonItems = items.filter(it => !it.person);
    return `<div class="block">
      ${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}
      <div id="person-filter-view">
        <p style="color:var(--text-dim);margin-bottom:24px;font-size:.95rem">Select a person to view their ${escapeHtml(singular)}.</p>
        <div class="person-filter-grid">
          ${people.map(p => {
            const count = items.filter(it => it.person === p).length;
            return `<button class="person-filter-card" data-person="${escapeHtml(p)}">
              <div class="person-filter-avatar">${escapeHtml(p[0].toUpperCase())}</div>
              <div class="person-filter-name">${escapeHtml(p)}</div>
              <div class="person-filter-count">${count} ${escapeHtml(singular)}${count !== 1 ? 's' : ''}</div>
            </button>`;
          }).join('')}${noPersonItems.length ? `
          <button class="person-filter-card" data-person="__other__">
            <div class="person-filter-avatar">∗</div>
            <div class="person-filter-name">Other</div>
            <div class="person-filter-count">${noPersonItems.length} ${escapeHtml(singular)}${noPersonItems.length !== 1 ? 's' : ''}</div>
          </button>` : ''}
        </div>
      </div>
      <div id="person-results-view" style="display:none">
        <div class="audio-filter-header">
          <button id="person-back-btn" class="btn" style="font-size:.8rem;padding:6px 14px">← All People</button>
          <span id="person-filter-label"></span>
        </div>
        <div id="person-results-items"></div>
      </div>
    </div>`;
  }

  function _renderFilteredItems(items) {
    if (!items.length) return '<p class="empty">Nothing here yet.</p>';
    if (_filterType === 'audio') {
      return items.map(it => `
        <div class="audio-item">
          <div class="label">${escapeHtml(it.label || 'Recording')}</div>
          <audio controls preload="none" src="${escapeHtml(it.src)}"></audio>
        </div>
      `).join('');
    }
    if (_filterType === 'files') {
      return `<div class="file-list">${items.map(it => `
        <a class="file-item" href="${escapeHtml(it.href)}" target="_blank" rel="noopener">
          <span class="ico">${escapeHtml((it.kind || 'FILE').toUpperCase().slice(0,4))}</span>
          <span class="meta">
            <div class="name">${escapeHtml(it.name)}</div>
            <div class="sub">${escapeHtml(it.sub || it.href)}</div>
          </span>
          <span class="arrow" style="color:var(--accent);font-family:var(--font-mono);font-size:.85rem">↗</span>
        </a>
      `).join('')}</div>`;
    }
    if (_filterType === 'images') {
      return `<div class="block-images">${items.map(it => `
        <figure>
          <img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.alt || '')}" loading="lazy" />
          ${it.caption ? `<figcaption style="color:var(--text-faint);font-size:.85rem;margin-top:6px;font-family:var(--font-mono)">${escapeHtml(it.caption)}</figcaption>` : ''}
        </figure>
      `).join('')}</div>`;
    }
    return '';
  }

  function renderBlock(b) {
    switch (b.type) {
      case 'text':
        return `<div class="block">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          <div class="block-text">${
            (Array.isArray(b.paragraphs) ? b.paragraphs : [b.text || ''])
              .map(p => `<p>${escapeHtml(p)}</p>`).join('')
          }</div>
        </div>`;
      case 'images':
        if (b.filterByPerson) return _personPickerHtml(b.items || [], 'images', b.heading, 'persona');
        return `<div class="block">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          <div class="block-images">
            ${(b.items || []).map(it => `
              <figure>
                <img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.alt || '')}" loading="lazy" />
                ${it.caption ? `<figcaption style="color:var(--text-faint);font-size:.85rem;margin-top:6px;font-family:var(--font-mono)">${escapeHtml(it.caption)}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        </div>`;
      case 'files':
        if (b.filterByPerson) return _personPickerHtml(b.items || [], 'files', b.heading, 'transcript');
        return `<div class="block">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          <div class="file-list">
            ${(b.items || []).map(it => `
              <a class="file-item" href="${escapeHtml(it.href)}" target="_blank" rel="noopener">
                <span class="ico">${escapeHtml((it.kind || 'FILE').toUpperCase().slice(0,4))}</span>
                <span class="meta">
                  <div class="name">${escapeHtml(it.name)}</div>
                  <div class="sub">${escapeHtml(it.sub || it.href)}</div>
                </span>
                <span class="arrow" style="color:var(--accent);font-family:var(--font-mono);font-size:.85rem">↗</span>
              </a>
            `).join('')}
          </div>
        </div>`;
      case 'audio':
        if (b.filterByPerson) return _personPickerHtml(b.items || [], 'audio', b.heading, 'recording');
        return `<div class="block">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          ${(b.items || []).map(it => `
            <div class="audio-item">
              <div class="label">${escapeHtml(it.label || 'Recording')}</div>
              <audio controls preload="none" src="${escapeHtml(it.src)}"></audio>
            </div>
          `).join('')}
        </div>`;
      case 'embed':
        return `<div class="block">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;min-height:600px">
            <iframe src="${escapeHtml(b.src)}" style="width:100%;height:600px;border:0" allowfullscreen></iframe>
          </div>
        </div>`;
      default:
        return '';
    }
  }

  function _setupPersonFilter() {
    const personView  = document.getElementById('person-filter-view');
    const resultsView = document.getElementById('person-results-view');
    if (!personView || !resultsView) return;

    const backBtn = document.getElementById('person-back-btn');
    const labelEl = document.getElementById('person-filter-label');
    const itemsEl = document.getElementById('person-results-items');

    personView.querySelector('.person-filter-grid').addEventListener('click', e => {
      const card = e.target.closest('[data-person]');
      if (!card) return;
      const person   = card.dataset.person;
      const filtered = person === '__other__'
        ? _filterItems.filter(it => !it.person)
        : _filterItems.filter(it => it.person === person);

      labelEl.textContent = person === '__other__' ? 'Other' : person;
      itemsEl.innerHTML   = _renderFilteredItems(filtered);

      personView.style.display  = 'none';
      resultsView.style.display = 'block';
    });

    backBtn.addEventListener('click', () => {
      personView.style.display  = '';
      resultsView.style.display = 'none';
    });
  }

  return { renderHome, renderTemplate };
})();
