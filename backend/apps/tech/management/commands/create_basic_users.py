# backend/apps/tech/management/commands/create_basic_users.py
import random
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone


class Command(BaseCommand):
    help = "Creates Organizations, Users, and Profiles for a multi-tenant shop system"

    def handle(self, *args, **options):
        User = get_user_model()

        from django.apps import apps

        # Dynamically get models
        self.Profile = apps.get_model("accounts", "Profile")
        self.Organization = apps.get_model("accounts", "Organization")

        self.stdout.write(
            self.style.SUCCESS("🚀 Starting multi-tenant data generation...")
        )

        with transaction.atomic():
            # 1. Create global admin user FIRST
            # This user acts as the 'Owner' for the organizations to satisfy the NOT NULL constraint
            admin_user = self.create_admin_superuser(User)

            # 2. Create Organizations
            organizations = self.generate_organizations(num_orgs=4, owner=admin_user)

            # 3. Create regular users
            users = self.generate_users(User, num_users=12, organizations=organizations)

            # 4. Create profiles (This is where the worker is linked to the shop)
            all_users = [admin_user] + users
            self.generate_profiles(all_users)

        self.stdout.write(
            self.style.SUCCESS(
                "✅ Success! Organizations created and Workers assigned."
            )
        )

    def create_admin_superuser(self, User):
        self.stdout.write("Ensuring admin superuser exists...")
        user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "is_superuser": True,
                "is_staff": True,
            },
        )
        if created:
            user.set_password("admin")
            user.save()
            self.stdout.write(self.style.SUCCESS("Admin superuser created."))
        return user

    def generate_organizations(self, num_orgs, owner):
        self.stdout.write(f"Generating {num_orgs} Organizations...")
        orgs = []
        shop_names = ["iFix", "TechRescue", "MobiLab", "QuickFix", "ThePhoneDoc"]
        suffixes = ["Central", "Solutions", "Express", "Station", "Hub"]

        for i in range(num_orgs):
            name = f"{random.choice(shop_names)} {random.choice(suffixes)} {random.randint(1, 99)}"

            # Use get_or_create so we don't crash if we run this twice
            org, created = self.Organization.objects.get_or_create(
                name=name,
                defaults={
                    "owner": owner,  # satisfying the non-nullable owner_id field
                    "address": f"{random.randint(1, 500)} Repair Street, {random.choice(['Paris', 'Lyon', 'Lille'])}",
                },
            )
            orgs.append(org)
            if created:
                self.stdout.write(f"Created Org: {name}")

        return orgs

    def generate_users(self, User, num_users, organizations):
        self.stdout.write(f"Generating {num_users} users...")
        users_list = []

        first_names = [
            "Alice",
            "Bob",
            "Carol",
            "David",
            "Emma",
            "Frank",
            "Grace",
            "Henry",
            "Ivy",
            "Jack",
            "Kate",
            "Liam",
        ]
        last_names = [
            "Adams",
            "Brown",
            "Clark",
            "Davis",
            "Evans",
            "Foster",
            "Garcia",
            "Harris",
            "Ivanov",
            "Johnson",
        ]

        for i in range(num_users):
            first = random.choice(first_names)
            last = random.choice(last_names)
            username_base = f"{first.lower()}{last.lower()}{random.randint(100, 999)}"
            username = username_base

            # Ensure unique username
            k = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}{k}"
                k += 1

            user = User(
                username=username,
                email=f"{username}@example.com",
                first_name=first,
                last_name=last,
                is_active=True,
                date_joined=timezone.now() - timedelta(days=random.randint(1, 100)),
            )
            user.set_password("password123")

            # We "tag" the object with a random org for the next step (Profiles)
            user._assigned_org = random.choice(organizations)
            users_list.append(user)

        User.objects.bulk_create(users_list)

        # Re-fetch the users from DB to get their IDs
        created_users = list(
            User.objects.filter(username__in=[u.username for u in users_list])
        )

        # Re-assign the organization tag to the re-fetched objects
        for user in created_users:
            original_user = next(u for u in users_list if u.username == user.username)
            user._assigned_org = original_user._assigned_org

        return created_users

    def generate_profiles(self, users):
        self.stdout.write("Generating profiles with Organization links...")
        profiles_to_create = []

        for user in users:
            # Prevent duplicate profiles
            if self.Profile.objects.filter(user=user).exists():
                continue

            # Check if this user was assigned an org in the previous step
            org = getattr(user, "_assigned_org", None)

            # Logic for user types
            if user.username == "admin":
                user_type = "Admin"
            else:
                user_type = random.choice(["Staff", "Staff", "Manager"])

            profiles_to_create.append(
                self.Profile(
                    user=user,
                    organization=org,  # This maps the user to their shop
                    type=user_type,
                    phone_number=f"+33-6-{random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}",
                    street_address=f"{random.randint(1, 999)} Tech Boulevard",
                    city=random.choice(["Paris", "Lyon", "Marseille"]),
                    postal_code=f"{random.randint(10000, 99999)}",
                    country="France",
                    date_of_birth=datetime.now()
                    - timedelta(days=random.randint(365 * 20, 365 * 50)),
                    profile_picture="profile_pics/default_profile.png",
                )
            )

        if profiles_to_create:
            self.Profile.objects.bulk_create(profiles_to_create)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully generated {len(profiles_to_create)} profiles."
                )
            )
