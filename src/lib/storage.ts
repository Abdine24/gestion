import { Maison, Locataire, Paiement, Depense, ProprietaireSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  MAISONS: 'gestionlocative_maisons',
  LOCATAIRES: 'gestionlocative_locataires',
  PAIEMENTS: 'gestionlocative_paiements',
  DEPENSES: 'gestionlocative_depenses',
  SETTINGS: 'gestionlocative_settings',
};

export const DEFAULT_SETTINGS: ProprietaireSettings = {
  nom_bailleur: 'Kouassi Kouamé Christian',
  nom_agence: 'Gestion Immobilière Prestige',
  telephone: '+225 07 08 09 10 11',
  email: 'contact@prestige-immo.com',
  adresse: 'Boulevard de la République, Immeuble Horizon',
  ville: 'Abidjan, Côte d\'Ivoire',
  devise: 'FCFA',
  resend_sender_email: 'loyers@prestige-immo.com'
};

const SEED_MAISONS: Maison[] = [
  {
    id: 'm1',
    nom: 'Villa Les Palmiers - Cocody',
    adresse: 'Cocody Riviera 3, Rue des Ambassades',
    description: 'Belle villa duplex 4 chambres, jardin avec piscine et garage 2 voitures.',
    nombre_chambres: 4,
    loyer_mensuel: 450000,
    statut: 'occupee',
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-01-10'
  },
  {
    id: 'm2',
    nom: 'Résidence L\'Étoile - Marcory',
    adresse: 'Marcory Zone 4, Boulevard de Marseille',
    description: 'Appartement standing 3 pièces, vue dégagée, ascenseur et groupe électrogène.',
    nombre_chambres: 2,
    loyer_mensuel: 280000,
    statut: 'occupee',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-01-15'
  },
  {
    id: 'm3',
    nom: 'Studio Moderne - Plateau',
    adresse: 'Le Plateau, Avenue Chardy',
    description: 'Studio meublé de luxe pour cadre ou expatrié, sécurisé 24h/24.',
    nombre_chambres: 1,
    loyer_mensuel: 180000,
    statut: 'occupee',
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-02-01'
  },
  {
    id: 'm4',
    nom: 'Villa Emeraude - Angré',
    adresse: 'Cocody Angré 8ème Tranche',
    description: 'Villa basse 3 chambres avec cour avant et arrière. Entièrement repeinte.',
    nombre_chambres: 3,
    loyer_mensuel: 320000,
    statut: 'disponible',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-02-10'
  },
  {
    id: 'm5',
    nom: 'Duplex Bel-Air - Bingerville',
    adresse: 'Bingerville, Cité Feh Kessé',
    description: 'Rénovation de la toiture et étanchéité en cours avant mise en location.',
    nombre_chambres: 4,
    loyer_mensuel: 380000,
    statut: 'en_renovation',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-02-20'
  }
];

const SEED_LOCATAIRES: Locataire[] = [
  {
    id: 'l1',
    nom: 'Diallo',
    prenom: 'Mamadou',
    telephone: '+225 05 55 44 33 22',
    whatsapp: '+2250555443322',
    profession: 'Ingénieur Télécom',
    date_debut_contrat: '2025-06-01',
    date_fin_contrat: '2026-05-31',
    maison_id: 'm1',
    created_at: '2025-06-01'
  },
  {
    id: 'l2',
    nom: 'Bakayoko',
    prenom: 'Aïcha',
    telephone: '+225 07 44 33 22 11',
    whatsapp: '+2250744332211',
    profession: 'Directrice Marketing',
    date_debut_contrat: '2025-09-01',
    date_fin_contrat: '2026-08-31',
    maison_id: 'm2',
    created_at: '2025-09-01'
  },
  {
    id: 'l3',
    nom: 'N\'Guessan',
    prenom: 'Patrick',
    telephone: '+225 01 22 33 44 55',
    whatsapp: '+2250122334455',
    profession: 'Consultant Financier',
    date_debut_contrat: '2025-11-01',
    date_fin_contrat: '2026-10-31',
    maison_id: 'm3',
    created_at: '2025-11-01'
  }
];

