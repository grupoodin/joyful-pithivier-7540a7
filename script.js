(function () {
  var WA = 'https://wa.me/5511940678537?text=' + encodeURIComponent(
    'Olá! Conheci o Grupo Odin e gostaria de entender como vocês podem estruturar minha empresa.');
  var $ = function (s, c) { return (c || document).querySelectorAll(s); };

  document.documentElement.classList.add('js');

  $('[data-wa]').forEach(function (a) {
    a.href = WA; a.target = '_blank'; a.rel = 'noopener';
  });

  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var fab = document.querySelector('.fab');
  var hero = document.getElementById('topo');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    drawer.hidden = !open;
    hdr.classList.toggle('is-o', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var ticking = false;
  function onScroll() {
    hdr.classList.toggle('is-s', window.scrollY > 24);
    fab.classList.toggle('on', window.scrollY > hero.offsetHeight * 0.55);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  var els = $('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  els.forEach(function (el, i) {
    var sib = el.parentElement.children;
    el.style.setProperty('--d', (Array.prototype.indexOf.call(sib, el) % 4) * 0.07 + 's');
    io.observe(el);
  });
})();
