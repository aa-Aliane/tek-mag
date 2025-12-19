# backend/apps/tech/management/commands/create_basic_users.py
import random
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Creates basic users and profiles without affecting CSV-imported tech models"

    def handle(self, *args, **options):
        User = get_user_model()
        
        from django.apps import apps
        self.Profile = apps.get_model("accounts", "Profile")

        self.stdout.write(
            self.style.SUCCESS("Creating basic users and profiles...")
        )

        with transaction.atomic():
            # Create admin user if it doesn't exist
            admin_user = self.create_admin_superuser(User)
            
            # Create regular users
            users = self.generate_users(User, num_users=10)  # Create fewer users
            
            # Create profiles for all users
            all_users = [admin_user] + users
            self.generate_profiles(all_users)

        self.stdout.write(
            self.style.SUCCESS("Basic user data generation complete!")
        )

    def create_admin_superuser(self, User):
        self.stdout.write("Creating admin superuser...")
        try:
            user = User.objects.get(username="admin")
            self.stdout.write(self.style.WARNING("Admin superuser already exists."))
        except User.DoesNotExist:
            user = User.objects.create_superuser(
                username="admin", email="admin@example.com", password="admin"
            )
            self.stdout.write(self.style.SUCCESS("Admin superuser created."))
        return user

    def generate_users(self, User, num_users):
        self.stdout.write(f"Generating {num_users} additional users...")
        users = []
        
        # More diverse names
        first_names = [
            "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack",
            "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Rachel", "Steve", "Tina",
            "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack"
        ]
        last_names = [
            "Adams", "Brown", "Clark", "Davis", "Evans", "Foster", "Garcia", "Harris", "Ivanov", "Johnson",
            "King", "Lee", "Martin", "Nelson", "Owens", "Perez", "Roberts", "Taylor", "Upton", "Vance",
            "Wright", "Young", "Zhang", "Allen", "Bell", "Cooper"
        ]

        for i in range(num_users):
            first = random.choice(first_names)
            last = random.choice(last_names)
            username_base = f"{first.lower()}{last.lower()}{random.randint(100, 999)}"
            username = username_base
            k = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}{k}"
                k += 1

            email_base = f"{first.lower()}.{last.lower()}{random.randint(1, 99)}"
            email = f"{email_base}@example.com"
            k = 1
            while User.objects.filter(email=email).exists():
                email = f"{email_base}{k}@example.com"
                k += 1

            import pytz
            timezone = pytz.timezone('UTC')  # Use UTC or get from Django settings
            date_joined = timezone.localize(datetime.now() - timedelta(days=random.randint(1, 180)))
            is_active = random.choice([True] * 9 + [False])  # 90% active

            user = User(
                username=username,
                email=email,
                first_name=first,
                last_name=last,
                is_active=is_active,
                date_joined=date_joined,
            )
            user.set_password("password123")
            users.append(user)

        User.objects.bulk_create(users)
        self.stdout.write(
            self.style.SUCCESS(f"{num_users} additional users generated.")
        )
        return users

    def generate_profiles(self, users):
        self.stdout.write("Generating profiles...")
        profiles_to_create = []

        for user in users:
            # Skip if profile already exists
            try:
                existing_profile = self.Profile.objects.get(user=user)
                self.stdout.write(
                    self.style.WARNING(
                        f"Profile already exists for user: {user.username}. Skipping."
                    )
                )
                continue
            except self.Profile.DoesNotExist:
                pass  # This is expected, continue with creating profile

            user_type = "Client"
            if user.username == "admin":
                user_type = "Admin"
            elif "tech" in user.username:
                user_type = "Staff"
            else:
                user_type = random.choice(["Client", "Staff"])

            phone_number = f"+33-{random.randint(1,9)}-{random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}"
            address = f"{random.randint(1, 999)} {random.choice(['Main St', 'Oak Ave', 'Pine Rd', 'Elm Blvd'])}, {random.choice(['Paris', 'Lyon', 'Marseille', 'Lille'])}, France"
            date_of_birth = datetime.now() - timedelta(
                days=random.randint(365 * 18, 365 * 70)
            )

            profiles_to_create.append(
                self.Profile(
                    user=user,
                    type=user_type,
                    phone_number=phone_number,
                    address=address,
                    date_of_birth=date_of_birth,
                    profile_picture="profile_pics/default_profile.png",
                )
            )

        if profiles_to_create:
            self.Profile.objects.bulk_create(profiles_to_create)
            self.stdout.write(self.style.SUCCESS(f"{len(profiles_to_create)} profiles generated."))
        else:
            self.stdout.write(self.style.WARNING("No new profiles to generate."))