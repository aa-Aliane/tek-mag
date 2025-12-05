from dj_rest_auth.registration.serializers import RegisterSerializer
from allauth.account.models import EmailConfirmation
from apps.accounts.models import EmailVerificationCode
import random

class CustomRegisterSerializer(RegisterSerializer):
    def save(self, request):
        user = super().save(request)

        # Generate a 6-digit code
        six_digit_code = str(random.randint(100000, 999999))
        print(f"Generated six_digit_code in serializer: {six_digit_code}")

        # Store the 6-digit code in our new model
        verification_code_instance, created = EmailVerificationCode.objects.update_or_create(
            user=user,
            defaults={'code': six_digit_code}
        )
        print(f"Stored six_digit_code in DB from serializer: {verification_code_instance.code}")

        # Get the EmailConfirmation object created by allauth
        # This assumes allauth creates it immediately after user registration
        email_address = user.emailaddress_set.filter(primary=True).first()
        if email_address:
            confirmation = EmailConfirmation.objects.filter(email_address=email_address).order_by('-created').first()
            if confirmation:
                confirmation.six_digit_code = verification_code_instance.code # Attach our custom code
                print(f"Attached six_digit_code to confirmation object from serializer: {confirmation.six_digit_code}")

        return user