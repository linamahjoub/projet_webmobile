# notifications/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from .services import send_notification
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Notification)
def send_notification_on_create(sender, instance, created, **kwargs):
    print(f"🔔 SIGNAL DÉCLENCHÉ - created={created}, id={instance.id}")
    logger.info(f"🔔 SIGNAL DÉCLENCHÉ - created={created}, id={instance.id}")
    
    if created:
        print(f"📧 Nouvelle notification créée: {instance.title}")
        print(f"📋 Canaux demandés: {instance.channels}")
        print(f"👤 Utilisateur: {instance.user.email if instance.user else 'None'}")
        
        # Déclencher l'envoi
        send_notification(instance)
    else:
        print(f"⚠️ Notification non créée (update)")