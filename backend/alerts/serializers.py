from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'name', 'description', 'module', 'severity',
            'check_condition',  # Ajout du champ manquant
            'condition_type', 'threshold_value', 'comparison_operator',
            'condition_field', 'compare_to', 'categories',
            'product', 'product_name',
            'notification_channels', 'recipients',
            'custom_subject', 'custom_body',
            'schedule', 'custom_schedule', 'repeat_until_resolved',
            'is_active', 'is_paused', 'tags',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'user_email', 'created_at', 'updated_at']

    def validate_categories(self, value):
        """Accept category ids as int/str and normalize to a list of ints."""
        if value in (None, ""):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("Le champ catégories doit être une liste.")

        normalized = []
        for item in value:
            try:
                normalized.append(int(item))
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    f"Catégorie invalide: {item}. Utilisez des IDs numériques."
                )
        return normalized
