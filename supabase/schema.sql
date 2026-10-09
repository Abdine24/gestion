-- ========================================================
-- Schema SQL pour Supabase - GestionLocative Pro
-- Exécutez ce script dans la console Supabase (SQL Editor)
-- ========================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Maisons
CREATE TABLE IF NOT EXISTS public.maisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    adresse TEXT NOT NULL,
    description TEXT,
    nombre_chambres INTEGER NOT NULL DEFAULT 1,
    loyer_mensuel NUMERIC(12, 2) NOT NULL,
    statut TEXT NOT NULL CHECK (statut IN ('disponible', 'occupee', 'en_renovation')) DEFAULT 'disponible',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Locataires
CREATE TABLE IF NOT EXISTS public.locataires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    whatsapp TEXT,
    profession TEXT,
    date_debut_contrat DATE NOT NULL,
    date_fin_contrat DATE,
    maison_id UUID REFERENCES public.maisons(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Paiements
CREATE TABLE IF NOT EXISTS public.paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locataire_id UUID NOT NULL REFERENCES public.locataires(id) ON DELETE CASCADE,
    maison_id UUID REFERENCES public.maisons(id) ON DELETE SET NULL,
    montant NUMERIC(12, 2) NOT NULL,
    mois TEXT NOT NULL,
    annee INTEGER NOT NULL,
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    moyen_paiement TEXT DEFAULT 'especes' CHECK (moyen_paiement IN ('especes', 'virement', 'cheque', 'mobile_money')),
    statut TEXT DEFAULT 'paye' CHECK (statut IN ('paye', 'partiel', 'en_attente')),
    commentaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Dépenses
CREATE TABLE IF NOT EXISTS public.depenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maison_id UUID NOT NULL REFERENCES public.maisons(id) ON DELETE CASCADE,
    locataire_id UUID REFERENCES public.locataires(id) ON DELETE SET NULL,
    montant NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    categorie TEXT DEFAULT 'refection' CHECK (categorie IN ('refection', 'entretien', 'plomberie', 'electricite', 'taxe', 'autre')),
    date_depense DATE NOT NULL DEFAULT CURRENT_DATE,
    justificatif_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security (RLS)
ALTER TABLE public.maisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locataires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depenses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS permissives pour la démo / authentifiés
CREATE POLICY "Permettre tout accès aux maisons" ON public.maisons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permettre tout accès aux locataires" ON public.locataires FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permettre tout accès aux paiements" ON public.paiements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permettre tout accès aux depenses" ON public.depenses FOR ALL USING (true) WITH CHECK (true);

-- Index pour performances de requêtes
CREATE INDEX IF NOT EXISTS idx_locataires_maison ON public.locataires(maison_id);
CREATE INDEX IF NOT EXISTS idx_paiements_locataire ON public.paiements(locataire_id);
CREATE INDEX IF NOT EXISTS idx_paiements_date ON public.paiements(date_paiement);
CREATE INDEX IF NOT EXISTS idx_depenses_maison ON public.depenses(maison_id);
