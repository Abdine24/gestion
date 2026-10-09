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
  DollarSign
} from 'lucide-react';
import { Locataire, Maison, Paiement, ProprietaireSettings } from '@/types';
import { formatMonnaie } from '@/lib/pdfGenerator';

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
    // Pick first available house or first house
    const available = maisons.find(m => m.statut === 'disponible');
    setMaisonId(available ? available.id : (maisons[0]?.id || ''));
    setIsModalOpen(true);
  };

  const openEditModal = (l: Locataire) => {
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
  };

  const filteredLocataires = locataires.filter((l) => {
    const fullName = `${l.prenom} ${l.nom}`.toLowerCase();
    const phone = l.telephone.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || phone.includes(search) || (l.profession && l.profession.toLowerCase().includes(search));
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Locataires
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
              {locataires.length} locataires actifs
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Coordonnées des occupants, suivi des baux et relances directes par WhatsApp ou téléphone.
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
          const maison = maisons.find((m) => m.id === loc.maison_id);
          const loyerMensuel = maison ? maison.loyer_mensuel : 0;

          // Check current month payment
          const payeCeMois = paiements
            .filter((p) => p.locataire_id === loc.id && p.mois.toLowerCase() === currentMonth.toLowerCase() && p.annee === currentYear)
            .reduce((s, p) => s + Number(p.montant), 0);

          const estAJour = payeCeMois >= loyerMensuel;
          const resteDu = Math.max(0, loyerMensuel - payeCeMois);

          // WhatsApp link
          const cleanPhone = (loc.whatsapp || loc.telephone).replace(/[^0-9]/g, '');
          const messageRelance = encodeURIComponent(
            `Bonjour ${loc.prenom} ${loc.nom},\nNous vous contactons concernant votre loyer de ${currentMonth} pour "${maison?.nom || 'votre logement'}".\nMontant en attente : ${formatMonnaie(resteDu, settings.devise)}.\nMerci de nous tenir informés.\nCordialement,\n${settings.nom_bailleur}`
          );
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${messageRelance}`;

          return (
            <div
              key={loc.id}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                {/* Header Profile with status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-indigo-600/30 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold text-base">
                      {loc.prenom.charAt(0)}{loc.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(loc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
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
                      {maison ? maison.nom : 'Non assigné'}
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
                      Période contrat :
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {loc.date_debut_contrat} {loc.date_fin_contrat ? `au ${loc.date_fin_contrat}` : ''}
                    </span>
                  </div>
                </div>

                {/* Rent Status Badge */}
                <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
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

              {/* Direct Actions: Phone + WhatsApp Relance */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${loc.telephone.replace(/\s+/g, '')}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  Appeler
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                  title="Envoyer un rappel de loyer WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Maison associée *</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Début du contrat *</label>
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
