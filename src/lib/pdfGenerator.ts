import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Maison, Locataire, Paiement, ProprietaireSettings } from '@/types';

export const formatMonnaie = (val: number, devise: string = 'FCFA') => {
  return `${new Intl.NumberFormat('fr-FR').format(val)} ${devise}`;
};

export const genererQuittancePDF = (
  paiement: Paiement,
  locataire: Locataire,
  maison: Maison | undefined,
  settings: ProprietaireSettings
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [2, 132, 199]; // Sky 600

  // Top header banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUITTANCE DE LOYER', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf: QUI-${paiement.annee}-${paiement.id.substring(0, 6).toUpperCase()}`, pageWidth - 14, 16, { align: 'right' });

  // Bailleur / Agence block
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BAILLEUR / AGENCE', 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.nom_agence || settings.nom_bailleur, 14, 45);
  doc.text(settings.nom_bailleur, 14, 50);
  doc.text(settings.adresse, 14, 55);
  doc.text(`${settings.ville} - Tél: ${settings.telephone}`, 14, 60);
  doc.text(`Email: ${settings.email}`, 14, 65);

  // Locataire block
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth / 2, 33, (pageWidth / 2) - 14, 36, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(pageWidth / 2, 33, (pageWidth / 2) - 14, 36, 3, 3, 'D');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('LOCATAIRE', (pageWidth / 2) + 6, 41);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${locataire.prenom} ${locataire.nom}`, (pageWidth / 2) + 6, 48);
  doc.text(`Tél: ${locataire.telephone}`, (pageWidth / 2) + 6, 54);
  doc.text(`Logement: ${maison ? maison.nom : 'Bien loué'}`, (pageWidth / 2) + 6, 60);
  doc.text(`Adresse: ${maison ? maison.adresse : 'Non précisée'}`, (pageWidth / 2) + 6, 65);

  // Divider
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 76, pageWidth - 14, 76);

  // Objet & Période
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Période concernée : Mois de ${paiement.mois} ${paiement.annee}`, 14, 86);

  // Statement text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const declaration = `Je soussigné(e) ${settings.nom_bailleur}, atteste avoir reçu de ${locataire.prenom} ${locataire.nom} la somme ci-dessous désignée au titre du loyer et charges du logement susmentionné pour la période correspondante.`;
  const splitDeclaration = doc.splitTextToSize(declaration, pageWidth - 28);
  doc.text(splitDeclaration, 14, 94);

  // Financial Table
  autoTable(doc, {
    startY: 110,
    head: [['Désignation', 'Période', 'Mode de Règlement', 'Montant Payé']],
    body: [
      [
        `Loyer mensuel (${maison?.nom || 'Logement'})`,
        `${paiement.mois} ${paiement.annee}`,
        paiement.moyen_paiement.toUpperCase().replace('_', ' '),
        formatMonnaie(paiement.montant, settings.devise)
      ]
    ],
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    theme: 'striped',
    margin: { left: 14, right: 14 }
  });

  // Total summary card
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 95, finalY, 81, 28, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL REÇU :', pageWidth - 90, finalY + 11);
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text(formatMonnaie(paiement.montant, settings.devise), pageWidth - 90, finalY + 22);

  // Signature Block
  const sigY = finalY + 45;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Fait à ${settings.ville}, le ${paiement.date_paiement}`, 14, sigY);
  doc.text('Mention : "Pour acquit"', 14, sigY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Signature / Cachet du Bailleur :', pageWidth - 80, sigY);

  // Stamp Box
  doc.setDrawColor(2, 132, 199);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(pageWidth - 80, sigY + 5, 66, 26, 2, 2, 'D');
  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.text('ACQUITTÉ - GESTIONLOCATIVE', pageWidth - 78, sigY + 16);
  doc.text(settings.nom_bailleur, pageWidth - 78, sigY + 22);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Cette quittance annule tous les reçus qui auraient pu être donnés pour acompte concernant le même terme.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`Quittance_${locataire.nom}_${paiement.mois}_${paiement.annee}.pdf`);
};

export const genererRapportFinancierPDF = (
  maisons: Maison[],
  paiements: Paiement[],
  depenses: any[],
  settings: ProprietaireSettings
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BILAN FINANCIER & RENTABILITÉ', 14, 18);

  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('fr-FR'), pageWidth - 14, 18, { align: 'right' });

  const totalRevenus = paiements.reduce((acc, p) => acc + Number(p.montant), 0);
  const totalDepenses = depenses.reduce((acc, d) => acc + Number(d.montant), 0);
  const resultatNet = totalRevenus - totalDepenses;

  // KPI boxes
  autoTable(doc, {
    startY: 38,
    head: [['Indicateur', 'Valeur Totale']],
    body: [
      ['Total des Loyers Perçus', formatMonnaie(totalRevenus, settings.devise)],
      ['Total des Dépenses & Travaux', formatMonnaie(totalDepenses, settings.devise)],
      ['Bénéfice Net d\'Exploitation', formatMonnaie(resultatNet, settings.devise)],
      ['Nombre total de biens', `${maisons.length} logements`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [2, 132, 199] },
    margin: { left: 14, right: 14 }
  });

  // Table of Houses with performance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableY = (doc as any).lastAutoTable.finalY + 12;

  const housesRows = maisons.map(m => {
    const rev = paiements.filter(p => p.maison_id === m.id).reduce((a, b) => a + Number(b.montant), 0);
    const dep = depenses.filter(d => d.maison_id === m.id).reduce((a, b) => a + Number(b.montant), 0);
    return [
      m.nom,
      m.statut.toUpperCase(),
      formatMonnaie(m.loyer_mensuel, settings.devise),
      formatMonnaie(rev, settings.devise),
      formatMonnaie(dep, settings.devise),
      formatMonnaie(rev - dep, settings.devise)
    ];
  });

  autoTable(doc, {
    startY: tableY,
    head: [['Logement', 'Statut', 'Loyer Mensuel', 'Revenus Cumulés', 'Dépenses', 'Bénéfice Net']],
    body: housesRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`Bilan_Financier_${new Date().getFullYear()}.pdf`);
};
