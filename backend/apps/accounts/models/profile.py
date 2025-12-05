from django.db import models

from .user import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )
    qr_code = models.ImageField(
        upload_to="qr_codes/%Y/%m/", blank=True, null=True, verbose_name="QR Code"
    )

    TYPE_CHOICES = [
        ("Client", "Client"),
        ("Staff", "Staff"),
        ("Admin", "Admin"),
    ]

    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="Admin")

    def __str__(self):
        return f"{self.user.username} Profile"
