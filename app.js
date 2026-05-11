/* ============================================
   HexaGram — JSON-driven routing & rendering
   URL params:
     member.html?member=<id>            → list of pages for a member
     project-template.html?member=<id>&page=<pageId>
   ============================================ */
window.HG = (function () {
  // Group leader (Akash) is NOT a folder — only the other 5 members.
  const FOLDERS = ['ayushman', 'aniket', 'monish', 'sushanth', 'shiven'];

  const TEAM = [
    { name: 'Akash',    id: 'SE24UCSE220', role: 'Group Leader', initial: 'A', leader: true, folder: null },
    { name: 'Ayushman', id: 'SE24UCSE258', role: 'Member',       initial: 'A', folder: 'ayushman' },
    { name: 'Aniket',   id: 'SE24UCSE188', role: 'Member',       initial: 'A', folder: 'aniket' },
    { name: 'Monish',   id: 'SE24UCSE153', role: 'Member',       initial: 'M', folder: 'monish' },
    { name: 'Sushanth', id: 'SE24UCSE168', role: 'Member',       initial: 'S', folder: 'sushanth' },
    { name: 'Shiven',   id: 'SE24UCSE187', role: 'Member',       initial: 'S', folder: 'shiven' }
  ];

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

  /* ---------- HOME: render member folders + team ---------- */
  async function renderHome(folderSel, teamSel) {
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

    const folderEl = document.querySelector(folderSel);
    if (!folderEl) return;
    try {
      const data = await loadContent();
      const members = data.members || {};
      const cards = FOLDERS.map((key, i) => {
        const m = members[key];
        if (!m) return '';
        const initial = m.name.charAt(0).toUpperCase();
        const count = Object.keys(m.pages || {}).length;
        return `
          <a class="folder-card" href="member.html?member=${encodeURIComponent(key)}">
            <span class="num">${String(i + 1).padStart(2, '0')}</span>
            <div class="folder-icon">${initial}</div>
            <h3>${escapeHtml(m.name)}</h3>
            <div class="meta">${escapeHtml(m.tagline || m.id)}</div>
            <span class="arrow">${count} deliverables →</span>
          </a>
        `;
      }).join('');
      folderEl.innerHTML = cards || '<div class="loading">No member folders found.</div>';
    } catch (e) {
      folderEl.innerHTML = `<div class="loading">Could not load folders. ${escapeHtml(e.message)}</div>`;
    }
  }

  /* ---------- MEMBER: list of pages for a specific member ---------- */
  async function renderMember() {
    const params = new URLSearchParams(location.search);
    const member = params.get('member');
    const titleEl = document.getElementById('memberTitle');
    const crumbEl = document.getElementById('crumbMember');
    const descEl  = document.getElementById('memberDesc');
    const grid    = document.getElementById('memberGrid');

    if (!member) {
      titleEl.textContent = 'No member selected';
      grid.innerHTML = '<p class="empty">Add ?member=&lt;id&gt; to the URL.</p>';
      return;
    }

    try {
      const data = await loadContent();
      const m = (data.members || {})[member];
      if (!m) {
        titleEl.textContent = 'Member not found';
        crumbEl.textContent = 'Not found';
        grid.innerHTML = `<p class="empty">No member with id "${escapeHtml(member)}" in content.json.</p>`;
        return;
      }
      document.title = `${m.name} — HexaGram`;
      titleEl.innerHTML = `<span class="gradient">${escapeHtml(m.name)}</span>'s folder`;
      if (crumbEl) crumbEl.textContent = m.name;
      if (descEl)  descEl.textContent = m.tagline || `Deliverables produced by ${m.name}.`;

      const pages = m.pages || {};
      const entries = Object.entries(pages);
      grid.innerHTML = entries.map(([pageId, p], i) => `
        <a class="cat-card"
           href="project-template.html?member=${encodeURIComponent(member)}&page=${encodeURIComponent(pageId)}">
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <div class="cat-icon">${p.icon || '◇'}</div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.summary || '')}</p>
          <span class="arrow">View →</span>
        </a>
      `).join('') || '<p class="empty">No deliverables yet.</p>';
    } catch (e) {
      grid.innerHTML = `<p class="empty">Failed to load: ${escapeHtml(e.message)}</p>`;
    }
  }

  /* ---------- TEMPLATE: render a specific page within a member ---------- */
  async function renderTemplate() {
    const params = new URLSearchParams(location.search);
    const member = params.get('member');
    const page   = params.get('page');
    const titleEl = document.getElementById('pageTitle');
    const crumbMemEl = document.getElementById('crumbMember');
    const crumbEl = document.getElementById('crumbTitle');
    const descEl  = document.getElementById('pageDesc');
    const body    = document.getElementById('pageContent');

    if (!member || !page) {
      titleEl.textContent = 'Missing parameters';
      body.innerHTML = '<p class="empty">URL must contain ?member=&lt;id&gt;&amp;page=&lt;pageId&gt;.</p>';
      return;
    }

    try {
      const data = await loadContent();
      const m = (data.members || {})[member];
      if (!m) {
        titleEl.textContent = 'Member not found';
        body.innerHTML = `<p class="empty">No member "${escapeHtml(member)}".</p>`;
        return;
      }
      const p = (m.pages || {})[page];
      if (!p) {
        titleEl.textContent = 'Page not found';
        body.innerHTML = `<p class="empty">No page "${escapeHtml(page)}" for ${escapeHtml(m.name)}.</p>`;
        return;
      }

      document.title = `${p.title} — ${m.name} — HexaGram`;
      titleEl.textContent = p.title;
      if (crumbMemEl) {
        crumbMemEl.textContent = m.name;
        crumbMemEl.setAttribute('href', `member.html?member=${encodeURIComponent(member)}`);
      }
      if (crumbEl) crumbEl.textContent = p.title;
      if (descEl)  descEl.textContent  = p.description || '';

      const blocks = (p.blocks || []).map(renderBlock).join('');
      body.classList.remove('loading');
      body.innerHTML = blocks || '<p class="empty">No content yet. Add blocks in content.json.</p>';
    } catch (e) {
      body.innerHTML = `<p class="empty">Failed to load: ${escapeHtml(e.message)}</p>`;
    }
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
                <span class="arrow" style="color:var(--red);font-family:var(--font-mono);font-size:.85rem">↗</span>
              </a>
            `).join('')}
          </div>
        </div>`;
      case 'audio':
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
          <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;aspect-ratio:16/9">
            <iframe src="${escapeHtml(b.src)}" style="width:100%;height:100%;border:0" allowfullscreen></iframe>
          </div>
        </div>`;
      default:
        return '';
    }
  }

  return { renderHome, renderMember, renderTemplate };
})();
