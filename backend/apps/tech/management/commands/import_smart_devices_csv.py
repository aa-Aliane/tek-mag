# backend/apps/tech/management/commands/import_smart_devices_csv.py
import csv
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.tech.models import Brand, Series, DeviceType, ProductModel


class Command(BaseCommand):
    help = 'Imports smart device data from smart_devices_2025.csv, generating minimal dummy data only for fields not in CSV'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv-file',
            type=str,
            default='smart_devices_2025.csv',
            help='Path to the CSV file to import (default: smart_devices_2025.csv in backend directory)'
        )

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']

        # Check if file exists in current directory (relative to manage.py in backend)
        if not os.path.exists(csv_file_path):
            self.stderr.write(
                self.style.ERROR(f'CSV file not found at {csv_file_path}. Please ensure the file is in the backend directory.')
            )
            return

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            rows = list(reader)

        self.stdout.write(
            self.style.SUCCESS(f'Found {len(rows)} records in CSV file')
        )

        with transaction.atomic():
            created_count = 0
            skipped_count = 0
            
            for row in rows:
                model_id = row.get('Model_ID')
                device_category = row.get('Device Category', '').strip()
                brand_name = row.get('Brand', '').strip()
                series_name = row.get('Serie', '').strip()  # Note: CSV has "Serie" not "Series"
                model_name = row.get('Model', '').strip()

                # Validate required fields from CSV
                if not all([device_category, brand_name, series_name, model_name]):
                    self.stderr.write(
                        self.style.WARNING(f'Skipping row {model_id} due to missing required data: {row}')
                    )
                    skipped_count += 1
                    continue

                # Create or get DeviceType (fields: name from CSV, plus dummy values for others)
                device_type, dt_created = DeviceType.objects.get_or_create(
                    name=device_category,
                    defaults={
                        'slug': device_category.lower().replace(' ', '-') + f'_csv_{model_id}',
                        'description': f'Device type from CSV import for {device_category}',
                        'icon': self._get_icon_for_device_category(device_category),
                        'domain': self._get_domain_for_device_category(device_category),
                        'is_active': True,
                    }
                )
                if dt_created:
                    self.stdout.write(
                        self.style.NOTICE(f'Created DeviceType: {device_type.name}')
                    )

                # Create or get Brand (only name from CSV, no extra fields needed)
                brand, b_created = Brand.objects.get_or_create(
                    name=brand_name,
                    defaults={}  # Brand model only has name and timestamp fields
                )
                if b_created:
                    self.stdout.write(self.style.NOTICE(f'Created Brand: {brand.name}'))

                # Create or get Series (fields: name from CSV, plus dummy values for others)
                series, s_created = Series.objects.get_or_create(
                    name=series_name,
                    brand=brand,
                    defaults={
                        'description': f'{brand_name} {series_name} series from CSV',
                        'device_type': device_type,
                        'market_segment': self._get_market_segment_for_series(series_name),
                    }
                )
                if s_created:
                    self.stdout.write(
                        self.style.NOTICE(f'Created Series: {series.name} for {brand.name}')
                    )

                # Create ProductModel with proper relationships (fields: name from CSV, plus dummy values for others)
                try:
                    product_model, pm_created = ProductModel.objects.get_or_create(
                        name=model_name,
                        brand=brand,
                        defaults={
                            'series': series
                        }
                    )
                    if pm_created:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'Created ProductModel: {product_model.name}')
                        )
                    else:
                        # Update series if it's different (in case CSV data changed)
                        if product_model.series != series:
                            product_model.series = series
                            product_model.save()
                            self.stdout.write(
                                self.style.WARNING(
                                    f'Updated ProductModel {product_model.name} series to {series.name}'
                                )
                            )

                except Exception as e:
                    self.stderr.write(
                        self.style.ERROR(f'Error creating ProductModel for model "{model_name}": {str(e)}')
                    )
                    skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Import complete.'
                f' Created: {created_count}, Skipped: {skipped_count}'
            )
        )

    def _get_icon_for_device_category(self, device_category):
        """Generate icon name based on device category"""
        icon_mapping = {
            'smartphone': 'smartphone',
            'phone': 'smartphone',
            'mobile': 'smartphone',
            'laptop': 'laptop',
            'desktop': 'desktop_mac',
            'tablet': 'tablet',
            'smartwatch': 'watch',
        }
        category_lower = device_category.lower()
        return icon_mapping.get(category_lower, 'devices')

    def _get_domain_for_device_category(self, device_category):
        """Determine domain based on device category"""
        phone_like = ['smartphone', 'phone', 'mobile', 'smartwatch']
        computer_like = ['laptop', 'desktop', 'tablet']
        
        category_lower = device_category.lower()
        if category_lower in phone_like:
            return 'PHONES'
        elif category_lower in computer_like:
            return 'COMPUTERS'
        else:
            # Default to PHONES for phone-like devices, COMPUTERS for others
            return 'PHONES' if any(keyword in category_lower for keyword in ['phone', 'watch']) else 'COMPUTERS'

    def _get_market_segment_for_series(self, series_name):
        """Generate market segment based on series name keywords"""
        series_lower = series_name.lower()
        
        premium_keywords = ['pro', 'ultra', 'max', 'premium']
        mid_range_keywords = ['a', 'm', 'se', 'lite']
        
        if any(keyword in series_lower for keyword in premium_keywords):
            return 'PREMIUM'
        elif any(keyword in series_lower for keyword in mid_range_keywords):
            return 'MID_RANGE'
        else:
            return 'FLAGSHIP'