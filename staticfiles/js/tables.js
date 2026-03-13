/**
 * tables.js — Client-side sort, filter, and pagination for data tables
 * FleetManager UI System
 */

(function () {
  'use strict';

  document.querySelectorAll('[data-table]').forEach(function (wrapper) {
    initTable(wrapper);
  });

  function initTable(wrapper) {
    const tableId      = wrapper.getAttribute('data-table');
    const table        = wrapper.querySelector('.data-table');
    if (!table) return;

    const thead        = table.querySelector('thead');
    const tbody        = table.querySelector('tbody');
    const searchInput  = wrapper.querySelector('[data-table-search]');
    const rppSelect    = wrapper.querySelector('[data-rows-per-page]');
    const paginationEl = wrapper.querySelector('.pagination');
    const emptyState   = wrapper.querySelector('.empty-state');

    let rows         = Array.from(tbody.querySelectorAll('tr'));
    let filteredRows = rows.slice();
    let sortCol      = -1;
    let sortAsc      = true;
    let currentPage  = 1;
    let rowsPerPage  = rppSelect ? parseInt(rppSelect.value, 10) : 25;

    // ── Bulk selection ──────────────────────────────────────────────────────
    const masterCheck = wrapper.querySelector('[data-check-all]');
    const bulkBar     = wrapper.querySelector('.bulk-actions-bar');

    if (masterCheck) {
      masterCheck.addEventListener('change', function () {
        const boxes = tbody.querySelectorAll('[data-row-check]');
        boxes.forEach(function (box) {
          box.checked = masterCheck.checked;
          box.closest('tr').classList.toggle('is-selected', masterCheck.checked);
        });
        updateBulkBar();
      });

      tbody.addEventListener('change', function (e) {
        if (e.target.matches('[data-row-check]')) {
          e.target.closest('tr').classList.toggle('is-selected', e.target.checked);
          updateBulkBar();
          const allChecked  = Array.from(tbody.querySelectorAll('[data-row-check]')).every(function (b) { return b.checked; });
          const someChecked = Array.from(tbody.querySelectorAll('[data-row-check]')).some(function (b) { return b.checked; });
          masterCheck.checked = allChecked;
          masterCheck.indeterminate = someChecked && !allChecked;
        }
      });
    }

    function updateBulkBar() {
      if (!bulkBar) return;
      const count = tbody.querySelectorAll('[data-row-check]:checked').length;
      bulkBar.classList.toggle('is-visible', count > 0);
      const countEl = bulkBar.querySelector('.bulk-actions-bar__count');
      if (countEl) countEl.textContent = count + ' élément(s) sélectionné(s)';
    }

    // ── Search / Filter ─────────────────────────────────────────────────────
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase().trim();
        filteredRows = rows.filter(function (row) {
          return row.textContent.toLowerCase().includes(query);
        });
        currentPage = 1;
        renderPage();
      });
    }

    // ── Rows-per-page ───────────────────────────────────────────────────────
    if (rppSelect) {
      rppSelect.addEventListener('change', function () {
        rowsPerPage = parseInt(rppSelect.value, 10);
        currentPage = 1;
        renderPage();
      });
    }

    // ── Column Sorting ──────────────────────────────────────────────────────
    if (thead) {
      thead.querySelectorAll('th.sortable').forEach(function (th, idx) {
        th.addEventListener('click', function () {
          if (sortCol === idx) {
            sortAsc = !sortAsc;
          } else {
            sortCol = idx;
            sortAsc = true;
          }
          // Update header arrows
          thead.querySelectorAll('th').forEach(function (h) {
            h.classList.remove('sort-asc', 'sort-desc');
          });
          th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');

          // Sort rows
          filteredRows.sort(function (a, b) {
            const aCells = a.querySelectorAll('td');
            const bCells = b.querySelectorAll('td');
            if (!aCells[idx] || !bCells[idx]) return 0;
            const aVal = aCells[idx].textContent.trim().toLowerCase();
            const bVal = bCells[idx].textContent.trim().toLowerCase();
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return sortAsc ? aNum - bNum : bNum - aNum;
            }
            return sortAsc
              ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
              : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
          });

          currentPage = 1;
          renderPage();
        });
      });
    }

    // ── Render Page ─────────────────────────────────────────────────────────
    function renderPage() {
      const totalRows  = filteredRows.length;
      const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
      currentPage = Math.min(currentPage, totalPages);

      const start = (currentPage - 1) * rowsPerPage;
      const end   = Math.min(start + rowsPerPage, totalRows);

      // Hide all rows, show only current page slice
      rows.forEach(function (row) { row.style.display = 'none'; });
      filteredRows.slice(start, end).forEach(function (row) { row.style.display = ''; });

      // Empty state
      if (emptyState) {
        emptyState.style.display = totalRows === 0 ? 'flex' : 'none';
      }

      // Update pagination
      renderPagination(totalRows, totalPages, start, end);
    }

    // ── Render Pagination ───────────────────────────────────────────────────
    function renderPagination(totalRows, totalPages, start, end) {
      if (!paginationEl) return;

      const info     = paginationEl.querySelector('.pagination__info');
      const controls = paginationEl.querySelector('.pagination__controls');

      if (info) {
        info.textContent = totalRows === 0
          ? 'Aucun résultat'
          : 'Affichage de ' + (start + 1) + '–' + end + ' sur ' + totalRows;
      }

      if (!controls) return;
      controls.innerHTML = '';

      function makeBtn(label, page, disabled, active) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' +
          (active   ? ' is-active'   : '') +
          (disabled ? ' is-disabled' : '');
        btn.innerHTML = label;
        btn.setAttribute('aria-label', 'Page ' + page);
        if (!disabled && !active) {
          btn.addEventListener('click', function () {
            currentPage = page;
            renderPage();
            // Scroll table into view
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
        return btn;
      }

      // Prev
      controls.appendChild(makeBtn('<i class="fa fa-chevron-left"></i>', currentPage - 1, currentPage === 1, false));

      // Page numbers with ellipsis
      const pages = buildPageRange(currentPage, totalPages);
      pages.forEach(function (p) {
        if (p === '…') {
          const el = document.createElement('span');
          el.className = 'page-btn page-btn--ellipsis';
          el.textContent = '…';
          controls.appendChild(el);
        } else {
          controls.appendChild(makeBtn(p, p, false, p === currentPage));
        }
      });

      // Next
      controls.appendChild(makeBtn('<i class="fa fa-chevron-right"></i>', currentPage + 1, currentPage === totalPages, false));
    }

    function buildPageRange(current, total) {
      if (total <= 7) return Array.from({ length: total }, function (_, i) { return i + 1; });
      const pages = [];
      pages.push(1);
      if (current > 3) pages.push('…');
      for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
        pages.push(p);
      }
      if (current < total - 2) pages.push('…');
      pages.push(total);
      return pages;
    }

    // ── Initial Render ──────────────────────────────────────────────────────
    renderPage();
  }
}());
