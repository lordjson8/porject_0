"""
config/urls.py — Main URL configuration for FleetManager
"""

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from django.urls import path, include
from django.views.generic import TemplateView, RedirectView
from django.contrib.auth import views as auth_views


# ── Minimal demo views using TemplateView for UI prototyping ──────────────────
class DashboardHomeView(TemplateView):
    template_name = 'pages/dashboard/home.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update({
            'total_vehicles': 142,
            'active_vehicles': 118,
            'active_contracts': 34,
            'doc_alerts': 7,
            'vehicles_trend': '+5',
            'active_trend': '+3',
            'contracts_trend': '0',
            'alerts_trend': '-2',
            'breadcrumb_items': [('Accueil', '/fr/dashboard/')],
            'recent_vehicles': [],
            'upcoming_contracts': [],
            'expiring_documents': [],
        })
        return ctx


class VehicleListView(TemplateView):
    template_name = 'pages/dashboard/vehicles/list.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update({
            'total_count': 0,
            'vehicles': [],
            'categories': [],
            'breadcrumb_items': [
                ('Accueil', '/fr/dashboard/'),
                ('Vehicules', '/fr/dashboard/vehicles/'),
            ],
        })
        return ctx


class VehicleFormView(TemplateView):
    template_name = 'pages/dashboard/vehicles/form.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)

        class FakeField:
            errors = []
            html_name = ''
            id_for_label = ''
            field = type('f', (), {'max_length': None, 'choices': []})()
            def value(self): return ''

        class FakeForm:
            non_field_errors_list = []
            errors = {}
            def non_field_errors(self): return self.non_field_errors_list
            plate = FakeField()
            chassis_number = FakeField()
            category = FakeField()

        ctx.update({
            'vehicle': None,
            'form': FakeForm(),
            'categories': [],
            'models': [],
            'current_step': 1,
            'breadcrumb_items': [
                ('Accueil', '/fr/dashboard/'),
                ('Vehicules', '/fr/dashboard/vehicles/'),
                ('Nouveau', None),
            ],
        })
        return ctx


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    # i18n language switcher
    path('i18n/', include('django.conf.urls.i18n')),
    # Root redirect
    path('', RedirectView.as_view(url='/fr/', permanent=False)),
]

urlpatterns += i18n_patterns(
    # Landing
    path('', TemplateView.as_view(
        template_name='pages/landing/index.html'),
        name='landing-index'),

    # Auth
    path('auth/', include(([
        path('login/',
             auth_views.LoginView.as_view(
                 template_name='pages/auth/login.html'),
             name='login'),
        path('logout/',
             auth_views.LogoutView.as_view(
                 template_name='pages/auth/logout.html',
                 next_page='/fr/auth/login/'),
             name='logout'),
        path('password-reset/',
             auth_views.PasswordResetView.as_view(
                 template_name='pages/auth/password_reset.html'),
             name='password-reset'),
        path('password-reset/done/',
             auth_views.PasswordResetDoneView.as_view(
                 template_name='pages/auth/password_reset_done.html'),
             name='password_reset_done'),
        path('password-reset/<uidb64>/<token>/',
             auth_views.PasswordResetConfirmView.as_view(
                 template_name='pages/auth/password_reset_confirm.html'),
             name='password_reset_confirm'),
    ], 'auth'), namespace='auth')),

    # Dashboard
    path('dashboard/', include(([
        path('',
             DashboardHomeView.as_view(),
             name='home'),
        path('vehicles/',
             VehicleListView.as_view(),
             name='vehicles-list'),
        path('vehicles/new/',
             VehicleFormView.as_view(),
             name='vehicles-new'),
        path('vehicles/<int:pk>/',
             TemplateView.as_view(
                 template_name='pages/dashboard/vehicles/detail.html',
                 extra_context={
                     'vehicle': None,
                     'vehicle_documents': [],
                     'vehicle_services': [],
                     'vehicle_contracts': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Vehicules', '/fr/dashboard/vehicles/'),
                         ('Detail', None),
                     ],
                 }),
             name='vehicles-detail'),
        path('vehicles/<int:pk>/edit/',
             VehicleFormView.as_view(),
             name='vehicles-edit'),
        path('models/',
             TemplateView.as_view(
                 template_name='pages/dashboard/models/list.html',
                 extra_context={
                     'models': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Modeles', None),
                     ],
                 }),
             name='models-list'),
        path('models/form/',
             TemplateView.as_view(
                 template_name='pages/dashboard/models/form.html',
                 extra_context={'model_obj': None, 'categories': [], 'form': None}),
             name='models-form'),
        path('contracts/',
             TemplateView.as_view(
                 template_name='pages/dashboard/contracts/list.html',
                 extra_context={
                     'contracts': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Contrats', None),
                     ],
                 }),
             name='contracts-list'),
        path('contracts/<int:pk>/',
             TemplateView.as_view(
                 template_name='pages/dashboard/contracts/detail.html',
                 extra_context={
                     'contract': type('c', (), {
                         'number': 'CTR-2024-001',
                         'title': 'Contrat assurance',
                         'status': 'active',
                         'provider': '-',
                         'type': '-',
                         'start_date': None,
                         'end_date': None,
                         'amount': None,
                         'vehicle_count': 0,
                         'description': '',
                         'renewal_conditions': '',
                     })(),
                     'contract_services': [],
                     'linked_vehicles': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Contrats', '/fr/dashboard/contracts/'),
                         ('Detail', None),
                     ],
                 }),
             name='contracts-detail'),
        path('services/',
             TemplateView.as_view(
                 template_name='pages/dashboard/services/list.html',
                 extra_context={
                     'services': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Services', None),
                     ],
                 }),
             name='services-list'),
        path('services/<int:pk>/',
             TemplateView.as_view(
                 template_name='pages/dashboard/services/detail.html',
                 extra_context={
                     'service': type('s', (), {
                         'title': 'Vidange', 'type': 'oil', 'date': None,
                         'km': None, 'technician': None, 'provider': None,
                         'cost': None, 'status': 'pending', 'description': '',
                         'vehicle_plate': None,
                     })(),
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Services', '/fr/dashboard/services/'),
                         ('Detail', None),
                     ],
                 }),
             name='services-detail'),
        path('documents/',
             TemplateView.as_view(
                 template_name='pages/dashboard/documents/list.html',
                 extra_context={
                     'documents': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Documents', None),
                     ],
                 }),
             name='documents-list'),
        path('drivers/',
             TemplateView.as_view(
                 template_name='pages/dashboard/drivers/list.html',
                 extra_context={
                     'drivers': [],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Conducteurs', None),
                     ],
                 }),
             name='drivers-list'),
        path('settings/',
             TemplateView.as_view(
                 template_name='pages/dashboard/settings/index.html',
                 extra_context={
                     'setting_items': [],
                     'section_title': 'Parametres',
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Parametres', None),
                     ],
                 }),
             name='settings'),
    ], 'dashboard'), namespace='dashboard')),

    prefix_default_language=True,
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