const SEED_PAIEMENTS: Paiement[] = [
  {
    id: 'p1',
    locataire_id: 'l1',
    maison_id: 'm1',
    montant: 450000,
    mois: 'Février',
    annee: 2026,
    date_paiement: '2026-02-05',
    moyen_paiement: 'virement',
    statut: 'paye',
    commentaire: 'Virement bancaire reçu sur compte principal'
  },
  {
    id: 'p2',
    locataire_id: 'l2',
    maison_id: 'm2',
    montant: 280000,
    mois: 'Février',
    annee: 2026,
    date_paiement: '2026-02-04',
    moyen_paiement: 'mobile_money',
    statut: 'paye',
    commentaire: 'Paiement Wave/Orange Money'
  },
  {
    id: 'p3',
    locataire_id: 'l3',
    maison_id: 'm3',
    montant: 180000,
    mois: 'Février',
    annee: 2026,
    date_paiement: '2026-02-02',
    moyen_paiement: 'especes',
    statut: 'paye',
    commentaire: 'Reçu en mains propres avec quittance'
  },
  {
    id: 'p4',
    locataire_id: 'l1',
    maison_id: 'm1',
    montant: 450000,
    mois: 'Mars',
    annee: 2026,
    date_paiement: '2026-03-05',
    moyen_paiement: 'virement',
    statut: 'paye',
    commentaire: 'Loyer Mars 2026 acquitté'
  },
  {
    id: 'p5',
    locataire_id: 'l2',
    maison_id: 'm2',
    montant: 150000,
    mois: 'Mars',
    annee: 2026,
    date_paiement: '2026-03-08',
    moyen_paiement: 'mobile_money',
    statut: 'partiel',
    commentaire: 'Acompte versé. Solde restant : 130 000 FCFA'
  }
  // Patrick N'Guessan n'a pas encore payé Mars 2026 -> calcul automatique de créance!
];

const SEED_DEPENSES: Depense[] = [
  {
    id: 'd1',
    maison_id: 'm1',
    locataire_id: 'l1',
    montant: 45000,
    description: 'Remplacement du mitigeur de salle de bain et vidange climatiseur',
    categorie: 'plomberie',
    date_depense: '2026-02-12'
  },
  {
    id: 'd2',
    maison_id: 'm5',
    montant: 125000,
    description: 'Achat de peinture et réfection de l\'étanchéité terrasse duplex',
    categorie: 'refection',
    date_depense: '2026-02-28'
  },
  {
    id: 'd3',
    maison_id: 'm2',
    montant: 30000,
    description: 'Entretien mensuel du surpresseur et filtres à eau',
    categorie: 'entretien',
    date_depense: '2026-03-02'
  }
];

