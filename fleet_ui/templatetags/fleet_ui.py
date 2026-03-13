"""
fleet_ui/templatetags/fleet_ui.py
Custom inclusion tags for FleetManager UI components.

Usage in templates:
  {% load fleet_ui %}
  {% stat_card title="Véhicules" value="142" trend="+5" trend_type="up" icon="fa-car" color="orange" %}
  {% alert message="Succès" level="success" dismissible=True %}
  {% status_badge "inscrit" %}
  {% breadcrumb items %}
  {% pagination page_obj %}
  {% empty_state icon="fa-car" title="Aucun véhicule" subtitle="..." cta_label="Ajouter" cta_url="/..." %}
"""

from django import template
from django.utils.translation import gettext_lazy as _

register = template.Library()


# ── stat_card ─────────────────────────────────────────────────────────────────
@register.inclusion_tag('components/charts/stat_card.html')
def stat_card(title='', value=0, trend='', trend_type='neutral',
              trend_label='', icon='fa-chart-line', color='orange'):
    """
    Renders a KPI stat card.

    Args:
        title      : card label
        value      : numeric value to display (supports count-up animation)
        trend      : trend string e.g. "+5" or "-2%"
        trend_type : "up" | "down" | "neutral"
        trend_label: secondary label e.g. "ce mois"
        icon       : Font Awesome 6 icon class e.g. "fa-car"
        color      : "orange" | "green" | "blue" | "red" | "purple"
    """
    return {
        'title':       title,
        'value':       value,
        'trend':       trend,
        'trend_type':  trend_type,
        'trend_label': trend_label,
        'icon':        icon,
        'color':       color,
    }


# ── alert ─────────────────────────────────────────────────────────────────────
@register.inclusion_tag('components/ui/alert.html')
def alert(message='', level='info', title='', dismissible=True, auto_dismiss=False):
    """
    Renders an alert message banner.

    Args:
        message     : alert body text
        level       : "success" | "error" | "warning" | "info"
        title       : optional bold heading
        dismissible : show close button
        auto_dismiss: auto-close after 5 seconds
    """
    return {
        'message':      message,
        'level':        level,
        'title':        title,
        'dismissible':  dismissible,
        'auto_dismiss': auto_dismiss,
    }


# ── status_badge ──────────────────────────────────────────────────────────────
@register.inclusion_tag('components/fleet/status_badge.html')
def status_badge(status=''):
    """
    Renders a vehicle status badge.

    Args:
        status: "commander" | "demande" | "inscrit" | "declasse" |
                "maintenance" | "service"
    """
    return {'status': status}


# ── breadcrumb ────────────────────────────────────────────────────────────────
@register.inclusion_tag('components/navigation/breadcrumb.html')
def breadcrumb(items=None):
    """
    Renders a breadcrumb navigation trail.

    Args:
        items: list of (label, url) tuples.
               The last item is treated as current page (no link).
               Pass None or empty list for default Home only.
    Example:
        {% breadcrumb items=breadcrumb_items %}
        where breadcrumb_items = [("Accueil", "/"), ("Véhicules", "/dashboard/vehicles/"), ("Peugeot 308", None)]
    """
    return {'items': items or []}


# ── pagination ────────────────────────────────────────────────────────────────
@register.inclusion_tag('components/tables/pagination.html')
def pagination(page_obj=None):
    """
    Renders Django pagination controls.

    Args:
        page_obj: Django Page object from Paginator.page()
    """
    return {'page_obj': page_obj}


# ── empty_state ───────────────────────────────────────────────────────────────
@register.inclusion_tag('components/ui/empty_state.html')
def empty_state(icon='fa-inbox', title='', subtitle='',
                cta_label='', cta_url='', cta_icon='fa-plus', cta_modal=''):
    """
    Renders an empty state placeholder.

    Args:
        icon      : Font Awesome icon class
        title     : heading text
        subtitle  : description text
        cta_label : CTA button label
        cta_url   : CTA button href
        cta_icon  : CTA button icon
        cta_modal : if set, opens this modal ID instead of navigating
    """
    return {
        'icon':      icon,
        'title':     title,
        'subtitle':  subtitle,
        'cta_label': cta_label,
        'cta_href':  cta_url,
        'cta_icon':  cta_icon,
        'cta_modal': cta_modal,
    }


# ── vehicle_card ──────────────────────────────────────────────────────────────
@register.inclusion_tag('components/fleet/vehicle_card.html')
def vehicle_card(vehicle=None, view_mode='grid'):
    """
    Renders a vehicle card in grid or list mode.

    Args:
        vehicle  : vehicle object or dict with plate, model_name, driver_name,
                   status, last_km, image_url, detail_url, edit_url
        view_mode: "grid" | "list"
    """
    return {
        'vehicle':   vehicle,
        'view_mode': view_mode,
    }


# ── Simple inclusion tag: badge ───────────────────────────────────────────────
@register.inclusion_tag('components/ui/badge.html')
def badge_tag(label='', variant='neutral', dot=False):
    """
    Renders a badge.
    Usage: {% badge_tag label="Actif" variant="success" %}
    """
    return {'label': label, 'variant': variant, 'dot': dot}
