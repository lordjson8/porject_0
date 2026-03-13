/**
 * file_upload.js — Drag & drop file upload UX
 * FleetManager UI System
 */

(function () {
  'use strict';

  document.querySelectorAll('.file-upload-zone').forEach(function (zone) {
    initUploadZone(zone);
  });

  function initUploadZone(zone) {
    const input      = zone.querySelector('.file-upload-zone__input');
    const listTarget = zone.getAttribute('data-file-list')
      ? document.getElementById(zone.getAttribute('data-file-list'))
      : zone.parentElement.querySelector('.file-list');

    if (!input) return;

    // ── Drag Events ───────────────────────────────────────────────────────────
    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragleave', function (e) {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('is-dragover');
      }
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      const files = e.dataTransfer ? e.dataTransfer.files : null;
      if (files && files.length) handleFiles(files);
    });

    // ── Input Change ─────────────────────────────────────────────────────────
    input.addEventListener('change', function () {
      if (input.files && input.files.length) {
        handleFiles(input.files);
      }
    });

    // ── Handle Files ─────────────────────────────────────────────────────────
    function handleFiles(files) {
      if (!listTarget) return;

      Array.from(files).forEach(function (file) {
        const item    = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = [
          '<i class="fa fa-file file-item__icon" aria-hidden="true"></i>',
          '<span class="file-item__name" title="' + escapeHtml(file.name) + '">' + escapeHtml(file.name) + '</span>',
          '<span class="file-item__size">' + formatSize(file.size) + '</span>',
          '<button type="button" class="file-item__remove" aria-label="Supprimer">',
          '  <i class="fa fa-times" aria-hidden="true"></i>',
          '</button>'
        ].join('');

        item.querySelector('.file-item__remove').addEventListener('click', function () {
          item.remove();
        });

        listTarget.appendChild(item);
      });
    }

    function formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k     = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i     = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    }
  }
}());