export const StorageService = {
  // Maisons
  async getMaisons(): Promise<Maison[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('maisons').select('*').order('nom');
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch error, fallback to local', e);
      }
    }
    if (typeof window === 'undefined') return SEED_MAISONS;
    const raw = localStorage.getItem(STORAGE_KEYS.MAISONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MAISONS, JSON.stringify(SEED_MAISONS));
      return SEED_MAISONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_MAISONS;
    }
  },

  async saveMaison(maison: Maison): Promise<Maison> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('maisons').upsert(maison).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase save error', e);
      }
    }
    const maisons = await this.getMaisons();
    const index = maisons.findIndex(m => m.id === maison.id);
    let updated: Maison[];
    if (index >= 0) {
      updated = [...maisons];
      updated[index] = maison;
    } else {
      updated = [maison, ...maisons];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MAISONS, JSON.stringify(updated));
    }
    return maison;
  },

  async deleteMaison(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('maisons').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    const maisons = await this.getMaisons();
    const filtered = maisons.filter(m => m.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MAISONS, JSON.stringify(filtered));
    }
  },

  // Locataires
  async getLocataires(): Promise<Locataire[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('locataires').select('*').order('nom');
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    if (typeof window === 'undefined') return SEED_LOCATAIRES;
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATAIRES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOCATAIRES, JSON.stringify(SEED_LOCATAIRES));
      return SEED_LOCATAIRES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_LOCATAIRES;
    }
  },

  async saveLocataire(locataire: Locataire): Promise<Locataire> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('locataires').upsert(locataire).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    const locataires = await this.getLocataires();
    const index = locataires.findIndex(l => l.id === locataire.id);
    let updated: Locataire[];
    if (index >= 0) {
      updated = [...locataires];
      updated[index] = locataire;
    } else {
      updated = [locataire, ...locataires];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOCATAIRES, JSON.stringify(updated));
    }

    // Automatically update house status to 'occupee' if assigned
    if (locataire.maison_id) {
      const maisons = await this.getMaisons();
      const m = maisons.find(item => item.id === locataire.maison_id);
      if (m && m.statut !== 'occupee') {
        m.statut = 'occupee';
        await this.saveMaison(m);
      }
    }

    return locataire;
  },

  async deleteLocataire(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('locataires').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    const locataires = await this.getLocataires();
    const locataireToDelete = locataires.find(l => l.id === id);
    const filtered = locataires.filter(l => l.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOCATAIRES, JSON.stringify(filtered));
    }

    // If house has no other active tenant, mark available
    if (locataireToDelete?.maison_id) {
      const remainingForHouse = filtered.some(l => l.maison_id === locataireToDelete.maison_id);
      if (!remainingForHouse) {
        const maisons = await this.getMaisons();
        const m = maisons.find(item => item.id === locataireToDelete.maison_id);
        if (m && m.statut === 'occupee') {
          m.statut = 'disponible';
          await this.saveMaison(m);
        }
      }
    }
  },

  // Paiements
  async getPaiements(): Promise<Paiement[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('paiements').select('*').order('date_paiement', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    if (typeof window === 'undefined') return SEED_PAIEMENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PAIEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(SEED_PAIEMENTS));
      return SEED_PAIEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PAIEMENTS;
    }
  },

  async savePaiement(paiement: Paiement): Promise<Paiement> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('paiements').upsert(paiement).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    const paiements = await this.getPaiements();
    const index = paiements.findIndex(p => p.id === paiement.id);
    let updated: Paiement[];
    if (index >= 0) {
      updated = [...paiements];
      updated[index] = paiement;
    } else {
      updated = [paiement, ...paiements];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(updated));
    }
    return paiement;
  },

  async deletePaiement(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('paiements').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    const paiements = await this.getPaiements();
    const filtered = paiements.filter(p => p.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(filtered));
    }
  },

  // Dépenses
  async getDepenses(): Promise<Depense[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('depenses').select('*').order('date_depense', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    if (typeof window === 'undefined') return SEED_DEPENSES;
    const raw = localStorage.getItem(STORAGE_KEYS.DEPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEPENSES, JSON.stringify(SEED_DEPENSES));
      return SEED_DEPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_DEPENSES;
    }
  },

  async saveDepense(depense: Depense): Promise<Depense> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('depenses').upsert(depense).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }
    const depenses = await this.getDepenses();
    const index = depenses.findIndex(d => d.id === depense.id);
    let updated: Depense[];
    if (index >= 0) {
      updated = [...depenses];
      updated[index] = depense;
    } else {
      updated = [depense, ...depenses];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DEPENSES, JSON.stringify(updated));
    }
    return depense;
  },

  async deleteDepense(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('depenses').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    const depenses = await this.getDepenses();
    const filtered = depenses.filter(d => d.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DEPENSES, JSON.stringify(filtered));
    }
  },

  // Settings
  getSettings(): ProprietaireSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: ProprietaireSettings): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  },

  // Reset to Demo
  resetToDemo(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MAISONS, JSON.stringify(SEED_MAISONS));
      localStorage.setItem(STORAGE_KEYS.LOCATAIRES, JSON.stringify(SEED_LOCATAIRES));
      localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(SEED_PAIEMENTS));
      localStorage.setItem(STORAGE_KEYS.DEPENSES, JSON.stringify(SEED_DEPENSES));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }
};
