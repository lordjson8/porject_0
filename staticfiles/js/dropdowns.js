/**
 * dropdowns.js — Dropdown toggle + outside-click close
 * FleetManager UI System
 */

(function () {
  'use strict';

  let activeDropdown = null;

  // ── Open Dropdown ────────────────────────────────────────────────────────────
  function openDropdown(menu, trigger) {
    if (activeDropdown && activeDropdown !== menu) {
      closeDropdown(activeDropdown);
    }
    menu.classList.add('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
    activeDropdown = menu;
  }

  // ── Close Dropdown ───────────────────────────────────────────────────────────
  function closeDropdown(menu) {
    if (!menu) return;
    menu.classList.remove('is-open');
    const trigger = document.querySelector('[aria-controls="' + menu.id + '"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (activeDropdown === menu) activeDropdown = null;
  }

  function closeAll() {
    document.querySelectorAll('.dropdown__menu.is-open').forEach(function (m) {
      closeDropdown(m);
    });
    document.querySelectorAll('.lang-switcher__menu.is-open').forEach(function (m) {
      m.classList.remove('is-open');
    });
    document.querySelectorAll('.user-menu__dropdown.is-open').forEach(function (m) {
      m.classList.remove('is-open');
    });
    activeDropdown = null;
  }

  // ── Toggle on Trigger Click ─────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    // Generic dropdown toggle
    const dropdownTrigger = e.target.closest('[data-dropdown]');
    if (dropdownTrigger) {
      e.stopPropagation();
      const targetId = dropdownTrigger.getAttribute('data-dropdown');
      const menu     = document.getElementById(targetId);
      if (!menu) return;
      if (menu.classList.contains('is-open')) {
        closeDropdown(menu);
      } else {
        openDropdown(menu, dropdownTrigger);
      }
      return;
    }

    // Language switcher
    const langToggle = e.target.closest('.lang-switcher__toggle');
    if (langToggle) {
      e.stopPropagation();
      const menu = langToggle.closest('.lang-switcher').querySelector('.lang-switcher__menu');
      if (menu) {
        const isOpen = menu.classList.toggle('is-open');
        langToggle.setAttribute('aria-expanded', isOpen.toString());
      }
      return;
    }

    // User menu
    const userToggle = e.target.closest('.user-menu__toggle');
    if (userToggle) {
      e.stopPropagation();
      const dropdown = userToggle.closest('.user-menu').querySelector('.user-menu__dropdown');
      if (dropdown) {
        const isOpen = dropdown.classList.toggle('is-open');
        userToggle.setAttribute('aria-expanded', isOpen.toString());
      }
      return;
    }

    // Click outside: close all
    closeAll();
  });

  // ── Keyboard: Escape ─────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll();
    }

    // Arrow key navigation inside open dropdown
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && activeDropdown) {
      e.preventDefault();
      const items  = Array.from(activeDropdown.querySelectorAll('.dropdown__item:not(:disabled)'));
      const current = document.activeElement;
      const idx     = items.indexOf(current);
      let next;
      if (e.key === 'ArrowDown') {
        next = items[idx + 1] || items[0];
      } else {
        next = items[idx - 1] || items[items.length - 1];
      }
      if (next) next.focus();
    }
  });

  // ── Expose API ───────────────────────────────────────────────────────────────
  window.FleetDropdown = { open: openDropdown, close: closeDropdown, closeAll: closeAll };
}());
