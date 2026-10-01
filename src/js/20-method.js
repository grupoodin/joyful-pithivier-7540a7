/* ---------- Escada de maturidade: animação automática no hero do método ---------- */
(function stairAuto() {
  $$('[data-stair-auto]').forEach((stair) => {
    const cols = $$('.stair__col', stair);
    let i = 0;
    const paint = () => cols.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      c.classList.toggle('is-done', k < i);
    });
    paint();
    if (reduceMotion) return;
    setInterval(() => { i = (i + 1) % (cols.length + 1); if (i === cols.length) { i = cols.length - 1; setTimeout(() => { i = 0; paint(); }, 1400); } paint(); }, 1500);
  });
})();

/* ---------- Método Odin®: etapas guiadas pelo scroll (desktop) ---------- */
(function methodScroll() {
  const root = $('[data-mscroll]');
  if (!root) return;
  const mq = matchMedia('(min-width: 961px)');
  const nodes = $$('.rail__node', root);
  const cols = $$('.stair__col', root);
  const meter = $('[data-meter]', root);
  const bar = $('[data-meter-bar]', root);
  const rail = $('.mscroll__rail', root);
  const STEPS = 5;
  let current = 0;

  const setStep = (n) => {
    if (n === current) return;
    current = n;
    root.dataset.step = String(n);
    nodes.forEach((el, i) => {
      el.classList.toggle('is-active', i + 1 === n);
      el.classList.toggle('is-done', i + 1 < n);
      if (i + 1 === n) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
    cols.forEach((c, i) => { c.classList.toggle('is-active', i + 1 === n); c.classList.toggle('is-done', i + 1 < n); });
    const pct = n * 20;
    if (meter) meter.textContent = pct;
    if (bar) bar.style.width = pct + '%';
    rail && rail.style.setProperty('--p', ((n - 1) / (STEPS - 1)).toFixed(3));
  };

  const progress = () => {
    const r = root.getBoundingClientRect();
    const total = r.height - innerHeight;
    return Math.min(Math.max(-r.top / total, 0), 0.999);
  };
  const onScroll = () => { if (mq.matches) setStep(Math.floor(progress() * STEPS) + 1); };

  nodes.forEach((el) => el.addEventListener('click', () => {
    const n = Number(el.dataset.go);
    if (!mq.matches) return;
    const top = root.getBoundingClientRect().top + scrollY;
    const total = root.offsetHeight - innerHeight;
    scrollTo({ top: top + ((n - 0.5) / STEPS) * total, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  current = 0;
  setStep(1);
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; raf(() => { onScroll(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
