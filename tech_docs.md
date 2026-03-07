# Tree View:
```
backend/apps/tech
├── admin.py
├── apps.py
├── filters
│   ├── __init__.py
│   └── product_variant.py
├── management
│   └── commands
│       ├── __pycache__
│       │   └── generate_remaining_tech_data.cpython-312.pyc
│       ├── create_basic_users.py
│       ├── generate_remaining_tech_data.py
│       ├── import_smart_devices_csv.py
│       └── populate_tech.py
├── models
│   ├── __init__.py
│   ├── base_product.py
│   ├── brand.py
│   ├── color.py
│   ├── device_type.py
│   ├── part.py
│   ├── part_type.py
│   ├── product_model.py
│   ├── product_variant.py
│   ├── quality_tier.py
│   └── series.py
├── pagination.py
├── serializers
│   ├── __init__.py
│   ├── base_product.py
│   ├── brand.py
│   ├── color.py
│   ├── device_type.py
│   ├── part.py
│   ├── part_type.py
│   ├── part_variant.py
│   ├── product_model.py
│   ├── product_variant.py
│   ├── quality_tier.py
│   └── series.py
├── urls.py
└── views
    ├── __init__.py
    ├── base_product.py
    ├── brand.py
    ├── color.py
    ├── device_type.py
    ├── part.py
    ├── part_type.py
    ├── part_variant.py
    ├── product_model.py
    ├── product_variant.py
    ├── quality_tier.py
    └── series.py

```

# Content:

## admin.py

```py
from django.contrib import admin

from .models import (
    Brand,
    Color,
    DeviceType,
    Part,
    ProductModel,
    ProductVariant,
    QualityTier,
    Series,
)

admin.site.register(Brand)
admin.site.register(Part)
admin.site.register(ProductModel)
admin.site.register(Series)
admin.site.register(DeviceType)
admin.site.register(Color)
admin.site.register(QualityTier)
admin.site.register(ProductVariant)

```


## apps.py

```py
from django.apps import AppConfig


class TechConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tech"

    class Meta:
        app_label = "tech"

```


## filters/__init__.py

```py
from .product_variant import ProductVariantFilter

```


## filters/product_variant.py

```py
# IMPORT THE MODEL, NOT THE SERIALIZER
from apps.tech.models import ProductVariant
from django_filters import rest_framework as filters


class ProductVariantFilter(filters.FilterSet):
    brand = filters.NumberFilter(field_name="product__brand__id")
    is_global = filters.BooleanFilter(field_name="product__owner", lookup_expr="isnull")
    is_device = filters.BooleanFilter(field_name="product__is_serialized")

    class Meta:
        model = ProductVariant  # Filters use Models
        fields = {
            "color": ["exact"],
            "quality_tier": ["exact"],
            "product": ["exact"],
            "storage": ["exact"],
        }

```


## management/commands/create_basic_users.py

```py
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

```


## management/commands/generate_remaining_tech_data.py

