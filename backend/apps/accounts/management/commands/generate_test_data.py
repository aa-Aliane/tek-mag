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
        self.Product = apps.get_model("tech", "Product")
        self.ProductModel = apps.get_model("tech", "ProductModel")

        # New models
        self.Location = apps.get_model("tech", "Location")
        self.Supplier = apps.get_model("tech", "Supplier")
        self.StockItem = apps.get_model("tech", "StockItem")
        self.StoreOrder = apps.get_model("tech", "StoreOrder")
        self.Repair = apps.get_model("repairs", "Repair")
        self.Issue = apps.get_model("repairs", "Issue")
        # Import the new models
        self.ProductQualityTier = apps.get_model("repairs", "ProductQualityTier")
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
            # self.generate_email_verification_codes(all_users)

        self.stdout.write(
            self.style.SUCCESS("Dummy data generation for accounts app complete!")
        )
        self.stdout.write(self.style.SUCCESS("Generating dummy data for tech app..."))

        with transaction.atomic():
            self.generate_device_types()
            self.generate_brands_series_and_models()
            self.generate_products()

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
                self.stdout.write(
                    self.style.WARNING(
                        f"Profile already exists for user: {user.username}. Skipping."
                    )
                )
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
        else:
            self.stdout.write(self.style.WARNING("No new profiles to generate."))

    def generate_email_verification_codes(self, users):
        self.stdout.write("Generating email verification codes...")
        codes_to_create = []

        for user in users:
            if random.random() < 0.5:
                code = "".join(random.choices("0123456789abcdef", k=6))
                codes_to_create.append(
                    self.EmailVerificationCode(
                        user=user,
                        code=code,
                    )
                )

        if codes_to_create:
            self.EmailVerificationCode.objects.bulk_create(codes_to_create)
            self.stdout.write(
                self.style.SUCCESS(
                    f"{len(codes_to_create)} email verification codes generated."
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING("No new email verification codes generated.")
            )

    def generate_device_types(self):
        """Generate device types as separate model instances"""
        self.stdout.write("Generating device types...")

        device_types_data = [
            {"name": "Phone", "slug": "phone", "description": "Mobile phones and smartphones", "icon": "phone", "domain": "PHONES"},
            {"name": "Laptop", "slug": "laptop", "description": "Portable computers and notebooks", "icon": "laptop", "domain": "COMPUTERS"},
            {"name": "Tablet", "slug": "tablet", "description": "Tablet computers and iPads", "icon": "tablet", "domain": "PHONES"},
            {"name": "Smartwatch", "slug": "smartwatch", "description": "Wearable smart devices", "icon": "watch", "domain": "PHONES"},
            {"name": "Desktop", "slug": "desktop", "description": "Desktop computers and workstations", "icon": "desktop", "domain": "COMPUTERS"},
            {"name": "Monitor", "slug": "monitor", "description": "Computer displays and screens", "icon": "monitor", "domain": "COMPUTERS"},
            {"name": "Printer", "slug": "printer", "description": "Printers and scanners", "icon": "printer", "domain": "COMPUTERS"},
            {"name": "Accessory", "slug": "accessory", "description": "Device accessories and peripherals", "icon": "accessory", "domain": "COMPUTERS"},
        ]

        device_types_created = 0

        for dt_data in device_types_data:
            device_type, created = self.DeviceType.objects.get_or_create(
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
        """Generate brands, series (with device types), and product models"""
        self.stdout.write("Generating brands, series, and product models...")

        # Get device types
        phone_type = self.DeviceType.objects.get(slug="phone")
        laptop_type = self.DeviceType.objects.get(slug="laptop")
        tablet_type = self.DeviceType.objects.get(slug="tablet")

        # Brand -> Series (with device_type) -> Models
        brands_data = {
            "Apple": {
                "iPhone": {"device_type": phone_type, "market_segment": "PREMIUM", "models": ["iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 14", "iPhone 14 Pro"]},
                "iPhone SE": {"device_type": phone_type, "market_segment": "MID_RANGE", "models": ["iPhone SE 2022"]},
                "iPad": {"device_type": tablet_type, "market_segment": "PREMIUM", "models": ["iPad Air", '''iPad Pro 11"''', '''iPad Pro 12.9"''']},
                "MacBook": {"device_type": laptop_type, "market_segment": "PREMIUM", "models": ["MacBook Air M2", '''MacBook Pro 14"''', '''MacBook Pro 16"''']},
            },
            "Samsung": {
                "Galaxy S": {"device_type": phone_type, "market_segment": "FLAGSHIP", "models": ["Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S23", "Galaxy S23 FE"]},
                "Galaxy A": {"device_type": phone_type, "market_segment": "MID_RANGE", "models": ["Galaxy A54", "Galaxy A34", "Galaxy A14"]},
                "Galaxy Tab": {"device_type": tablet_type, "market_segment": "FLAGSHIP", "models": ["Galaxy Tab S9", "Galaxy Tab S9+", "Galaxy Tab A9"]},
            },
            "Google": {
                "Pixel": {"device_type": phone_type, "market_segment": "FLAGSHIP", "models": ["Pixel 8", "Pixel 8 Pro", "Pixel 7a"]},
                "Pixel Fold": {"device_type": phone_type, "market_segment": "PREMIUM", "models": ["Pixel Fold"]},
            },
            "Xiaomi": {
                "Redmi Note": {"device_type": phone_type, "market_segment": "BUDGET", "models": ["Redmi Note 13", "Redmi Note 13 Pro", "Redmi Note 12"]},
                "Xiaomi": {"device_type": phone_type, "market_segment": "FLAGSHIP", "models": ["Xiaomi 14", "Xiaomi 14 Pro"]},
            },
            "Huawei": {
                "P Series": {"device_type": phone_type, "market_segment": "FLAGSHIP", "models": ["P60 Pro", "P50"]},
                "MatePad": {"device_type": tablet_type, "market_segment": "FLAGSHIP", "models": ["MatePad Pro", "MatePad 11"]},
            },
        }

        brands_created = 0
        series_created = 0
        models_created = 0

        for brand_name, series_dict in brands_data.items():
            brand, created = self.Brand.objects.get_or_create(name=brand_name)
            if created:
                brands_created += 1

            for series_name, series_data in series_dict.items():
                # Create series with device_type reference
                series, created = self.Series.objects.get_or_create(
                    name=series_name,
                    brand=brand,
                    defaults={
                        "device_type": series_data["device_type"],
                        "description": f"{brand_name} {series_name} series",
                        "market_segment": series_data.get("market_segment", ""),
                    },
                )
                if created:
                    series_created += 1

                # Create models for this series
                for model_name in series_data["models"]:
                    model, created = self.ProductModel.objects.get_or_create(
                        name=model_name,
                        brand=brand,
                        defaults={
                            "series": series,
                        },
                    )
                    if created:
                        models_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{brands_created} new brands, {series_created} new series, "
                f"and {models_created} new product models generated."
            )
        )

    def generate_products(self):
        self.stdout.write("Generating products...")

        all_brands = list(self.Brand.objects.all())
        all_product_models = list(self.ProductModel.objects.all())

        if not all_brands or not all_product_models:
            self.stdout.write(
                self.style.WARNING(
                    "Skipping product generation: Brands or ProductModels not found."
                )
            )
            return

        products_to_create = []

        product_parts = {
            "phone": [
                "Screen Assembly", "Battery Pack", "Charging Port", "Rear Camera", "Front Camera", "Loudspeaker",
                "Earpiece Speaker", "Vibration Motor", "Power Button Flex", "Volume Button Flex", "SIM Tray", "Back Glass",
            ],
            "laptop": [
                "Screen Assembly", "Battery Pack", "Keyboard", "Trackpad", "Charger", "RAM Module", "SSD Drive", "Cooling Fan",
            ],
            "tablet": [
                "Screen Assembly", "Battery Pack", "Charging Port", "Camera Module", "Loudspeaker", "Back Panel", "Digitizer",
            ],
        }

        for model in all_product_models:
            # Get device_type slug from the model's series
            device_type_slug = (
                model.series.device_type.slug
                if model.series and model.series.device_type
                else "phone"
            )
            parts = product_parts.get(device_type_slug, product_parts["phone"])

            num_products = random.randint(3, 5)
            selected_parts = random.sample(parts, min(num_products, len(parts)))

            # Keep track of SKUs generated in this batch to avoid duplicates
            used_skus = set()
            for part_name in selected_parts:
                sku = f"SKU-{random.randint(10000, 99999)}"
                # Check against both database and current batch
                while self.Product.objects.filter(sku=sku).exists() or sku in used_skus:
                    sku = f"SKU-{random.randint(10000, 99999)}"
                used_skus.add(sku)

                product = self.Product(
                    name=f"{model.brand.name} {model.name} {part_name}",
                    ean13=f"{random.randint(1000000000000, 9999999999999)}",
                    sku=sku,
                    serial_number=f"SER-{random.randint(1000, 9999)}",
                    image_url="https://via.placeholder.com/150",
                    price=Decimal(f"{random.randint(10, 500)}.00"),
                    repair_price=Decimal(f"{random.randint(20, 600)}.00"),
                    special_price=Decimal(f"{random.randint(5, 450)}.00"),
                    other_price=Decimal(f"{random.randint(8, 480)}.00"),
                    brand=model.brand,
                    model=model,
                )
                products_to_create.append(product)

        self.Product.objects.bulk_create(products_to_create)
        self.stdout.write(
            self.style.SUCCESS(f"{len(products_to_create)} new products generated.")
        )

    def generate_locations(self):
        self.stdout.write("Generating locations...")
        locations_data = [
            {"name": "Main Warehouse", "address": "123 Storage Lane", "type": "Warehouse"},
            {"name": "Downtown Store", "address": "456 Main St", "type": "Store"},
            {"name": "Tech Lab", "address": "789 Innovation Blvd", "type": "Lab"},
        ]

        for loc_data in locations_data:
            self.Location.objects.get_or_create(
                name=loc_data["name"],
                defaults={
                    "address": loc_data["address"],
                    "type": loc_data["type"]
                }
            )
        self.stdout.write(self.style.SUCCESS(f"{len(locations_data)} locations generated."))

    def generate_suppliers(self):
        self.stdout.write("Generating suppliers...")
        suppliers_data = [
            {"name": "Global Tech Parts", "contact_name": "Alice Smith", "email": "alice@globaltech.com"},
            {"name": "Screen Masters", "contact_name": "Bob Jones", "email": "bob@screenmasters.com"},
            {"name": "Battery World", "contact_name": "Charlie Brown", "email": "charlie@batteryworld.com"},
        ]

        for sup_data in suppliers_data:
            self.Supplier.objects.get_or_create(
                name=sup_data["name"],
                defaults={
                    "contact_name": sup_data["contact_name"],
                    "email": sup_data["email"]
                }
            )
        self.stdout.write(self.style.SUCCESS(f"{len(suppliers_data)} suppliers generated."))

    def generate_stock_items(self):
        self.stdout.write("Generating stock items...")
        products = list(self.Product.objects.all())
        locations = list(self.Location.objects.all())

        if not products or not locations:
            self.stdout.write(self.style.WARNING("Skipping stock items: Products or Locations missing."))
            return

        stock_items = []
        for product in products:
            # Randomly assign stock to locations
            for location in random.sample(locations, k=random.randint(1, len(locations))):
                stock_items.append(
                    self.StockItem(
                        product=product,
                        location=location,
                        quantity=random.randint(0, 50),
                        serial_number=f"SN-{random.randint(10000, 99999)}" if random.choice([True, False]) else None
                    )
                )

        self.StockItem.objects.bulk_create(stock_items)
        self.stdout.write(self.style.SUCCESS(f"{len(stock_items)} stock items generated."))

    def generate_store_orders(self):
        self.stdout.write("Generating store orders...")
        suppliers = list(self.Supplier.objects.all())

        if not suppliers:
            self.stdout.write(self.style.WARNING("Skipping store orders: Suppliers missing."))
            return

        orders = []
        for _ in range(10):
            supplier = random.choice(suppliers)
            orders.append(
                self.StoreOrder(
                    supplier=supplier,
                    status=random.choice(["pending", "ordered", "received", "cancelled"]),
                    notes=f"Order from {supplier.name}",
                    items_description="Various parts"
                )
            )

        self.StoreOrder.objects.bulk_create(orders)
        self.stdout.write(self.style.SUCCESS(f"{len(orders)} store orders generated."))

    def generate_issues(self):
        self.stdout.write("Generating issues...")
        common_issues = [
            ("Screen Cracked", ['phone', 'tablet'], True, Decimal("80.00")),
            ("Battery Not Charging", ['phone', 'tablet', 'laptop', 'desktop'], True, Decimal("50.00")),
            ("Water Damage", ['phone', 'tablet'], True, Decimal("120.00")),
            ("Software Issue", ['phone', 'tablet', 'laptop', 'desktop'], False, Decimal("40.00")),
            ("Battery Replacement", ['phone', 'tablet', 'laptop', 'desktop'], True, Decimal("65.00")),
            ("Camera Malfunction", ['phone', 'tablet'], True, Decimal("75.00")),
            ("Speaker Issue", ['phone', 'tablet', 'laptop', 'desktop'], True, Decimal("45.00")),
            ("Charging Port Problem", ['phone', 'tablet'], True, Decimal("35.00")),
            ("Water Damage (Severe)", ['phone', 'tablet'], True, Decimal("150.00")),
            ("Touch Screen Unresponsive", ['phone', 'tablet'], True, Decimal("70.00")),
            ("Overheating", ['laptop', 'desktop'], True, Decimal("90.00")),
            ("Keyboard Not Working", ['laptop', 'desktop'], True, Decimal("40.00")),
            ("Display Issues", ['laptop', 'desktop'], True, Decimal("100.00")),
            ("Hard Drive Failure", ['laptop', 'desktop'], True, Decimal("110.00")),
        ]

        created_count = 0
        for name, device_type_slugs, requires_part, base_price in common_issues:
            issue, created = self.Issue.objects.get_or_create(
                name=name,
                defaults={
                    'requires_part': requires_part,
                    'base_price': base_price
                }
            )
            if created:
                # Associate the device types using the slugs
                for slug in device_type_slugs:
                    try:
                        device_type = self.DeviceType.objects.get(slug=slug)
                        issue.device_types.add(device_type)
                    except self.DeviceType.DoesNotExist:
                        self.stdout.write(
                            self.style.WARNING(f"Device type with slug '{slug}' does not exist for issue '{name}'")
                        )
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"{created_count} new issues generated."))

    def generate_quality_tiers(self):
        """Generate quality tiers for product-based issues"""
        self.stdout.write("Generating quality tiers...")
        
        # Get all products to create quality tiers for
        products = list(self.Product.objects.all())
        if not products:
            self.stdout.write(self.style.WARNING("Skipping quality tiers: No products found."))
            return

        # Define quality tiers and their characteristics
        quality_tiers_info = [
            {
                'tier': 'standard',
                'multiplier': 1.0,
                'warranty_days': 90,
                'description_fr': 'Pièce compatible de qualité standard',
                'description_en': 'Standard quality compatible part'
            },
            {
                'tier': 'premium',
                'multiplier': 1.3,
                'warranty_days': 180,
                'description_fr': 'Pièce haute qualité, proche des spécifications originales',
                'description_en': 'High-quality part matching original specifications'
            },
            {
                'tier': 'original',
                'multiplier': 1.8,
                'warranty_days': 365,
                'description_fr': 'Pièce d\'origine du fabricant',
                'description_en': 'Manufacturer original part'
            },
            {
                'tier': 'refurbished',
                'multiplier': 0.7,
                'warranty_days': 30,
                'description_fr': 'Pièce reconditionnée avec garantie limitée',
                'description_en': 'Refurbished part with limited warranty'
            }
        ]

        created_count = 0
        for product in products:
            # Use the product's repair_price as the base for quality tier pricing
            base_price = product.repair_price or product.price or Decimal("50.00")

            for tier_info in quality_tiers_info:
                # Calculate the price based on the multiplier
                price = base_price * Decimal(str(tier_info['multiplier']))

                # Create the quality tier
                # Note: The ProductQualityTier model links to ProductModel, not Product
                # So we need to use the product's model field
                _, created = self.ProductQualityTier.objects.get_or_create(
                    product=product.model,  # Use the ProductModel from the product's model field
                    quality_tier=tier_info['tier'],
                    defaults={
                        'price': price,
                        'warranty_days': tier_info['warranty_days'],
                        'description_fr': tier_info['description_fr'],
                        'description_en': tier_info['description_en'],
                        'availability_status': random.choice(['in_stock', 'low_stock', 'out_of_stock'])
                    }
                )

                if created:
                    created_count += 1

        self.stdout.write(self.style.SUCCESS(f"{created_count} quality tiers generated."))

    def generate_service_pricing(self):
        """Generate service pricing for service-based issues"""
        self.stdout.write("Generating service pricing...")
        
        # Define service-based issues and their pricing
        service_issues_data = [
            {
                'name': 'Diagnostic Service',
                'device_types': ['phone', 'laptop', 'tablet', 'desktop'],
                'pricing_type': 'fixed',
                'base_price': Decimal("25.00"),
                'complexity': 'medium',
                'description_fr': 'Service de diagnostic complet pour identifier les problèmes',
                'description_en': 'Complete diagnostic service to identify issues'
            },
            {
                'name': 'Software Update',
                'device_types': ['phone', 'laptop', 'tablet', 'desktop'],
                'pricing_type': 'fixed',
                'base_price': Decimal("35.00"),
                'complexity': 'low',
                'description_fr': 'Mise à jour logicielle et configuration',
                'description_en': 'Software update and configuration'
            },
            {
                'name': 'Data Backup',
                'device_types': ['phone', 'laptop', 'tablet', 'desktop'],
                'pricing_type': 'fixed',
                'base_price': Decimal("40.00"),
                'complexity': 'medium',
                'description_fr': 'Sauvegarde sécurisée des données avant réparation',
                'description_en': 'Secure data backup before repair'
            },
            {
                'name': 'Cleaning Service',
                'device_types': ['phone', 'laptop', 'tablet', 'desktop'],
                'pricing_type': 'fixed',
                'base_price': Decimal("30.00"),
                'complexity': 'low',
                'description_fr': 'Nettoyage approfondi de l\'appareil',
                'description_en': 'Thorough device cleaning'
            },
            {
                'name': 'Custom Software Installation',
                'device_types': ['laptop', 'desktop'],
                'pricing_type': 'fixed',
                'base_price': Decimal("50.00"),
                'complexity': 'high',
                'description_fr': 'Installation de logiciels personnalisés',
                'description_en': 'Custom software installation'
            },
        ]

        created_count = 0
        for service_data in service_issues_data:
            # Create or get the issue
            issue, created = self.Issue.objects.get_or_create(
                name=service_data['name'],
                defaults={
                    'requires_part': False,
                    'base_price': service_data['base_price'],
                    'category_type': 'service_based'
                }
            )
            
            # Associate device types
            for slug in service_data['device_types']:
                try:
                    device_type = self.DeviceType.objects.get(slug=slug)
                    issue.device_types.add(device_type)
                except self.DeviceType.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f"Device type with slug '{slug}' does not exist for service '{service_data['name']}'")
                    )
            
            # Create service pricing
            _, pricing_created = self.ServicePricing.objects.get_or_create(
                issue=issue,
                defaults={
                    'pricing_type': service_data['pricing_type'],
                    'base_price': service_data['base_price'],
                    'complexity_level': service_data['complexity'],
                    'description_fr': service_data['description_fr'],
                    'description_en': service_data['description_en']
                }
            )
            
            if pricing_created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"{created_count} service pricing entries generated."))

    def generate_repairs(self, users):
        self.stdout.write("Generating repairs...")

        clients = [u for u in users if not u.is_staff and not u.is_superuser]
        if not clients:
            self.stdout.write(self.style.WARNING("Skipping repairs: No clients found."))
            return

        product_models = list(self.ProductModel.objects.all())
        if not product_models:
             self.stdout.write(self.style.WARNING("Skipping repairs: No product models found."))
             return

        issues = list(self.Issue.objects.all())
        if not issues:
            self.stdout.write(self.style.WARNING("No issues found to associate with repairs."))
            issues = []  # Create empty list if no issues are found

        repairs = []

        for i in range(20):
            client = random.choice(clients)
            product_model = random.choice(product_models)
            date = datetime.now().date() - timedelta(days=random.randint(0, 30))
            uid = f"REP-{date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

            # Ensure UID uniqueness
            while self.Repair.objects.filter(uid=uid).exists():
                 uid = f"REP-{date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

            # Randomly decide if repair should have a scheduled date (30% chance)
            scheduled_date = None
            if random.random() < 0.3:  # 30% chance of having a scheduled date
                scheduled_date = datetime.now().date() + timedelta(days=random.randint(1, 14))  # Schedule within next 14 days

            # Randomly generate accessories (60% chance of having accessories)
            accessories = None
            if random.random() < 0.6:  # 60% chance of having accessories
                possible_accessories = ["Chargeur", "Étui", "Câble USB", "Oreillettes", "Support", "Film protecteur", "Batterie externe"]
                selected_accessories = random.sample(possible_accessories, random.randint(1, 3))  # 1-3 accessories
                accessories = ", ".join(selected_accessories)

            repair = self.Repair(
                uid=uid,
                date=date,
                scheduled_date=scheduled_date,
                accessories=accessories,
                client=client,
                product_model=product_model,
                description=random.choice(["Screen cracked", "Battery not charging", "Water damage", "Software issue"]),
                price=Decimal(f"{random.randint(50, 300)}.00"),
                comment="Generated test repair"
            )
            repairs.append(repair)

        try:
            created_repairs = self.Repair.objects.bulk_create(repairs)

            # Now associate issues with repairs after creating repairs
            for repair in created_repairs:
                # Randomly assign 1-3 issues to each repair
                if issues:  # Only if issues exist
                    num_issues = random.randint(1, min(3, len(issues)))
                    selected_issues = random.sample(issues, num_issues)
                    
                    # For each selected issue, create a RepairIssue entry
                    for issue in selected_issues:
                        # For product-based issues, randomly select a quality tier if available
                        quality_tier = None
                        if issue.category_type == 'product_based' and issue.associated_product:
                            # Get available quality tiers for this product
                            available_tiers = list(self.ProductQualityTier.objects.filter(
                                product=issue.associated_product,
                                availability_status='in_stock'
                            ))
                            if available_tiers:
                                quality_tier = random.choice(available_tiers)
                        
                        # Create the RepairIssue entry
                        self.RepairIssue.objects.create(
                            repair=repair,
                            issue=issue,
                            quality_tier=quality_tier
                        )

            self.stdout.write(self.style.SUCCESS(f"{len(created_repairs)} repairs generated with issues associated."))
        except Exception as e:
             self.stdout.write(self.style.ERROR(f"Failed to generate repairs: {e}"))
