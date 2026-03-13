# FleetManager — Session Notes
Last updated: 2026-03-12

---

## Project Overview

Fleet Management Django UI — full template system built from scratch.

- **Path:** `/home/fils/Documents/projects/leo/project_0`
- **Stack:** Django 5.2.12, SQLite, Python 3.11
- **Design:** Postman-inspired (primary `#FF6C37`, dark bg `#1A1A2E`)
- **i18n:** French (default), English, Arabic (RTL). All strings wrapped in `{% trans %}`
- **No external CSS frameworks** — pure CSS with custom properties
- **No jQuery** — vanilla JS only
- **Icons:** Font Awesome 6 (CDN)
- **Fonts:** DM Sans (body) + Space Grotesk (headings) via Google Fonts

---

## What Was Built (Session 1)

### Settings (`config/settings.py`)
- Added `fleet_ui` to `INSTALLED_APPS`
- Added `LocaleMiddleware`
- `TEMPLATES['DIRS'] = [BASE_DIR / 'templates']`
- `STATICFILES_DIRS = [BASE_DIR / 'static']`
- `LANGUAGES` = fr / en / ar
- `LOCALE_PATHS = [BASE_DIR / 'locale']`
- `LANGUAGE_CODE = 'fr'`

### URL routing (`config/urls.py`)
- `i18n_patterns` with `prefix_default_language=True`
- Namespaced groups: `auth:` and `dashboard:`
- Demo `TemplateView`-based views for all pages (no real models yet)
- Landing URL: `name='landing-index'` (no namespace wrapper)

### Django app scaffolding
- `fleet_ui/__init__.py`
- `fleet_ui/apps.py`
- `fleet_ui/templatetags/__init__.py`
- `fleet_ui/templatetags/fleet_ui.py` — 8 inclusion tags:
  - `stat_card`, `alert`, `status_badge`, `breadcrumb`, `pagination`,
    `empty_state`, `vehicle_card`, `badge_tag`

### Static files
**CSS** (`static/css/`):
- `variables.css` — all design tokens (colors, spacing, radii, shadows, fonts, z-index)
- `reset.css`
- `base.css`
- `layout.css` — sidebar (collapsible 260px→64px), topbar (60px sticky), main-wrapper
- `components.css` — buttons, badges, alerts, cards, modals, dropdowns, avatars, etc.
- `forms.css`
- `tables.css`
- `responsive.css` — breakpoints 1024px / 640px, RTL `[dir="rtl"]`, print styles

**JS** (`static/js/`):
- `sidebar.js` — collapse toggle, localStorage persistence, mobile overlay
- `modals.js` — modal stack, `data-modal-trigger` / `data-modal-id`, focus management
- `dropdowns.js` — outside-click close
- `tables.js` — client-side sort, filter, pagination, rows-per-page, bulk checkboxes
- `alerts.js` — auto-dismiss
- `tabs.js` — tab switching
- `file_upload.js` — drag-drop upload preview
- `i18n.js` — RTL direction enforcement, count-up animation (IntersectionObserver), stepper init

### Templates (62 total)

**Base layouts:**
- `templates/base/base.html` — master: fonts, FA CDN, all CSS/JS links
- `templates/base/base_auth.html` — split-panel: brand left + form right
- `templates/base/base_dashboard.html` — app shell with sidebar overlay, Chart.js CDN

**Layout partials:**
- `templates/layouts/sidebar.html` — nav groups, sub-navs, tooltips, active highlighting
- `templates/layouts/topbar.html` — hamburger, page title, notifications, lang switcher, user dropdown
- `templates/layouts/footer.html`

**Pages:**
- `templates/pages/landing/index.html` — hero, features grid, stats bar, footer
- `templates/pages/auth/login.html` — password toggle, loading state, remember me
- `templates/pages/auth/logout.html`
- `templates/pages/auth/password_reset.html`
- `templates/pages/auth/password_reset_done.html`
- `templates/pages/auth/password_reset_confirm.html`
- `templates/pages/dashboard/home.html` — 4 KPI cards, charts, recent vehicles, contract expiries
- `templates/pages/dashboard/vehicles/list.html` — filter bar, grid/list toggle, bulk actions, table
- `templates/pages/dashboard/vehicles/detail.html` — 5-tab layout (Info | Documents | Services | Contrats | Historique KM)
- `templates/pages/dashboard/vehicles/form.html` — 5-step stepper form
- `templates/pages/dashboard/models/list.html`
- `templates/pages/dashboard/models/form.html`
- `templates/pages/dashboard/contracts/list.html`
- `templates/pages/dashboard/contracts/detail.html`
- `templates/pages/dashboard/services/list.html`
- `templates/pages/dashboard/services/detail.html`
- `templates/pages/dashboard/documents/list.html`
- `templates/pages/dashboard/drivers/list.html`
- `templates/pages/dashboard/settings/index.html`