```py
# backend/apps/tech/management/commands/generate_remaining_tech_data.py
import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q


class Command(BaseCommand):
    help = "Generates remaining tech app data that's not covered by CSV import"

    def handle(self, *args, **options):
        from django.apps import apps

        # Get all the required models using get_model
        User = get_user_model()
        self.Profile = apps.get_model("accounts", "Profile")
        self.Brand = apps.get_model("tech", "Brand")
        self.Series = apps.get_model("tech", "Series")
        self.DeviceType = apps.get_model("tech", "DeviceType")
        self.Part = apps.get_model("tech", "Part")
        self.ProductModel = apps.get_model("tech", "ProductModel")

        # New models
        self.Location = apps.get_model("stock", "Location")
        self.Supplier = apps.get_model("stock", "Supplier")
        self.StockItem = apps.get_model("stock", "StockItem")
        self.StoreOrder = apps.get_model("stock", "StoreOrder")
        self.Repair = apps.get_model("repairs", "Repair")
        self.Issue = apps.get_model("repairs", "Issue")
        # Import the new models
        self.PartQualityTier = apps.get_model("repairs", "PartQualityTier")
        self.ServicePricing = apps.get_model("repairs", "ServicePricing")
        self.RepairIssue = apps.get_model("repairs", "RepairIssue")

        self.stdout.write(self.style.SUCCESS("Generating remaining tech data..."))

        with transaction.atomic():
            # Get all users for repair assignments
            users = list(User.objects.all())
            if not users:
                self.stdout.write(
                    self.style.WARNING(
                        "No users found. Please run generate_test_data first or create some users."
                    )
                )
                return

            # Generate parts for the imported device models
            self.generate_parts()

            # Generate remaining tech data
            self.generate_locations()
            self.generate_suppliers()
            self.generate_stock_items()
            self.generate_store_orders()

            # Generate quality tiers before issues so that issues can be linked to parts with tiers
            self.generate_quality_tiers()

            # Generate repairs and issues data
            self.generate_issues()
            self.generate_service_pricing()
            self.generate_repairs(users)  # Pass users to assign repairs to clients

        self.stdout.write(
            self.style.SUCCESS("Remaining tech data generation complete!")
        )

    def generate_parts(self):
        self.stdout.write("Generating parts for imported models...")

        all_brands = list(self.Brand.objects.all())
        all_product_models = list(self.ProductModel.objects.all())

        if not all_brands or not all_product_models:
            self.stdout.write(
                self.style.WARNING(
                    "Skipping part generation: Brands or ProductModels not found."
                )
            )
            return

        parts_to_create = []
        # Store tuples of (part_instance, model_instance) to set M2M later
        part_model_pairs = []

        device_parts = {
            "phone": [
                "Screen Assembly",
                "Battery Pack",
                "Charging Port",
                "Rear Camera",
                "Front Camera",
                "Loudspeaker",
                "Earpiece Speaker",
                "Vibration Motor",
                "Power Button Flex",
                "Volume Button Flex",
                "SIM Tray",
                "Back Glass",
            ],
            "laptop": [
                "Screen Assembly",
                "Battery Pack",
                "Keyboard",
                "Trackpad",
                "Charger",
                "RAM Module",
                "SSD Drive",
                "Cooling Fan",
            ],
            "tablet": [
                "Screen Assembly",
                "Battery Pack",
                "Charging Port",
                "Camera Module",
                "Loudspeaker",
                "Back Panel",
                "Digitizer",
            ],
        }

        # Keep track of SKUs generated in this batch to avoid duplicates
        used_skus = set()
        existing_skus = set(self.Part.objects.values_list("sku", flat=True))

        for model in all_product_models:
            # Get device_type slug from the model's series
            if model.series and model.series.device_type:
                device_type_slug = model.series.device_type.slug
            else:
                device_type_slug = "phone"  # default

            parts_list = device_parts.get(device_type_slug, device_parts["phone"])

            num_parts = random.randint(
                1, 3
            )  # Reduce number per model to avoid too many
            selected_parts = random.sample(parts_list, min(num_parts, len(parts_list)))

            for part_name in selected_parts:
                sku = f"SKU-{random.randint(10000, 99999)}"
                # Check against both database and current batch
                while sku in existing_skus or sku in used_skus:
                    sku = f"SKU-{random.randint(10000, 99999)}"
                used_skus.add(sku)

                part = self.Part(
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
                    # model=model, # REMOVED: Part does not have 'model' field
                )
                parts_to_create.append(part)
                part_model_pairs.append((part, model))

        if parts_to_create:
            # Bulk create parts
            created_parts = self.Part.objects.bulk_create(parts_to_create)
            
            # Now handle Many-to-Many relationships
            # Since bulk_create modifies the instances in-place with IDs (in supported DBs like Postgres),
            # we can iterate through part_model_pairs. 
            # Note: This relies on DB support for returning IDs. 
            # If using SQLite (older versions) or MySQL, this might need refinement.
            # Assuming Postgres or modern Django/SQLite.
            
            # To be safe and robust across DBs, let's iterate and adding relations.
            # But we need to match the created part back to the model. 
            # Since 'parts_to_create' instances are updated with IDs, and 'part_model_pairs' holds references to them:
            
            m2m_relations = []
            for part, model in part_model_pairs:
                if part.id:
                    # We can't bulk_create m2m relations easily with through table without extra work, 
                    # but simple add() works if we do it one by one, or we can use the through model.
                    # Part.compatible_models is a ManyToManyField.
                    part.compatible_models.add(model)
            
            self.stdout.write(
                self.style.SUCCESS(f"{len(created_parts)} new parts generated.")
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "No new parts to generate."
                )
            )

    def generate_locations(self):
        self.stdout.write("Generating locations...")
        locations_data = [
            {
                "name": "Main Warehouse",
                "address": "123 Storage Lane",
                "type": "warehouse", # Lowercase to match choices
            },
            {"name": "Downtown Store", "address": "456 Main St", "type": "store"},
            {"name": "Tech Lab", "address": "789 Innovation Blvd", "type": "lab"},
            {"name": "Service Center", "address": "321 Repair Ave", "type": "service_center"},
        ]

        created_count = 0
        existing_count = 0
        for loc_data in locations_data:
            location, created = self.Location.objects.get_or_create(
                name=loc_data["name"],
                defaults={"address": loc_data["address"], "type": loc_data["type"]},
            )
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{created_count} locations created, {existing_count} already existed."
            )
        )

    def generate_suppliers(self):
        self.stdout.write("Generating suppliers...")
        suppliers_data = [
            {
                "name": "Global Tech Parts",
                "contact_name": "Alice Smith",
                "email": "alice@globaltech.com",
                "phone": "+1-555-0101",
            },
            {
                "name": "Screen Masters",
                "contact_name": "Bob Jones",
                "email": "bob@screenmasters.com",
                "phone": "+1-555-0102",
            },
            {
                "name": "Battery World",
                "contact_name": "Charlie Brown",
                "email": "charlie@batteryworld.com",
                "phone": "+1-555-0103",
            },
            {
                "name": "Component Supply Co.",
                "contact_name": "Diana Prince",
                "email": "diana@components.com",
                "phone": "+1-555-0104",
            },
        ]

        created_count = 0
        existing_count = 0
        for sup_data in suppliers_data:
            supplier, created = self.Supplier.objects.get_or_create(
                name=sup_data["name"],
                defaults={
                    "contact_name": sup_data["contact_name"],
                    "email": sup_data["email"],
                    "phone": sup_data["phone"],
                    "address": f"{random.randint(100, 999)} {random.choice(['Main St', 'Oak Ave', 'Pine Rd'])}, {random.choice(['CityA', 'CityB', 'CityC'])}",
                },
            )
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{created_count} suppliers created, {existing_count} already existed."
            )
        )

    def generate_stock_items(self):
        self.stdout.write("Generating stock items...")
        parts = list(self.Part.objects.all())
        locations = list(self.Location.objects.all())

        if not parts or not locations:
            self.stdout.write(
                self.style.WARNING("Skipping stock items: Parts or Locations missing.")
            )
            return

        # Create stock items for random parts at random locations
        stock_items = []
        # Create stock for about 60% of parts across different locations
        for part in random.sample(parts, k=int(len(parts) * 0.6)):
            # Assign to 1-2 random locations
            for location in random.sample(
                locations, k=random.randint(1, min(2, len(locations)))
            ):
                # Check if this part-location combination already exists
                if not self.StockItem.objects.filter(
                    part=part, location=location
                ).exists():
                    stock_items.append(
                        self.StockItem(
                            part=part,
                            location=location,
                            quantity=random.randint(0, 30),
                            serial_number=(
                                f"SN-{random.randint(10000, 99999)}"
                                if random.choice([True, False])
                                else None
                            ),
                        )
                    )

        if stock_items:
            self.StockItem.objects.bulk_create(stock_items)
            self.stdout.write(
                self.style.SUCCESS(f"{len(stock_items)} stock items generated.")
            )

    def generate_store_orders(self):
        self.stdout.write("Generating store orders...")
        suppliers = list(self.Supplier.objects.all())

        if not suppliers:
            self.stdout.write(
                self.style.WARNING("Skipping store orders: Suppliers missing.")
            )
            return

        orders = []
        for _ in range(15):  # Generate more orders
            supplier = random.choice(suppliers)
            orders.append(
                self.StoreOrder(
                    supplier=supplier,
                    status=random.choice(
                        ["pending", "ordered", "received", "cancelled"]
                    ),
                    notes=f"Order from {supplier.name}",
                    items_description="Various parts and components",
                    expected_delivery_date=datetime.now().date()
                    + timedelta(days=random.randint(5, 30)),
                )
            )

        if orders:
            self.StoreOrder.objects.bulk_create(orders)
            self.stdout.write(
                self.style.SUCCESS(f"{len(orders)} store orders generated.")
            )

    def generate_issues(self):
        self.stdout.write("Generating issues...")
        common_issues = [
            ("Screen Cracked", ["phone", "tablet"], True, Decimal("80.00")),
            (
                "Battery Not Charging",
                ["phone", "tablet", "laptop", "desktop"],
                True,
                Decimal("50.00"),
            ),
            ("Water Damage", ["phone", "tablet"], True, Decimal("120.00")),
            (
                "Software Issue",
                ["phone", "tablet", "laptop", "desktop"],
                False,
                Decimal("40.00"),
            ),
            (
                "Battery Replacement",
                ["phone", "tablet", "laptop", "desktop"],
                True,
                Decimal("65.00"),
            ),
            ("Camera Malfunction", ["phone", "tablet"], True, Decimal("75.00")),
            (
                "Speaker Issue",
                ["phone", "tablet", "laptop", "desktop"],
                True,
                Decimal("45.00"),
            ),
            ("Charging Port Problem", ["phone", "tablet"], True, Decimal("35.00")),
            ("Water Damage (Severe)", ["phone", "tablet"], True, Decimal("150.00")),
            ("Touch Screen Unresponsive", ["phone", "tablet"], True, Decimal("70.00")),
            ("Overheating", ["laptop", "desktop"], True, Decimal("90.00")),
            ("Keyboard Not Working", ["laptop", "desktop"], True, Decimal("40.00")),
            ("Display Issues", ["laptop", "desktop"], True, Decimal("100.00")),
            ("Hard Drive Failure", ["laptop", "desktop"], True, Decimal("110.00")),
        ]

        created_count = 0
        for name, device_type_slugs, requires_part, base_price in common_issues:
            issue, created = self.Issue.objects.get_or_create(
                name=name,
                defaults={
                    "requires_part": requires_part,
                    "base_price": base_price,
                    # Categorize based on requires_part
                    "category_type": "part_based" if requires_part else "service_based",
                },
            )
            # Associate the device types
            for category in device_type_slugs:
                matching_device_types = self.DeviceType.objects.filter(
                    name__icontains=category
                )

                if matching_device_types.exists():
                    for device_type in matching_device_types:
                        issue.device_types.add(device_type)
                else:
                    # try common mappings
                    if category == "phone":
                        phone_types = self.DeviceType.objects.filter(
                            name__icontains="smartphone"
                        )
                        for device_type in phone_types:
                            issue.device_types.add(device_type)
                    elif category == "laptop":
                        laptop_types = self.DeviceType.objects.filter(
                            name__icontains="laptop"
                        )
                        for device_type in laptop_types:
                            issue.device_types.add(device_type)
                    elif category == "tablet":
                        tablet_types = self.DeviceType.objects.filter(
                            name__icontains="tablet"
                        )
                        for device_type in tablet_types:
                            issue.device_types.add(device_type)
                    elif category == "desktop":
                        desktop_types = self.DeviceType.objects.filter(
                            name__icontains="desktop"
                        )
                        for device_type in desktop_types:
                            issue.device_types.add(device_type)

            # For part-based issues, link them to a Part that has quality tiers defined
            if requires_part:
                # Intelligent linking based on name similarity
                part_keywords = []
                if "Screen" in name or "Display" in name:
                    part_keywords = ["Screen"]
                elif "Battery" in name:
                    part_keywords = ["Battery"]
                elif "Camera" in name:
                    part_keywords = ["Camera"]
                elif "Charging" in name:
                    part_keywords = ["Charging"]
                elif "Speaker" in name:
                    part_keywords = ["Loudspeaker", "Speaker"]
                elif "Glass" in name:
                    part_keywords = ["Back Glass", "Panel"]

                if part_keywords:
                    # Find parts that contain these keywords
                    query = Q()
                    for kw in part_keywords:
                        query |= Q(name__icontains=kw)
                    
                    matching_parts = self.Part.objects.filter(query)
                    
                    if matching_parts.exists():
                        # Link all matching parts to this issue (ManyToMany)
                        issue.compatible_parts.add(*matching_parts)
                        
                        # Set the first one as the primary associated part if needed
                        if not issue.associated_part:
                            issue.associated_part = matching_parts.first()
                
                # Fallback: if no specific match, ensure it has at least something if it's part-based
                if issue.category_type == "part_based" and not issue.compatible_parts.exists():
                     # Find a Part that has quality tiers associated with it
                    parts_with_tiers = self.Part.objects.filter(
                        quality_tiers__isnull=False
                    ).distinct()

                    if parts_with_tiers.exists():
                        part = parts_with_tiers.first()
                        issue.associated_part = part
                        issue.compatible_parts.add(part)
                    else:
                        # Fallback: link to any Part if no quality tiers exist
                        any_part = self.Part.objects.first()
                        if any_part:
                            issue.associated_part = any_part
                            issue.compatible_parts.add(any_part)

            issue.save()

            if created:
                created_count += 1

        # Count existing issues
        expected_issue_names = [issue[0] for issue in common_issues]
        existing_issue_count = self.Issue.objects.filter(
            name__in=expected_issue_names
        ).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"{created_count} new issues created, {existing_issue_count - created_count} already existed."
            )
        )

    def generate_quality_tiers(self):
        """Generate quality tiers for part-based issues"""
        self.stdout.write("Generating quality tiers...")

        # Get all parts to create quality tiers for
        parts = list(self.Part.objects.all())
        if not parts:
            self.stdout.write(
                self.style.WARNING("Skipping quality tiers: No parts found.")
            )
            return

        # Define quality tiers
        quality_tiers_info = [
            {
                "tier": "standard",
                "multiplier": 1.0,
                "warranty_days": 90,
                "description_fr": "Pièce compatible de qualité standard",
                "description_en": "Standard quality compatible part",
            },
            {
                "tier": "premium",
                "multiplier": 1.3,
                "warranty_days": 180,
                "description_fr": "Pièce haute qualité, proche des spécifications originales",
                "description_en": "High-quality part matching original specifications",
            },
            {
                "tier": "original",
                "multiplier": 1.8,
                "warranty_days": 365,
                "description_fr": "Pièce d'origine du fabricant",
                "description_en": "Manufacturer original part",
            },
            {
                "tier": "refurbished",
                "multiplier": 0.7,
                "warranty_days": 30,
                "description_fr": "Pièce reconditionnée avec garantie limitée",
                "description_en": "Refurbished part with limited warranty",
            },
        ]

        created_count = 0
        for part in parts:
            base_price = part.repair_price or part.price or Decimal("50.00")

            for tier_info in quality_tiers_info:
                price = base_price * Decimal(str(tier_info["multiplier"]))

                _, created = self.PartQualityTier.objects.get_or_create(
                    part=part,
                    quality_tier=tier_info["tier"],
                    defaults={
                        "price": price,
                        "warranty_days": tier_info["warranty_days"],
                        "description_fr": tier_info["description_fr"],
                        "description_en": tier_info["description_en"],
                        "availability_status": random.choice(
                            ["in_stock", "low_stock", "out_of_stock"]
                        ),
                    },
                )

                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"{created_count} quality tiers generated.")
        )

    def generate_service_pricing(self):
        """Generate service pricing for service-based issues"""
        self.stdout.write("Generating service pricing...")

        service_issues_data = [
            {
                "name": "Diagnostic Service",
                "device_types": ["phone", "laptop", "tablet", "desktop"],
                "pricing_type": "fixed",
                "base_price": Decimal("25.00"),
                "complexity": "medium",
                "description_fr": "Service de diagnostic complet pour identifier les problèmes",
                "description_en": "Complete diagnostic service to identify issues",
            },
            {
                "name": "Software Update",
                "device_types": ["phone", "laptop", "tablet", "desktop"],
                "pricing_type": "fixed",
                "base_price": Decimal("35.00"),
                "complexity": "low",
                "description_fr": "Mise à jour logicielle et configuration",
                "description_en": "Software update and configuration",
            },
            {
                "name": "Data Backup",
                "device_types": ["phone", "laptop", "tablet", "desktop"],
                "pricing_type": "fixed",
                "base_price": Decimal("40.00"),
                "complexity": "medium",
                "description_fr": "Sauvegarde sécurisée des données avant réparation",
                "description_en": "Secure data backup before repair",
            },
            {
                "name": "Cleaning Service",
                "device_types": ["phone", "laptop", "tablet", "desktop"],
                "pricing_type": "fixed",
                "base_price": Decimal("30.00"),
                "complexity": "low",
                "description_fr": "Nettoyage approfondi de l'appareil",
                "description_en": "Thorough device cleaning",
            },
            {
                "name": "Custom Software Installation",
                "device_types": ["laptop", "desktop"],
                "pricing_type": "fixed",
                "base_price": Decimal("50.00"),
                "complexity": "high",
                "description_fr": "Installation de logiciels personnalisés",
                "description_en": "Custom software installation",
            },
        ]

        created_count = 0
        for service_data in service_issues_data:
            issue, created = self.Issue.objects.get_or_create(
                name=service_data["name"],
                defaults={
                    "requires_part": False,
                    "base_price": service_data["base_price"],
                    "category_type": "service_based",
                },
            )

            for slug in service_data["device_types"]:
                try:
                    device_type = self.DeviceType.objects.get(slug=slug)
                    issue.device_types.add(device_type)
                except self.DeviceType.DoesNotExist:
                    pass

            _, pricing_created = self.ServicePricing.objects.get_or_create(
                issue=issue,
                defaults={
                    "pricing_type": service_data["pricing_type"],
                    "base_price": service_data["base_price"],
                    "complexity_level": service_data["complexity"],
                    "description_fr": service_data["description_fr"],
                    "description_en": service_data["description_en"],
                },
            )

            if pricing_created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"{created_count} service pricing entries generated.")
        )

    def generate_repairs(self, users):
        self.stdout.write("Generating repairs...")

        clients = []
        for u in users:
            if not u.is_staff and not u.is_superuser:
                try:
                    if hasattr(u, "profile") and u.profile:
                        clients.append(u)
                except Exception:
                    continue

        if not clients:
            self.stdout.write(
                self.style.WARNING("Skipping repairs: No clients with profiles found.")
            )
            return

        product_models = list(self.ProductModel.objects.all())
        if not product_models:
            self.stdout.write(
                self.style.WARNING("Skipping repairs: No product models found.")
            )
            return

        issues = list(self.Issue.objects.all())
        repairs = []

        for i in range(30):
            client = random.choice(clients)
            product_model = random.choice(product_models)
            date = datetime.now().date() - timedelta(days=random.randint(0, 60))
            uid = f"REP-{date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

            while self.Repair.objects.filter(uid=uid).exists():
                uid = f"REP-{date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

            repair = self.Repair(
                uid=uid,
                date=date,
                client=client,
                product_model=product_model,
                description=random.choice(
                    [
                        "Screen cracked",
                        "Battery not charging",
                        "Water damage",
                        "Software issue",
                        "Camera not working",
                        "Charging port damaged",
                    ]
                ),
                # price=Decimal(f"{random.randint(50, 300)}.00"), # REMOVED: price is calculated from issues
                status=random.choice(["saisie", "en-cours", "prete", "en-attente"]),
                comment="Generated test repair",
            )
            repairs.append(repair)

        if repairs:
            try:
                created_repairs = self.Repair.objects.bulk_create(repairs)

                for repair in created_repairs:
                    if issues:
                        num_issues = random.randint(1, min(3, len(issues)))
                        selected_issues = random.sample(issues, num_issues)

                        for issue in selected_issues:
                            quality_tier = None
                            if (
                                issue.category_type == "part_based"
                                and issue.associated_part
                            ):
                                available_tiers = list(
                                    self.PartQualityTier.objects.filter(
                                        part=issue.associated_part,
                                        availability_status="in_stock",
                                    )
                                )
                                if available_tiers:
                                    quality_tier = random.choice(available_tiers)

                            self.RepairIssue.objects.create(
                                repair=repair, issue=issue, quality_tier=quality_tier
                            )

                self.stdout.write(
                    self.style.SUCCESS(f"{len(created_repairs)} repairs generated.")
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to generate repairs: {e}"))

```


