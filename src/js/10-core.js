/* ==========================================================================
   Grupo Odin — comportamento (JS puro, sem dependências)
   ========================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const raf = (fn) => requestAnimationFrame(fn);

/* ---------- Cabeçalho: estado de rolagem + menu mobile ---------- */
(function header() {
  const el = $('[data-header]');
  if (!el) return;
  const onScroll = () => el.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('.menu-toggle', el);
  const menu = $('#menu-mobile', el);
  if (!toggle || !menu) return;
  let closeTimer;
  const setOpen = (open) => {
    clearTimeout(closeTimer);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', open);
    if (open) {
      menu.hidden = false;
      raf(() => raf(() => menu.classList.add('is-open')));
    } else {
      menu.classList.remove('is-open');
      closeTimer = setTimeout(() => (menu.hidden = true), 420);
    }
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => e.target.closest('a') && setOpen(false));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  matchMedia('(min-width: 1021px)').addEventListener('change', (m) => m.matches && setOpen(false));
})();

/* ---------- Revelação ao rolar ---------- */
(function reveal() {
  const items = $$('[data-reveal]');
  const steps = $$('.steps, [data-chart]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.concat(steps).forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }),
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
  );
  items.forEach((el) => io.observe(el));
  steps.forEach((el) => !el.matches('[data-reveal]') && io.observe(el));
})();

/* ---------- Contadores ---------- */
(function counters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const run = (el) => {
    const end = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = end; return; }
    const dur = 1600;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf(tick);
    };
    el.textContent = '0';
    raf(tick);
  };
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }),
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
})();

/* ---------- Texto que "acende" palavra por palavra ---------- */
(function words() {
  const blocks = $$('[data-words]');
  if (!blocks.length) return;
  const split = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement('span');
          s.className = 'w'; s.textContent = part; frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
  };
  blocks.forEach(split);
  if (reduceMotion) { $$('.w').forEach((w) => w.classList.add('is-lit')); return; }

  const update = () => {
    const vh = innerHeight;
    blocks.forEach((b) => {
      const r = b.getBoundingClientRect();
      const ws = $$('.w', b);
      const start = vh * 0.88, end = vh * 0.38;
      const p = Math.min(Math.max((start - r.top) / (start - end + r.height * 0.6), 0), 1);
      const n = Math.ceil(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('is-lit', i < n));
    });
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; raf(() => { update(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();

/* ---------- Símbolo Odin: dimensões, ciclo automático e parallax ---------- */
(function odinArt() {
  $$('[data-odin-art]').forEach((art) => {
    const tabs = $$('.odin-art__tab', art);
    const caption = $('[data-caption]', art);
    const order = ['t', 'r', 'b', 'l'];
    let timer, locked = false;

    const set = (dim) => {
      art.dataset.active = dim;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.dim === dim)));
      const tab = tabs.find((t) => t.dataset.dim === dim);
      if (tab && caption) caption.textContent = tab.dataset.text;
    };
    const cycle = () => {
      if (locked || reduceMotion) return;
      set(order[(order.indexOf(art.dataset.active) + 1) % order.length]);
    };
    const start = () => { clearInterval(timer); timer = setInterval(cycle, 3600); };

    tabs.forEach((t) => {
      t.addEventListener('click', () => { locked = true; set(t.dataset.dim); });
      t.addEventListener('mouseenter', () => { locked = true; set(t.dataset.dim); });
      t.addEventListener('mouseleave', () => (locked = false));
      t.addEventListener('focus', () => { locked = true; set(t.dataset.dim); });
      t.addEventListener('blur', () => (locked = false));
    });
    $$('.oa-bar', art).forEach((b) => {
      b.addEventListener('mouseenter', () => { locked = true; set(b.dataset.dim); });
      b.addEventListener('mouseleave', () => (locked = false));
    });

    raf(() => raf(() => art.classList.add('is-ready')));
    start();

    if (finePointer && !reduceMotion) {
      const svg = $('.odin-art__svg', art);
      const host = art.closest('.hero, section') || art;
      host.addEventListener('pointermove', (e) => {
        const r = host.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        art.style.setProperty('--px', x.toFixed(3));
        art.style.setProperty('--py', y.toFixed(3));
        svg.style.setProperty('--rx', (x * 7).toFixed(2) + 'deg');
        svg.style.setProperty('--ry', (-y * 6).toFixed(2) + 'deg');
      });
      host.addEventListener('pointerleave', () => {
        ['--px', '--py'].forEach((p) => art.style.removeProperty(p));
        ['--rx', '--ry'].forEach((p) => svg.style.removeProperty(p));
      });
    }
  });
})();
