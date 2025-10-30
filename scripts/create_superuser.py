import os
import django


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sharebite.settings')
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402


def main() -> None:
	User = get_user_model()
	username = os.environ.get('SB_ADMIN_USERNAME', 'admin')
	email = os.environ.get('SB_ADMIN_EMAIL', 'admin@example.com')
	password = os.environ.get('SB_ADMIN_PASSWORD', 'Admin!234')
	user, created = User.objects.get_or_create(
		username=username,
		defaults={
			'email': email,
			'role': 'admin',
			'is_staff': True,
			'is_superuser': True,
		},
	)
	user.set_password(password)
	user.is_staff = True
	user.is_superuser = True
	user.save()
	print(f"superuser {'created' if created else 'updated'}: {username}")


if __name__ == '__main__':
	main()


