'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign, 
  Home, 
  Users, 
  ArrowUpRight, 
  PlusCircle, 
  MessageCircle,
  Receipt,
  Wrench,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Maison, Locataire, Paiement, Depense, ProprietaireSettings } from '@/types';
import { formatMonnaie, genererQuittancePDF } from '@/lib/pdfGenerator';

interface DashboardProps {
  maisons: Maison[];
  locataires: Locataire[];
  paiements: Paiement[];
  depenses: Depense[];
  settings: ProprietaireSettings;
  onNavigateTab: (tab: string) => void;
  onOpenNewPayment: () => void;
  onOpenNewMaison: () => void;
  onOpenNewLocataire: () => void;
  onOpenNewDepense: () => void;
}

export default function Dashboard({
  maisons,
  locataires,
  paiements,
  depenses,
  settings,
  onNavigateTab,
  onOpenNewPayment,
  onOpenNewMaison,
  onOpenNewLocataire,
  onOpenNewDepense,
}: DashboardProps) {
  const currentMonthName = 'Mars';
  const currentYear = 2026;

  // Calculs financiers
  const totalLoyerAttendu = maisons
    .filter(m => m.statut === 'occupee')
    .reduce((sum, m) => sum + m.loyer_mensuel, 0);

  const paiementsMois = paiements.filter(
    p => p.mois.toLowerCase() === currentMonthName.toLowerCase() && p.annee === currentYear
  );

  const revenusMois = paiementsMois.reduce((sum, p) => sum + Number(p.montant), 0);

  const depensesMois = depenses
    .filter(d => d.date_depense.startsWith(`${currentYear}-03`))
    .reduce((sum, d) => sum + Number(d.montant), 0);

  const beneficeNetMois = revenusMois - depensesMois;

  // Calcul des impayés / créances
  const unpaidList = locataires.map(l => {
    const maison = maisons.find(m => m.id === l.maison_id);
    const loyerDu = maison ? maison.loyer_mensuel : 0;
    const payeCeMois = paiements
      .filter(p => p.locataire_id === l.id && p.mois.toLowerCase() === currentMonthName.toLowerCase() && p.annee === currentYear)
      .reduce((s, p) => s + Number(p.montant), 0);
    const resteDu = Math.max(0, loyerDu - payeCeMois);
    return {
      locataire: l,
      maison,
      loyerDu,
      payeCeMois,
      resteDu
    };
  }).filter(item => item.resteDu > 0);

  const creancesTotales = unpaidList.reduce((sum, item) => sum + item.resteDu, 0);

  // Taux d'occupation
  const totalMaisonsCount = maisons.length;
  const maisonsOccupeesCount = maisons.filter(m => m.statut === 'occupee').length;
  const tauxOccupation = totalMaisonsCount > 0 ? Math.round((maisonsOccupeesCount / totalMaisonsCount) * 100) : 0;

  // Données mensuelles pour le graphique
  const monthlyData = [
    { mois: 'Oct', revenus: 750000, depenses: 80000 },
    { mois: 'Nov', revenus: 880000, depenses: 120000 },
    { mois: 'Déc', revenus: 910000, depenses: 195000 },
    { mois: 'Jan', revenus: 820000, depenses: 60000 },
    { mois: 'Fév', revenus: 910000, depenses: 170000 },
    { mois: 'Mar', revenus: revenusMois, depenses: depensesMois },
  ];

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.revenus, d.depenses)), 1000000);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Tableau de Bord
            <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-sky-400">
              {currentMonthName} {currentYear}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Vue d&apos;ensemble de la rentabilité, des encaissements et des alertes locatives.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewPayment}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            Enregistrer Paiement
          </button>
          <button
            onClick={onOpenNewDepense}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            Dépense
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Revenus du Mois */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Revenus Perçus (Mois)</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {formatMonnaie(revenusMois, settings.devise)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Attendu : {formatMonnaie(totalLoyerAttendu, settings.devise)}</span>
              <span className="text-sky-400 font-semibold">
                {totalLoyerAttendu > 0 ? Math.round((revenusMois / totalLoyerAttendu) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Créances Totales / Impayés */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Créances Totales (Impayés)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl font-black tracking-tight ${creancesTotales > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatMonnaie(creancesTotales, settings.devise)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">{unpaidList.length} locataire(s) en retard</span>
              {creancesTotales > 0 && (
                <button
                  onClick={() => onNavigateTab('locataires')}
                  className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-0.5"
                >
                  Relancer <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* KPI 3: Dépenses du Mois */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Dépenses & Travaux</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-amber-300 tracking-tight">
              {formatMonnaie(depensesMois, settings.devise)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Travaux & Réfections</span>
              <button
                onClick={() => onNavigateTab('depenses')}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
              >
                Détails <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* KPI 4: Bénéfice Net */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bénéfice Net Réalisé</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl font-black tracking-tight ${beneficeNetMois >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMonnaie(beneficeNetMois, settings.devise)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Marge nette</span>
              <span className="text-emerald-400 font-semibold">
                {revenusMois > 0 ? Math.round((beneficeNetMois / revenusMois) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Financial Chart & Occupancy Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Bar Chart for Revenues vs Expenses */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Évolution Financière (6 derniers mois)
              </h3>
              <p className="text-xs text-slate-400">Comparaison des loyers perçus vs dépenses de réfection</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500 inline-block" />
                <span className="text-slate-300">Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-slate-300">Dépenses</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {monthlyData.map((d, index) => {
              const revHeight = (d.revenus / maxVal) * 100;
              const depHeight = (d.depenses / maxVal) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    
                    {/* Revenue Bar */}
                    <div 
                      style={{ height: `${Math.max(revHeight, 4)}%` }} 
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-md transition-all group-hover:brightness-125 relative"
                      title={`Revenus ${d.mois}: ${formatMonnaie(d.revenus, settings.devise)}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[10px] text-sky-300 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 transition">
                        {formatMonnaie(d.revenus, settings.devise)}
                      </span>
                    </div>

                    {/* Expense Bar */}
                    <div 
                      style={{ height: `${Math.max(depHeight, 4)}%` }} 
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all group-hover:brightness-125 relative"
                      title={`Dépenses ${d.mois}: ${formatMonnaie(d.depenses, settings.devise)}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[10px] text-amber-300 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 transition">
                        {formatMonnaie(d.depenses, settings.devise)}
                      </span>
                    </div>

                  </div>
                  <span className="text-[11px] font-medium text-slate-400 mt-2">{d.mois}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Moyenne mensuelle nette : ~ {formatMonnaie(720000, settings.devise)}</span>
            <span className="text-emerald-400 font-medium">Rentabilité positive</span>
          </div>
        </div>

        {/* Occupancy and Properties Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-sky-400" />
                Parc Immobilier
              </h3>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                {totalMaisonsCount} biens
              </span>
            </div>

            {/* Circular / Progress Indicator */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-4 text-center">
              <div className="text-3xl font-black text-sky-400">{tauxOccupation}%</div>
              <p className="text-xs text-slate-400 mt-0.5">Taux d&apos;occupation actuel</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${tauxOccupation}%` }}
                />
              </div>
            </div>

            {/* Breakdown Status */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Occupées / Louées
                </span>
                <span className="font-bold text-white">{maisonsOccupeesCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Disponibles
                </span>
                <span className="font-bold text-white">{maisons.filter(m => m.statut === 'disponible').length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  En rénovation
                </span>
                <span className="font-bold text-white">{maisons.filter(m => m.statut === 'en_renovation').length}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('maisons')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-semibold rounded-xl transition"
            >
              Gérer les biens immobiliers →
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Action Alerts for Unpaid Rents & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unpaid Rents Immediate Action List with WhatsApp Button */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Créances & Impayés à Relancer</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
              {unpaidList.length} en attente
            </span>
          </div>

          {unpaidList.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Aucun impayé pour {currentMonthName} {currentYear}</p>
              <p className="text-xs text-slate-400 mt-1">Tous les locataires sont parfaitement à jour de leurs loyers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidList.map((item, index) => {
                const whatsappMsg = encodeURIComponent(
                  `Bonjour ${item.locataire.prenom},\nNous vous rappelons que le loyer du mois de ${currentMonthName} pour "${item.maison?.nom || 'votre logement'}" est actuellement en attente d'un montant de ${formatMonnaie(item.resteDu, settings.devise)}.\nMerci de bien vouloir régulariser.\nCordialement,\n${settings.nom_bailleur}`
                );
                const whatsappUrl = `https://wa.me/${(item.locataire.whatsapp || item.locataire.telephone).replace(/[^0-9]/g, '')}?text=${whatsappMsg}`;

                return (
                  <div key={index} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.locataire.prenom} {item.locataire.nom}</span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-medium">
                          Reste {formatMonnaie(item.resteDu, settings.devise)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.maison?.nom} • Tél: {item.locataire.telephone}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                        title="Relancer par WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                      <button
                        onClick={onOpenNewPayment}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition active:scale-95"
                      >
                        Encaisser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Payments & PDF Receipts */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Derniers Encaissements</h3>
            </div>
            <button
              onClick={() => onNavigateTab('paiements')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Historique complet →
            </button>
          </div>

          <div className="space-y-2.5">
            {paiements.slice(0, 4).map((p) => {
              const loc = locataires.find(l => l.id === p.locataire_id);
              const m = maisons.find(item => item.id === p.maison_id || item.id === loc?.maison_id);

              return (
                <div key={p.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {loc ? `${loc.prenom} ${loc.nom}` : 'Locataire'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {p.mois} {p.annee} • {p.moyen_paiement.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        +{formatMonnaie(p.montant, settings.devise)}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.date_paiement}</p>
                    </div>

                    {loc && (
                      <button
                        onClick={() => genererQuittancePDF(p, loc, m, settings)}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition"
                        title="Télécharger Quittance PDF"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
