from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Repair

@receiver(pre_save, sender=Repair)
def notify_client_on_status_change(sender, instance, **kwargs):
    # 1. Check if this is an update (not a new creation)
    if instance.pk:
        try:
            old_instance = Repair.objects.get(pk=instance.pk)
        except Repair.DoesNotExist:
            return

        # 2. Check if the status field actually changed
        if old_instance.status != instance.status:
            
            # 3. Check if the Admin has enabled notifications
            # (Assuming you have a setting or a 'SiteConfig' model)
            notifications_enabled = getattr(settings, 'ENABLE_REPAIR_EMAILS', True)

            if notifications_enabled:
                send_mail(
                    subject=f"Update on your Repair #{instance.id}",
                    message=f"Hi {instance.client.username}, your repair status is now: {instance.status}.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.client.email],
                    fail_silently=False,
                )