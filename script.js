(() => {
  'use strict';
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => [...r.querySelectorAll(s)];

  // Footer year
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Clients row: built from the <li> items in #clientList (the row hides itself when the list is empty)
  const cl = $('#clientList');
  const cbox = $('#clients');
  if (cl && cbox) {
    const people = $$('li', cl);
    const n = people.length;
    cbox.hidden = n === 0;
    if (n) {
      const MAX = 6;
      people.slice(MAX).forEach((li) => { li.hidden = true; });
      if (n > MAX) {
        const more = d.createElement('li');
        more.className = 'more-n';
        more.textContent = '+' + (n - MAX);
        cl.appendChild(more);
      }
      $('#clientText').textContent = n + (n === 1 ? ' Happy Client' : ' Happy Clients');
    }
  }

  // Active menu link while scrolling
  const nav = $('#nav');
  const links = $$('#menu a:not(.btn)');
  const spy = ['about', 'certifications', 'skills', 'now'].map((id) => d.getElementById(id)).filter(Boolean);
  let ticking = false;
  const onScroll = () => {
    const y = innerHeight * 0.4;
    let cur = '#top';
    spy.forEach((s) => { if (s.getBoundingClientRect().top <= y) cur = '#' + s.id; });
    links.forEach((a) => {
      if (a.getAttribute('href') === cur) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    ticking = false;
  };
  onScroll();
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // Mobile menu
  const burger = $('#burger');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $('#menu').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Scroll reveal with a small stagger inside each group
  const items = $$('.reveal');
  items.forEach((el) => {
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
    el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 5) * 0.07).toFixed(2) + 's');
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Tools marquee: duplicate the list once so the loop is seamless
  const track = $('#marq');
  if (track && !reduce) {
    $$('span', track).forEach((s) => {
      const c = s.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
  }

  // Tabs (data roles + journey years)
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role=tab]', root);
    const panels = tabs.map((t) => d.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus, user) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
      if (user) tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
    };
    let start = tabs.findIndex((t) => t.hasAttribute('data-default'));
    if (start < 0) start = 0;
    select(start, false, false);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false, true));
      t.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true, true); }
      });
    });
  });

  // Testimonial slider (auto-advances, pauses on hover or focus)
  const sl = $('#slider');
  if (sl) {
    const slides = $$('.slide', sl);
    const dots = $('.sdots', sl);
    let i = 0, timer = null;
    const go = (k) => {
      i = (k + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-on', j === i));
      $$('button', dots).forEach((b, j) => { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    };
    slides.forEach((_, k) => {
      const b = d.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to testimonial ' + (k + 1));
      b.addEventListener('click', () => go(k));
      dots.appendChild(b);
    });
    $$('.sbtn', sl).forEach((b) => b.addEventListener('click', () => go(i + parseInt(b.dataset.dir, 10))));
    const start = () => { if (!reduce && !timer) timer = setInterval(() => go(i + 1), 6500); };
    const stop = () => { clearInterval(timer); timer = null; };
    sl.addEventListener('mouseenter', stop);
    sl.addEventListener('mouseleave', start);
    sl.addEventListener('focusin', stop);
    sl.addEventListener('focusout', start);
    go(0);
    start();
  }

  // Certificates: built from the public "cert" repo, so new uploads appear on their own
  const cg = $('#certGrid');
  if (cg) {
    const U = 'vvraj00480-debug', R = 'cert';
    const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
    const raw = (p) => 'https://raw.githubusercontent.com/' + U + '/' + R + '/HEAD/' + enc(p);
    const blob = (p) => 'https://github.com/' + U + '/' + R + '/blob/HEAD/' + enc(p);
    const mk = (tag, cls, txt) => { const e = d.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
    const when = (iso) => { const t = new Date(iso + 'T00:00:00Z'); return isNaN(t) ? '' : t.toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }); };
    const card = (c) => {
      const a = mk('article', 'card cert reveal in');
      const link = blob(c.file);
      if (c.thumb) {
        const t = mk('a', 'thumb'); t.href = link; t.target = '_blank'; t.rel = 'noopener'; t.setAttribute('aria-label', 'Open ' + c.title);
        const im = d.createElement('img'); im.src = raw(c.thumb); im.alt = 'Certificate: ' + c.title; im.loading = 'lazy'; im.width = 880; im.height = 680;
        t.appendChild(im); a.appendChild(t);
      }
      a.appendChild(mk('p', 'eyebrow', [c.issuer, c.date ? when(c.date) : ''].filter(Boolean).join(' · ')));
      a.appendChild(mk('h3', '', c.title));
      const sub = [c.program, c.duration].filter(Boolean).join(' · ');
      if (sub) a.appendChild(mk('p', 'note', sub));
      if (c.skills && c.skills.length) { const ul = mk('ul', 'ptags'); c.skills.forEach((s) => ul.appendChild(mk('li', '', s))); a.appendChild(ul); }
      const m = mk('a', 'more', 'View certificate \u2192'); m.href = link; m.target = '_blank'; m.rel = 'noopener'; a.appendChild(m);
      return a;
    };
    const isFile = (n) => /\.(pdf|png|jpe?g|webp)$/i.test(n);
    const isImg = (n) => /\.(png|jpe?g|webp)$/i.test(n);
    const ok = (r) => { if (!r.ok) throw new Error(r.status); return r.json(); };
    fetch(raw('certs.json')).then(ok)
      .catch(() => fetch('https://api.github.com/repos/' + U + '/' + R + '/contents/').then(ok).then((items) =>
        items.filter((f) => f.type === 'file' && isFile(f.name)).map((f) => ({ title: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), file: f.path, thumb: isImg(f.name) ? f.path : '' }))))
      .then((list) => {
        cg.textContent = '';
        if (!list.length) { cg.appendChild(mk('p', 'mute', 'Certificates coming soon.')); return; }
        list.forEach((c) => cg.appendChild(card(c)));
      })
      .catch(() => {
        cg.textContent = '';
        const p = mk('p', 'mute', 'Certificates could not load right now. '); const a = mk('a', 'more', 'See them on GitHub \u2192');
        a.href = 'https://github.com/' + U + '/' + R; a.target = '_blank'; a.rel = 'noopener'; p.appendChild(a); cg.appendChild(p);
      });
  }

  // Now section: employment switch, reading list, updated date (all driven by data- attributes in index.html)
  const now = $('#now');
  if (now) {
    const emp = now.dataset.employed === 'true';
    const role = (now.dataset.role || '').trim();
    const company = (now.dataset.company || '').trim();

    $('#empSwitch').setAttribute('aria-checked', String(!emp)); // switch is ON (green) when open to work
    $('#empLabel').textContent = emp ? 'Employed' : 'Open to work';
    $('#empSub').textContent = emp
      ? (role && company ? 'Working as ' + role + ' at ' + company + '.' : 'Currently working full-time. Still happy to chat.')
      : 'Looking for my next data role. Say hello.';

    const st = $('#statusText');
    if (st) {
      st.textContent = emp ? 'Employed · open to conversations' : 'Available for work';
      $('#statusDot').classList.toggle('busy', emp);
    }

    const u = (now.dataset.updated || '').split('-');
    if (u.length >= 2) {
      const dt = new Date(+u[0], (+u[1] || 1) - 1, 1);
      if (!isNaN(dt)) $('#updated').textContent = 'Updated ' + dt.toLocaleDateString('en', { month: 'short', year: 'numeric' });
    }

    // Reading list: hides the empty message once papers are listed in index.html
    const list = $('#readList');
    const empty = $('#readEmpty');
    if (list && empty) empty.hidden = list.children.length > 0;
  }
})();
