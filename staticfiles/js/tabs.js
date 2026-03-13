/**
 * tabs.js — Tab switching with keyboard navigation
 * FleetManager UI System
 */

(function () {
  'use strict';

  document.querySelectorAll('[data-tabs]').forEach(function (tabGroup) {
    initTabs(tabGroup);
  });

  function initTabs(tabGroup) {
    const btns   = tabGroup.querySelectorAll('.tab__btn');
    const panels = tabGroup.querySelectorAll('.tab-panel');

    function activateTab(btn) {
      const target = btn.getAttribute('data-tab-target');

      // Deactivate all
      btns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) {
        p.classList.remove('is-active');
        p.setAttribute('hidden', '');
      });

      // Activate selected
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const panel = tabGroup.querySelector('[data-tab-panel="' + target + '"]');
      if (panel) {
        panel.classList.add('is-active');
        panel.removeAttribute('hidden');
      }

      // Persist to URL hash if desired
      if (btn.getAttribute('data-tab-hash') !== 'false') {
        history.replaceState(null, '', '#' + target);
      }
    }

    // Click
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateTab(btn);
      });

      // Keyboard navigation
      btn.addEventListener('keydown', function (e) {
        const all  = Array.from(btns);
        const idx  = all.indexOf(btn);
        let target;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          target = all[(idx + 1) % all.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          target = all[(idx - 1 + all.length) % all.length];
        } else if (e.key === 'Home') {
          e.preventDefault();
          target = all[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          target = all[all.length - 1];
        }

        if (target) {
          target.focus();
          activateTab(target);
        }
      });
    });

    // Restore from URL hash
    const hash = window.location.hash.slice(1);
    const hashBtn = hash
      ? tabGroup.querySelector('.tab__btn[data-tab-target="' + hash + '"]')
      : null;

    const firstActive = hashBtn
      || tabGroup.querySelector('.tab__btn.is-active')
      || btns[0];

    if (firstActive) activateTab(firstActive);
  }
}());
