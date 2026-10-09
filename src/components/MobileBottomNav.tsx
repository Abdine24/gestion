'use client';

import React from 'react';
import { LayoutDashboard, Home, Users, Receipt, Wrench } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export default function MobileBottomNav({ currentTab, onSelectTab }: MobileBottomNavProps) {
  const items = [
    { id: 'dashboard', label: 'Bord', icon: LayoutDashboard },
    { id: 'maisons', label: 'Biens', icon: Home },
    { id: 'locataires', label: 'Locataires', icon: Users },
    { id: 'paiements', label: 'Loyers', icon: Receipt },
    { id: 'depenses', label: 'Dépenses', icon: Wrench },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-500/20' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
