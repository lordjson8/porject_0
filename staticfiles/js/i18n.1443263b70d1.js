/**
 * i18n.js — Language switcher + RTL support toggle
 * FleetManager UI System
 */

(function () {
  'use strict';

  const RTL_LANGS = ['ar', 'he', 'fa', 'ur'];

  // ── RTL direction enforcement ─────────────────────────────────────────────
  function applyDirection(lang) {
    const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('fm_dir', dir);
  }

  // ── Init: restore direction from Django-set lang or localStorage ──────────
  function init() {
    // Django sets lang via <html lang="...">
    const currentLang = document.documentElement.getAttribute('lang') || 'fr';
    applyDirection(currentLang);

    // Stat card count-up animation
    initCountUp();

    // Auto-focus first form field on auth pages
    const authInput = document.querySelector('.auth-form-panel input:not([type=hidden])');
    if (authInput) {
      requestAnimationFrame(function () { authInput.focus(); });
    }
  }

  // ── Count-Up Animation on stat cards ─────────────────────────────────────
  function initCountUp() {
    document.querySelectorAll('[data-count-up]').forEach(function (el) {
      const target   = parseFloat(el.getAttribute('data-count-up')) || 0;
      const duration = 1200; // ms
      const start    = performance.now();
      const isFloat  = String(target).includes('.');
      const decimals = isFloat ? 1 : 0;

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease     = 1 - Math.pow(1 - progress, 3);
        const value    = target * ease;
        el.textContent = isFloat ? value.toFixed(decimals) : Math.round(value).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      }

      // Use IntersectionObserver to trigger when visible
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              requestAnimationFrame(tick);
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.1 });
        observer.observe(el);
      } else {
        requestAnimationFrame(tick);
      }
    });
  }

  // ── Multi-step form stepper ──────────────────────────────────────────────
  function initStepper() {
    const stepper = document.querySelector('[data-stepper]');
    if (!stepper) return;

    const steps       = Array.from(stepper.querySelectorAll('.step'));
    const panels      = document.querySelectorAll('[data-step-panel]');
    const nextBtns    = document.querySelectorAll('[data-step-next]');
    const prevBtns    = document.querySelectorAll('[data-step-prev]');
    let   currentStep = 0;

    function goTo(n) {
      if (n < 0 || n >= steps.length) return;

      steps.forEach(function (s, i) {
        s.classList.toggle('is-active',    i === n);
        s.classList.toggle('is-completed', i < n);
      });

      panels.forEach(function (p) { p.style.display = 'none'; });
      const activePanel = document.querySelector('[data-step-panel="' + n + '"]');
      if (activePanel) activePanel.style.display = 'block';

      currentStep = n;

      // Update prev/next button visibility
      document.querySelectorAll('[data-step-prev]').forEach(function (b) {
        b.style.display = n === 0 ? 'none' : '';
      });
      document.querySelectorAll('[data-step-next]').forEach(function (b) {
        const isLast = n === steps.length - 1;
        b.style.display = isLast ? 'none' : '';
      });
      document.querySelectorAll('[data-step-submit]').forEach(function (b) {
        b.style.display = n === steps.length - 1 ? '' : 'none';
      });
    }

    nextBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { goTo(currentStep + 1); });
    });

    prevBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { goTo(currentStep - 1); });
    });

    // Allow clicking step circles to navigate backward
    steps.forEach(function (step, i) {
      step.addEventListener('click', function () {
        if (i < currentStep) goTo(i);
      });
    });

    goTo(0);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    init();
    initStepper();
  });
}());
