/**
 * modals.js — Modal open/close/backdrop management
 * FleetManager UI System
 */

(function () {
  'use strict';

  // Track open modal stack
  const openModals = [];

  // ── Open Modal ──────────────────────────────────────────────────────────────
  function openModal(modalId) {
    const backdrop = document.querySelector('[data-modal-id="' + modalId + '"]');
    if (!backdrop) return;

    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    openModals.push(modalId);

    // Focus first focusable element inside modal
    requestAnimationFrame(function () {
      const focusable = backdrop.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus();
    });
  }

  // ── Close Modal ─────────────────────────────────────────────────────────────
  function closeModal(modalId) {
    const backdrop = document.querySelector('[data-modal-id="' + modalId + '"]');
    if (!backdrop) return;

    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');

    const idx = openModals.indexOf(modalId);
    if (idx > -1) openModals.splice(idx, 1);

    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }
  }

  function closeTopModal() {
    if (openModals.length > 0) {
      closeModal(openModals[openModals.length - 1]);
    }
  }

  // ── Close on Backdrop Click ─────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-backdrop')) {
      closeTopModal();
    }
  });

  // ── Trigger Buttons ─────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-modal-trigger]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-modal-trigger'));
    }

    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      const modalId = closeBtn.getAttribute('data-modal-close');
      if (modalId) {
        closeModal(modalId);
      } else {
        closeTopModal();
      }
    }
  });

  // ── Keyboard: Escape ────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeTopModal();
    }
  });

  // ── Confirm Modal Helper ────────────────────────────────────────────────────
  window.confirmAction = function (options) {
    const id     = 'confirm-modal-' + Date.now();
    const title  = options.title   || 'Confirmer';
    const msg    = options.message || 'Êtes-vous sûr ?';
    const label  = options.label   || 'Confirmer';
    const isDanger = options.danger !== false;

    const html = [
      '<div class="modal-backdrop" data-modal-id="' + id + '" aria-modal="true" role="dialog" aria-label="' + title + '">',
      '  <div class="modal modal--sm">',
      '    <div class="modal__header">',
      '      <h2 class="modal__title">' + title + '</h2>',
      '      <button class="modal__close" data-modal-close aria-label="Fermer"><i class="fa fa-times"></i></button>',
      '    </div>',
      '    <div class="modal__body">',
      '      <p style="font-size:var(--text-sm);color:var(--color-text-body)">' + msg + '</p>',
      '    </div>',
      '    <div class="modal__footer">',
      '      <button class="btn btn--secondary" data-modal-close>Annuler</button>',
      '      <button class="btn ' + (isDanger ? 'btn--danger' : 'btn--primary') + '" id="confirm-ok-' + id + '">' + label + '</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.insertAdjacentHTML('beforeend', html);
    openModal(id);

    document.getElementById('confirm-ok-' + id).addEventListener('click', function () {
      closeModal(id);
      document.querySelector('[data-modal-id="' + id + '"]').remove();
      if (typeof options.onConfirm === 'function') options.onConfirm();
    });

    document.querySelector('[data-modal-id="' + id + '"]').addEventListener('click', function (e) {
      if (e.target === this || e.target.closest('[data-modal-close]')) {
        closeModal(id);
        this.remove();
      }
    });
  };

  // ── Expose API ───────────────────────────────────────────────────────────────
  window.FleetModal = { open: openModal, close: closeModal };
}());
