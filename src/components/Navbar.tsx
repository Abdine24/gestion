'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  Database, 
  Check, 
  Menu, 
  X, 
  Download,
  AlertTriangle,
  Smartphone,
  MapPin
} from 'lucide-react';
import { ProprietaireSettings } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  settings: ProprietaireSettings;
  onUpdateCurrency: (currency: 'FCFA' | 'EUR' | 'USD') => void;
  unpaidCount: number;
  unpaidTenants: { nom: string; maison: string; montant: number }[];
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onNavigateTab: (tab: string) => void;
}

export default function Navbar({
  settings,
  onUpdateCurrency,
  unpaidCount,
  unpaidTenants,
  onOpenMobileMenu,
  isMobileMenuOpen,
  onNavigateTab,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg md:hidden focus:outline-none"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div 
            onClick={() => onNavigateTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">GestionLocative</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">PWA Gestion Immobilière & Loyers</p>
            </div>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Single City Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-sky-400">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>{settings.ville}</span>
          </div>

          {/* Database / Sync Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-medium">
              {isSupabaseConfigured ? 'Supabase Synchronisé' : 'Stockage Local Sécurisé'}
            </span>
          </div>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-slate-700 transition"
              title="Changer la devise"
            >
              <span>{settings.devise}</span>
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                {(['FCFA', 'EUR', 'USD'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      onUpdateCurrency(curr);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      settings.devise === curr ? 'text-sky-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{curr}</span>
                    {settings.devise === curr && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Overdue Rents */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              aria-label="Alertes impayés"
            >
              <Bell className="w-4 h-4" />
              {unpaidCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-950 animate-bounce">
                  {unpaidCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="font-semibold text-sm text-white">Alertes Loyers & Retards</h4>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                    {unpaidCount} en attente
                  </span>
                </div>

                {unpaidTenants.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    Tous les loyers sont à jour ce mois-ci ! Félicitations.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {unpaidTenants.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateTab('locataires');
                        }}
                        className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{t.nom}</p>
                          <p className="text-slate-400 text-[11px]">{t.maison}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-400">
                            {new Intl.NumberFormat('fr-FR').format(t.montant)} {settings.devise}
                          </span>
                          <span className="block text-[10px] text-amber-400">Relance recommandée</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateTab('paiements');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Voir tous les paiements et relances →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick PWA App Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA Ready</span>
          </div>

        </div>

      </div>
    </header>
  );
}
