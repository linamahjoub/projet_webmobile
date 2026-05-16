# orders/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from orders.models import OrderItem
from stock.models import Product
from alerts.services import evaluate_stock_alerts_for_product
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=OrderItem)
def reduce_product_stock_on_order(sender, instance, created, **kwargs):
    """
    Déclenché après la création ou modification d'un article de commande.
    Réduit le stock du produit commandé et vérifie les alertes.
    """
    order_item = instance
    product = order_item.product
    quantity_ordered = order_item.quantity
    
    # Vérifier s'il y a une variation de quantité lors d'une mise à jour
    if not created:
        # Cas de modification : il faudrait comparer avec l'ancien état
        # Pour simplifier, on traite surtout la création
        logger.info(f"OrderItem modifié: {product.name}")
        return
    
    # Cas de création d'une nouvelle commande
    logger.info(f"🛒 Nouvelle commande détectée: {product.name} x{quantity_ordered}")
    
    # Réduire le stock du produit
    old_quantity = product.quantity
    product.quantity -= quantity_ordered
    
    # S'assurer que la quantité ne soit pas négative
    if product.quantity < 0:
        logger.warning(f"⚠️ Stock négatif détecté pour {product.name}. Ancien: {old_quantity}, Commandé: {quantity_ordered}")
        product.quantity = 0
    
    product.save(update_fields=['quantity'])
    
    logger.info(f"📦 Stock mis à jour: {product.name} ({old_quantity} → {product.quantity})")
    
    # Vérifier si le nouveau stock déclenche une alerte
    result = evaluate_stock_alerts_for_product(product)
    if result['triggered'] > 0:
        logger.info(f"🚨 {result['triggered']} alerte(s) déclenchée(s) suite à la commande de {product.name}")
