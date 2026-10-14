/**
 * Tapir LP — Main entry point
 */

(function () {
  const loaderEl = () => document.getElementById('page-loader');
  const errorEl = () => document.getElementById('page-error');

  async function loadBootstrapConfig() {
    // 1. Config injetada no build ou no servidor de dev
    if (window.HOTEL_CONFIG) return window.HOTEL_CONFIG;

    // 2. Build estático / dev: config.json ao lado do index
    try {
      const local = await fetch('./config.json');
      if (local.ok) return await local.json();
    } catch (_) { /* segue para fallback de dev */ }

    // 3. Dev legado: configs/{slug}.json ou ?hotel=slug
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('hotel') || window.HOTEL_SLUG || 'extasy-brotas';

    try {
      const res = await fetch(`/configs/${slug}.json`);
      if (!res.ok) throw new Error(`Config não encontrada: ${slug}`);
      return await res.json();
    } catch (err) {
      console.error('[Tapir LP]', err.message);
      return null;
    }
  }

  function setBootState(state) {
    const body = document.body;
    body.classList.remove('is-booting', 'is-ready', 'is-error');
    body.classList.add(state);

    const loader = loaderEl();
    const error = errorEl();

    if (state === 'is-booting') {
      loader?.classList.remove('hidden');
      loader?.setAttribute('aria-busy', 'true');
      error?.classList.add('hidden');
      return;
    }

    if (state === 'is-error') {
      loader?.classList.add('hidden');
      loader?.setAttribute('aria-busy', 'false');
      error?.classList.remove('hidden');
      return;
    }

    // is-ready
    loader?.classList.add('is-leaving');
    loader?.setAttribute('aria-busy', 'false');
    error?.classList.add('hidden');
    window.setTimeout(() => {
      loader?.classList.add('hidden');
      loader?.classList.remove('is-leaving');
    }, 420);
  }

  function showLoadError() {
    setBootState('is-error');
  }

  function revealPage() {
    setBootState('is-ready');
  }

  function initUI(config) {
    // Header scroll
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 50);
    }, { passive: true });

    // Mobile menu
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('mobile-menu-overlay');

    const closeMenu = () => {
      mobileMenu?.classList.remove('is-open');
      menuOverlay?.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      menuOverlay?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      mobileMenu?.classList.add('is-open');
      menuOverlay?.classList.add('is-open');
      menuToggle?.setAttribute('aria-expanded', 'true');
      mobileMenu?.setAttribute('aria-hidden', 'false');
      menuOverlay?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    };

    menuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileMenu?.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuOverlay?.addEventListener('click', closeMenu);

    mobileMenu?.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // FAQ accordion
    document.getElementById('faq-list')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq__question');
      if (!btn) return;
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq__item').forEach((i) => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Gallery lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    document.getElementById('gallery-grid')?.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery__item');
      if (!item) return;
      const img = item.querySelector('img');
      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox?.classList.add('is-open');
        lightbox?.setAttribute('aria-hidden', 'false');
      }
    });

    document.getElementById('lightbox-close')?.addEventListener('click', () => {
      lightbox?.classList.remove('is-open');
      lightbox?.setAttribute('aria-hidden', 'true');
    });

    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function mountApp(config) {
    window.HOTEL_CONFIG = config;

    Render.init(config);
    Booking.init(config);
    WhatsApp.init(config);
    TapirBooking.init(config);
    TapirAnalytics.init(config);
    initUI(config);

    // Re-bind após render dinâmico
    WhatsApp.init(config);
    TapirBooking.init(config);

    revealPage();
  }

  async function resolveConfig(bootstrap) {
    if (window.WebsiteApi?.isEnabled(bootstrap)) {
      return window.WebsiteApi.fetchConfig(bootstrap);
    }
    return bootstrap;
  }

  async function boot() {
    setBootState('is-booting');

    const bootstrap = await loadBootstrapConfig();
    if (!bootstrap) {
      showLoadError();
      return;
    }

    try {
      const config = await resolveConfig(bootstrap);
      if (!config?.hotel) {
        throw new Error('Config sem dados do hotel');
      }
      mountApp(config);
    } catch (err) {
      console.error('[Tapir LP] Falha ao carregar hotel:', err);
      showLoadError();
    }
  }

  document.getElementById('page-error-retry')?.addEventListener('click', () => {
    boot();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
