'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building2, 
  Mail, 
  Database, 
  Key, 
  RotateCcw, 
  Save, 
  Check, 
  Download, 
  Upload,
  Code
} from 'lucide-react';
import { ProprietaireSettings, Maison, Locataire, Paiement, Depense } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

interface ParametresViewProps {
  settings: ProprietaireSettings;
  onSaveSettings: (settings: ProprietaireSettings) => void;
  onResetDemo: () => void;
  maisons: Maison[];
  locataires: Locataire[];
  paiements: Paiement[];
  depenses: Depense[];
}

export default function ParametresView({
  settings,
  onSaveSettings,
  onResetDemo,
  maisons,
  locataires,
  paiements,
  depenses
}: ParametresViewProps) {
  const [formData, setFormData] = useState<ProprietaireSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backup = {
      date: new Date().toISOString(),
      settings: formData,
      maisons,
      locataires,
      paiements,
      depenses
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gestionlocative_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Paramètres & Configuration
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Personnalisez les coordonnées sur vos quittances, votre devise et vos connexions d&apos;API (Supabase, Resend).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Bailleur / Agence Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            Informations du Bailleur & Agence (En-tête des Quittances)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom complet du Bailleur / Propriétaire *</label>
              <input
                type="text"
                required
                value={formData.nom_bailleur}
                onChange={(e) => setFormData({ ...formData, nom_bailleur: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l&apos;Agence / Enseigne</label>
              <input
                type="text"
                value={formData.nom_agence}
                onChange={(e) => setFormData({ ...formData, nom_agence: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone de contact *</label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email professionnel *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse postale</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ville et Pays</label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Devise et Affichage
          </h2>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Devise principale</label>
            <select
              value={formData.devise}
              onChange={(e) => setFormData({ ...formData, devise: e.target.value as 'FCFA' | 'EUR' | 'USD' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
            >
              <option value="FCFA">Franc CFA (FCFA)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar US ($)</option>
            </select>
          </div>
        </div>

        {/* Resend & Supabase Cloud Integration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Intégrations Cloud (Supabase & Resend)
          </h2>

          <div className="space-y-4">
            {/* Supabase status */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  Statut Supabase : {isSupabaseConfigured ? 'Connecté & Synchronisé' : 'Mode Stockage Local / PWA hors-ligne'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pour connecter votre propre instance Supabase, renseignez les variables d&apos;environnement <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans votre fichier <code>.env.local</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Code className="w-3.5 h-3.5" />
                Script SQL Supabase
              </button>
            </div>

            {/* Resend API Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Clé API Resend (Pour l&apos;envoi automatique des quittances par email)</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.resend_api_key || ''}
                  onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                  placeholder="re_123456789..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Laissez vide pour utiliser le mode de simulation sans clé.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition active:scale-95"
            >
              <Save className="w-4 h-4 text-slate-950" />
              Enregistrer les Paramètres
            </button>

            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Enregistré avec succès !
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              title="Exporter les données au format JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Sauvegarde JSON
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Voulez-vous réinitialiser toutes les données avec les données de démonstration ?')) {
                  onResetDemo();
                }
              }}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition"
              title="Réinitialiser avec les données d'exemple"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser Démo
            </button>
          </div>
        </div>

      </form>

      {/* SQL Script View Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-400" />
                Script SQL PostgreSQL pour Supabase
              </h3>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3">
              Copiez ce script et collez-le dans le <strong>SQL Editor</strong> de votre projet Supabase pour créer instantanément les tables <code>maisons</code>, <code>locataires</code>, <code>paiements</code>, <code>depenses</code> et les index de performance :
            </p>

            <div className="mt-3 flex-1 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
              <pre className="whitespace-pre-wrap">
{`-- Schema SQL pour Supabase - GestionLocative Pro
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

CREATE TABLE IF NOT EXISTS public.paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locataire_id UUID NOT NULL REFERENCES public.locataires(id) ON DELETE CASCADE,
    maison_id UUID REFERENCES public.maisons(id) ON DELETE SET NULL,
    montant NUMERIC(12, 2) NOT NULL,
    mois TEXT NOT NULL,
    annee INTEGER NOT NULL,
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    moyen_paiement TEXT DEFAULT 'especes',
    statut TEXT DEFAULT 'paye',
    commentaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.depenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maison_id UUID NOT NULL REFERENCES public.maisons(id) ON DELETE CASCADE,
    locataire_id UUID REFERENCES public.locataires(id) ON DELETE SET NULL,
    montant NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    categorie TEXT DEFAULT 'refection',
    date_depense DATE NOT NULL DEFAULT CURRENT_DATE,
    justificatif_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `CREATE TABLE IF NOT EXISTS public.maisons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nom TEXT NOT NULL, adresse TEXT NOT NULL, description TEXT, nombre_chambres INTEGER NOT NULL DEFAULT 1, loyer_mensuel NUMERIC(12, 2) NOT NULL, statut TEXT NOT NULL CHECK (statut IN ('disponible', 'occupee', 'en_renovation')) DEFAULT 'disponible', image_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS public.locataires (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nom TEXT NOT NULL, prenom TEXT NOT NULL, telephone TEXT NOT NULL, whatsapp TEXT, profession TEXT, date_debut_contrat DATE NOT NULL, date_fin_contrat DATE, maison_id UUID REFERENCES public.maisons(id) ON DELETE SET NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS public.paiements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), locataire_id UUID NOT NULL REFERENCES public.locataires(id) ON DELETE CASCADE, maison_id UUID REFERENCES public.maisons(id) ON DELETE SET NULL, montant NUMERIC(12, 2) NOT NULL, mois TEXT NOT NULL, annee INTEGER NOT NULL, date_paiement DATE NOT NULL DEFAULT CURRENT_DATE, moyen_paiement TEXT DEFAULT 'especes', statut TEXT DEFAULT 'paye', commentaire TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());\nCREATE TABLE IF NOT EXISTS public.depenses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), maison_id UUID NOT NULL REFERENCES public.maisons(id) ON DELETE CASCADE, locataire_id UUID REFERENCES public.locataires(id) ON DELETE SET NULL, montant NUMERIC(12, 2) NOT NULL, description TEXT NOT NULL, categorie TEXT DEFAULT 'refection', date_depense DATE NOT NULL DEFAULT CURRENT_DATE, justificatif_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());`
                  );
                  alert('Code SQL copié dans le presse-papier !');
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Copier le code SQL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
