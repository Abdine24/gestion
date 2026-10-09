# Cahier des Charges
# GestionLocative Pro

## 1. Présentation du Projet

### Nom du Projet
GestionLocative Pro

### Type d’Application
Progressive Web App (PWA)

### Objectif
Développer une application web moderne permettant à un propriétaire immobilier de suivre efficacement :

- Les locataires
- Les loyers perçus
- Les impayés
- Les créances
- Les dépenses de réfection
- Les revenus générés
- La rentabilité globale des biens immobiliers

L'application devra fonctionner parfaitement sur ordinateur, tablette et smartphone.

---

## Technologies

- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Supabase
- PostgreSQL
- Resend
- Vercel

---

## Modules Principaux

### Tableau de Bord
- Revenus du mois
- Créances totales
- Dépenses du mois
- Bénéfice net
- Graphiques financiers
- Alertes rapides

### Gestion des Maisons
- Nom
- Adresse
- Description
- Nombre de chambres
- Loyer
- Statut

### Gestion des Locataires
- Nom
- Prénom
- Téléphone
- WhatsApp
- Profession
- Date début contrat
- Date fin contrat
- Maison associée

### Paiements
- Enregistrement des loyers
- Historique
- Calcul automatique des impayés

### Dépenses
- Dépenses générales
- Dépenses liées à un locataire
- Justificatifs

### Rapports
- PDF
- Excel

### Notifications
- Notifications PWA
- Emails via Resend

---

## Base de Données

### maisons
- id
- nom
- adresse
- description
- nombre_chambres
- loyer_mensuel
- statut

### locataires
- id
- nom
- prenom
- telephone
- whatsapp
- profession
- date_debut_contrat
- date_fin_contrat
- maison_id

### paiements
- id
- locataire_id
- montant
- mois
- annee
- date_paiement

### depenses
- id
- maison_id
- locataire_id
- montant
- description
- date_depense

---

## MVP

✅ Authentification
✅ Tableau de bord
✅ Gestion des maisons
✅ Gestion des locataires
✅ Paiements
✅ Dépenses
✅ Calcul des impayés
✅ Rapports PDF
✅ Emails via Resend