## management/commands/import_smart_devices_csv.py

```py
# backend/apps/tech/management/commands/import_smart_devices_csv.py
import csv
import os
import re

from apps.tech.models import Brand, DeviceType, ProductModel, Series
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Imports smart device data from smart_devices_2025.csv, generating minimal dummy data only for fields not in CSV"

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv-file",
            type=str,
            default="smart_devices_2025.csv",
            help="Path to the CSV file to import (default: smart_devices_2025.csv in backend directory)",
        )

    def handle(self, *args, **options):
        csv_file_path = options["csv_file"]

        # Check if file exists in current directory (relative to manage.py in backend)
        if not os.path.exists(csv_file_path):
            self.stderr.write(
                self.style.ERROR(
                    f"CSV file not found at {csv_file_path}. Please ensure the file is in the backend directory."
                )
            )
            return

        with open(csv_file_path, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            rows = list(reader)

        self.stdout.write(self.style.SUCCESS(f"Found {len(rows)} records in CSV file"))

        with transaction.atomic():
            created_count = 0
            skipped_count = 0

            for row in rows:
                model_id = row.get("Model_ID")
                device_category = row.get("Device Category", "").strip()
                brand_name = row.get("Brand", "").strip()
                series_name = row.get(
                    "Serie", ""
                ).strip()  # Note: CSV has "Serie" not "Series"
                model_name = row.get("Model", "").strip()

                # Validate required fields from CSV
                if not all([device_category, brand_name, series_name, model_name]):
                    self.stderr.write(
                        self.style.WARNING(
                            f"Skipping row {model_id} due to missing required data: {row}"
                        )
                    )
                    skipped_count += 1
                    continue

                # Create or get DeviceType (fields: name from CSV, plus dummy values for others)
                device_type, dt_created = DeviceType.objects.get_or_create(
                    name=device_category,
                    defaults={
                        "slug": device_category.lower().replace(" ", "-")
                        + f"_csv_{model_id}",
                        "description": f"Device type from CSV import for {device_category}",
                        "icon": self._get_icon_for_device_category(device_category),
                        "domain": self._get_domain_for_device_category(device_category),
                        "is_active": True,
                    },
                )
                if dt_created:
                    self.stdout.write(
                        self.style.NOTICE(f"Created DeviceType: {device_type.name}")
                    )

                # Create or get Brand (only name from CSV, no extra fields needed)
                brand, b_created = Brand.objects.get_or_create(
                    name=brand_name,
                    defaults={},  # Brand model only has name and timestamp fields
                )
                if b_created:
                    self.stdout.write(self.style.NOTICE(f"Created Brand: {brand.name}"))

                # Create or get Series (fields: name from CSV, plus dummy values for others)
                series, s_created = Series.objects.get_or_create(
                    name=series_name,
                    brand=brand,
                    defaults={
                        "description": f"{brand_name} {series_name} series from CSV",
                        "device_type": device_type,
                        "market_segment": self._get_market_segment_for_series(
                            series_name
                        ),
                    },
                )
                if s_created:
                    self.stdout.write(
                        self.style.NOTICE(
                            f"Created Series: {series.name} for {brand.name}"
                        )
                    )

                # Determine if this is a popular model based on model name
                is_popular = self._is_popular_model(model_name)

                # Create ProductModel with proper relationships (fields: name from CSV, plus dummy values for others)
                try:
                    product_model, pm_created = ProductModel.objects.get_or_create(
                        name=model_name,
                        brand=brand,
                        defaults={"series": series, "is_popular": is_popular},
                    )
                    if pm_created:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Created ProductModel: {product_model.name} (Popular: {is_popular})"
                            )
                        )
                    else:
                        # Update series if it's different (in case CSV data changed)
                        # Also update the is_popular field if needed
                        updated = False
                        if product_model.series != series:
                            product_model.series = series
                            updated = True
                        if product_model.is_popular != is_popular:
                            product_model.is_popular = is_popular
                            updated = True

                        if updated:
                            product_model.save()
                            self.stdout.write(
                                self.style.WARNING(
                                    f"Updated ProductModel {product_model.name} (Series: {series.name}, Popular: {is_popular})"
                                )
                            )

                except Exception as e:
                    self.stderr.write(
                        self.style.ERROR(
                            f'Error creating ProductModel for model "{model_name}": {str(e)}'
                        )
                    )
                    skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete."
                f" Created: {created_count}, Skipped: {skipped_count}"
            )
        )

    def _get_icon_for_device_category(self, device_category):
        """Generate icon name based on device category"""
        icon_mapping = {
            "smartphone": "smartphone",
            "phone": "smartphone",
            "mobile": "smartphone",
            "laptop": "laptop",
            "desktop": "desktop_mac",
            "tablet": "tablet",
            "smartwatch": "watch",
        }
        category_lower = device_category.lower()
        return icon_mapping.get(category_lower, "devices")

    def _get_domain_for_device_category(self, device_category):
        """Determine domain based on device category"""
        phone_like = ["smartphone", "phone", "mobile", "smartwatch"]
        computer_like = ["laptop", "desktop", "tablet"]

        category_lower = device_category.lower()
        if category_lower in phone_like:
            return "PHONES"
        elif category_lower in computer_like:
            return "COMPUTERS"
        else:
            # Default to PHONES for phone-like devices, COMPUTERS for others
            return (
                "PHONES"
                if any(keyword in category_lower for keyword in ["phone", "watch"])
                else "COMPUTERS"
            )

    def _get_market_segment_for_series(self, series_name):
        """Generate market segment based on series name keywords"""
        series_lower = series_name.lower()

        premium_keywords = ["pro", "ultra", "max", "premium"]
        mid_range_keywords = ["a", "m", "se", "lite"]

        if any(keyword in series_lower for keyword in premium_keywords):
            return "PREMIUM"
        elif any(keyword in series_lower for keyword in mid_range_keywords):
            return "MID_RANGE"
        else:
            return "FLAGSHIP"

    def _is_popular_model(self, model_name):
        """Determine if a model is popular based on specific model names"""
        model_lower = model_name.lower().strip()

        # Define specific popular models based on market data for 2025
        popular_models = [
            # Apple iPhones
            "iphone 16",
            "iphone 16 pro",
            "iphone 16 pro max",
            "iphone 17",
            "iphone 17 pro",
            "iphone 17 pro max",
            # Samsung Galaxy series
            "galaxy a16 5g",
            "galaxy a36 5g",
            "galaxy s25",
            "galaxy s25 ultra",
            "galaxy s25 plus",
            "galaxy note 25",
            "galaxy note 25 ultra",
            "galaxy z fold 7",
            "galaxy z flip 7",
            # Google Pixel
            "pixel 10",
            "pixel 10 pro",
            "pixel 10 pro xl",
            "pixel watch 4",
            "pixel watch 4 pro",
            # Apple iPads
            "ipad 11",
            "ipad air m3",
            "ipad pro m5",
            "ipad pro 13",
            "ipad pro 16",
            # Apple MacBooks
            "macbook air m4",
            "macbook pro m4",
            "macbook pro 14",
            "macbook pro 16",
            # Samsung tablets
            "galaxy tab s11",
            "galaxy tab s11+",
            "galaxy tab s11 ultra",
            # Popular Wearables
            "apple watch series 11",
            "apple watch ultra 3",
            "apple watch se 3",
            "samsung galaxy watch 7",
            "samsung galaxy watch ultra",
            # Popular Laptops
            "surface laptop 7",
            "surface laptop 7+",
            "zenbook 14 oled",
            "zenbook a14",
            "thinkpad x1 carbon",
            "xps 13",
            "xps 15",
            "spectre x360",
            # OnePlus
            "oneplus 15",
            "oneplus 15r",
            # Other popular models
            "galaxy a55",
            "galaxy a35",
            "galaxy a15",
            "redmi note 13",
            "galaxy s24",
            "galaxy s24+",
            "galaxy s24 ultra",
            "iphone 15",
            "iphone 15 pro",
            "iphone 15 pro max",
        ]

        # Check if the model name exactly matches or contains a popular model name
        for popular_model in popular_models:
            if popular_model in model_lower:
                return True

        # Also check for general popular series
        popular_series = [
            r"iphone \d{1,2}",  # iPhone followed by 1-2 digits
            r"iphone \d{1,2} pro",  # iPhone followed by 1-2 digits and "pro"
            r"iphone \d{1,2} pro max",  # iPhone followed by 1-2 digits and "pro max"
            r"galaxy (s|a|note)\d{2}",  # Galaxy followed by S, A, or Note and 2 digits
            r"pixel \d{1,2}",  # Pixel followed by 1-2 digits
            r"macbook (air|pro)",  # MacBook Air or Pro
            r"ipad (pro|air|\d{1,2})",  # iPad Pro, Air, or version number
            r"apple watch series \d{1,2}",  # Apple Watch Series followed by number
            r"galaxy watch \d{1,2}",  # Galaxy Watch followed by number
        ]

        for series_pattern in popular_series:
            if re.search(series_pattern, model_lower):
                return True

        return False

```


