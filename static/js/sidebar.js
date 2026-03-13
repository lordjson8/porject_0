/**
 * sidebar.js — Sidebar collapse, mobile overlay, active item highlighting
 * FleetManager UI System
 */

(function () {
  'use strict';

  const SIDEBAR_COLLAPSED_KEY = 'fm_sidebar_collapsed';

  // ── Element References ──────────────────────────────────────────────────────
  const sidebar     = document.querySelector('.sidebar');
  const mainWrapper = document.querySelector('.main-wrapper');
  const toggleBtn   = document.querySelector('.sidebar__toggle');
  const hamburger   = document.querySelector('.topbar__hamburger');
  const overlay     = document.querySelector('.sidebar-overlay');

  if (!sidebar) return;

  // ── Restore Collapse State ──────────────────────────────────────────────────
  function init() {
    const isCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    if (isCollapsed && window.innerWidth > 1024) {
      sidebar.classList.add('is-collapsed');
    }
    highlightActiveItem();
    initSubNavs();
  }

  // ── Toggle Desktop Collapse ─────────────────────────────────────────────────
  function toggleCollapse() {
    const collapsed = sidebar.classList.toggle('is-collapsed');
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed);
  }

  // ── Mobile Open/Close ───────────────────────────────────────────────────────
  function openMobile() {
    sidebar.classList.add('is-mobile-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    sidebar.classList.remove('is-mobile-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  // ── Highlight Active Nav Item ───────────────────────────────────────────────
  function highlightActiveItem() {
    const currentPath = window.location.pathname;

    // Sub-nav links
    document.querySelectorAll('.nav-sub__link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && currentPath.startsWith(href) && href !== '/') {
        link.classList.add('is-active');
        // Open parent group
        const group = link.closest('.nav-item');
        if (group) group.classList.add('is-open');
      }
    });

    // Top-level nav links
    document.querySelectorAll('.nav-item__link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && href !== '#' && currentPath.startsWith(href) && href !== '/') {
        link.classList.add('is-active');
      }
    });
  }

  // ── Collapsible Sub-Navs ────────────────────────────────────────────────────
  function initSubNavs() {
    document.querySelectorAll('.nav-item__link[data-toggle="sub"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const parent = link.closest('.nav-item');
        if (!parent) return;

        // Close siblings
        const siblings = parent.parentElement
          ? parent.parentElement.querySelectorAll('.nav-item.is-open')
          : [];
        siblings.forEach(function (sib) {
          if (sib !== parent) sib.classList.remove('is-open');
        });

        parent.classList.toggle('is-open');
      });
    });
  }

  // ── Event Listeners ─────────────────────────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (window.innerWidth <= 1024) {
        closeMobile();
      } else {
        toggleCollapse();
      }
    });
  }

  if (hamburger) {
    hamburger.addEventListener('click', openMobile);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobile);
  }

  // Keyboard: Escape closes mobile sidebar
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('is-mobile-open')) {
      closeMobile();
    }
  });

  // Resize: close mobile overlay when going to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) {
      closeMobile();
    }
  });

  // ── Init ────────────────────────────────────────────────────────────────────
  init();
}());
