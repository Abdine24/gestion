import * as XLSX from 'xlsx';
import { Maison, Locataire, Paiement, Depense } from '@/types';

export const exporterExcelComplet = (
  maisons: Maison[],
  locataires: Locataire[],
  paiements: Paiement[],
  depenses: Depense[]
) => {
  const wb = XLSX.utils.book_new();

  // 1. Feuille Maisons
  const maisonsData = maisons.map(m => ({
    'ID': m.id,
    'Nom du Bien': m.nom,
    'Adresse': m.adresse,
    'Chambres': m.nombre_chambres,
    'Loyer Mensuel': m.loyer_mensuel,
    'Statut': m.statut,
    'Description': m.description
  }));
  const wsMaisons = XLSX.utils.json_to_sheet(maisonsData);
  XLSX.utils.book_append_sheet(wb, wsMaisons, 'Biens Immobiliers');

  // 2. Feuille Locataires
  const locatairesData = locataires.map(l => {
    const maison = maisons.find(m => m.id === l.maison_id);
    return {
      'ID': l.id,
      'Nom': l.nom,
      'Prénom': l.prenom,
      'Téléphone': l.telephone,
      'WhatsApp': l.whatsapp || '',
      'Profession': l.profession || '',
      'Bien Loué': maison ? maison.nom : 'Non assigné',
      'Début Contrat': l.date_debut_contrat,
      'Fin Contrat': l.date_fin_contrat || 'Indéterminée'
    };
  });
  const wsLocataires = XLSX.utils.json_to_sheet(locatairesData);
  XLSX.utils.book_append_sheet(wb, wsLocataires, 'Locataires');

  // 3. Feuille Paiements
  const paiementsData = paiements.map(p => {
    const locataire = locataires.find(l => l.id === p.locataire_id);
    const maison = maisons.find(m => m.id === p.maison_id);
    return {
      'ID': p.id,
      'Date': p.date_paiement,
      'Locataire': locataire ? `${locataire.prenom} ${locataire.nom}` : p.locataire_id,
      'Bien': maison ? maison.nom : '',
      'Mois': p.mois,
      'Année': p.annee,
      'Montant': p.montant,
      'Mode Règlement': p.moyen_paiement,
      'Statut': p.statut,
      'Commentaire': p.commentaire || ''
    };
  });
  const wsPaiements = XLSX.utils.json_to_sheet(paiementsData);
  XLSX.utils.book_append_sheet(wb, wsPaiements, 'Historique Paiements');

  // 4. Feuille Dépenses
  const depensesData = depenses.map(d => {
    const maison = maisons.find(m => m.id === d.maison_id);
    const locataire = locataires.find(l => l.id === d.locataire_id);
    return {
      'ID': d.id,
      'Date': d.date_depense,
      'Bien Concerné': maison ? maison.nom : '',
      'Locataire Associé': locataire ? `${locataire.prenom} ${locataire.nom}` : 'Général',
      'Catégorie': d.categorie,
      'Description': d.description,
      'Montant': d.montant
    };
  });
  const wsDepenses = XLSX.utils.json_to_sheet(depensesData);
  XLSX.utils.book_append_sheet(wb, wsDepenses, 'Dépenses & Travaux');

  // Write and trigger download
  XLSX.writeFile(wb, `GestionLocative_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
