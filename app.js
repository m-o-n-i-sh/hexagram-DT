/* ============================================
   HexaGram — JSON-driven routing & rendering
   ============================================ */
window.HG = (function () {
  const TEAM = [
    {
      name: 'Akash',
      id: 'SE24UCSE220',
      role: 'Group Leader',
      initial: 'A',
      leader: true,
      bio: 'Led the team through every phase of the project — from planning empathy interviews to coordinating the final prototype. Kept things moving when consensus was hard to reach, and was the first to try any new tool the team adopted.'
    },
    {
      name: 'Ayushman',
      id: 'SE24UCSE258',
      role: 'Member',
      initial: 'A',
      bio: 'Conducted the most interviews in the team and had a particular knack for getting interviewees to open up past their initial, guarded answers. Also took the lead on synthesising raw notes into persona drafts.'
    },
    {
      name: 'Aniket',
      id: 'SE24UCSE188',
      role: 'Member',
      initial: 'A',
      bio: 'Handled most of the structural and diagrammatic work — the RCA, the persona comparison chart, and the journey maps all went through his hands at some point. Good at finding the shape inside a mess of data.'
    },
    {
      name: 'Monish',
      id: 'SE24UCSE153',
      role: 'Member',
      initial: 'M',
      bio: 'Took charge of the website build and made sure every artefact the team produced was documented and accessible. Also wrote a significant chunk of the interview transcripts from scratch, listening back through hours of recordings.'
    },
    {
      name: 'Sushanth',
      id: 'SE24UCSE168',
      role: 'Member',
      initial: 'S',
      bio: 'Did the most fieldwork interviews and covered interviewees from the widest range of backgrounds. Was consistently the most willing to push back on the group when a design direction felt off. His instincts on the HMW shortlist were right more often than not.'
    },
    {
      name: 'Shiven',
      id: 'SE24UCSE187',
      role: 'Member',
      initial: 'S',
      bio: 'Focused on the ideation and solution phases. Ran the 6-3-5 brainwriting sessions and managed the filtering process that took 1,080 raw ideas down to three viable solution groups. Also built and tested the Chrome extension MVP.'
    }
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
 
  /* ---- Lightbox ---- */
  function _initLightbox() {
    if (document.getElementById('hg-lightbox')) return;
    const lb = document.createElement('div');
    lb.id = 'hg-lightbox';
    lb.innerHTML = `
      <div class="lb-backdrop"></div>
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">‹</button>
      <button class="lb-next" aria-label="Next">›</button>
      <div class="lb-inner">
        <img class="lb-img" src="" alt="" />
        <div class="lb-caption"></div>
      </div>`;
    document.body.appendChild(lb);
 
    let _imgs = [];
    let _idx  = 0;
 
    function show(idx) {
      _idx = (idx + _imgs.length) % _imgs.length;
      const it = _imgs[_idx];
      lb.querySelector('.lb-img').src       = it.src;
      lb.querySelector('.lb-img').alt       = it.alt || '';
      lb.querySelector('.lb-caption').textContent = it.caption || '';
      lb.classList.add('lb-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('lb-open');
      document.body.style.overflow = '';
    }
 
    lb.querySelector('.lb-backdrop').addEventListener('click', close);
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(_idx - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(_idx + 1));
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('lb-open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   show(_idx - 1);
      if (e.key === 'ArrowRight')  show(_idx + 1);
    });
 
    // Expose opener
    window._hgLightboxOpen = function(imgs, startIdx) {
      _imgs = imgs;
      show(startIdx);
    };
  }
 
  function _attachLightbox(containerEl) {
    const figures = containerEl.querySelectorAll('figure img, .lb-trigger');
    if (!figures.length) return;
    const imgs = Array.from(figures).map(img => ({
      src:     img.dataset.lbSrc  || img.src,
      alt:     img.dataset.lbAlt  || img.alt  || '',
      caption: img.dataset.lbCaption || (img.closest('figure')?.querySelector('figcaption')?.textContent || '')
    }));
    figures.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => window._hgLightboxOpen(imgs, i));
    });
  }
 
  async function renderHome(catSel, teamSel) {
    _initLightbox();
 
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
          ${m.bio ? `<p class="member-bio">${escapeHtml(m.bio)}</p>` : ''}
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
    _initLightbox();
 
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
      _setupExcel();
      _attachLightbox(body);
    } catch (e) {
      body.innerHTML = `<p class="empty">Failed to load content: ${escapeHtml(e.message)}</p>`;
    }
  }
 
  function _personPickerHtml(items, type, heading, singular) {
    _filterItems = items;
    _filterType  = type;
    const people        = [...new Set(items.map(it => it.person).filter(Boolean))];
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
      const imgList = items.map(it => ({
        src: it.src, alt: it.alt || '', caption: it.caption || ''
      }));
      const html = `<div class="block-images">${items.map((it, i) => `
        <figure>
          <img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.alt || '')}" loading="lazy"
            data-lb-src="${escapeHtml(it.src)}" data-lb-alt="${escapeHtml(it.alt||'')}" data-lb-caption="${escapeHtml(it.caption||'')}"
            data-lb-group-idx="${i}" style="cursor:zoom-in" />
          ${it.caption ? `<figcaption style="color:var(--text-faint);font-size:.85rem;margin-top:6px;font-family:var(--font-mono)">${escapeHtml(it.caption)}</figcaption>` : ''}
        </figure>
      `).join('')}</div>`;
      // attach lightbox after a tick
      setTimeout(() => {
        const container = document.getElementById('person-results-items');
        if (container) {
          container.querySelectorAll('figure img').forEach((img, i) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => window._hgLightboxOpen(imgList, i));
          });
        }
      }, 50);
      return html;
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
      case 'images': {
        if (b.filterByPerson) return _personPickerHtml(b.items || [], 'images', b.heading, 'persona');
        const imgList = (b.items || []).map(it => ({ src: it.src, alt: it.alt||'', caption: it.caption||'' }));
        return `<div class="block">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          <div class="block-images">
            ${(b.items || []).map((it, i) => `
              <figure>
                <img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.alt || '')}" loading="lazy"
                  data-lb-idx="${i}" style="cursor:zoom-in"
                  onclick="window._hgLightboxOpen(${escapeHtml(JSON.stringify(imgList))}, ${i})" />
                ${it.caption ? `<figcaption style="color:var(--text-faint);font-size:.85rem;margin-top:6px;font-family:var(--font-mono)">${escapeHtml(it.caption)}</figcaption>` : ''}
              </figure>
            `).join('')}
          </div>
        </div>`;
      }
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
      case 'excel':
        return `<div class="block" data-excel-src="${escapeHtml(b.src)}">
          ${b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : ''}
          <div class="excel-loading" style="color:var(--text-dim);font-family:var(--font-mono);font-size:.85rem">Loading…</div>
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
 
  async function _setupExcel() {
    const blocks = document.querySelectorAll('[data-excel-src]');
    for (const block of blocks) {
      const src = block.dataset.excelSrc;
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        const buf = await res.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array' });
 
        function renderSheet(idx) {
          block.querySelectorAll('.excel-tab').forEach((t, i) => t.classList.toggle('excel-tab-active', i === idx));
          const ws   = wb.Sheets[wb.SheetNames[idx]];
          const html = XLSX.utils.sheet_to_html(ws, { header: '', footer: '' });
          block.querySelector('.excel-table-wrap').innerHTML = html;
        }
 
        const tabsHtml = wb.SheetNames.map((n, i) =>
          `<button class="excel-tab${i === 0 ? ' excel-tab-active' : ''}" data-idx="${i}">${escapeHtml(n)}</button>`
        ).join('');
 
        block.querySelector('.excel-loading').outerHTML =
          `<div class="excel-tabs">${tabsHtml}</div><div class="excel-table-wrap"></div>`;
 
        renderSheet(0);
 
        block.querySelector('.excel-tabs').addEventListener('click', e => {
          const btn = e.target.closest('[data-idx]');
          if (btn) renderSheet(Number(btn.dataset.idx));
        });
      } catch (e) {
        block.querySelector('.excel-loading').textContent = 'Failed to load file.';
      }
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
 
  async function renderMember() {
    _initLightbox();
    const params   = new URLSearchParams(location.search);
    const memberId = params.get('id');
    const titleEl  = document.getElementById('memberTitle');
    const crumbEl  = document.getElementById('crumbMember');
    const descEl   = document.getElementById('memberDesc');
    const gridEl   = document.getElementById('memberGrid');
 
    const member = TEAM.find(m => m.id === memberId);
    if (!member) {
      titleEl.textContent = 'Member not found';
      crumbEl.textContent = '?';
      gridEl.innerHTML    = '<p class="empty">No member with that ID.</p>';
      return;
    }
 
    document.title  = `${member.name} — HexaGram`;
    titleEl.textContent = member.name;
    crumbEl.textContent = member.name;
    if (descEl && member.bio) descEl.textContent = member.bio;
 
    try {
      const data = await loadContent();
      const cats = data.categories || [];
      gridEl.innerHTML = cats.map((c, i) => `
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
      gridEl.innerHTML = `<div class="loading">Could not load categories. ${escapeHtml(e.message)}</div>`;
    }
  }
 
  return { renderHome, renderTemplate, renderMember };
})();
