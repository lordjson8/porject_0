/**
 * alerts.js — Auto-dismiss alerts, dismissible close buttons
 * FleetManager UI System
 */

(function () {
  'use strict';

  const AUTO_DISMISS_DELAY = 5000; // ms

  // ── Dismiss Alert ───────────────────────────────────────────────────────────
  function dismissAlert(alert) {
    alert.style.transition = 'opacity 0.3s ease, max-height 0.4s ease, margin 0.4s ease, padding 0.4s ease';
    alert.style.opacity = '0';
    alert.style.maxHeight = '0';
    alert.style.marginBottom = '0';
    alert.style.paddingTop = '0';
    alert.style.paddingBottom = '0';
    alert.style.overflow = 'hidden';
    setTimeout(function () { alert.remove(); }, 450);
  }

  // ── Close Buttons ───────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    const closeBtn = e.target.closest('.alert__close');
    if (closeBtn) {
      const alert = closeBtn.closest('.alert');
      if (alert) dismissAlert(alert);
    }
  });

  // ── Auto-Dismiss for alerts with [data-auto-dismiss] ────────────────────────
  document.querySelectorAll('.alert[data-auto-dismiss]').forEach(function (alert) {
    const delay = parseInt(alert.getAttribute('data-auto-dismiss'), 10) || AUTO_DISMISS_DELAY;
    setTimeout(function () {
      if (document.body.contains(alert)) {
        dismissAlert(alert);
      }
    }, delay);
  });

  // ── Django Messages Auto-Dismiss ────────────────────────────────────────────
  document.querySelectorAll('.alert[data-django-message]').forEach(function (alert) {
    setTimeout(function () {
      if (document.body.contains(alert)) {
        dismissAlert(alert);
      }
    }, AUTO_DISMISS_DELAY);
  });
}());