**Components** (`templates/components/`):
- `charts/`: `stat_card.html`, `chart_bar.html`, `chart_line.html`, `chart_donut.html`
- `fleet/`: `vehicle_card.html`, `status_badge.html`, `contract_row.html`, `service_item.html`, `document_item.html`
- `forms/`: `form_errors.html`, `input.html`, `select.html`, `textarea.html`, `checkbox.html`, `radio.html`, `file_upload.html`, `date_picker.html`, `search_bar.html`
- `navigation/`: `breadcrumb.html`, `sidebar_item.html`, `tabs.html`, `stepper.html`
- `tables/`: `data_table.html`, `table_actions.html`, `pagination.html`
- `ui/`: `modal.html`, `alert.html`, `button.html`, `badge.html`, `card.html`, `divider.html`, `dropdown.html`, `tooltip.html`, `spinner.html`, `progress.html`, `avatar.html`, `empty_state.html`

---

## Bugs Fixed (Session 2)

### Bug 1 — NoReverseMatch: 'landing' is not a registered namespace
- **URL:** `/fr/`
- **File:** `templates/pages/landing/index.html` line 294
- **Cause:** Template used `{% url 'landing:index' %}` but URL is registered as `name='landing-index'` with no namespace
- **Fix:** Changed to `{% url 'landing-index' %}`

### Bug 2 — RecursionError: maximum recursion depth exceeded
- **URL:** `/fr/auth/login/`
- **Root cause:** Every component template had a "Usage" example in its `{# #}` comment header like:
  ```
  {# ===...
     Usage:
       {% include "components/foo/bar.html" with ... %}
     ===... #}
  ```
  Django's template lexer executes `{% %}` tags even inside `{# #}` multi-line comment blocks.
  This caused each component to include itself infinitely.

- **Complication:** Some headers had nested inline `{# comment #}` inside the outer comment block.
  Django closes the outer `{#` at the FIRST `#}` it encounters. If an inner `{# ... #}` appears
  before the closing `#}` of the outer comment, the outer comment closes early — leaving any
  remaining `{% include %}` usage examples OUTSIDE the comment as executable template code.

- **Fix:**
  1. Python script stripped self-referencing `{% include %}` from comment blocks in 18 files
  2. Manual fix in `templates/components/forms/checkbox.html` — its second "Usage (toggle switch)"
     `{% include %}` block was accidentally outside the comment due to a nested `{# checkbox|toggle #}`
     closing the outer comment prematurely on line 7

- **Verification:** Django tokenizer simulation confirmed zero self-referencing executable includes remain

---

## CRITICAL RULE — Template Comments
**NEVER** put `{% %}` Django template tags inside `{# #}` comment blocks.
Django executes `{% %}` tags regardless of comment context.
For usage examples in comment headers, use plain text:
```
{# Usage: include "components/foo.html" with bar=baz #}
```

---

## Current State (end of Session 2)
- `python manage.py check` → 0 issues
- Landing page `/fr/` renders OK (~15000 chars)
- Login page `/fr/auth/login/` renders OK (~9111 chars)
- All component templates clean — no recursive includes
- No real models/views yet — all pages use demo `TemplateView` with fake context

---

## Key URL Names Reference
| Name | URL pattern |
|---|---|
| `landing-index` | `/fr/` |
| `auth:login` | `/fr/auth/login/` |
| `auth:logout` | `/fr/auth/logout/` |
| `dashboard:home` | `/fr/dashboard/` |
| `dashboard:vehicles-list` | `/fr/dashboard/vehicles/` |
| `dashboard:vehicles-new` | `/fr/dashboard/vehicles/new/` |
| `dashboard:vehicles-detail` | `/fr/dashboard/vehicles/<pk>/` |
| `dashboard:vehicles-edit` | `/fr/dashboard/vehicles/<pk>/edit/` |
| `dashboard:models-list` | `/fr/dashboard/models/` |
| `dashboard:contracts-list` | `/fr/dashboard/contracts/` |
| `dashboard:services-list` | `/fr/dashboard/services/` |
| `dashboard:documents-list` | `/fr/dashboard/documents/` |
| `dashboard:drivers-list` | `/fr/dashboard/drivers/` |
| `dashboard:settings` | `/fr/dashboard/settings/` |
| `set_language` | `/i18n/set_language/` |

---

## Next Steps (TODO)
- Build real Django models: Vehicle, VehicleModel, Category, Contract, Service, Document, Driver
- Wire up real views (class-based or function-based) to replace TemplateView stubs
- Add Django forms for create/edit operations
- Connect modal "Enregistrer" buttons to real form POSTs
- Add translations to `locale/` (run `makemessages`, `compilemessages`)
- Add login_required / permission checks to dashboard views
- Write tests