## management/commands/populate_tech.py

```py
import csv
import os
import re

from apps.tech.models import (
    BaseProduct,
    Brand,
    Color,
    DeviceType,
    ProductModel,
    ProductVariant,
    QualityTier,
    Series,
)
from django.core.management.base import BaseCommand

# ── pure helpers (no DB) ───────────────────────────────────────────────────────


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


# Stock-TSV "Categorie" → (canonical DeviceType name, domain)
_CATEGORY_MAP = {
    "réparation": ("Smartphone", "PHONES"),
    "protection": ("Smartphone", "PHONES"),
    "téléphonie": ("Smartphone", "PHONES"),
    "gsm": ("Smartphone", "PHONES"),
    "mobile": ("Smartphone", "PHONES"),
    "informatique": ("Ordinateur", "COMPUTERS"),
    "ordinateur": ("Ordinateur", "COMPUTERS"),
    "laptop": ("Ordinateur", "COMPUTERS"),
    "tablette": ("Tablette", "COMPUTERS"),
    "tablet": ("Tablette", "COMPUTERS"),
    "accessoire": ("Accessoire", "PHONES"),
    "divers": ("Divers", "PHONES"),
}


def _device_type_for_category(category: str):
    key = category.lower().strip()
    for fragment, result in _CATEGORY_MAP.items():
        if fragment in key:
            return result
    return (category.strip() or "Divers", "PHONES")


# Buyback model string → brand
_BRAND_RULES = [
    ("Apple", ["iPhone", "iPad", "MacBook", "iMac", "Apple Watch", "AirPods"]),
    ("Samsung", ["Galaxy", "Samsung"]),
    ("Google", ["Pixel"]),
    ("Acer", ["Acer", "Chromebook"]),
    ("Dell", ["Dell", "DELL", "Latitude", "XPS", "Inspiron", "Precision"]),
    ("Lenovo", ["Lenovo", "ThinkPad", "IdeaPad", "Legion", "Yoga"]),
    ("HP", ["HP ", "Spectre", "Pavilion", "EliteBook", "ProBook", "Omen"]),
    ("Asus", ["Asus", "ASUS", "ZenBook", "VivoBook", "ROG"]),
    ("Huawei", ["Huawei", "Honor"]),
    ("Xiaomi", ["Xiaomi", "Redmi", "POCO"]),
    ("OnePlus", ["OnePlus"]),
    ("Sony", ["Sony", "Xperia"]),
]


def _brand_for_model(model_raw: str) -> str:
    for brand_name, keywords in _BRAND_RULES:
        if any(kw in model_raw for kw in keywords):
            return brand_name
    return "Generic"


# Buyback model string → (DeviceType name, domain)
_DEVICE_TYPE_RULES = [
    (
        [
            "iPhone",
            "Galaxy A",
            "Galaxy S",
            "Galaxy Note",
            "Galaxy Z",
            "Pixel",
            "Redmi",
            "Xperia",
            "OnePlus",
        ],
        "Smartphone",
        "PHONES",
    ),
    (["iPad"], "Tablette", "COMPUTERS"),
    (["MacBook", "iMac"], "Ordinateur", "COMPUTERS"),
    (
        [
            "IdeaPad",
            "ThinkPad",
            "Chromebook",
            "Latitude",
            "XPS",
            "Inspiron",
            "Precision",
            "Spectre",
            "EliteBook",
            "ZenBook",
            "VivoBook",
            "Pavilion",
            "Omen",
            "Laptop",
        ],
        "Ordinateur",
        "COMPUTERS",
    ),
    (["Watch", "watch"], "Montre", "PHONES"),
    (["AirPods", "Buds"], "Audio", "PHONES"),
]


def _device_type_for_model(model_raw: str):
    for keywords, name, domain in _DEVICE_TYPE_RULES:
        if any(kw in model_raw for kw in keywords):
            return name, domain
    return "Divers", "PHONES"


# Buyback model string → Series name (product line, not full model name)
_SERIES_RULES = [
    (r"iPhone\s*(\d+)", lambda m: f"iPhone {m.group(1)}"),
    (r"iPad\s*(Pro|Air|Mini)", lambda m: f"iPad {m.group(1)}"),
    (r"iPad", lambda m: "iPad"),
    (r"MacBook\s*(Air|Pro)", lambda m: f"MacBook {m.group(1)}"),
    (r"Galaxy\s*S\d+", lambda m: "Galaxy S"),
    (r"Galaxy\s*A\d+", lambda m: "Galaxy A"),
    (r"Galaxy\s*Note", lambda m: "Galaxy Note"),
    (r"Galaxy\s*Z\s*Fold", lambda m: "Galaxy Z Fold"),
    (r"Galaxy\s*Z\s*Flip", lambda m: "Galaxy Z Flip"),
    (r"Pixel\s*\d+", lambda m: "Google Pixel"),
    (r"IdeaPad", lambda m: "IdeaPad"),
    (r"ThinkPad", lambda m: "ThinkPad"),
    (r"Latitude", lambda m: "Latitude"),
    (r"XPS", lambda m: "XPS"),
    (r"Chromebook", lambda m: "Chromebook"),
]


def _series_for_model(model_raw: str) -> str:
    for pattern, formatter in _SERIES_RULES:
        m = re.search(pattern, model_raw, re.IGNORECASE)
        if m:
            return formatter(m)
    words = model_raw.strip().split()
    return " ".join(words[:2]) if len(words) >= 2 else model_raw.strip()


# ── management command ─────────────────────────────────────────────────────────


class Command(BaseCommand):
    help = "GLOBAL DEPLOYMENT: Populates master catalog from TSVs with NO owner"

    def handle(self, *args, **options):
        STOCK_FILE = "data/Stock Pièces - Stock.tsv"
        BUYBACK_FILE = "data/Rachat Reprise - Rachat Reprise.tsv"

        if os.path.exists(STOCK_FILE):
            self.stdout.write(
                self.style.MIGRATE_LABEL(f"Importing parts:    {STOCK_FILE}")
            )
            self.import_stock(STOCK_FILE)
        else:
            self.stdout.write(self.style.ERROR(f"Missing: {STOCK_FILE}"))

        if os.path.exists(BUYBACK_FILE):
            self.stdout.write(
                self.style.MIGRATE_LABEL(f"Importing buybacks: {BUYBACK_FILE}")
            )
            self.import_buybacks(BUYBACK_FILE)
        else:
            self.stdout.write(self.style.ERROR(f"Missing: {BUYBACK_FILE}"))

    # ── private DB helpers ─────────────────────────────────────────────────────

    def _get_or_create_device_type(self, name: str, domain: str) -> DeviceType:
        """
        FIX 1 – DeviceType requires unique `slug` and non-blank `domain`.
        The original code passed neither → IntegrityError on first INSERT.
        """
        slug = _slugify(name)
        base_slug, counter = slug, 1
        while DeviceType.objects.filter(slug=slug).exclude(name=name).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        dev_type, _ = DeviceType.objects.get_or_create(
            name=name,
            defaults={
                "slug": slug,
                "domain": domain,
                "description": f"Imported: {name}",
                "is_active": True,
            },
        )
        return dev_type

    def _get_or_create_quality_tier(self, name: str) -> QualityTier:
        """
        FIX 5 – QualityTier has unique_together = ("name", "owner").
        owner=None must be explicit so the lookup uses the right constraint.
        """
        tier, _ = QualityTier.objects.get_or_create(name=name, owner=None)
        return tier

    def _get_or_create_color(self, name: str) -> Color:
        """FIX 5 – same unique_together issue as QualityTier."""
        color, _ = Color.objects.get_or_create(name=name, owner=None)
        return color

    # ── import: spare parts ────────────────────────────────────────────────────

    def import_stock(self, path):
        created = updated = skipped = 0

        with open(path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                if not row.get("Produit"):
                    skipped += 1
                    continue

                try:
                    # FIX 1 + NEW – resolve real DeviceType from category string
                    raw_cat = row.get("Categorie", "Divers").strip()
                    dt_name, dt_domain = _device_type_for_category(raw_cat)
                    dev_type = self._get_or_create_device_type(dt_name, dt_domain)

                    brand_name = row.get("Marque", "").strip() or "Générique"
                    brand, _ = Brand.objects.get_or_create(name=brand_name)

                    # FIX 2 – BaseProduct has NO `device_type` field.
                    base_prod, _ = BaseProduct.objects.get_or_create(
                        name=row["Produit"].strip(),
                        owner=None,
                        defaults={"brand": brand},
                    )

                    # FIX 5 – owner=None explicit for unique_together
                    quality = (
                        self._get_or_create_quality_tier(row["Qualité"].strip())
                        if row.get("Qualité")
                        else None
                    )
                    color = (
                        self._get_or_create_color(row["Variante"].strip())
                        if row.get("Variante")
                        else None
                    )

                    raw_price = (
                        row.get("Prix d'achat HT", "0")
                        .replace("€", "")
                        .replace("\xa0", "")
                        .replace(" ", "")
                        .replace(",", ".")
                        .strip()
                    )
                    try:
                        cost = float(raw_price)
                    except ValueError:
                        cost = 0.0

                    sku = (
                        row.get("ENA", "").strip()
                        or row.get("Code interne Fournisseur", "").strip()
                        or None
                    )

                    # FIX 4 – ProductVariant has no `quantity` (computed via StockItem)
                    # and no `notes` field. Both removed.
                    _, was_created = ProductVariant.objects.update_or_create(
                        sku=sku,
                        defaults={
                            "product": base_prod,
                            "name": row["Produit"].strip(),
                            "cost_price": cost,
                            "retail_price": cost * 2.0,
                            "quality_tier": quality,
                            "color": color,
                        },
                    )
                    if was_created:
                        created += 1
                    else:
                        updated += 1

                except Exception as exc:
                    self.stdout.write(
                        self.style.ERROR(f"  ✗ [{row.get('Produit', '?')}]: {exc}")
                    )
                    skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"  Parts — created: {created}, updated: {updated}, skipped: {skipped}"
            )
        )

    # ── import: buybacks / second-hand ────────────────────────────────────────

    def import_buybacks(self, path):
        created = updated = skipped = 0

        with open(path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                # Strip all keys to handle trailing-space column headers
                # (e.g. the TSV has "Prix de vente " with a trailing space)
                row = {k.strip(): v for k, v in row.items()}

                model_raw = row.get("MODEL", "").strip()
                if not model_raw:
                    skipped += 1
                    continue

                try:
                    # FIX NEW – "Occasion/Rachat" is a business workflow, not a
                    # DeviceType. Infer the real category from the model string.
                    dt_name, dt_domain = _device_type_for_model(model_raw)
                    dev_type = self._get_or_create_device_type(dt_name, dt_domain)

                    # FIX 6 – expanded brand detection
                    brand_name = _brand_for_model(model_raw)
                    brand, _ = Brand.objects.get_or_create(name=brand_name)

                    # FIX NEW – Series must be a product *line* ("iPhone 13",
                    # "Galaxy S", "IdeaPad"), not the full model name or a
                    # business category like "Rachat".
                    series_name = _series_for_model(model_raw)
                    series, _ = Series.objects.get_or_create(
                        name=series_name,
                        brand=brand,
                        defaults={"device_type": dev_type},
                    )

                    # FIX 2 – no `device_type` on BaseProduct
                    base_prod, _ = BaseProduct.objects.get_or_create(
                        name=model_raw,
                        owner=None,
                        defaults={"brand": brand, "is_serialized": True},
                    )

                    # Register as a ProductModel so the device shows up in
                    # the repair catalogue and the parts-compatibility matrix.
                    ProductModel.objects.get_or_create(
                        name=model_raw,
                        brand=brand,
                        defaults={"device_type": dev_type, "series": series},
                    )

                    # FIX 5 – owner=None explicit
                    grade_raw = row.get("Grade", "Grade B").strip() or "Grade B"
                    quality = self._get_or_create_quality_tier(grade_raw)

                    sku = (
                        str(row.get("IMEI", "")).strip()
                        or str(row.get("No ID", "")).strip()
                        or None
                    )
                    if not sku:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  ⚠ Skipping '{model_raw}': no IMEI / No ID"
                            )
                        )
                        skipped += 1
                        continue

                    try:
                        cost = float(row.get("Prix d'achat", 0) or 0)
                    except (ValueError, TypeError):
                        cost = 0.0
                    try:
                        retail = float(row.get("Prix de vente", 0) or 0)
                    except (ValueError, TypeError):
                        retail = 0.0

                    battery = row.get("Batterie %", "").strip()
                    is_sold = row.get("Statut", "").strip().lower() == "vendu"

                    # FIX 4 – no `quantity` or `notes` on ProductVariant.
                    # Battery / IMEI metadata goes in `description`.
                    _, was_created = ProductVariant.objects.update_or_create(
                        sku=sku,
                        defaults={
                            "product": base_prod,
                            "name": model_raw,
                            "cost_price": cost,
                            "retail_price": retail,
                            "quality_tier": quality,
                            "description": f"IMEI: {sku} | Battery: {battery}"
                            + (" | Vendu" if is_sold else ""),
                        },
                    )
                    if was_created:
                        created += 1
                    else:
                        updated += 1

                except Exception as exc:
                    self.stdout.write(self.style.ERROR(f"  ✗ [{model_raw}]: {exc}"))
                    skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"  Buybacks — created: {created}, updated: {updated}, skipped: {skipped}"
            )
        )

```


