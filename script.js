/* ================================================
   GRUPO ODIN — SCRIPTS
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---- MOBILE MENU ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  hamburger?.addEventListener('click', () => mobileMenu.classList.add('open'));
  mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

  // ---- SCROLL ANIMATIONS ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Trigger score bar fills
        entry.target.querySelectorAll?.('.pilar-score-fill').forEach(bar => {
          bar.style.width = bar.dataset.width || '0%';
        });
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ---- PILAR SCORE BARS ----
  const pilarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.pilar-score-fill').forEach(bar => {
          setTimeout(() => {
            bar.style.width = bar.dataset.width || '0%';
          }, 200);
        });
        pilarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const pilaresGrid = document.querySelector('.pilares-grid');
  if (pilaresGrid) pilarObserver.observe(pilaresGrid);

  // ---- ANIMATED COUNTER ----
  function animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString('pt-BR') + (el.dataset.suffix || '');
      if (start >= target) clearInterval(timer);
    }, 16);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.target), 2000);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

  // ---- SCORE GAUGE ANIMATION ----
  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl = entry.target.querySelector('.score-gauge-number');
        if (numEl) animateCounter(numEl, 847, 2500);
        gaugeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const scoreGauge = document.querySelector('.score-gauge');
  if (scoreGauge) gaugeObserver.observe(scoreGauge);

  // ---- ACTIVE NAV LINK ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? 'var(--odin-red)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- FORM SUBMIT ----
  const form = document.querySelector('.contato-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Mensagem Enviada ✓';
    btn.style.background = '#2a7d4f';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });

  // ---- TICKER DUPLICATE ----
  const tickerInner = document.querySelector('.ticker-inner');
  if (tickerInner) {
    tickerInner.innerHTML += tickerInner.innerHTML;
  }

});


