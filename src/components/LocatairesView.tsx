'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MessageCircle, 
  Home, 
  Calendar, 
  Briefcase, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign,
  Receipt,
  Download,
  History,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Clock
} from 'lucide-react';
import { Locataire, Maison, Paiement, ProprietaireSettings } from '@/types';
import { formatMonnaie, genererQuittancePDF } from '@/lib/pdfGenerator';

interface LocatairesViewProps {
  locataires: Locataire[];
  maisons: Maison[];
  paiements: Paiement[];
  settings: ProprietaireSettings;
  onSaveLocataire: (locataire: Locataire) => void;
  onDeleteLocataire: (id: string) => void;
  onOpenNewPaymentForTenant?: (tenantId: string) => void;
}

export default function LocatairesView({
  locataires,
  maisons,
  paiements,
  settings,
  onSaveLocataire,
  onDeleteLocataire,
  onOpenNewPaymentForTenant
}: LocatairesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocataire, setEditingLocataire] = useState<Locataire | null>(null);

  // State for Tenant Details & Full Payments History Modal
  const [selectedLocataireForDetails, setSelectedLocataireForDetails] = useState<Locataire | null>(null);

  // Form State
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profession, setProfession] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [maisonId, setMaisonId] = useState('');

  const currentMonth = 'Mars';
  const currentYear = 2026;

  const openNewModal = () => {
    setEditingLocataire(null);
    setNom('');
    setPrenom('');
    setTelephone('');
    setWhatsapp('');
    setProfession('');
    setDateDebut(new Date().toISOString().slice(0, 10));
    setDateFin('');
    const available = maisons.find(m => m.statut === 'disponible');
    setMaisonId(available ? available.id : (maisons[0]?.id || ''));
    setIsModalOpen(true);
  };

  const openEditModal = (l: Locataire, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLocataire(l);
    setNom(l.nom);
    setPrenom(l.prenom);
    setTelephone(l.telephone);
    setWhatsapp(l.whatsapp || '');
    setProfession(l.profession || '');
    setDateDebut(l.date_debut_contrat);
    setDateFin(l.date_fin_contrat || '');
    setMaisonId(l.maison_id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !telephone.trim()) return;

    const locataireToSave: Locataire = {
      id: editingLocataire ? editingLocataire.id : `l_${Date.now()}`,
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      whatsapp: whatsapp.trim() || telephone.trim(),
      profession: profession.trim(),
      date_debut_contrat: dateDebut,
      date_fin_contrat: dateFin || undefined,
      maison_id: maisonId,
      created_at: editingLocataire?.created_at || new Date().toISOString()
    };

    onSaveLocataire(locataireToSave);
    setIsModalOpen(false);

    // If currently viewing this tenant's details, update the selected state
    if (selectedLocataireForDetails?.id === locataireToSave.id) {
      setSelectedLocataireForDetails(locataireToSave);
    }
  };

  const filteredLocataires = locataires.filter((l) => {
    const fullName = `${l.prenom} ${l.nom}`.toLowerCase();
    const phone = l.telephone.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || phone.includes(search) || (l.profession && l.profession.toLowerCase().includes(search));
  });

  // Calculate detailed financial stats for a given tenant
  const getTenantFinancialSummary = (tenant: Locataire) => {
    const tenantMaison = maisons.find(m => m.id === tenant.maison_id);
    const loyerMensuel = tenantMaison ? tenantMaison.loyer_mensuel : 0;

    // All payments made by this tenant
    const tenantPayments = paiements
      .filter(p => p.locataire_id === tenant.id)
      .sort((a, b) => new Date(b.date_paiement).getTime() - new Date(a.date_paiement).getTime());

    const totalRegle = tenantPayments.reduce((sum, p) => sum + Number(p.montant), 0);

    // Approximate months elapsed since date_debut_contrat
    const startDate = new Date(tenant.date_debut_contrat);
    const now = new Date();
    const monthsElapsed = Math.max(
      1,
      (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()) + 1
    );

    const totalAttenduDepuisEntree = monthsElapsed * loyerMensuel;
    const solde = totalRegle - totalAttenduDepuisEntree;

    return {
      tenantMaison,
      loyerMensuel,
      tenantPayments,
      totalRegle,
      monthsElapsed,
      totalAttenduDepuisEntree,
      solde
    };
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Locataires
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
              {locataires.length} locataires • {settings.ville}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cliquez sur un locataire pour consulter l&apos;historique complet de tous ses règlements depuis son entrée.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Nouveau Locataire
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, métier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />
      </div>

      {/* Grid of Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLocataires.map((loc) => {
          const { tenantMaison, loyerMensuel, tenantPayments, totalRegle } = getTenantFinancialSummary(loc);

          // Check current month payment
          const payeCeMois = tenantPayments
            .filter((p) => p.mois.toLowerCase() === currentMonth.toLowerCase() && p.annee === currentYear)
            .reduce((s, p) => s + Number(p.montant), 0);

          const estAJour = payeCeMois >= loyerMensuel;
          const resteDu = Math.max(0, loyerMensuel - payeCeMois);

          // WhatsApp link
          const cleanPhone = (loc.whatsapp || loc.telephone).replace(/[^0-9]/g, '');
          const messageRelance = encodeURIComponent(
            `Bonjour ${loc.prenom} ${loc.nom},\nNous vous contactons concernant votre loyer de ${currentMonth} pour "${tenantMaison?.nom || 'votre logement'}".\nMontant en attente : ${formatMonnaie(resteDu, settings.devise)}.\nMerci de nous tenir informés.\nCordialement,\n${settings.nom_bailleur}`
          );
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${messageRelance}`;

          return (
            <div
              key={loc.id}
              onClick={() => setSelectedLocataireForDetails(loc)}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between cursor-pointer group hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-200"
            >
              <div>
                {/* Header Profile with status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-indigo-600/30 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold text-base group-hover:scale-105 transition-transform">
                      {loc.prenom.charAt(0)}{loc.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-sky-400 transition-colors">
                        {loc.prenom} {loc.nom}
                      </h3>
                      {loc.profession && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-500" />
                          {loc.profession}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEditModal(loc, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Supprimer le locataire ${loc.prenom} ${loc.nom} ?`)) {
                          onDeleteLocataire(loc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Property & Rent info */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-sky-400" />
                      Logement :
                    </span>
                    <span className="font-semibold text-white">
                      {tenantMaison ? tenantMaison.nom : 'Non assigné'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Loyer mensuel :
                    </span>
                    <span className="font-bold text-sky-400">
                      {formatMonnaie(loyerMensuel, settings.devise)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Entrée dans les lieux :
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">
                      {loc.date_debut_contrat}
                    </span>
                  </div>
                </div>

                {/* Lifetime Payments Indicator */}
                <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    Total versé ({tenantPayments.length} règ.) :
                  </span>
                  <span className="font-bold text-emerald-400">
                    {formatMonnaie(totalRegle, settings.devise)}
                  </span>
                </div>

                {/* Rent Status Badge */}
                <div className="mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Statut {currentMonth} :</span>
                  {estAJour ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> À jour ({formatMonnaie(payeCeMois, settings.devise)})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> Reste {formatMonnaie(resteDu, settings.devise)}
                    </span>
                  )}
                </div>
              </div>

              {/* View History Button Banner */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedLocataireForDetails(loc)}
                  className="w-full py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Voir l&apos;historique complet ({tenantPayments.length} règlements)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                {/* Direct Actions: Phone + WhatsApp Relance */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${loc.telephone.replace(/\s+/g, '')}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    Appeler
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                    title="Envoyer un rappel de loyer WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLocataires.length === 0 && (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucun locataire trouvé</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Ajoutez votre premier locataire pour démarrer le suivi des loyers et des quittances.
          </p>
          <button
            onClick={openNewModal}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            + Enregistrer un locataire
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FICHE DÉTAILLÉE DU LOCATAIRE & HISTORIQUE COMPLET */}
      {/* ======================================================== */}
      {selectedLocataireForDetails && (() => {
        const {
          tenantMaison,
          loyerMensuel,
          tenantPayments,
          totalRegle,
          monthsElapsed,
          totalAttenduDepuisEntree,
          solde
        } = getTenantFinancialSummary(selectedLocataireForDetails);

        const cleanPhone = (selectedLocataireForDetails.whatsapp || selectedLocataireForDetails.telephone).replace(/[^0-9]/g, '');
        const recapWhatsappMsg = encodeURIComponent(
          `Bonjour ${selectedLocataireForDetails.prenom},\nVoici le récapitulatif de votre dossier locatif pour "${tenantMaison?.nom || 'votre logement'}" à ${settings.ville} :\n• Date d'entrée : ${selectedLocataireForDetails.date_debut_contrat}\n• Total des règlements effectués : ${formatMonnaie(totalRegle, settings.devise)} (${tenantPayments.length} paiements)\n• Loyer mensuel : ${formatMonnaie(loyerMensuel, settings.devise)}\n• Solde actuel : ${solde >= 0 ? 'À jour' : `Reste ${formatMonnaie(Math.abs(solde), settings.devise)}`}\nMerci de votre confiance !\n${settings.nom_bailleur}`
        );

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 relative">
                <button
                  onClick={() => setSelectedLocataireForDetails(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-500/20">
                      {selectedLocataireForDetails.prenom.charAt(0)}{selectedLocataireForDetails.nom.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                          {selectedLocataireForDetails.prenom} {selectedLocataireForDetails.nom}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {settings.ville}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-sky-400" />
                          {tenantMaison?.nom || 'Logement loué'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedLocataireForDetails.telephone}
                        </span>
                        {selectedLocataireForDetails.profession && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                              {selectedLocataireForDetails.profession}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions in Header */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${recapWhatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                      title="Partager le récapitulatif par WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Relevé WhatsApp</span>
                    </a>

                    <button
                      onClick={() => openEditModal(selectedLocataireForDetails)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      title="Modifier les informations"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial KPI Summary Cards */}
              <div className="p-6 bg-slate-950/50 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    Bilan Financier depuis l&apos;entrée ({selectedLocataireForDetails.date_debut_contrat})
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    ~ {monthsElapsed} mois dans le logement
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Total Regle */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] text-slate-400">Total des règlements perçus</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">
                      {formatMonnaie(totalRegle, settings.devise)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tenantPayments.length} paiements effectués</p>
                  </div>

                  {/* Loyer Mensuel */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] text-slate-400">Loyer mensuel contractuel</p>
                    <p className="text-xl font-black text-sky-400 mt-1">
                      {formatMonnaie(loyerMensuel, settings.devise)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tenantMaison?.adresse || settings.ville}</p>
                  </div>

                  {/* Situation Globale / Solde */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] text-slate-400">Solde global calculé</p>
                    <p className={`text-xl font-black mt-1 ${solde >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {solde >= 0 ? `À jour (+${formatMonnaie(solde, settings.devise)})` : `-${formatMonnaie(Math.abs(solde), settings.devise)}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {solde >= 0 ? 'Aucune créance en cours' : 'Créance en retard de paiement'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Complete List of Payments */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-sky-400" />
                      Historique Exhaustif de tous les Règlements
                    </h3>
                    <p className="text-xs text-slate-400">
                      Chaque paiement enregistré depuis l&apos;entrée de ce locataire dans la maison.
                    </p>
                  </div>

                  {onOpenNewPaymentForTenant && (
                    <button
                      onClick={() => {
                        setSelectedLocataireForDetails(null);
                        onOpenNewPaymentForTenant(selectedLocataireForDetails.id);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      Encaisser un loyer
                    </button>
                  )}
                </div>

                {tenantPayments.length === 0 ? (
                  <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                    <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Aucun règlement enregistré pour le moment</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Enregistrez le premier loyer de ce locataire pour commencer à générer ses quittances.
                    </p>
                    {onOpenNewPaymentForTenant && (
                      <button
                        onClick={() => {
                          setSelectedLocataireForDetails(null);
                          onOpenNewPaymentForTenant(selectedLocataireForDetails.id);
                        }}
                        className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition"
                      >
                        + Enregistrer le premier règlement
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Date</th>
                          <th className="py-3 px-4 font-semibold">Mois & Année</th>
                          <th className="py-3 px-4 font-semibold">Montant Réglé</th>
                          <th className="py-3 px-4 font-semibold">Moyen</th>
                          <th className="py-3 px-4 font-semibold">Statut</th>
                          <th className="py-3 px-4 font-semibold text-right">Quittance PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                        {tenantPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                              {p.date_paiement}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                              {p.mois} {p.annee}
                            </td>
                            <td className="py-3.5 px-4 font-black text-emerald-400 text-xs whitespace-nowrap">
                              +{formatMonnaie(p.montant, settings.devise)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] uppercase font-semibold border border-slate-700">
                                {p.moyen_paiement.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {p.statut === 'paye' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Payé
                                </span>
                              )}
                              {p.statut === 'partiel' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                  <Clock className="w-3 h-3" /> Acompte
                                </span>
                              )}
                              {p.statut === 'en_attente' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30">
                                  <AlertCircle className="w-3 h-3" /> En attente
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => genererQuittancePDF(p, selectedLocataireForDetails, tenantMaison, settings)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30 transition active:scale-95 text-[11px]"
                                title="Télécharger la quittance officielle"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Quittance</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Logement rattaché : <strong>{tenantMaison?.nom || 'Logement'}</strong>
                </span>
                <button
                  onClick={() => setSelectedLocataireForDetails(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-semibold"
                >
                  Fermer la fiche
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal Add / Edit Locataire */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingLocataire ? 'Modifier le locataire' : 'Nouveau locataire'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Mamadou"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Diallo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+225 05 55 44 33 22"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp (avec indicatif)</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+2250555443322"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Ex: Architecte, Cadre..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Maison associée ({settings.ville}) *</label>
                  <select
                    required
                    value={maisonId}
                    onChange={(e) => setMaisonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Sélectionner un bien...</option>
                    {maisons.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom} ({formatMonnaie(m.loyer_mensuel, settings.devise)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date d&apos;entrée dans la maison *</label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fin du contrat</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition active:scale-95"
                >
                  {editingLocataire ? 'Enregistrer les modifications' : 'Enregistrer le locataire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
