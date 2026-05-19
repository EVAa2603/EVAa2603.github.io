/* =========================================================
   МАТ.11 — клиентский JS
   - переключение темы (dark / light) с сохранением в localStorage
   - аккордеоны
   - мобильное меню
   - reveal-анимация при прокрутке (Intersection Observer)
   - рендер формул KaTeX через класс .kx
   ========================================================= */

(function () {
  'use strict';

  // ---------- ТЕМА ----------
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const storageKey = 'mat11-theme';

  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.textContent = theme === 'light' ? '☀' : '☾';
    try { localStorage.setItem(storageKey, theme); } catch (e) {}
  };

  const savedTheme = (() => {
    try { return localStorage.getItem(storageKey); } catch (e) { return null; }
  })();

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ---------- БУРГЕР-МЕНЮ ----------
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', () => links.classList.toggle('is-open'));
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') links.classList.remove('is-open');
    });
  }

  // ---------- АККОРДЕОН ----------
  document.querySelectorAll('.acc-head').forEach((head) => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      if (!item) return;
      const isOpen = item.classList.contains('is-open');
      // закрываем только в пределах одного списка
      item.parentElement.querySelectorAll('.acc-item.is-open').forEach((other) => {
        if (other !== item) other.classList.remove('is-open');
      });
      item.classList.toggle('is-open', !isOpen);
    });
  });

  // ---------- REVEAL ON SCROLL ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- РЕНДЕР KaTeX ----------
  const renderMath = () => {
    if (typeof window.katex === 'undefined') return;
    document.querySelectorAll('.kx').forEach((el) => {
      if (el.dataset.rendered === '1') return;
      const src = el.textContent;
      try {
        window.katex.render(src, el, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
        });
        el.dataset.rendered = '1';
      } catch (e) {
        /* silently fail — fallback к исходному тексту */
      }
    });
  };

  if (document.readyState === 'complete') {
    renderMath();
  } else {
    window.addEventListener('load', renderMath);
  }

  // Перерисуем формулы при смене темы (KaTeX наследует цвет, но для надёжности)
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTimeout(renderMath, 50);
    });
  }

  // ---------- ПЛАВНАЯ ПРОКРУТКА ПО ЯКОРЯМ ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
