import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Generates realistic dummy data for both accounts and tech apps."

    def handle(self, *args, **options):
        from django.apps import apps

        self.EmailVerificationCode = apps.get_model("accounts", "EmailVerificationCode")
        self.Profile = apps.get_model("accounts", "Profile")
        self.Brand = apps.get_model("tech", "Brand")
        self.Series = apps.get_model("tech", "Series")
        self.DeviceType = apps.get_model("tech", "DeviceType")
        self.Part = apps.get_model("tech", "Part")
        self.ProductModel = apps.get_model("tech", "ProductModel")

        # New models
        self.Location = apps.get_model("tech", "Location")
        self.Supplier = apps.get_model("tech", "Supplier")
        self.StockItem = apps.get_model("tech", "StockItem")
        self.StoreOrder = apps.get_model("tech", "StoreOrder")
        self.Repair = apps.get_model("repairs", "Repair")
        self.Issue = apps.get_model("repairs", "Issue")
        # Import the new models
        self.PartQualityTier = apps.get_model("repairs", "PartQualityTier")
        self.ServicePricing = apps.get_model("repairs", "ServicePricing")
        self.RepairIssue = apps.get_model("repairs", "RepairIssue")

        self.stdout.write(
            self.style.SUCCESS("Generating dummy data for accounts app...")
        )
        with transaction.atomic():
            admin_user = self.create_admin_superuser()
            users = self.generate_users(num_users=29)
            all_users = [admin_user] + users
            self.generate_profiles(all_users)

        self.stdout.write(
            self.style.SUCCESS("Dummy data generation for accounts app complete!")
        )
        self.stdout.write(self.style.SUCCESS("Generating dummy data for tech app..."))

        with transaction.atomic():
            self.generate_device_types()
            self.generate_brands_series_and_models()
            self.generate_parts()

            # Generate new tech data
            self.generate_locations()
            self.generate_suppliers()
            self.generate_stock_items()
            self.generate_store_orders()

        self.stdout.write(
            self.style.SUCCESS("Dummy data generation for tech app complete!")
        )

        self.stdout.write(self.style.SUCCESS("Generating dummy data for repairs app..."))
        with transaction.atomic():
            self.generate_issues()
            # Generate quality tiers and service pricing after issues
            self.generate_quality_tiers()
            self.generate_service_pricing()
            self.generate_repairs(users) # Pass users to assign repairs to clients

        self.stdout.write(
            self.style.SUCCESS("Dummy data generation for repairs app complete!")
        )

    def create_admin_superuser(self):
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

    def generate_users(self, num_users):
        self.stdout.write(f"Generating {num_users} additional users...")
        users = []
        first_names = [
            "John", "Jane", "Michael", "Emily", "David", "Sarah", "Chris", "Anna", "James", "Laura",
            "Robert", "Jessica", "Daniel", "Olivia", "Matthew", "Sophia", "William", "Ava", "Joseph", "Mia",
            "Charles", "Isabella", "Thomas", "Charlotte", "George", "Amelia", "Henry", "Harper", "Alexander", "Evelyn",
        ]
        last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
            "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
            "Thompson", "Moore", "Clark", "Lewis", "Robinson",
        ]

        for i in range(num_users):
            first = random.choice(first_names)
            last = random.choice(last_names)
            username_base = f"{first.lower().replace(' ', '')}{last.lower()}{random.randint(1000, 9999)}"
            username = username_base
            k = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}{k}"
                k += 1

            email_base = f"{first.lower().replace(' ', '')}.{last.lower()}"
            email = f"{email_base}{random.randint(1, 999)}@example.com"
            k = 1
            while User.objects.filter(email=email).exists():
                email = f"{email_base}{k}@example.com"
                k += 1

            date_joined = datetime.now() - timedelta(days=random.randint(1, 365))
            is_active = random.choice([True] * 9 + [False])

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
            if hasattr(user, "profile") and user.profile:
                continue

            user_type = "Client"
            if user.username == "admin":
                user_type = "Admin"
            elif "tech" in user.username:
                user_type = "Staff"
            elif "customer" in user.username:
                user_type = "Client"
            else:
                user_type = random.choice(["Client", "Staff"])

            phone_number = f"+33-{random.randint(1,9)}-{random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}-{random.randint(10,99)}"
            address = f"{random.randint(1, 999)} {random.choice(['Street', 'Avenue', 'Boulevard'])}, {random.choice(['CityA', 'CityB', 'CityC'])}, Country"
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
            self.stdout.write(self.style.SUCCESS("Profiles generated."))

    def generate_device_types(self):
        """Generate device types"""
        self.stdout.write("Generating device types...")

        device_types_data = [
            {"name": "Phone", "slug": "phone", "description": "Mobile phones and smartphones", "icon": "phone", "domain": "PHONES"},
            {"name": "Laptop", "slug": "laptop", "description": "Portable computers and notebooks", "icon": "laptop", "domain": "COMPUTERS"},
            {"name": "Tablet", "slug": "tablet", "description": "Tablet computers and iPads", "icon": "tablet", "domain": "PHONES"},
            {"name": "Smartwatch", "slug": "smartwatch", "description": "Wearable smart devices", "icon": "watch", "domain": "PHONES"},
            {"name": "Desktop", "slug": "desktop", "description": "Desktop computers and workstations", "icon": "desktop", "domain": "COMPUTERS"},
        ]

        device_types_created = 0
        for dt_data in device_types_data:
            _, created = self.DeviceType.objects.get_or_create(
                slug=dt_data["slug"],
                defaults={
                    "name": dt_data["name"],
                    "description": dt_data["description"],
                    "icon": dt_data["icon"],
                    "domain": dt_data["domain"],
                },
            )
            if created:
                device_types_created += 1

        self.stdout.write(
            self.style.SUCCESS(f"{device_types_created} new device types generated.")
        )

    def generate_brands_series_and_models(self):
        """Generate brands, series, and product models"""
        self.stdout.write("Generating brands, series, and product models...")

        phone_type = self.DeviceType.objects.get(slug="phone")
        laptop_type = self.DeviceType.objects.get(slug="laptop")
        tablet_type = self.DeviceType.objects.get(slug="tablet")

        brands_data = {
            "Apple": {
                "iPhone": {"device_type": phone_type, "models": ["iPhone 15", "iPhone 15 Pro", "iPhone 14"]},
                "iPad": {"device_type": tablet_type, "models": ["iPad Air", "iPad Pro"]},
                "MacBook": {"device_type": laptop_type, "models": ["MacBook Air M2", "MacBook Pro"]},
            },
            "Samsung": {
                "Galaxy S": {"device_type": phone_type, "models": ["Galaxy S24", "Galaxy S23"]},
                "Galaxy Tab": {"device_type": tablet_type, "models": ["Galaxy Tab S9", "Galaxy Tab A9"]},
            },
        }

        for brand_name, series_dict in brands_data.items():
            brand, _ = self.Brand.objects.get_or_create(name=brand_name)
            for series_name, series_data in series_dict.items():
                series, _ = self.Series.objects.get_or_create(
                    name=series_name,
                    brand=brand,
                    defaults={"device_type": series_data["device_type"]},
                )
                for model_name in series_data["models"]:
                    self.ProductModel.objects.get_or_create(
                        name=model_name,
                        brand=brand,
                        defaults={"series": series},
                    )

    def generate_parts(self):
        self.stdout.write("Generating parts...")
        all_product_models = list(self.ProductModel.objects.all())
        
        parts_to_create = []
        device_parts = {
            "phone": ["Screen Assembly", "Battery Pack", "Charging Port"],
            "laptop": ["Screen Assembly", "Keyboard", "SSD Drive"],
            "tablet": ["Screen Assembly", "Battery Pack", "Digitizer"],
        }

        for model in all_product_models:
            device_type_slug = model.series.device_type.slug if model.series and model.series.device_type else "phone"
            parts_list = device_parts.get(device_type_slug, device_parts["phone"])

            for part_name in random.sample(parts_list, k=random.randint(1, len(parts_list))):
                sku = f"SKU-{random.randint(10000, 99999)}"
                while self.Part.objects.filter(sku=sku).exists():
                    sku = f"SKU-{random.randint(10000, 99999)}"

                parts_to_create.append(
                    self.Part(
                        name=f"{model.brand.name} {model.name} {part_name}",
                        ean13=f"{random.randint(1000000000000, 9999999999999)}",
                        sku=sku,
                        price=Decimal(f"{random.randint(10, 500)}.00"),
                        brand=model.brand,
                        model=model,
                    )
                )

        self.Part.objects.bulk_create(parts_to_create)
        self.stdout.write(self.style.SUCCESS(f"{len(parts_to_create)} new parts generated."))

    def generate_locations(self):
        locations_data = ["Main Warehouse", "Downtown Store", "Tech Lab"]
        for name in locations_data:
            self.Location.objects.get_or_create(name=name)

    def generate_suppliers(self):
        suppliers_data = ["Global Tech Parts", "Screen Masters", "Battery World"]
        for name in suppliers_data:
            self.Supplier.objects.get_or_create(name=name)

    def generate_stock_items(self):
        parts = list(self.Part.objects.all())
        locations = list(self.Location.objects.all())
        stock_items = []
        for part in parts:
            for location in random.sample(locations, k=random.randint(1, len(locations))):
                stock_items.append(
                    self.StockItem(
                        part=part,
                        location=location,
                        quantity=random.randint(0, 50)
                    )
                )
        self.StockItem.objects.bulk_create(stock_items)

    def generate_store_orders(self):
        suppliers = list(self.Supplier.objects.all())
        orders = []
        for _ in range(10):
            supplier = random.choice(suppliers)
            orders.append(
                self.StoreOrder(
                    supplier=supplier,
                    status=random.choice(["pending", "ordered", "received", "cancelled"]),
                    items_description="Various parts"
                )
            )
        self.StoreOrder.objects.bulk_create(orders)

    def generate_issues(self):
        common_issues = [
            ("Screen Cracked", ['phone', 'tablet'], True, Decimal("80.00")),
            ("Battery Replacement", ['phone', 'tablet', 'laptop'], True, Decimal("65.00")),
            ("Software Issue", ['phone', 'tablet', 'laptop'], False, Decimal("40.00")),
        ]

        for name, slugs, requires_part, base_price in common_issues:
            issue, created = self.Issue.objects.get_or_create(
                name=name,
                defaults={'requires_part': requires_part, 'base_price': base_price}
            )
            if created:
                for slug in slugs:
                    try:
                        device_type = self.DeviceType.objects.get(slug=slug)
                        issue.device_types.add(device_type)
                    except Exception:
                        pass
                
                if requires_part:
                    part = self.Part.objects.filter(name__icontains=name.split()[0]).first() or self.Part.objects.first()
                    if part:
                        issue.associated_part = part
                        issue.category_type = 'part_based'
                        issue.save()

    def generate_quality_tiers(self):
        parts = list(self.Part.objects.all())
        quality_tiers = ['standard', 'premium', 'original', 'refurbished']
        for part in parts:
            base_price = part.price or Decimal("50.00")
            for tier in quality_tiers:
                self.PartQualityTier.objects.get_or_create(
                    part=part,
                    quality_tier=tier,
                    defaults={'price': base_price * Decimal(str(random.uniform(0.7, 1.8))), 'warranty_days': 90}
                )

    def generate_service_pricing(self):
        service_issues = self.Issue.objects.filter(category_type='service_based')
        for issue in service_issues:
            self.ServicePricing.objects.get_or_create(
                issue=issue,
                defaults={'pricing_type': 'fixed', 'base_price': issue.base_price or Decimal("30.00")}
            )

    def generate_repairs(self, users):
        clients = [u for u in users if not u.is_staff and not u.is_superuser]
        product_models = list(self.ProductModel.objects.all())
        issues = list(self.Issue.objects.all())
        
        repairs = []
        for i in range(20):
            client = random.choice(clients)
            product_model = random.choice(product_models)
            uid = f"REP-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
            
            repair = self.Repair(
                uid=uid,
                date=datetime.now().date(),
                client=client,
                product_model=product_model,
                description="Test repair",
                price=Decimal("100.00")
            )
            repairs.append(repair)
            
        created_repairs = self.Repair.objects.bulk_create(repairs)
        for repair in created_repairs:
            selected_issues = random.sample(issues, k=random.randint(1, 2))
            for issue in selected_issues:
                quality_tier = None
                if issue.category_type == 'part_based' and issue.associated_part:
                    quality_tier = self.PartQualityTier.objects.filter(part=issue.associated_part).first()
                
                self.RepairIssue.objects.create(
                    repair=repair,
                    issue=issue,
                    quality_tier=quality_tier
                )