'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Home, 
  Calendar, 
  FileText, 
  Trash2, 
  X, 
  Tag, 
  DollarSign, 
  Filter,
  CheckCircle
} from 'lucide-react';
import { Depense, Maison, Locataire, ProprietaireSettings, CategorieDepense } from '@/types';
import { formatMonnaie } from '@/lib/pdfGenerator';

interface DepensesViewProps {
  depenses: Depense[];
  maisons: Maison[];
  locataires: Locataire[];
  settings: ProprietaireSettings;
  onSaveDepense: (depense: Depense) => void;
  onDeleteDepense: (id: string) => void;
  isInitialNewOpen?: boolean;
}

export default function DepensesView({
  depenses,
  maisons,
  locataires,
  settings,
  onSaveDepense,
  onDeleteDepense,
  isInitialNewOpen = false
}: DepensesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(isInitialNewOpen);

  // Form State
  const [maisonId, setMaisonId] = useState(maisons[0]?.id || '');
  const [locataireId, setLocataireId] = useState('');
  const [montant, setMontant] = useState<number>(35000);
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<CategorieDepense>('refection');
  const [dateDepense, setDateDepense] = useState(new Date().toISOString().slice(0, 10));
  const [justificatifUrl, setJustificatifUrl] = useState('');

  const openNewModal = () => {
    setMaisonId(maisons[0]?.id || '');
    setLocataireId('');
    setMontant(35000);
    setDescription('');
    setCategorie('refection');
    setDateDepense(new Date().toISOString().slice(0, 10));
    setJustificatifUrl('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maisonId || montant <= 0 || !description.trim()) return;

    const nouvelleDepense: Depense = {
      id: `d_${Date.now()}`,
      maison_id: maisonId,
      locataire_id: locataireId || undefined,
      montant: Number(montant),
      description: description.trim(),
      categorie,
      date_depense: dateDepense,
      justificatif_url: justificatifUrl.trim() || undefined,
      created_at: new Date().toISOString()
    };

    onSaveDepense(nouvelleDepense);
    setIsModalOpen(false);
  };

  const filteredDepenses = depenses.filter((d) => {
    const matchesSearch = d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'all' || d.categorie === selectedCat;
    return matchesSearch && matchesCat;
  });

  const totalDepenses = filteredDepenses.reduce((sum, d) => sum + Number(d.montant), 0);

  const getCategoryBadgeClass = (cat: CategorieDepense) => {
    switch (cat) {
      case 'refection':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'plomberie':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'electricite':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'entretien':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'taxe':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Dépenses & Travaux
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              Total : {formatMonnaie(totalDepenses, settings.devise)}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Suivi des réfections, entretiens réguliers, plomberie et justificatifs de frais déductibles.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Déclarer une Dépense
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une description de travaux..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'refection', label: 'Réfection' },
            { id: 'entretien', label: 'Entretien' },
            { id: 'plomberie', label: 'Plomberie' },
            { id: 'electricite', label: 'Électricité' },
            { id: 'taxe', label: 'Taxes/Impôts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCat === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List / Cards of Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepenses.map((d) => {
          const maison = maisons.find((m) => m.id === d.maison_id);
          const locataire = locataires.find((l) => l.id === d.locataire_id);

          return (
            <div
              key={d.id}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getCategoryBadgeClass(d.categorie)}`}>
                    {d.categorie}
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {d.date_depense}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-bold text-white leading-snug">
                    {d.description}
                  </p>
                  <p className="text-lg font-black text-amber-300 mt-1">
                    -{formatMonnaie(d.montant, settings.devise)}
                  </p>
                </div>

                {/* Property & Tenant affiliation */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Home className="w-3.5 h-3.5 text-sky-400" />
                      Logement :
                    </span>
                    <span className="font-semibold">{maison?.nom || 'Logement'}</span>
                  </div>

                  {locataire && (
                    <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Locataire lié :</span>
                      <span>{locataire.prenom} {locataire.nom}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {d.justificatif_url ? (
                  <a
                    href={d.justificatif_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Voir justificatif
                  </a>
                ) : (
                  <span className="text-slate-500 text-[11px]">Sans justificatif joint</span>
                )}

                <button
                  onClick={() => {
                    if (confirm('Supprimer cette dépense ?')) {
                      onDeleteDepense(d.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepenses.length === 0 && (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucune dépense enregistrée</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Déclarez vos travaux et frais d&apos;entretien pour calculer précisément votre bénéfice net.
          </p>
          <button
            onClick={openNewModal}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            + Déclarer une dépense
          </button>
        </div>
      )}

      {/* Modal Add Depense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Nouvelle Dépense / Réfection
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bien immobilier concerné *</label>
                <select
                  required
                  value={maisonId}
                  onChange={(e) => setMaisonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  {maisons.map((m) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Locataire lié (optionnel)</label>
                <select
                  value={locataireId}
                  onChange={(e) => setLocataireId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="">Aucun (Dépense générale du logement)</option>
                  {locataires.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.prenom} {l.nom}
                    </option>
                  ))}
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie *</label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value as CategorieDepense)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="refection">Réfection & Travaux</option>
                    <option value="entretien">Entretien régulier</option>
                    <option value="plomberie">Plomberie</option>
                    <option value="electricite">Électricité</option>
                    <option value="taxe">Taxes foncières / Impôts</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date de la dépense *</label>
                <input
                  type="date"
                  required
                  value={dateDepense}
                  onChange={(e) => setDateDepense(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description détaillée *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Remplacement tuyauterie cuisine et robinetterie..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lien justificatif (facture, reçu photo)</label>
                <input
                  type="url"
                  value={justificatifUrl}
                  onChange={(e) => setJustificatifUrl(e.target.value)}
                  placeholder="https://..."
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  Enregistrer la dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