## models/__init__.py

```py
from .base_product import BaseProduct
from .brand import Brand
from .color import Color
from .device_type import DeviceType
from .part import Part
from .part_type import PartType
from .product_model import ProductModel
from .product_variant import ProductVariant
from .quality_tier import QualityTier
from .series import Series

```


## models/base_product.py

```py
from django.db import models

from .brand import Brand


class BaseProduct(models.Model):
    """
    The umbrella model for everything that can be in stock.
    """

    name = models.TextField(verbose_name="Product Name")

    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        verbose_name="Brand",
    )

    owner = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_products",
    )

    # This boolean tells React: "Ask for IMEI" (True) or "Ask for Quantity" (False)
    is_serialized = models.BooleanField(
        default=False, verbose_name="Is Serialized (Phone/Laptop)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand.name if self.brand else ''} {self.name}"

```


## models/brand.py

```py
from django.db import models

class Brand(models.Model):
    """
    Represents a product brand or manufacturer.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Brand Name")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Brand"
        verbose_name_plural = "Brands"
        ordering = ["name"]

    def __str__(self):
        return self.name

```


## models/color.py

```py
from django.db import models


class Color(models.Model):
    name = models.CharField(max_length=50, verbose_name="Color Name")

    owner = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_colors",
    )

    class Meta:
        unique_together = ("name", "owner")

    def __str__(self):
        return f"{self.name} ({'Global' if not self.owner else 'Private'})"

```


