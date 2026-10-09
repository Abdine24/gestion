'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Home, 
  MapPin, 
  Bed, 
  DollarSign, 
  Edit3, 
  Trash2, 
  UserCheck, 
  Wrench,
  X,
  CheckCircle,
  Building
} from 'lucide-react';
import { Maison, Locataire, Paiement, Depense, ProprietaireSettings, StatutMaison } from '@/types';
import { formatMonnaie } from '@/lib/pdfGenerator';

interface MaisonsViewProps {
  maisons: Maison[];
  locataires: Locataire[];
  paiements: Paiement[];
  depenses: Depense[];
  settings: ProprietaireSettings;
  onSaveMaison: (maison: Maison) => void;
  onDeleteMaison: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export default function MaisonsView({
  maisons,
  locataires,
  paiements,
  depenses,
  settings,
  onSaveMaison,
  onDeleteMaison,
  onNavigateTab
}: MaisonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaison, setEditingMaison] = useState<Maison | null>(null);

  // Form state
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [description, setDescription] = useState('');
  const [nombreChambres, setNombreChambres] = useState(2);
  const [loyerMensuel, setLoyerMensuel] = useState(250000);
  const [statut, setStatut] = useState<StatutMaison>('disponible');
  const [imageUrl, setImageUrl] = useState('');

  const openNewModal = () => {
    setEditingMaison(null);
    setNom('');
    setAdresse('');
    setDescription('');
    setNombreChambres(2);
    setLoyerMensuel(250000);
    setStatut('disponible');
    setImageUrl('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Maison) => {
    setEditingMaison(m);
    setNom(m.nom);
    setAdresse(m.adresse);
    setDescription(m.description);
    setNombreChambres(m.nombre_chambres);
    setLoyerMensuel(m.loyer_mensuel);
    setStatut(m.statut);
    setImageUrl(m.image_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !adresse.trim()) return;

    const maisonToSave: Maison = {
      id: editingMaison ? editingMaison.id : `m_${Date.now()}`,
      nom: nom.trim(),
      adresse: adresse.trim(),
      description: description.trim(),
      nombre_chambres: Number(nombreChambres),
      loyer_mensuel: Number(loyerMensuel),
      statut,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      created_at: editingMaison?.created_at || new Date().toISOString()
    };

    onSaveMaison(maisonToSave);
    setIsModalOpen(false);
  };

  // Filtered houses
  const filteredMaisons = maisons.filter((m) => {
    const matchesSearch = 
      m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || m.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Biens Immobiliers
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
              {maisons.length} logements • {settings.ville}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gérez votre parc immobilier situé exclusivement à {settings.ville}, suivez l&apos;état des locations et la rentabilité par bien.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Ajouter un Bien
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'occupee', label: 'Occupées' },
            { id: 'disponible', label: 'Disponibles' },
            { id: 'en_renovation', label: 'Rénovation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatut(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterStatut === tab.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Houses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaisons.map((maison) => {
          const locataire = locataires.find((l) => l.maison_id === maison.id);
          const totalRev = paiements
            .filter((p) => p.maison_id === maison.id)
            .reduce((s, p) => s + Number(p.montant), 0);
          const totalDep = depenses
            .filter((d) => d.maison_id === maison.id)
            .reduce((s, d) => s + Number(d.montant), 0);
          const net = totalRev - totalDep;

          return (
            <div
              key={maison.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                {/* Image Header with Badge */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={maison.image_url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                    alt={maison.nom}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {maison.statut === 'occupee' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-slate-950 shadow-md">
                        Occupée
                      </span>
                    )}
                    {maison.statut === 'disponible' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/90 text-slate-950 shadow-md">
                        Disponible
                      </span>
                    )}
                    {maison.statut === 'en_renovation' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 shadow-md">
                        En Rénovation
                      </span>
                    )}
                  </div>

                  {/* Action buttons on image */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(maison)}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white transition backdrop-blur-md"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Confirmer la suppression de "${maison.nom}" ?`)) {
                          onDeleteMaison(maison.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 transition backdrop-blur-md"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rent Price Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-900/90 text-sky-400 border border-slate-700/60 shadow-lg backdrop-blur-md">
                      {formatMonnaie(maison.loyer_mensuel, settings.devise)} / mois
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition">
                      {maison.nom}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {maison.adresse}
                    </p>
                  </div>

                  {maison.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {maison.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4 text-sky-400" />
                      {maison.nombre_chambres} chambre(s)
                    </span>
                  </div>

                  {/* Tenant information */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    {locataire ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="font-semibold text-white">{locataire.prenom} {locataire.nom}</p>
                            <p className="text-[10px] text-slate-400">{locataire.telephone}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigateTab('locataires')}
                          className="text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                        >
                          Fiche →
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Aucun locataire assigné</span>
                        <button
                          onClick={() => onNavigateTab('locataires')}
                          className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                        >
                          + Assigner
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial bottom summary */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                <span>Dépenses : <strong className="text-amber-400">{formatMonnaie(totalDep, settings.devise)}</strong></span>
                <span>Net : <strong className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatMonnaie(net, settings.devise)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaisons.length === 0 && (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800">
          <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucun bien immobilier trouvé</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Ajustez vos filtres de recherche ou ajoutez un nouveau bien immobilier à votre portefeuille.
          </p>
          <button
            onClick={openNewModal}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            + Ajouter un premier bien
          </button>
        </div>
      )}

      {/* Modal Add / Edit Maison */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingMaison ? 'Modifier le bien' : 'Nouveau bien immobilier'}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du logement *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Villa Les Palmiers, Appartement B2..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse complète *</label>
                <input
                  type="text"
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Cocody Angré 8e Tranche, Rue L12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Loyer Mensuel ({settings.devise}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={loyerMensuel}
                    onChange={(e) => setLoyerMensuel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de chambres *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={nombreChambres}
                    onChange={(e) => setNombreChambres(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Statut d&apos;occupation *</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as StatutMaison)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="disponible">Disponible (À louer)</option>
                  <option value="occupee">Occupée (Louée)</option>
                  <option value="en_renovation">En rénovation / Travaux</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL de l&apos;image d&apos;illustration</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Équipements</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Villa duplex avec piscine, climatiseurs neufs, gardiennage..."
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
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition active:scale-95"
                >
                  {editingMaison ? 'Enregistrer les modifications' : 'Créer le bien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
