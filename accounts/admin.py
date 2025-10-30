from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, RestaurantProfile, NGOProfile


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
	fieldsets = (
		(None, {'fields': ('username', 'password')}),
		('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
		('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
		('Important dates', {'fields': ('last_login', 'date_joined')}),
		('Role', {'fields': ('role',)}),
	)
	list_display = ('username', 'email', 'role', 'is_staff')


@admin.register(RestaurantProfile)
class RestaurantProfileAdmin(admin.ModelAdmin):
	list_display = ('organization_name', 'user')


@admin.register(NGOProfile)
class NGOProfileAdmin(admin.ModelAdmin):
	list_display = ('organization_name', 'user')

# Register your models here.
