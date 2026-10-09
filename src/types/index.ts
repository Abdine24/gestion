export type StatutMaison = 'disponible' | 'occupee' | 'en_renovation';
export type MoyenPaiement = 'especes' | 'virement' | 'cheque' | 'mobile_money';
export type StatutPaiement = 'paye' | 'partiel' | 'en_attente';
export type CategorieDepense = 'refection' | 'entretien' | 'plomberie' | 'electricite' | 'taxe' | 'autre';

export interface Maison {
  id: string;
  nom: string;
  adresse: string;
  description: string;
  nombre_chambres: number;
  loyer_mensuel: number;
  statut: StatutMaison;
  image_url?: string;
  created_at?: string;
}

export interface Locataire {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp?: string;
  profession?: string;
  date_debut_contrat: string;
  date_fin_contrat?: string;
  maison_id: string;
  created_at?: string;
}

export interface Paiement {
  id: string;
  locataire_id: string;
  maison_id?: string;
  montant: number;
  mois: string;
  annee: number;
  date_paiement: string;
  moyen_paiement: MoyenPaiement;
  statut: StatutPaiement;
  commentaire?: string;
  created_at?: string;
}

export interface Depense {
  id: string;
  maison_id: string;
  locataire_id?: string;
  montant: number;
  description: string;
  categorie: CategorieDepense;
  date_depense: string;
  justificatif_url?: string;
  created_at?: string;
}

export interface ProprietaireSettings {
  nom_bailleur: string;
  nom_agence: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  devise: 'FCFA' | 'EUR' | 'USD';
  resend_api_key?: string;
  resend_sender_email?: string;
}

export interface FinancialStats {
  revenusMois: number;
  creancesTotales: number;
  depensesMois: number;
  beneficeNet: number;
  tauxOccupation: number;
  totalMaisons: number;
  totalLocataires: number;
}
