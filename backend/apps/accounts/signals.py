from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps

import secrets
import string

@receiver(post_save, sender=apps.get_model('accounts', 'User'))
def create_user_profile(sender, instance, created, **kwargs):
    User = apps.get_model('accounts', 'User')
    Profile = apps.get_model('accounts', 'Profile')
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=apps.get_model('accounts', 'User'))
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

