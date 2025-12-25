# backend/apps/tech/management/commands/generate_remaining_tech_data.py
import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction


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
            self.style.SUCCESS("Generating remaining tech data...")
        )

        with transaction.atomic():
            # Get all users for repair assignments
            users = list(User.objects.all())
            if not users:
                self.stdout.write(
                    self.style.WARNING("No users found. Please run generate_test_data first or create some users.")
                )
                return

            # Generate products for the imported device models
            self.generate_products()

            # Generate remaining tech data
            self.generate_locations()
            self.generate_suppliers()
            self.generate_stock_items()
            self.generate_store_orders()

            # Generate quality tiers before issues so that issues can be linked to product models with tiers
            self.generate_quality_tiers()

            # Generate repairs and issues data
            self.generate_issues()
            self.generate_service_pricing()
            self.generate_repairs(users)  # Pass users to assign repairs to clients

        self.stdout.write(
            self.style.SUCCESS("Remaining tech data generation complete!")
        )

    def generate_products(self):
        self.stdout.write("Generating products for imported models...")

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
            if model.series and model.series.device_type:
                device_type_slug = model.series.device_type.slug
            else:
                device_type_slug = "phone"  # default
            
            parts = product_parts.get(device_type_slug, product_parts["phone"])

            num_products = random.randint(1, 3)  # Reduce number per model to avoid too many
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

        if products_to_create:
            # Get all existing SKUs to filter out duplicates
            existing_skus = set(self.Product.objects.values_list('sku', flat=True))
            unique_products = []
            for product in products_to_create:
                if product.sku not in existing_skus:
                    unique_products.append(product)
                    existing_skus.add(product.sku)

            if unique_products:
                self.Product.objects.bulk_create(unique_products)
                self.stdout.write(
                    self.style.SUCCESS(f"{len(unique_products)} new products generated.")
                )
            else:
                self.stdout.write(
                    self.style.WARNING("No new products to generate (all SKUs already exist).")
                )

    def generate_locations(self):
        self.stdout.write("Generating locations...")
        locations_data = [
            {"name": "Main Warehouse", "address": "123 Storage Lane", "type": "Warehouse"},
            {"name": "Downtown Store", "address": "456 Main St", "type": "Store"},
            {"name": "Tech Lab", "address": "789 Innovation Blvd", "type": "Lab"},
            {"name": "Service Center", "address": "321 Repair Ave", "type": "Service"},
        ]

        created_count = 0
        existing_count = 0
        for loc_data in locations_data:
            location, created = self.Location.objects.get_or_create(
                name=loc_data["name"],
                defaults={
                    "address": loc_data["address"],
                    "type": loc_data["type"]
                }
            )
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(self.style.SUCCESS(f"{created_count} locations created, {existing_count} already existed."))

    def generate_suppliers(self):
        self.stdout.write("Generating suppliers...")
        suppliers_data = [
            {"name": "Global Tech Parts", "contact_name": "Alice Smith", "email": "alice@globaltech.com", "phone": "+1-555-0101"},
            {"name": "Screen Masters", "contact_name": "Bob Jones", "email": "bob@screenmasters.com", "phone": "+1-555-0102"},
            {"name": "Battery World", "contact_name": "Charlie Brown", "email": "charlie@batteryworld.com", "phone": "+1-555-0103"},
            {"name": "Component Supply Co.", "contact_name": "Diana Prince", "email": "diana@components.com", "phone": "+1-555-0104"},
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
                    "address": f"{random.randint(100, 999)} {random.choice(['Main St', 'Oak Ave', 'Pine Rd'])}, {random.choice(['CityA', 'CityB', 'CityC'])}"
                }
            )
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(self.style.SUCCESS(f"{created_count} suppliers created, {existing_count} already existed."))

    def generate_stock_items(self):
        self.stdout.write("Generating stock items...")
        products = list(self.Product.objects.all())
        locations = list(self.Location.objects.all())

        if not products or not locations:
            self.stdout.write(self.style.WARNING("Skipping stock items: Products or Locations missing."))
            return

        # Create stock items for random products at random locations
        stock_items = []
        # Create stock for about 60% of products across different locations
        for product in random.sample(products, k=int(len(products) * 0.6)):
            # Assign to 1-2 random locations
            for location in random.sample(locations, k=random.randint(1, min(2, len(locations)))):
                # Check if this product-location combination already exists
                if not self.StockItem.objects.filter(product=product, location=location).exists():
                    stock_items.append(
                        self.StockItem(
                            product=product,
                            location=location,
                            quantity=random.randint(0, 30),
                            serial_number=f"SN-{random.randint(10000, 99999)}" if random.choice([True, False]) else None
                        )
                    )

        if stock_items:
            self.StockItem.objects.bulk_create(stock_items)
            self.stdout.write(self.style.SUCCESS(f"{len(stock_items)} stock items generated."))

    def generate_store_orders(self):
        self.stdout.write("Generating store orders...")
        suppliers = list(self.Supplier.objects.all())

        if not suppliers:
            self.stdout.write(self.style.WARNING("Skipping store orders: Suppliers missing."))
            return

        orders = []
        for _ in range(15):  # Generate more orders
            supplier = random.choice(suppliers)
            orders.append(
                self.StoreOrder(
                    supplier=supplier,
                    status=random.choice(["pending", "ordered", "received", "cancelled"]),
                    notes=f"Order from {supplier.name}",
                    items_description="Various parts and components",
                    expected_delivery_date=datetime.now().date() + timedelta(days=random.randint(5, 30))
                )
            )

        if orders:
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
                    'base_price': base_price,
                    # Categorize based on requires_part for backward compatibility
                    'category_type': 'product_based' if requires_part else 'service_based'
                }
            )
            # Associate the device types using the actual device types from the DB
            # Map general categories to actual device types that exist
            for category in device_type_slugs:
                # Look for device types that contain the category name
                matching_device_types = self.DeviceType.objects.filter(
                    name__icontains=category
                )

                if matching_device_types.exists():
                    for device_type in matching_device_types:
                        issue.device_types.add(device_type)
                else:
                    # If no exact match, try common mappings
                    if category == 'phone':
                        phone_types = self.DeviceType.objects.filter(
                            name__icontains='smartphone'
                        )
                        for device_type in phone_types:
                            issue.device_types.add(device_type)
                    elif category == 'laptop':
                        laptop_types = self.DeviceType.objects.filter(
                            name__icontains='laptop'
                        )
                        for device_type in laptop_types:
                            issue.device_types.add(device_type)
                    elif category == 'tablet':
                        tablet_types = self.DeviceType.objects.filter(
                            name__icontains='tablet'
                        )
                        for device_type in tablet_types:
                            issue.device_types.add(device_type)
                    elif category == 'desktop':
                        desktop_types = self.DeviceType.objects.filter(
                            name__icontains='desktop'
                        )
                        for device_type in desktop_types:
                            issue.device_types.add(device_type)

            # For product-based issues, link them to a ProductModel that has quality tiers defined
            # Since we generate quality tiers before issues, we know there should be ProductModel instances with quality tiers
            if requires_part and issue.category_type == 'product_based':
                # Find a ProductModel that has quality tiers associated with it
                # This ensures that when we select this issue, quality tiers will be available
                product_models_with_tiers = self.ProductModel.objects.filter(
                    quality_tiers__isnull=False
                ).distinct()

                if product_models_with_tiers.exists():
                    issue.associated_product = product_models_with_tiers.first()
                else:
                    # Fallback: link to any ProductModel if no quality tiers exist
                    any_product_model = self.ProductModel.objects.first()
                    if any_product_model:
                        issue.associated_product = any_product_model

            issue.save()

            if created:
                created_count += 1

        # Count how many of our expected issues actually exist in the database now
        expected_issue_names = [issue[0] for issue in common_issues]
        existing_issue_count = self.Issue.objects.filter(name__in=expected_issue_names).count()
        self.stdout.write(self.style.SUCCESS(f"{created_count} new issues created, {existing_issue_count - created_count} already existed."))

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

        # Only include users who have profiles (which means they were created properly)
        clients = []
        for u in users:
            if not u.is_staff and not u.is_superuser:
                try:
                    # Check if user has a profile
                    if hasattr(u, 'profile') and u.profile:
                        clients.append(u)
                except self.Profile.DoesNotExist:
                    continue  # Skip users without profiles

        if not clients:
            self.stdout.write(self.style.WARNING("Skipping repairs: No clients with profiles found."))
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

        for i in range(30):  # Generate more repairs
            client = random.choice(clients)
            product_model = random.choice(product_models)
            date = datetime.now().date() - timedelta(days=random.randint(0, 60))  # More recent
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
                description=random.choice([
                    "Screen cracked", "Battery not charging", "Water damage", "Software issue",
                    "Camera not working", "Charging port damaged", "Touch screen unresponsive"
                ]),
                price=Decimal(f"{random.randint(50, 300)}.00"),
                status=random.choice(["saisie", "en-cours", "prete", "en-attente"]),
                comment="Generated test repair"
            )
            repairs.append(repair)

        if repairs:
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