## models/device_type.py

```py
from django.db import models


class DeviceType(models.Model):

    DOMAIN_CHOICES = [
        ("COMPUTERS", "Computers"),
        ("PHONES", "Phones"),
    ]

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    domain = models.CharField(max_length=50, choices=DOMAIN_CHOICES)

    class Meta:
        verbose_name = "Device Type"
        verbose_name_plural = "Device Types"
        ordering = ["name"]

    def __str__(self):
        return self.name

```


## models/part.py

```py
from django.db import models

from .base_product import BaseProduct
from .product_model import ProductModel


class Part(BaseProduct):
    """
    Represents a spare part (Screen, Battery, etc.).
    Inherits name, brand, and owner from BaseProduct.
    """

    part_type = models.ForeignKey(
        "PartType", on_delete=models.PROTECT, related_name="parts"
    )

    compatible_models = models.ManyToManyField(
        ProductModel,
        related_name="compatible_parts",
        verbose_name="Compatible Models",
        blank=True,
    )

    class Meta:
        verbose_name = "Part"
        verbose_name_plural = "Parts"

```


## models/part_type.py

```py
from django.db import models


class PartType(models.Model):
    """
    Standardized list of types (e.g., Screen, Battery, Camera).
    """

    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

```


## models/product_model.py

```py
# product_model.py
from django.db import models

from .base_product import BaseProduct


class ProductModel(BaseProduct):
    # This links to the DeviceType model you just showed me
    device_type = models.ForeignKey(
        "DeviceType", on_delete=models.CASCADE, related_name="models"
    )

    series = models.ForeignKey(
        "Series",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="models",
    )

    is_popular = models.BooleanField(default=False)

    release_year = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Product Model"

```


