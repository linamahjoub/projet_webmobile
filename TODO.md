# TODO

- [ ] Ajouter export PDF “Bon d’achat” (fichier PDF retourné par l’API)
  - [ ] Côté backend: créer un endpoint DRF dans `backend/purchase/views.py` (ex: `@action(detail=True, methods=['get'])` `pdf/`)
  - [ ] Côté backend: implémenter génération PDF (lib: à choisir: WeasyPrint / xhtml2pdf / ReportLab)
  - [ ] Côté backend: ajouter route dans `backend/purchase/urls.py` via l’endpoint action
  - [ ] Côté frontend: ajouter bouton “Exporter PDF” dans `frontend/src/pages/appro/BonAchat.jsx`
  - [ ] Côté frontend: appeler le endpoint, télécharger le blob et nommer le fichier
  - [ ] Tester: créer un bon d’achat, exporter PDF, vérifier contenu (fournisseur, dates, items, total, statut)

