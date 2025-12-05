from django.db import models
from django.conf import settings

class EmailVerificationCode(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "accounts"

    def __str__(self):
        return f"Verification code for {self.user.email}: {self.code}"
