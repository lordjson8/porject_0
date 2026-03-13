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
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django import forms as dj_forms


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


class RegisterForm(UserCreationForm):
    first_name = dj_forms.CharField(max_length=30, required=False)
    last_name = dj_forms.CharField(max_length=30, required=False)
    email = dj_forms.EmailField(required=False)

    class Meta(UserCreationForm.Meta):
        fields = ('first_name', 'last_name', 'username', 'email', 'password1', 'password2')


class RegisterView(CreateView):
    form_class = RegisterForm
    template_name = 'pages/auth/register.html'
    success_url = reverse_lazy('auth:login')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['form'] = ctx.get('form') or RegisterForm()
        return ctx


class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'pages/dashboard/profile/index.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['breadcrumb_items'] = [
            ('Accueil', '/fr/dashboard/'),
            ('Profil', None),
        ]
        return ctx

    def post(self, request, *args, **kwargs):
        from django.contrib import messages
        from django.shortcuts import redirect
        user = request.user
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.email = request.POST.get('email', '')
        user.username = request.POST.get('username', user.username) or user.username
        user.save()
        messages.success(request, 'Profil mis à jour avec succès.')
        return redirect(request.path)


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
        path('register/',
             RegisterView.as_view(),
             name='register'),
        path('password-change/',
             auth_views.PasswordChangeView.as_view(
                 template_name='pages/auth/password_change.html',
                 success_url=reverse_lazy('auth:password-change-done')),
             name='password-change'),
        path('password-change/done/',
             auth_views.PasswordChangeDoneView.as_view(
                 template_name='pages/auth/password_change_done.html'),
             name='password-change-done'),
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
        path('reports/',
             TemplateView.as_view(
                 template_name='pages/dashboard/reports/index.html',
                 extra_context={
                     'service_stats': [],
                     'top_vehicles': [],
                     'default_service_stats': [
                         ('Vidange', 12, '48 000 DZD', 35),
                         ('Révision', 8, '64 000 DZD', 23),
                         ('Pneus', 6, '42 000 DZD', 18),
                         ('Freins', 5, '35 000 DZD', 15),
                         ('Autre', 3, '18 500 DZD', 9),
                     ],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Rapports', None),
                     ],
                 }),
             name='reports'),
        path('locations/',
             TemplateView.as_view(
                 template_name='pages/dashboard/locations/index.html',
                 extra_context={
                     'locations': [],
                     'demo_locations': [
                         ('Dépôt Central', 'Alger', 42, 60),
                         ('Garage Ouest', 'Oran', 18, 25),
                         ('Agence Est', 'Constantine', 12, 20),
                     ],
                     'breadcrumb_items': [
                         ('Accueil', '/fr/dashboard/'),
                         ('Emplacements', None),
                     ],
                 }),
             name='locations'),
        path('profile/',
             ProfileView.as_view(),
             name='profile'),
    ], 'dashboard'), namespace='dashboard')),

    prefix_default_language=True,
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
