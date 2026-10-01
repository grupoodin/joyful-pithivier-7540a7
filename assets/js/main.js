(() => {
'use strict';
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

/* ---------- Formulário de contato ---------- */
(function contactForm() {
  const form = $('#form-contato');
  if (!form) return;
  const done = $('.form__done', form.parentElement);
  const status = $('.form__status', form);
  const btn = $('button[type="submit"]', form);
  const endpoint = (form.dataset.endpoint || '').trim();
  const mailTo = form.dataset.email;
  const waHref = form.dataset.wa;

  // Máscara simples de telefone BR
  const phone = $('#f-whats', form);
  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = d.length > 10 ? d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
      : d.length > 6 ? d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
      : d.length > 2 ? d.replace(/^(\d{2})(\d{0,5})/, '($1) $2') : d;
  });

  const rules = {
    nome: (v) => v.trim().length >= 2 || 'Informe seu nome.',
    empresa: (v) => v.trim().length >= 2 || 'Informe o nome da empresa.',
    whatsapp: (v) => v.replace(/\D/g, '').length >= 10 || 'Informe um WhatsApp com DDD.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Informe um e-mail válido.',
    faturamento: (v) => !!v || 'Selecione uma faixa de faturamento.',
  };
  const setErr = (field, msg) => {
    const wrap = field.closest('.field');
    const out = wrap && $('.field__err', wrap);
    wrap && wrap.classList.toggle('is-invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (out) out.textContent = msg || '';
  };
  const validateField = (el) => {
    const rule = rules[el.name];
    if (!rule) return true;
    const res = rule(el.value);
    setErr(el, res === true ? '' : res);
    return res === true;
  };
  $$('input, select', form).forEach((el) => {
    el.addEventListener('blur', () => rules[el.name] && validateField(el));
    el.addEventListener('input', () => el.getAttribute('aria-invalid') === 'true' && validateField(el));
  });

  const consent = $('input[name="consentimento"]', form);
  const consentErr = $('.field__err--check', form);

  const message = (data) => [
    'Olá, Grupo Odin! Gostaria de conversar sobre a estruturação do meu negócio.',
    '',
    `Nome: ${data.nome}`,
    `Empresa: ${data.empresa}`,
    `WhatsApp: ${data.whatsapp}`,
    `E-mail: ${data.email}`,
    `Faturamento mensal: ${data.faturamento}`,
    `Necessidade: ${data.mensagem || '—'}`,
  ].join('\n');

  const showDone = (title, text, actions = []) => {
    $('[data-done-title]', done).textContent = title;
    $('[data-done-text]', done).textContent = text;
    const box = $('[data-done-actions]', done);
    box.replaceChildren(...actions);
    form.hidden = true;
    done.hidden = false;
    done.focus();
  };
  const actionLink = (label, href, ext) => {
    const a = document.createElement('a');
    a.className = 'btn btn--ghost btn--sm'; a.href = href; a.textContent = label;
    if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    const fields = $$('input, select', form).filter((el) => rules[el.name]);
    const okFields = fields.map(validateField).every(Boolean);
    const okConsent = consent.checked;
    consentErr.textContent = okConsent ? '' : 'Para continuar, confirme o consentimento.';
    if (!okFields || !okConsent) {
      const first = $('[aria-invalid="true"]', form) || consent;
      first.focus();
      return;
    }
    const fd = new FormData(form);
    if (fd.get('website')) return; // honeypot
    const data = Object.fromEntries(fd.entries());
    const text = message(data);

    if (endpoint) {
      form.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, origem: location.href }) });
        if (!res.ok) throw new Error(String(res.status));
        showDone('Recebemos sua mensagem.', 'Em breve, alguém do Grupo Odin entra em contato para entender o momento da sua empresa.');
      } catch {
        status.textContent = `Não foi possível enviar agora. Tente novamente ou escreva para ${mailTo}.`;
      } finally {
        form.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
      }
      return;
    }

    // Sem endpoint configurado: abre o e-mail pronto (fallback transparente, sem simular envio)
    const subject = `Conversa estratégica — ${data.empresa}`;
    const href = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    const actions = [actionLink('Abrir e-mail novamente', href)];
    if (waHref) actions.push(actionLink('Enviar pelo WhatsApp', `${waHref}?text=${encodeURIComponent(text)}`, true));
    const copy = document.createElement('button');
    copy.type = 'button'; copy.className = 'btn btn--ghost btn--sm'; copy.textContent = 'Copiar mensagem';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); copy.textContent = 'Mensagem copiada ✓'; } catch { copy.textContent = 'Copie manualmente'; }
    });
    actions.push(copy);
    showDone('Falta só um passo.', `Abrimos o seu aplicativo de e-mail com a mensagem pronta para ${mailTo}. Se nada abriu, use os botões abaixo.`, actions);
    location.href = href;
  });
})();

/* ---------- FAQ: abre um item por vez ---------- */
(function faq() {
  const list = $('[data-faq]');
  if (!list) return;
  list.addEventListener('toggle', (e) => {
    if (!e.target.open) return;
    $$('details[open]', list).forEach((d) => d !== e.target && d.removeAttribute('open'));
  }, true);
})();

})();
