import random
from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.models import EmailConfirmation, EmailAddress
from django.urls import reverse
from .models import EmailVerificationCode

from django.core.mail import send_mail

class CustomAccountAdapter(DefaultAccountAdapter):
    def user_email_confirm(self, request, user, signup=True):
        email_address = EmailAddress.objects.filter(user=user, primary=True).first()
        if not email_address:
            email = user.email
            if email:
                email_address, created = EmailAddress.objects.get_or_create(
                    user=user, email=email, defaults={"primary": True, "verified": False}
                )
            else:
                return

        # Generate a 6-digit code
        six_digit_code = str(random.randint(100000, 999999))

        # Store the 6-digit code in our new model
        verification_code_instance, created = EmailVerificationCode.objects.update_or_create(
            user=user,
            defaults={'code': six_digit_code}
        )

        # Send the email directly using Django's send_mail
        subject = "Your Email Verification Code"
        message = f"Your verification code is: {six_digit_code}"
        from_email = "aliane781@gmail.com"  # Use your configured FROM_EMAIL
        recipient_list = [email_address.email]

        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

        return None # No confirmation object needed from allauth

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        # This method is no longer used as we are sending email directly in user_email_confirm
        pass

