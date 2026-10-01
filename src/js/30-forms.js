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
