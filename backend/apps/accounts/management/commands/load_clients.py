import csv
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Profile

User = get_user_model()

class Command(BaseCommand):
    help = 'Loads client data from clients_raw.csv into User and Profile models.'

    def handle(self, *args, **options):
        csv_file_path = os.path.join('source_data', 'clients_raw.csv')

        if not os.path.exists(csv_file_path):
            self.stderr.write(self.style.ERROR(f'CSV file not found at {csv_file_path}'))
            return

        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                client_id = row.get('ID')
                full_name = row.get('Nom', '').strip()
                phone = row.get('Telephone', '').strip()
                email = row.get('Mail', '').strip()
                address = row.get('Adresse', '').strip()

                # Split full name into first and last name (basic approach)
                name_parts = full_name.split(' ', 1)
                first_name = name_parts[0] if name_parts else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''

                # Create or update User
                user, created = User.objects.get_or_create(
                    username=f'client_{client_id}', # Using a unique username
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': email if email else f'client_{client_id}@example.com', # Provide a default email if empty
                    }
                )
                if not created:
                    user.first_name = first_name
                    user.last_name = last_name
                    if email: # Only update email if provided in CSV
                        user.email = email
                    user.save()

                # Create or update Profile
                profile, created = Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        'phone_number': phone,
                        'address': address,
                        'type': 'Client', # Set profile type to Client
                    }
                )
                if not created:
                    profile.phone_number = phone
                    profile.address = address
                    profile.type = 'Client'
                    profile.save()

                self.stdout.write(self.style.SUCCESS(f'Successfully processed client: {full_name} (ID: {client_id})'))

        self.stdout.write(self.style.SUCCESS('Client data loading complete.'))
