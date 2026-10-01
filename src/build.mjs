// Build mínimo, sem dependências.
//   src/pages/*.html   -> /*.html            (páginas, com front-matter JSON)
//   src/partials/*.html -> {{> nome}}         (header, footer, sprite…)
//   src/css/*.css      -> assets/css/main.css (concatenado, ordem alfabética)
//   src/js/*.js        -> assets/js/main.js   (concatenado, ordem alfabética)
//   sitemap.xml e robots.txt são gerados a partir das páginas.
//
// Uso: node src/build.mjs [--watch]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const site = JSON.parse(fs.readFileSync(path.join(SRC, 'data/site.json'), 'utf8'));

const NAV = [
  { key: 'inicio', label: 'Início', href: 'index.html' },
  { key: 'sobre', label: 'Sobre', href: 'sobre.html' },
  { key: 'servicos', label: 'Serviços', href: 'servicos.html' },
  { key: 'metodo', label: 'Método Odin', href: 'metodo-odin.html' },
  { key: 'contato', label: 'Contato', href: 'contato.html' },
];

const read = (p) => fs.readFileSync(p, 'utf8');
const list = (dir, ext) =>
  fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort();

const partials = () =>
  Object.fromEntries(
    list(path.join(SRC, 'partials'), '.html').map((f) => [
      f.replace(/\.html$/, ''),
      read(path.join(SRC, 'partials', f)),
    ]),
  );

const get = (obj, key) =>
  key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

// {{> parcial}} (recursivo) e {{caminho.da.variavel}}
function render(tpl, ctx, parts, depth = 0) {
  if (depth > 6) throw new Error('Includes aninhados demais');
  const withIncludes = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in parts)) throw new Error(`Parcial não encontrado: ${name}`);
    return render(parts[name], ctx, parts, depth + 1);
  });
  return withIncludes.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    const v = get(ctx, key);
    if (v === undefined) throw new Error(`Variável não definida: ${key}`);
    return String(v);
  });
}

function parsePage(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`Front-matter ausente em ${file}`);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length) };
}

function build() {
  const parts = partials();
  const pages = list(path.join(SRC, 'pages'), '.html');
  const urls = [];

  for (const file of pages) {
    const { meta, body } = parsePage(read(path.join(SRC, 'pages', file)), file);
    const out = meta.out || file;
    const cur = Object.fromEntries(
      NAV.map((n) => [n.key, n.key === meta.nav ? 'aria-current="page"' : '']),
    );
    const wa = site.whatsapp.number
      ? `https://wa.me/${site.whatsapp.number.replace(/\D/g, '')}`
      : '';
    const ctx = {
      contact: {
        whatsappHref: wa,
        whatsappFooter: wa
          ? `<li><a href="${wa}" target="_blank" rel="noopener">WhatsApp ${site.whatsapp.display}</a></li>`
          : '',
        whatsappCard: wa
          ? `<a class="channel" href="${wa}" target="_blank" rel="noopener"><svg class="channel__icon" aria-hidden="true"><use href="#i-whatsapp"/></svg><span class="channel__label">WhatsApp</span><span class="channel__value">${site.whatsapp.display}</span></a>`
          : '',
      },
      site,
      page: {
        schema: '',
        ogImage: 'assets/img/og-image.png',
        robots: 'index,follow',
        ...meta,
        path: out === 'index.html' ? '' : out,
        canonical: `${site.url}/${out === 'index.html' ? '' : out}`,
      },
      cur,
    };
    // O corpo é renderizado primeiro; o layout o recebe como {{page.content}}.
    ctx.page.content = render(body, ctx, parts);
    const html = render(parts.layout, ctx, parts);
    fs.writeFileSync(path.join(ROOT, out), html);
    if (meta.sitemap !== false) urls.push({ loc: ctx.page.canonical, prio: meta.priority || '0.8' });
  }

  // Redirecionamentos das URLs do site anterior
  for (const [from, to] of Object.entries({
    'metodo.html': 'metodo-odin.html',
    'financeiro.html': 'servicos.html#odin-finance',
  })) {
    fs.writeFileSync(
      path.join(ROOT, from),
      `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Redirecionando…</title><meta name="robots" content="noindex"><link rel="canonical" href="${site.url}/${to}"><meta http-equiv="refresh" content="0; url=${to}"><p><a href="${to}">Continuar</a></p></html>\n`,
    );
  }

  // CSS e JS
  const cat = (dir, ext) =>
    list(path.join(SRC, dir), ext).map((f) => read(path.join(SRC, dir, f))).join('\n');
  fs.mkdirSync(path.join(ROOT, 'assets/css'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'assets/js'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'assets/css/main.css'), cat('css', '.css'));
  fs.writeFileSync(path.join(ROOT, 'assets/js/main.js'), `(() => {\n'use strict';\n${cat('js', '.js')}\n})();\n`);

  // sitemap + robots
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.prio}</priority></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  fs.writeFileSync(
    path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
  );
  console.log(`✔ build ok — ${pages.length} páginas`);
}

build();
if (process.argv.includes('--watch')) {
  let t;
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(t);
    t = setTimeout(() => {
      try { build(); } catch (e) { console.error('✖', e.message); }
    }, 80);
  });
}