## models/product_variant.py

```py
from django.db import models

from .base_product import BaseProduct


class ProductVariant(models.Model):
    """
    The 'Flavor' of a product.
    Handles both Parts (Colors/Quality) and Devices (Colors/Grades/Storage).
    """

    # We change 'part' to 'product' and point to BaseProduct
    product = models.ForeignKey(
        BaseProduct,
        on_delete=models.CASCADE,
        related_name="variants",
        verbose_name="Product",
    )

    # From your old model
    name = models.CharField(
        max_length=255, help_text="e.g. iPhone 12 - 128GB - Black - Grade A"
    )
    description = models.TextField(blank=True)
    ean13 = models.CharField(max_length=13, unique=True, blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)

    # Shared Attributes
    color = models.ForeignKey(
        "Color",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="variants",
    )
    quality_tier = models.ForeignKey(
        "QualityTier",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="variants",
        verbose_name="Quality/Grade",  # This handles 'Original' for parts and 'Grade A' for phones
    )

    # Device-Specific Attribute (NULL for parts)
    STORAGE_CHOICES = [
        ("64GB", "64GB"),
        ("128GB", "128GB"),
        ("256GB", "256GB"),
        ("512GB", "512GB"),
        ("1TB", "1TB"),
    ]
    storage = models.CharField(
        max_length=20,
        choices=STORAGE_CHOICES,
        null=True,
        blank=True,
        verbose_name="Storage Capacity",
    )

    # Device-Specific Attribute (NULL for parts)
    RAM_CHOICES = [
        ("2GB", "2GB"),
        ("4GB", "4GB"),
        ("6GB", "6GB"),
        ("8GB", "8GB"),
        ("12GB", "12GB"),
        ("16GB", "16GB"),
        ("32GB", "32GB"),
        ("64GB", "64GB"),
    ]

    ram = models.CharField(max_length=10, choices=RAM_CHOICES, null=True, blank=True)

    # Financials
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def stock_quantity(self):
        # This will count StockItems (with or without IMEIs)
        return self.stock_items.count()

    @property
    def margin(self):
        return self.retail_price - self.cost_price

    def __str__(self):
        # Dynamic string: includes storage if it exists (for phones)
        storage_str = f" - {self.storage}" if self.storage else ""
        return f"{self.product.name}{storage_str} - {self.quality_tier} ({self.color})"

```


## models/quality_tier.py

```py
from django.db import models


class QualityTier(models.Model):
    """
    Represents a quality tier for parts, such as "New", "Refurbished", "Used", etc.
    """

    name = models.CharField(
        max_length=50, unique=True, verbose_name="Quality Tier Name"
    )
    description = models.TextField(blank=True, verbose_name="Description")

    owner = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_quality_tiers",
    )

    class Meta:
        unique_together = ("name", "owner")

    def __str__(self):
        return f"{self.name} ({'Global' if not self.owner else 'Private'})"

```


## models/series.py

```py
from django.db import models

from .brand import Brand
from .device_type import DeviceType


class Series(models.Model):

    name = models.CharField(max_length=100)  # "Galaxy S", "Galaxy A", "iPhone Pro"
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="series")
    description = models.TextField(blank=True)
    device_type = models.ForeignKey(
        DeviceType, on_delete=models.CASCADE, related_name="series"
    )
    market_segment = models.CharField(
        max_length=20,
        choices=[
            ("BUDGET", "Budget"),
            ("MID_RANGE", "Mid-Range"),
            ("FLAGSHIP", "Flagship"),
            ("PREMIUM", "Premium"),
        ],
        blank=True,
    )

    class Meta:
        verbose_name_plural = "Series"
        unique_together = ["name", "brand"]

```


## pagination.py

```py
from rest_framework.pagination import PageNumberPagination


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class NoPagination:
    """
    A pagination class that returns all results without pagination.
    """
    def paginate_queryset(self, queryset, request, view=None):
        return None

    def get_paginated_response(self, data):
        from rest_framework.response import Response
        return Response({
            'results': data
        })

    def to_representation(self, instance):
        return instance
```


## serializers/__init__.py

```py
from .base_product import BaseProductSerializer
from .brand import BrandSerializer
from .color import ColorSerializer
from .device_type import DeviceTypeSerializer
from .part import PartSerializer
from .product_model import ProductModelSerializer
from .product_variant import ProductVariantSerializer
from .quality_tier import QualityTierSerializer
from .series import SeriesSerializer

```


## serializers/base_product.py

```py
from apps.accounts.serializers import OrganizationSerializer
from apps.tech.models import BaseProduct
from rest_framework import serializers

from .brand import BrandSerializer


class BaseProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = BaseProduct
        fields = "__all__"

    def to_representation(self, instance):

        representation = super().to_representation(instance)

        if instance.brand:
            representation["brand"] = BrandSerializer(instance.brand).data
        if instance.owner:
            representation["owner"] = OrganizationSerializer(instance.owner).data

```


## serializers/brand.py

```py
from rest_framework import serializers
from ..models import Brand

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

```


## serializers/color.py

```py
from apps.accounts.serializers import OrganizationSerializer
from apps.tech.models import Color
from rest_framework import serializers


class ColorSerializer(serializers.ModelSerializer):
    """
    Serializer for the standardized global Part Types.
    """

    class Meta:
        model = Color
        fields = "__all__"

    def to_representation(self, instance):

        representation = super().to_representation(instance)

        if instance.owner:
            representation["owner"] = OrganizationSerializer(instance.owner).data

```


## serializers/device_type.py

```py
from rest_framework import serializers

from ..models import DeviceType


class DeviceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceType
        fields = "__all__"

```


## serializers/part.py

```py
from apps.tech.models import Part
from apps.tech.serializers.product_model import ProductModelSerializer

from .base_product import BaseProductSerializer
from .part_type import PartTypeSerializer
from .product_model import ProductModelSerializer


class PartSerializer(BaseProductSerializer):

    class Meta:
        model = Part
        fields = "__all__"

    def to_representation(self, instance):
        reprentation = super().to_representation(instance)

        if instance.part_type:
            reprentation["part_type"] = PartTypeSerializer(instance.part_type).data
        if instance.compatible_models:
            reprentation["compatible_models"] = ProductModelSerializer(
                instance.compatible_models.all(), many=True
            )

```


## serializers/part_type.py

```py
# apps/stock/serializers.py
from apps.tech.models import PartType
from rest_framework import serializers


class PartTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for the standardized global Part Types.
    """

    class Meta:
        model = PartType
        fields = "__all__"

```


## serializers/part_variant.py

```py
from apps.tech.models import PartVariant
from rest_framework import serializers

from .color import ColorSerializer
from .quality_tier import QualityTierSerializer


class PartVariantSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartVariant
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.quality_tier:
            representation["quality_tier"] = QualityTierSerializer(
                instance.quality_tier
            ).data

        if instance.color:
            representation["color"] = ColorSerializer(instance.color).data

        return representation

```


## serializers/product_model.py

