'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X,
  Send,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Paiement, Locataire, Maison, ProprietaireSettings, MoyenPaiement, StatutPaiement } from '@/types';
import { formatMonnaie, genererQuittancePDF } from '@/lib/pdfGenerator';

interface PaiementsViewProps {
  paiements: Paiement[];
  locataires: Locataire[];
  maisons: Maison[];
  settings: ProprietaireSettings;
  onSavePaiement: (paiement: Paiement) => void;
  onDeletePaiement: (id: string) => void;
  isInitialNewOpen?: boolean;
}

export default function PaiementsView({
  paiements,
  locataires,
  maisons,
  settings,
  onSavePaiement,
  onDeletePaiement,
  isInitialNewOpen = false
}: PaiementsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMois, setSelectedMois] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(isInitialNewOpen);
  const [emailStatus, setEmailStatus] = useState<{ id: string; message: string; ok: boolean } | null>(null);

  // Form state
  const [locataireId, setLocataireId] = useState(locataires[0]?.id || '');
  const [montant, setMontant] = useState<number>(0);
  const [mois, setMois] = useState('Mars');
  const [annee, setAnnee] = useState(2026);
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().slice(0, 10));
  const [moyenPaiement, setMoyenPaiement] = useState<MoyenPaiement>('especes');
  const [statut, setStatut] = useState<StatutPaiement>('paye');
  const [commentaire, setCommentaire] = useState('');

  const monthsList = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleSelectTenant = (tenantId: string) => {
    setLocataireId(tenantId);
    const loc = locataires.find(l => l.id === tenantId);
    if (loc) {
      const m = maisons.find(item => item.id === loc.maison_id);
      if (m) {
        setMontant(m.loyer_mensuel);
      }
    }
  };

  const openNewModal = () => {
    const firstLoc = locataires[0];
    if (firstLoc) {
      setLocataireId(firstLoc.id);
      const m = maisons.find(item => item.id === firstLoc.maison_id);
      setMontant(m ? m.loyer_mensuel : 250000);
    }
    setMois('Mars');
    setAnnee(2026);
    setDatePaiement(new Date().toISOString().slice(0, 10));
    setMoyenPaiement('virement');
    setStatut('paye');
    setCommentaire('Loyer réglé par virement');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locataireId || montant <= 0) return;

    const loc = locataires.find(l => l.id === locataireId);

    const nouveauPaiement: Paiement = {
      id: `p_${Date.now()}`,
      locataire_id: locataireId,
      maison_id: loc?.maison_id,
      montant: Number(montant),
      mois,
      annee: Number(annee),
      date_paiement: datePaiement,
      moyen_paiement: moyenPaiement,
      statut,
      commentaire: commentaire.trim() || undefined,
      created_at: new Date().toISOString()
    };

    onSavePaiement(nouveauPaiement);
    setIsModalOpen(false);
  };

  const handleSendEmailReceipt = async (p: Paiement, loc: Locataire) => {
    setEmailStatus({ id: p.id, message: 'Envoi en cours...', ok: true });
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: loc.telephone ? `${loc.nom.toLowerCase()}@client.com` : 'locataire@client.com',
          subject: `Quittance de loyer - ${p.mois} ${p.annee} (${settings.nom_agence || settings.nom_bailleur})`,
          html: `
            <h2>Quittance de Loyer - ${p.mois} ${p.annee}</h2>
            <p>Bonjour ${loc.prenom} ${loc.nom},</p>
            <p>Nous vous confirmons la bonne réception de votre paiement de <strong>${formatMonnaie(p.montant, settings.devise)}</strong> pour le loyer de ${p.mois} ${p.annee}.</p>
            <p>Mode de règlement : ${p.moyen_paiement.toUpperCase()}</p>
            <p>Date : ${p.date_paiement}</p>
            <br/>
            <p>Cordialement,<br/><strong>${settings.nom_bailleur}</strong><br/>${settings.nom_agence}</p>
          `,
          apiKey: settings.resend_api_key
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus({ id: p.id, message: 'Quittance envoyée par email !', ok: true });
      } else {
        setEmailStatus({ id: p.id, message: 'Erreur envoi email', ok: false });
      }
    } catch {
      setEmailStatus({ id: p.id, message: 'Échec de transmission', ok: false });
    }

    setTimeout(() => setEmailStatus(null), 4000);
  };

  // Filtered payments
  const filteredPaiements = paiements.filter((p) => {
    const loc = locataires.find(l => l.id === p.locataire_id);
    const locName = loc ? `${loc.prenom} ${loc.nom}`.toLowerCase() : '';
    const matchesSearch = locName.includes(searchTerm.toLowerCase()) || p.mois.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMois = selectedMois === 'all' || p.mois.toLowerCase() === selectedMois.toLowerCase();
    return matchesSearch && matchesMois;
  });

  const totalFiltered = filteredPaiements.reduce((sum, p) => sum + Number(p.montant), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Paiements & Quittances
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
              Total perçu : {formatMonnaie(totalFiltered, settings.devise)}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enregistrez les loyers perçus, téléchargez les quittances officielles en PDF et notifiez les locataires.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Enregistrer un Paiement
        </button>
      </div>

      {/* Filter and Month Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par locataire ou mois..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedMois('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedMois === 'all'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tous les mois
          </button>
          {['Février', 'Mars', 'Avril'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMois(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedMois === m
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List of Payments */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Locataire & Logement</th>
                <th className="py-3.5 px-4 font-semibold">Période</th>
                <th className="py-3.5 px-4 font-semibold">Montant</th>
                <th className="py-3.5 px-4 font-semibold">Moyen</th>
                <th className="py-3.5 px-4 font-semibold">Statut</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quittance & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPaiements.map((p) => {
                const loc = locataires.find((l) => l.id === p.locataire_id);
                const maison = maisons.find((m) => m.id === p.maison_id || m.id === loc?.maison_id);

                return (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                      {p.date_paiement}
                    </td>

                    <td className="py-3.5 px-4">
                      {loc ? (
                        <div>
                          <p className="font-bold text-white text-xs">{loc.prenom} {loc.nom}</p>
                          <p className="text-[11px] text-slate-400">{maison?.nom || 'Logement'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Locataire supprimé</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200 whitespace-nowrap">
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
                          <AlertTriangle className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Download PDF button */}
                        {loc && (
                          <button
                            onClick={() => genererQuittancePDF(p, loc, maison, settings)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30 transition active:scale-95 text-[11px]"
                            title="Générer la Quittance en PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        )}

                        {/* Send Email button */}
                        {loc && (
                          <button
                            onClick={() => handleSendEmailReceipt(p, loc)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Envoyer la quittance par email via Resend"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            if (confirm('Supprimer ce règlement ?')) {
                              onDeletePaiement(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Notification feedback */}
                      {emailStatus?.id === p.id && (
                        <p className={`text-[10px] mt-1 ${emailStatus.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {emailStatus.message}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPaiements.length === 0 && (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucun paiement enregistré</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Enregistrez les loyers perçus pour générer automatiquement les quittances correspondantes.
          </p>
          <button
            onClick={openNewModal}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            + Enregistrer un paiement
          </button>
        </div>
      )}

      {/* Modal Add Paiement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-400" />
                Enregistrer un Paiement de Loyer
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Locataire *</label>
                <select
                  required
                  value={locataireId}
                  onChange={(e) => handleSelectTenant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="">Sélectionner un locataire...</option>
                  {locataires.map((l) => {
                    const m = maisons.find(item => item.id === l.maison_id);
                    return (
                      <option key={l.id} value={l.id}>
                        {l.prenom} {l.nom} — {m?.nom || 'Logement'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Montant ({settings.devise}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={montant}
                    onChange={(e) => setMontant(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date d&apos;encaissement *</label>
                  <input
                    type="date"
                    required
                    value={datePaiement}
                    onChange={(e) => setDatePaiement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mois concerné *</label>
                  <select
                    value={mois}
                    onChange={(e) => setMois(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    {monthsList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Année *</label>
                  <input
                    type="number"
                    required
                    value={annee}
                    onChange={(e) => setAnnee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mode de règlement *</label>
                  <select
                    value={moyenPaiement}
                    onChange={(e) => setMoyenPaiement(e.target.value as MoyenPaiement)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="especes">Espèces</option>
                    <option value="virement">Virement bancaire</option>
                    <option value="mobile_money">Mobile Money (Wave/Orange/MTN)</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Statut *</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as StatutPaiement)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="paye">Payé (Totalité)</option>
                    <option value="partiel">Acompte (Partiel)</option>
                    <option value="en_attente">En attente de compensation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Commentaire</label>
                <input
                  type="text"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ex: Reçu en espèces avec quittance signée..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  Enregistrer et Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
