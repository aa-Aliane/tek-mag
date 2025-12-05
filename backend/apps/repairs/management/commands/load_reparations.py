import csv
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.repairs.models.repair import Repair
from apps.tech.models import ProductModel
from datetime import datetime
from decimal import Decimal
import re

User = get_user_model()

class Command(BaseCommand):
    help = 'Loads reparation data from reparations_raw.csv into Repair model.'

    def handle(self, *args, **options):
        csv_file_path = os.path.join('source_data', 'reparations_raw.csv')

        if not os.path.exists(csv_file_path):
            self.stderr.write(self.style.ERROR(f'CSV file not found at {csv_file_path}'))
            return

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                uid = row.get('UID', '').strip()
                date_str = row.get('Date', '').strip()
                client_name = row.get('Client', '').strip()
                model_name = row.get('Model', '').strip()
                description = row.get('Description de la Panne', '').strip()
                password = row.get('Mot de Pass', '').strip()
                price_str = row.get('Prix', '0.00').strip().replace('$', '')
                card_payment_str = row.get('Carte', '0.00').strip().replace('$', '')
                cash_payment_str = row.get('Espèce', '0.00').strip().replace('$', '')
                comment = row.get('Commentaire', '').strip()
                device_photo_path = row.get("Photo de l'appareil", '').strip()
                file_path = row.get('File', '').strip()

                if not uid:
                    self.stderr.write(self.style.WARNING(f'Skipping row due to missing UID: {row}'))
                    continue

                # Date parsing
                repair_date = None
                try:
                    # Assuming date format is M/D/YY or M/D/YYYY
                    repair_date = datetime.strptime(date_str, '%m/%d/%y').date()
                except ValueError:
                    try:
                        repair_date = datetime.strptime(date_str, '%m/%d/%Y').date()
                    except ValueError:
                        self.stderr.write(self.style.WARNING(f'Could not parse date "{date_str}" for UID {uid}. Skipping date.'))

                # Client matching
                client_user = None
                if client_name:
                    # Try to match by full name (first_name + last_name) or username
                    name_parts = client_name.split(' ', 1)
                    first_name = name_parts[0] if name_parts else ''
                    last_name = name_parts[1] if len(name_parts) > 1 else ''

                    # Attempt to find user by first_name and last_name
                    try:
                        client_user = User.objects.get(first_name=first_name, last_name=last_name)
                    except User.DoesNotExist:
                        # If not found, try by username (e.g., client_ID)
                        try:
                            client_user = User.objects.get(username=f'client_{client_name}') # This might not work if client_name is not the ID
                        except User.DoesNotExist:
                            self.stderr.write(self.style.WARNING(f'Client "{client_name}" not found for UID {uid}. Skipping client association.'))
                    except User.MultipleObjectsReturned:
                        self.stderr.write(self.style.WARNING(f'Multiple clients found for "{client_name}" for UID {uid}. Skipping client association.'))
                
                if not client_user:
                    self.stderr.write(self.style.WARNING(f'No client user found or associated for UID {uid}. Repair will be created without a client.'))


                # ProductModel matching
                product_model_obj = None
                if model_name:
                    try:
                        # Case-insensitive search for product model name
                        product_model_obj = ProductModel.objects.get(name__iexact=model_name)
                    except ProductModel.DoesNotExist:
                        self.stderr.write(self.style.WARNING(f'Product model "{model_name}" not found for UID {uid}. Skipping product model association.'))
                    except ProductModel.MultipleObjectsReturned:
                        self.stderr.write(self.style.WARNING(f'Multiple product models found for "{model_name}" for UID {uid}. Skipping product model association.'))

                # Decimal conversions
                try:
                    price = Decimal(price_str)
                except Exception:
                    price = Decimal('0.00')
                    self.stderr.write(self.style.WARNING(f'Could not parse price "{price_str}" for UID {uid}. Defaulting to 0.00.'))

                try:
                    card_payment = Decimal(card_payment_str)
                except Exception:
                    card_payment = Decimal('0.00')
                    self.stderr.write(self.style.WARNING(f'Could not parse card payment "{card_payment_str}" for UID {uid}. Defaulting to 0.00.'))

                try:
                    cash_payment = Decimal(cash_payment_str)
                except Exception:
                    cash_payment = Decimal('0.00')
                    self.stderr.write(self.style.WARNING(f'Could not parse cash payment "{cash_payment_str}" for UID {uid}. Defaulting to 0.00.'))

                # Create or update Repair
                repair, created = Repair.objects.get_or_create(
                    uid=uid,
                    defaults={
                        'date': repair_date,
                        'client': client_user,
                        'product_model': product_model_obj,
                        'description': description,
                        'password': password,
                        'price': price,
                        'card_payment': card_payment,
                        'cash_payment': cash_payment,
                        'comment': comment,
                        # For device_photo and file, we'll just store the path string for now.
                        # Actual file handling (uploading, saving) is more complex and out of scope for a simple loader.
                        'device_photo': device_photo_path,
                        'file': file_path,
                    }
                )
                if not created:
                    # Update existing repair
                    repair.date = repair_date
                    repair.client = client_user
                    repair.product_model = product_model_obj
                    repair.description = description
                    repair.password = password
                    repair.price = price
                    repair.card_payment = card_payment
                    repair.cash_payment = cash_payment
                    repair.comment = comment
                    repair.device_photo = device_photo_path
                    repair.file = file_path
                    repair.save()

                self.stdout.write(self.style.SUCCESS(f'Successfully processed repair: {uid}'))

        self.stdout.write(self.style.SUCCESS('Reparation data loading complete.'))