```py
from rest_framework import serializers

from ..models import ProductModel
from .base_product import BaseProductSerializer
from .device_type import DeviceTypeSerializer
from .series import SeriesSerializer


class ProductModelSerializer(BaseProductSerializer):
    class Meta:
        model = ProductModel
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.device_type:
            representation["device_type"] = DeviceTypeSerializer(
                instance.device_type
            ).data
        if instance.series:
            representation["series"] = SeriesSerializer(instance.series).data

```


## serializers/product_variant.py

```py
from apps.tech.models import ProductVariant
from rest_framework import serializers

from .base_product import BaseProductSerializer
from .color import ColorSerializer
from .quality_tier import QualityTierSerializer


class ProductVariantSerializer(serializers.ModelSerializer):
    # We include the product details so the frontend sees "iPhone 12"
    # and the "is_serialized" flag without extra API calls.

    class Meta:
        model = ProductVariant
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # 1. Expand Product/Parent Details (Name, Brand, is_serialized)
        if instance.product:
            representation["product"] = BaseProductSerializer(instance.product).data

            # Useful for flat searching in the React Table
            representation["product_name"] = instance.product.name
            representation["brand_name"] = (
                instance.product.brand.name if instance.product.brand else None
            )
            representation["is_serialized"] = instance.product.is_serialized

        # 2. Expand Quality Tier (Handles "Original" or "Grade A")
        if instance.quality_tier:
            representation["quality_tier"] = QualityTierSerializer(
                instance.quality_tier
            ).data

        # 3. Expand Color
        if instance.color:
            representation["color"] = ColorSerializer(instance.color).data

        # 4. Add the calculated margin
        representation["margin"] = instance.margin

        return representation

```


## serializers/quality_tier.py

```py
from apps.accounts.serializers import OrganizationSerializer
from apps.tech.models import QualityTier
from rest_framework import serializers


class QualityTierSerializer(serializers.ModelSerializer):
    """
    Serializer for the standardized global Part Types.
    """

    class Meta:
        model = QualityTier
        fields = "__all__"

    def to_representation(self, instance):

        representation = super().to_representation(instance)

        if instance.owner:
            representation["owner"] = OrganizationSerializer(instance.owner).data

```


## serializers/series.py

```py
from rest_framework import serializers

from ..models import Series


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = "__all__"

```


## urls.py

```py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BrandViewSet,
    ColorViewSet,
    DeviceTypeViewSet,
    PartViewSet,
    ProductModelViewSet,
    ProductVariantViewSet,
    QualityTierViewSet,
    SeriesViewSet,
)

router = DefaultRouter()
router.register(r"parts", PartViewSet)
router.register(r"product-variants", ProductVariantViewSet)
router.register(r"brands", BrandViewSet)
router.register(r"product-models", ProductModelViewSet)
router.register(r"device-types", DeviceTypeViewSet)
router.register(r"series", SeriesViewSet)
router.register(r"colors", ColorViewSet)
router.register(r"quality-tiers", QualityTierViewSet)


urlpatterns = [
    path("", include(router.urls)),
]

```


## views/__init__.py

```py
from .brand import BrandViewSet
from .color import ColorViewSet
from .device_type import DeviceTypeViewSet
from .part import PartViewSet
from .product_model import ProductModelViewSet
from .product_variant import ProductVariantViewSet
from .quality_tier import QualityTierViewSet
from .series import SeriesViewSet

```


## views/base_product.py

```py
from apps.tech.models import BaseProduct
from apps.tech.serializers import BaseProductSerializer
from rest_framework import viewsets


class BaseProductViewSet(viewsets.ModelViewSet):
    queryset = BaseProduct.objects.all()
    serializer_class = BaseProductSerializer

```


## views/brand.py

```py
from rest_framework import viewsets
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from ..models import Brand
from ..serializers import BrandSerializer


class BrandFilter(filters.FilterSet):
    device_type = filters.NumberFilter(method='filter_by_device_type')

    def filter_by_device_type(self, queryset, name, value):
        # Filter brands that have series associated with the specified device type
        return queryset.filter(series__device_type_id=value).distinct()

    class Meta:
        model = Brand
        fields = []


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = BrandFilter
    search_fields = ['name']
    pagination_class = None  # Disable pagination for brands

```


## views/color.py

```py
from apps.tech.models import Color
from apps.tech.serializers import ColorSerializer
from rest_framework import viewsets


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    pagination_class = None

```


## views/device_type.py

```py
from rest_framework import viewsets

from ..models import DeviceType
from ..serializers import DeviceTypeSerializer


class DeviceTypeViewSet(viewsets.ModelViewSet):
    queryset = DeviceType.objects.all()
    serializer_class = DeviceTypeSerializer

```


## views/part.py

```py
from apps.tech.models import Part
from apps.tech.serializers.part import PartSerializer
from django_filters import rest_framework as filters
from rest_framework import viewsets


class PartFilter(filters.FilterSet):
    class Meta:
        model = Part
        fields = {
            "name": ["icontains"],
            "brand": ["exact"],
            "compatible_models": ["exact"],
        }


class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = PartFilter

```


## views/part_type.py

```py
from apps.tech.models import PartType
from apps.tech.serializers import PartTypeSerializer
from rest_framework import viewsets


class PartTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PartType.objects.all()
    serializer_class = PartTypeSerializer
    pagination_class = None

```


## views/part_variant.py

```py
from apps.tech.filters import PartVariantFilter
from apps.tech.models import PartVariant
from apps.tech.serializers import PartVariantSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets


class PartVariantViewSet(viewsets.ModelViewSet):
    queryset = PartVariant.objects.all().select_related("part", "color", "quality_tier")
    serializer_class = PartVariantSerializer
    pagination_class = None

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PartVariantFilter

```


## views/product_model.py

```py
from django_filters import FilterSet
from django_filters.rest_framework import DjangoFilterBackend, filters
from rest_framework import viewsets

from ..models import ProductModel
from ..serializers import ProductModelSerializer


class ProductModelFilter(FilterSet):
    brand = filters.NumberFilter(field_name="brand__id")
    device_type = filters.NumberFilter(method="filter_by_device_type")

    def filter_by_device_type(self, queryset, name, value):
        # Filter models by device type through the series relationship
        # ProductModel -> Series -> DeviceType
        return queryset.filter(series__device_type_id=value).distinct()

    class Meta:
        model = ProductModel
        fields = ["brand", "device_type"]


class ProductModelViewSet(viewsets.ModelViewSet):
    queryset = ProductModel.objects.all()
    serializer_class = ProductModelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductModelFilter
    pagination_class = None

```


## views/product_variant.py

```py
from apps._common.pagination import OptionalPagination
from apps.tech.filters import ProductVariantFilter  # The filter class we just discussed
from apps.tech.models import ProductVariant
from apps.tech.serializers import ProductVariantSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    The main engine for the Catalogue.
    Handles both the 'Stock Pièces' and 'Rachat Reprise' data.
    """

    serializer_class = ProductVariantSerializer

    # PERFORMANCE: select_related prevents the "N+1" problem where
    # the database is hit for every single row to find the Brand name.
    queryset = (
        ProductVariant.objects.all()
        .select_related("product", "product__brand", "color", "quality_tier")
        .prefetch_related("product__owner")
    )

    # Integration with your Fucking Good UX filters
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductVariantFilter

    pagination_class = OptionalPagination

    # SEARCH: This is what makes the Catalogue search bar work.
    # It looks through the Parent Product name AND the Brand name.
    search_fields = ["product__name", "product__brand__name", "sku", "ean13", "name"]

    ordering_fields = ["retail_price", "cost_price", "product__name", "created_at"]
    ordering = ["product__name"]

    def perform_create(self, serializer):
        """
        Optional: If you want to automatically link the product owner
        to the person who created this variant.
        """
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Attempt to paginate the results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # FALLBACK: If pagination returns None, serialize the queryset directly.
        # This prevents the 'NoneType' object is not iterable error.
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

```


## views/quality_tier.py

```py
from apps.tech.models import QualityTier
from apps.tech.serializers import QualityTierSerializer
from rest_framework import viewsets


class QualityTierViewSet(viewsets.ModelViewSet):
    queryset = QualityTier.objects.all()
    serializer_class = QualityTierSerializer
    pagination_class = None

```


## views/series.py

```py
from rest_framework import viewsets

from ..models import Series
from ..serializers import SeriesSerializer


class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

```

