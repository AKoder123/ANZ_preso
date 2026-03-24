/* ═══════════════════════════════════════════
   STEPHEN RANDO PITCH — app.js
   ═══════════════════════════════════════════ */

(async () => {
  /* ── 1. LOAD CONTENT ── */
  let deck;
  try {
    const res = await fetch('./content.json');
    deck = await res.json();
  } catch (e) {
    document.body.innerHTML = '<p style="color:#fff;padding:40px">Error loading content.json</p>';
    return;
  }

  const slides = deck.slides;
  const total  = slides.length;

  /* ── 2. DOM REFS ── */
  const deckEl       = document.getElementById('deck');
  const navBrand     = document.getElementById('navBrand');
  const slideCounter = document.getElementById('slideCounter');
  const progressRail = document.getElementById('progressRail');
  const progressFill = document.getElementById('progressFill');

  /* ── 3. NAV BRAND ── */
  navBrand.textContent = deck.meta.title;

  /* ── 4. COMPUTE TOP OFFSET ── */
  const nav = document.getElementById('topNav');
  function setTopOffset() {
    const h = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--topOffset', h + 'px');
  }
  setTopOffset();
  window.addEventListener('resize', setTopOffset);

  /* ── 5. RENDER SLIDES ── */
  slides.forEach((s, i) => {
    const el = buildSlide(s, i);
    deckEl.appendChild(el);
  });

  /* ── 6. BUILD PROGRESS DOTS ── */
  const dots = [];
  slides.forEach((s, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.title = s.headline || `Slide ${i + 1}`;
    dot.addEventListener('click', () => scrollToSlide(i));
    progressRail.appendChild(dot);
    dots.push(dot);
  });

  /* ── 7. INTERSECTION OBSERVER ── */
  const slideEls = Array.from(document.querySelectorAll('.slide'));
  let currentIdx = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        entry.target.classList.add('is-active');
        const idx = slideEls.indexOf(entry.target);
        if (idx !== -1) updateProgress(idx);
      }
    });
  }, { threshold: 0.5 });

  slideEls.forEach(el => observer.observe(el));

  function updateProgress(idx) {
    currentIdx = idx;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    slideCounter.textContent = `${idx + 1} / ${total}`;
    progressFill.style.height = ((idx + 1) / total * 100) + '%';
  }

  /* ── 8. KEYBOARD NAV ── */
  document.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToSlide(Math.min(currentIdx + 1, total - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToSlide(Math.max(currentIdx - 1, 0));
    }
  });

  function scrollToSlide(idx) {
    slideEls[idx].scrollIntoView({ behavior: 'smooth' });
  }

  /* ── 9. PDF EXPORT ── */
  setupPdfExport(slideEls, slides);

  /* ════════════════════════════════
     SLIDE BUILDERS
  ════════════════════════════════ */
  function buildSlide(s, i) {
    const wrap = document.createElement('section');
    wrap.className = `slide slide-${s.type}`;
    wrap.dataset.index = i;

    // background deco
    const bg = document.createElement('div');
    bg.className = 'slide-bg-deco';
    wrap.appendChild(bg);

    // slide number
    const num = document.createElement('div');
    num.className = 'slide-num';
    num.textContent = `0${i + 1}`;
    wrap.appendChild(num);

    // inner content
    const inner = document.createElement('div');
    inner.className = 'slide-inner';
    wrap.appendChild(inner);

    if (s.type === 'title')            buildTitle(inner, s);
    else if (s.type === 'program')     buildProgram(inner, s);
    else if (s.type === 'content')     buildContent(inner, s);
    else if (s.type === 'beforeAfter') buildBeforeAfter(inner, s);
    else if (s.type === 'timeline')    buildTimeline(inner, s);
    else if (s.type === 'closing')     buildClosing(inner, s);
    else if (s.type === 'section')     buildSection(inner, s);

    return wrap;
  }

  /* ── TITLE ── */
  function buildTitle(inner, s) {
    const left = div('title-left', 'data-animate');
    const nameParts = (s.headline || '').split(' ');
    const first = nameParts.slice(0, -1).join(' ');
    const last  = nameParts.slice(-1)[0] || '';

    const nameEl = div('title-name');
    nameEl.innerHTML = `${esc(first)}<strong>${esc(last)}</strong>`;
    left.appendChild(nameEl);

    const role = div('title-role');
    role.textContent = s.note || 'Director';
    left.appendChild(role);

    const divider = div('title-divider');
    left.appendChild(divider);

    const sub = div('title-subheadline');
    sub.textContent = s.subheadline || '';
    left.appendChild(sub);

    inner.appendChild(left);

    // Right: stat boxes
    const right = div('title-right');
    const stats = [
      { number: '17+', label: 'Years at ANZ' },
      { number: '$137m', label: 'Wealth Separation Program' },
      { number: '$975m+', label: 'Benefits Realised' },
      { number: '250+', label: 'Resources Led' }
    ];

    stats.forEach((st, idx) => {
      const box = div('stat-box');
      box.setAttribute('data-animate', '');
      box.style.setProperty('transition-delay', (0.1 + idx * 0.1) + 's');

      const num = div('stat-number');
      num.textContent = st.number;
      const lbl = div('stat-label');
      lbl.textContent = st.label;
      box.appendChild(num);
      box.appendChild(lbl);
      right.appendChild(box);
    });

    inner.appendChild(right);
  }

  /* ── PROGRAM (initiative overview) ── */
  function buildProgram(inner, s) {
    // Header
    const header = div('content-header', 'data-animate');
    const ey = div('eyebrow');
    ey.textContent = 'Initiative Overview';
    header.appendChild(ey);
    const hl = div('headline');
    hl.innerHTML = `<span class="grad">${esc(s.headline || '')}</span>`;
    header.appendChild(hl);
    if (s.subheadline) {
      const sub = div('subheadline');
      sub.textContent = s.subheadline;
      header.appendChild(sub);
    }
    inner.appendChild(header);

    // Bullets as horizontal feature strip
    const strip = div('program-strip');
    (s.bullets || []).forEach((b, idx) => {
      const item = div('program-item');
      item.setAttribute('data-animate', '');
      const num = div('program-item-num');
      num.textContent = String(idx + 1).padStart(2, '0');
      const txt = div('program-item-text');
      txt.innerHTML = formatBullet(b);
      item.appendChild(num);
      item.appendChild(txt);
      strip.appendChild(item);
    });
    inner.appendChild(strip);

    // Note tag
    if (s.note) {
      const noteWrap = div('program-note', 'data-animate');
      const noteTxt = document.createElement('span');
      noteTxt.textContent = s.note;
      noteWrap.appendChild(noteTxt);
      inner.appendChild(noteWrap);
    }
  }

  /* ── TIMELINE ── */
  function buildTimeline(inner, s) {
    const header = div('content-header', 'data-animate');
    const ey = div('eyebrow');
    ey.textContent = 'Regulatory Delivery Roadmap';
    header.appendChild(ey);
    const hl = div('headline');
    hl.innerHTML = `<span class="grad">${esc(s.headline || '')}</span>`;
    header.appendChild(hl);
    if (s.subheadline) {
      const sub = div('subheadline');
      sub.textContent = s.subheadline;
      header.appendChild(sub);
    }
    inner.appendChild(header);

    const tl = div('timeline-track');
    const phases = s.phases || [];
    phases.forEach((ph, idx) => {
      const node = div('timeline-node');
      node.setAttribute('data-animate', '');

      const dot = div('timeline-dot');
      const connector = div('timeline-connector');

      const content = div('timeline-content');
      const date = div('timeline-date');
      date.textContent = ph.date;
      const label = div('timeline-label');
      label.textContent = ph.label;
      const detail = div('timeline-detail');
      detail.textContent = ph.detail;

      content.appendChild(date);
      content.appendChild(label);
      content.appendChild(detail);

      node.appendChild(dot);
      if (idx < phases.length - 1) node.appendChild(connector);
      node.appendChild(content);
      tl.appendChild(node);
    });
    inner.appendChild(tl);
  }

  /* ── CONTENT ── */
  function buildContent(inner, s) {
    const header = div('content-header', 'data-animate');

    if (s.subheadline) {
      const ey = div('eyebrow');
      ey.textContent = s.subheadline;
      header.appendChild(ey);
    }

    const hl = div('headline');
    hl.innerHTML = `<span class="grad">${esc(s.headline || '')}</span>`;
    header.appendChild(hl);

    inner.appendChild(header);

    const bullets = s.bullets || [];
    const grid = div('bullets-grid');

    bullets.forEach((b, idx) => {
      const card = div('bullet-card' + (idx === 4 && bullets.length === 5 ? ' wide' : ''));
      card.setAttribute('data-animate', '');

      const num = div('bullet-card-num');
      num.textContent = String(idx + 1).padStart(2, '0');
      card.appendChild(num);

      const text = div('bullet-card-text');
      // Bold metric-like text (starts with $ or % or number)
      text.innerHTML = formatBullet(b);
      card.appendChild(text);

      grid.appendChild(card);
    });

    inner.appendChild(grid);
  }

  /* ── BEFORE/AFTER ── */
  function buildBeforeAfter(inner, s) {
    const header = div('ba-header', 'data-animate');

    const hl = div('headline');
    hl.innerHTML = `<span class="grad">${esc(s.headline || '')}</span>`;
    header.appendChild(hl);
    inner.appendChild(header);

    const cols = div('ba-cols');

    // Left col
    const leftCol = div('ba-col left-col');
    leftCol.setAttribute('data-animate', '');
    const leftTitle = div('ba-col-title');
    leftTitle.textContent = s.left?.title || 'Before';
    leftCol.appendChild(leftTitle);
    const leftList = document.createElement('ul');
    leftList.className = 'ba-bullets';
    (s.left?.bullets || []).forEach(b => {
      const li = document.createElement('li');
      li.innerHTML = formatBullet(b);
      leftList.appendChild(li);
    });
    leftCol.appendChild(leftList);
    cols.appendChild(leftCol);

    // Divider
    const divider = div('ba-divider');
    const icon = div('ba-divider-icon');
    icon.textContent = '↔';
    divider.appendChild(icon);
    cols.appendChild(divider);

    // Right col
    const rightCol = div('ba-col right-col');
    rightCol.setAttribute('data-animate', '');
    const rightTitle = div('ba-col-title');
    rightTitle.textContent = s.right?.title || 'After';
    rightCol.appendChild(rightTitle);
    const rightList = document.createElement('ul');
    rightList.className = 'ba-bullets';
    (s.right?.bullets || []).forEach(b => {
      const li = document.createElement('li');
      li.innerHTML = formatBullet(b);
      rightList.appendChild(li);
    });
    rightCol.appendChild(rightList);
    cols.appendChild(rightCol);

    inner.appendChild(cols);
  }

  /* ── CLOSING ── */
  function buildClosing(inner, s) {
    const orn = div('closing-ornament');
    orn.setAttribute('data-animate', '');
    inner.appendChild(orn);

    const hl = div('closing-headline', 'data-animate');
    const words = (s.headline || '').split(' ');
    const halfIdx = Math.floor(words.length / 2);
    hl.innerHTML = words.slice(0, halfIdx).join(' ') + ' <strong>' + esc(words.slice(halfIdx).join(' ')) + '</strong>';
    inner.appendChild(hl);

    if (s.subheadline) {
      const sub = div('closing-subheadline', 'data-animate');
      sub.textContent = s.subheadline;
      inner.appendChild(sub);
    }

    if (s.bullets?.length) {
      const grid = div('closing-bullets', 'data-animate');
      s.bullets.forEach(b => {
        const item = div('closing-bullet');
        const dot = div('closing-bullet-dot');
        item.appendChild(dot);
        const txt = document.createElement('span');
        txt.innerHTML = formatBullet(b);
        item.appendChild(txt);
        grid.appendChild(item);
      });
      inner.appendChild(grid);
    }

    if (s.note) {
      const note = div('closing-note', 'data-animate');
      note.textContent = s.note;
      inner.appendChild(note);
    }

    const ornB = div('closing-ornament-bottom');
    ornB.setAttribute('data-animate', '');
    inner.appendChild(ornB);
  }

  /* ── SECTION ── */
  function buildSection(inner, s) {
    if (s.subheadline) {
      const ey = div('eyebrow', 'data-animate');
      ey.textContent = s.subheadline;
      inner.appendChild(ey);
    }
    const hl = div('headline', 'data-animate');
    hl.innerHTML = `<span class="grad">${esc(s.headline || '')}</span>`;
    inner.appendChild(hl);
  }

  /* ════════════════════════════════
     HELPERS
  ════════════════════════════════ */
  function div(className, ...attrs) {
    const el = document.createElement('div');
    el.className = className;
    attrs.forEach(a => {
      if (a === 'data-animate') el.setAttribute('data-animate', '');
    });
    return el;
  }

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function formatBullet(text) {
    // Bold anything that looks like a metric
    return esc(text).replace(
      /(\$[\d,.]+[a-zA-Z+]*|[\d,.]+%|\d+\+|\d+x)/g,
      '<strong>$1</strong>'
    );
  }

  /* ════════════════════════════════
     PDF EXPORT
  ════════════════════════════════ */
  function setupPdfExport(slideEls) {
    const btn = document.getElementById('exportPdfBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Loading libs…';

      // Load html2canvas
      if (!window.html2canvas) {
        try {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        } catch {
          alert('Could not load html2canvas from cdnjs.cloudflare.com. Please allow that domain or self-host the library.');
          btn.disabled = false; btn.textContent = 'Export PDF'; return;
        }
      }

      // Load jsPDF
      if (!window.jspdf) {
        try {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        } catch {
          alert('Could not load jsPDF from cdnjs.cloudflare.com. Please allow that domain or self-host the library.');
          btn.disabled = false; btn.textContent = 'Export PDF'; return;
        }
      }

      btn.textContent = 'Exporting…';
      document.body.classList.add('exportingPdf');

      // Force all slides visible
      slideEls.forEach(el => el.classList.add('is-active'));

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
      let first = true;

      for (let i = 0; i < slideEls.length; i++) {
        btn.textContent = `Exporting ${i + 1}/${slideEls.length}…`;

        const stage = document.createElement('div');
        stage.id = 'pdfStage';
        document.body.appendChild(stage);

        // Clone background
        const bgClone = slideEls[i].querySelector('.slide-bg-deco');
        if (bgClone) stage.appendChild(bgClone.cloneNode(true));

        // Clone slide
        const slideClone = slideEls[i].cloneNode(true);
        slideClone.classList.add('is-active');
        slideClone.style.cssText = `width:1920px;height:1080px;min-height:unset;padding:90px 96px;overflow:hidden;scroll-snap-align:unset;`;
        // Remove nav/progress inside clone
        ['#topNav','#progressRail','.progress-bar-track','.slide-num'].forEach(sel => {
          slideClone.querySelectorAll(sel).forEach(el => el.remove());
        });
        stage.appendChild(slideClone);

        try {
          const canvas = await html2canvas(stage, {
            backgroundColor: '#080c14',
            scale: 2,
            useCORS: true,
            width: 1920,
            height: 1080,
            windowWidth: 1920,
            windowHeight: 1080
          });

          const imgData = canvas.toDataURL('image/png');

          if (!first) pdf.addPage([1920, 1080], 'landscape');
          pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
          first = false;
        } catch (err) {
          console.error('Slide capture error:', err);
        }

        stage.remove();
      }

      pdf.save('StephenRando-Pitch.pdf');

      document.body.classList.remove('exportingPdf');
      btn.disabled = false;
      btn.textContent = 'Export PDF';
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load: ' + src));
      document.head.appendChild(s);
    });
  }

})();
