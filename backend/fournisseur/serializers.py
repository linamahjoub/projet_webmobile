from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "registre_commerce",
            "identifiant_fiscal",
            "secteur",
            "anciennete",
            "contact_name",
            "email",
            "phone",
            "address",
            "city",
            "country",
            "prix_unitaire",
            "conditions_paiement",
            "remise",
            "zone_couverture",
            "minimum_commande",
            "delai_livraison",
            "certifications",
            "garantie_sav",
            "references_clients",
            "capacite_production",
            "delivery_time",
            "vat",
            "payment_method",
            "is_active",
            "note_globale",
            "commentaires",
            "created_at",
            "updated_at",
        ]
