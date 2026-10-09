'use client';

import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Maison, Locataire, Paiement, Depense, ProprietaireSettings } from '@/types';
import { formatMonnaie, genererRapportFinancierPDF } from '@/lib/pdfGenerator';
import { exporterExcelComplet } from '@/lib/excelExport';

interface RapportsViewProps {
  maisons: Maison[];
  locataires: Locataire[];
  paiements: Paiement[];
  depenses: Depense[];
  settings: ProprietaireSettings;
}

export default function RapportsView({
  maisons,
  locataires,
  paiements,
  depenses,
  settings,
}: RapportsViewProps) {
  const totalRevenus = paiements.reduce((acc, p) => acc + Number(p.montant), 0);
  const totalDepenses = depenses.reduce((acc, d) => acc + Number(d.montant), 0);
  const beneficeNet = totalRevenus - totalDepenses;
  const margeNette = totalRevenus > 0 ? Math.round((beneficeNet / totalRevenus) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Rapports & Exports
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              PDF & Excel
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Générez vos bilans comptables, quittances et archives au format tableur Microsoft Excel ou document PDF officiel.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exporterExcelComplet(maisons, locataires, paiements, depenses)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporter Excel (.xlsx)
          </button>

          <button
            onClick={() => genererRapportFinancierPDF(maisons, paiements, depenses, settings)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-slate-950" />
            Bilan Financier PDF
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Revenus Cumulés Perçus</p>
          <h2 className="text-2xl font-black text-emerald-400 mt-2">
            +{formatMonnaie(totalRevenus, settings.devise)}
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">{paiements.length} paiements enregistrés</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Dépenses & Réfections</p>
          <h2 className="text-2xl font-black text-amber-300 mt-2">
            -{formatMonnaie(totalDepenses, settings.devise)}
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">{depenses.length} interventions / travaux</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Bénéfice Net d&apos;Exploitation</p>
          <h2 className={`text-2xl font-black mt-2 ${beneficeNet >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
            {formatMonnaie(beneficeNet, settings.devise)}
          </h2>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">Marge nette globale : {margeNette}%</p>
        </div>
      </div>

      {/* Property Breakdown Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Home className="w-4 h-4 text-sky-400" />
            Rentabilité Détaillée par Bien Immobilier
          </h3>
          <span className="text-xs text-slate-400">
            {maisons.length} logements audités
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Logement</th>
                <th className="py-3.5 px-4 font-semibold">Statut</th>
                <th className="py-3.5 px-4 font-semibold">Loyer Mensuel</th>
                <th className="py-3.5 px-4 font-semibold">Total Encaissé</th>
                <th className="py-3.5 px-4 font-semibold">Total Travaux</th>
                <th className="py-3.5 px-4 font-semibold">Résultat Net</th>
                <th className="py-3.5 px-4 font-semibold text-right">Rentabilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {maisons.map((m) => {
                const rev = paiements.filter(p => p.maison_id === m.id).reduce((s, p) => s + Number(p.montant), 0);
                const dep = depenses.filter(d => d.maison_id === m.id).reduce((s, d) => s + Number(d.montant), 0);
                const net = rev - dep;
                const ratio = rev > 0 ? Math.round((net / rev) * 100) : 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {m.nom}
                      <span className="block text-[11px] font-normal text-slate-400">{m.adresse}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.statut === 'occupee' ? 'bg-emerald-500/20 text-emerald-300' :
                        m.statut === 'disponible' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {m.statut.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      {formatMonnaie(m.loyer_mensuel, settings.devise)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      +{formatMonnaie(rev, settings.devise)}
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 font-medium">
                      -{formatMonnaie(dep, settings.devise)}
                    </td>
                    <td className="py-3.5 px-4 font-black">
                      <span className={net >= 0 ? 'text-sky-400' : 'text-rose-400'}>
                        {formatMonnaie(net, settings.devise)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-bold ${ratio >= 70 ? 'text-emerald-400' : ratio > 0 ? 'text-sky-400' : 'text-slate-400'}`}>
                        {ratio}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
