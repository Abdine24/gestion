# 🏢 GestionLocative Pro - Progressive Web App (PWA)

Application web progressive moderne dédiée aux propriétaires bailleurs et gestionnaires immobiliers pour le suivi des logements, locataires, encaissements de loyers, calcul automatique des impayés, dépenses de réfection et bilan de rentabilité.

Développée avec **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL)**, **Resend** et **PWA Service Worker**.

---

## 🌟 Fonctionnalités Clés

### 📊 1. Tableau de Bord Financier & Décisionnel
- **Revenus du mois** comparés aux loyers théoriques attendus.
- **Créances totales** : calcul en temps réel des impayés et des locataires en retard.
- **Dépenses de réfection & entretien** du mois en cours.
- **Bénéfice Net d'exploitation** et marge locative en pourcentage.
- **Graphique financier interactif** (évolution sur 6 mois des revenus vs dépenses).
- **Taux d'occupation global** avec jauge d'activité.
- **Alertes instantanées** avec relance WhatsApp en 1 clic.

### 🏡 2. Gestion du Parc Immobilier
- Fiches complètes des logements (Nom, Adresse, Nb chambres, Loyer mensuel, Photos).
- Statuts dynamiques : *Disponible*, *Occupée*, *En rénovation*.
- Suivi de la rentabilité nette par bien immobilier (Revenus perçus - Travaux cumulés).
- Ajout, modification et suppression de biens.

### 👥 3. Gestion des Locataires & Relances Intelligentes
- Coordonnées complètes (Téléphone, WhatsApp, Profession, Dates de bail).
- Statut du loyer du mois (*À jour* ou *En retard avec montant exact*).
- **Relance WhatsApp directe en 1 clic** avec message courtois pré-rédigé.
- **Appel téléphonique direct** depuis l'application mobile.
- Historique des baux et des paiements par locataire.

### 🧾 4. Encaissement des Loyers & Quittances PDF Officielles
- Enregistrement des règlements (Espèces, Virement bancaire, Mobile Money Wave/Orange/MTN, Chèque).
- Prise en charge des acomptes et règlements partiels.
- **Génération automatique et instantanée de Quittance de Loyer au format PDF** (conforme aux normes légales, cachet pour acquit et coordonnées complètes).
- **Envoi des quittances par Email via l'API Resend**.

### 🛠️ 5. Suivi des Dépenses & Travaux
- Déclaration des travaux (Plomberie, Réfection, Entretien, Électricité, Taxes foncières).
- Association des dépenses à un logement spécifique et/ou à un locataire.
- Archivage des liens de justificatifs (factures, devis, reçus).

### 📈 6. Rapports Financiers & Exports
- **Export Microsoft Excel (.xlsx)** complet multi-onglets (Biens, Locataires, Paiements, Dépenses).
- **Export Bilan Financier PDF** avec synthèse des marges d'exploitation.

### 📱 7. Progressive Web App (PWA) & Fonctionnement Hors-ligne
- Installable en 1 clic sur Smartphone (Android & iOS Safari) et Ordinateur (Chrome, Edge).
- Service Worker intégré (`sw.js`) pour mise en cache de l'application.
- Fonctionnement en **Mode Hors-ligne / Local** avec synchronisation localStorage sécurisée.

---

## 🚀 Installation & Démarrage Local

### Prérequis
- Node.js 18+ (recommandé Node.js 20+)
- npm ou pnpm

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancement du serveur de développement
```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Configuration de la Base de Données Supabase (Optionnel)

L'application fonctionne immédiatement en **Mode Démo / Stockage Local Sécurisé**. Pour synchroniser vos données dans le Cloud avec **Supabase** :

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez le **SQL Editor** dans Supabase et exécutez le script fourni dans `supabase/schema.sql`.
3. Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
RESEND_API_KEY=re_votre_cle_resend_optionnelle
```

---

## 📁 Architecture du Projet

```
├── public/
│   ├── manifest.json         # Manifest PWA (icônes, standalone, couleurs)
│   ├── sw.js                 # Service Worker (gestion du cache & offline)
│   ├── icon-192.svg          # Icône d'application 192px
│   └── icon-512.svg          # Icône d'application 512px
├── src/
│   ├── app/
│   │   ├── api/send-email/   # Route API pour l'envoi d'emails Resend
│   │   ├── globals.css       # Design system & Tailwind CSS
│   │   ├── layout.tsx        # Layout racine PWA & métadonnées
│   │   └── page.tsx          # Page principale et contrôleur d'onglets
│   ├── components/
│   │   ├── Dashboard.tsx     # Tableau de bord financier & alertes impayés
│   │   ├── MaisonsView.tsx   # Gestion des biens immobiliers
│   │   ├── LocatairesView.tsx# Gestion locataires & bouton WhatsApp direct
│   │   ├── PaiementsView.tsx # Historique des loyers & quittances PDF
│   │   ├── DepensesView.tsx  # Suivi des travaux & réfections
│   │   ├── RapportsView.tsx  # Exports Excel & PDF
│   │   ├── ParametresView.tsx# Profil bailleur, devise & sauvegardes
│   │   ├── Navbar.tsx        # En-tête avec compteur d'alertes & devise
│   │   ├── Sidebar.tsx       # Navigation desktop & tiroir mobile
│   │   ├── MobileBottomNav.tsx# Barre de navigation mobile inférieure
│   │   └── PWAInstallBanner.tsx # Bannière d'installation PWA native
│   ├── lib/
│   │   ├── excelExport.ts    # Générateur d'export Excel (.xlsx)
│   │   ├── pdfGenerator.ts   # Générateur de quittance et bilan PDF (jsPDF)
│   │   ├── storage.ts        # Service de persistance (LocalStorage + Supabase)
│   │   └── supabase.ts       # Client Supabase
│   └── types/
│       └── index.ts          # Modèles TypeScript complets
├── supabase/
│   └── schema.sql            # Script SQL PostgreSQL pour Supabase
└── Cahier_Charges_GestionLocative_Pro.md
```

---

## 🚢 Déploiement en Production (Vercel)

Déployez ce projet sur [Vercel](https://vercel.com) en connectant simplement votre dépôt GitHub :
`https://github.com/Abdine24/gestion.git`
