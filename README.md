# Grupo Odin — site institucional

Site estático multi-página (Início, Sobre, Serviços, Método Odin, Contato), construído a partir do IDV 2026 e da Apresentação Institucional.

## Estrutura
- `src/pages/*.html` — páginas (front-matter JSON + HTML). `src/partials/` — layout, header, footer, sprite SVG, CTA, símbolo animado.
- `src/css/*.css` e `src/js/*.js` — concatenados em `assets/css/main.css` e `assets/js/main.js`.
- `src/data/site.json` — e-mail, Instagram, WhatsApp, Portal do Cliente e endpoint do formulário.
- Os arquivos gerados (`*.html`, `assets/`, `sitemap.xml`, `robots.txt`) são versionados: o site funciona em qualquer hospedagem estática.

## Uso
```
npm run build   # gera as páginas
npm run dev     # build em watch + servidor em http://localhost:5502
```

## Pendências de configuração (`src/data/site.json`)
- `formEndpoint`: URL que recebe o POST JSON do formulário (Formspree, Netlify, API própria). Vazio = abre o e-mail pronto para `contato@grupoodin.com.br` (nada é enviado em silêncio).
- `whatsapp.number` / `display`: o material não traz número; preenchido, o canal aparece no rodapé, no contato e no formulário.
