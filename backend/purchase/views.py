from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.http import FileResponse
import logging
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderCreateUpdateSerializer, PurchaseOrderItemSerializer
from .pdf_generator import PurchaseOrderPDFGenerator

logger = logging.getLogger(__name__)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    API ViewSet pour gérer les Bons d'Achat (Purchase Orders)
    Endpoints:
    - GET /api/purchase-orders/          -> List all
    - POST /api/purchase-orders/          -> Create
    - GET /api/purchase-orders/{id}/      -> Detail
    - PUT /api/purchase-orders/{id}/      -> Update
    - DELETE /api/purchase-orders/{id}/   -> Delete
    - GET /api/purchase-orders/by-status/{status}/ -> Filter by status
    """
    
    queryset = PurchaseOrder.objects.all().select_related('supplier', 'created_by').prefetch_related('items')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PurchaseOrderCreateUpdateSerializer
        return PurchaseOrderSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create pour logger les erreurs de serializer"""
        print(f"\n\n{'='*80}")
        print(f"🔵 PURCHASE ORDER CREATE REQUEST")
        print(f"{'='*80}")
        print(f"📥 Request data: {request.data}")
        print(f"{'='*80}\n")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"\n❌ SERIALIZER VALIDATION FAILED")
            print(f"Errors: {serializer.errors}")
            logger.error(f"❌ Serializer errors: {serializer.errors}")
            logger.error(f"📥 Request data: {request.data}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            print(f"\n✅ SERIALIZER VALID - CREATING PURCHASE ORDER")
            self.perform_create(serializer)
            print(f"✅ PURCHASE ORDER CREATED SUCCESSFULLY")
            
            # Retourner la réponse avec le serializer read-only
            instance = self.get_queryset().get(id=serializer.instance.id)
            response_serializer = PurchaseOrderSerializer(instance)
            headers = self.get_success_headers(response_serializer.data)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"\n❌ ERROR DURING CREATION: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")
            logger.error(f"❌ Error during creation: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Override update pour logger les erreurs de serializer"""
        print(f"\n\n{'='*80}")
        print(f"PURCHASE ORDER UPDATE REQUEST")
        print(f"{'='*80}")
        print(f"Request data: {request.data}")
        print(f"{'='*80}\n")
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            print(f"\nSERIALIZER VALIDATION FAILED")
            print(f"Errors: {serializer.errors}")
            logger.error(f"Serializer errors: {serializer.errors}")
            logger.error(f"Request data: {request.data}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            print(f"\nSERIALIZER VALID - UPDATING PURCHASE ORDER")
            self.perform_update(serializer)
            print(f"PURCHASE ORDER UPDATED SUCCESSFULLY")
            
            # Retourner la réponse avec le serializer read-only
            updated_instance = self.get_queryset().get(id=instance.id)
            response_serializer = PurchaseOrderSerializer(updated_instance)
            return Response(response_serializer.data)
        except Exception as e:
            print(f"\nERROR DURING UPDATE: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")
            logger.error(f"Error during update: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_queryset(self):
        """Filtrer les commandes selon le rôle utilisateur"""
        user = self.request.user
        
        # Super admin et staff voient tout
        if user.is_superuser or user.is_staff:
            return self.queryset
        
        # Responsable appro voit les commandes qu'il a créées
        if user.role == 'responsable_appro':
            return self.queryset.filter(created_by=user)
        
        # Les autres utilisateurs ne voient rien
        return self.queryset.none()
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Récupérer les commandes par statut: /api/purchase-orders/by-status/?status=pending"""
        status_filter = request.query_params.get('status', None)
        
        if not status_filter:
            return Response({'error': 'Status parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(status=status_filter)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Récupérer les statistiques des commandes: /api/purchase-orders/statistics/"""
        queryset = self.get_queryset()
        
        stats = {
            'total_orders': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'approved': queryset.filter(status='approved').count(),
            'sent': queryset.filter(status='sent').count(),
            'delivered': queryset.filter(status='delivered').count(),
            'cancelled': queryset.filter(status='cancelled').count(),
            'total_amount': sum(po.total_amount for po in queryset),
        }
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approuver une commande: POST /api/purchase-orders/{id}/approve/
        Seul le superadmin peut approuver
        """
        # Vérifier que l'utilisateur est superadmin
        if not request.user.is_superuser:
            return Response(
                {'error': 'Seul l\'administrateur peut approuver une commande'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        purchase_order = self.get_object()
        purchase_order.status = 'approved'
        purchase_order.save()
        serializer = self.get_serializer(purchase_order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Envoyer une commande: POST /api/purchase-orders/{id}/send/"""
        purchase_order = self.get_object()
        purchase_order.status = 'sent'
        purchase_order.save()
        serializer = self.get_serializer(purchase_order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """Marquer comme livrée: POST /api/purchase-orders/{id}/deliver/"""
        purchase_order = self.get_object()
        purchase_order.status = 'delivered'
        purchase_order.save()
        serializer = self.get_serializer(purchase_order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler une commande: POST /api/purchase-orders/{id}/cancel/"""
        purchase_order = self.get_object()
        purchase_order.status = 'cancelled'
        purchase_order.save()
        serializer = self.get_serializer(purchase_order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Exporter une commande en PDF: GET /api/purchase-orders/{id}/export_pdf/"""
        try:
            purchase_order = self.get_object()
            
            # Générer le PDF
            pdf_generator = PurchaseOrderPDFGenerator(purchase_order)
            pdf_buffer = pdf_generator.generate()
            
            # Retourner le fichier PDF
            filename = f"bon_achat_{purchase_order.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            response = FileResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération du PDF: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Erreur lors de la génération du PDF: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
