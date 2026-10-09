'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Receipt, 
  Wrench, 
  FileSpreadsheet, 
  Settings,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, badge: null },
    { id: 'maisons', label: 'Biens Immobiliers', icon: Home, badge: null },
    { id: 'locataires', label: 'Locataires', icon: Users, badge: null },
    { id: 'paiements', label: 'Paiements & Quittances', icon: Receipt, badge: 'PDF' },
    { id: 'depenses', label: 'Dépenses & Travaux', icon: Wrench, badge: null },
    { id: 'rapports', label: 'Rapports Financiers', icon: FileSpreadsheet, badge: 'Excel' },
    { id: 'parametres', label: 'Paramètres', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 glass-panel border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 py-2">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Gestion Locative Pro
            </p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card for PWA & Offline Tips */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>PWA Autonome</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Fonctionne hors-ligne et installable sur smartphone en 1 clic.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
            <span>Version 1.0.0</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Prêt
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
