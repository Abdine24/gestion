'use client';

import React, { useState, useEffect } from 'react';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Dashboard from '@/components/Dashboard';
import MaisonsView from '@/components/MaisonsView';
import LocatairesView from '@/components/LocatairesView';
import PaiementsView from '@/components/PaiementsView';
import DepensesView from '@/components/DepensesView';
import RapportsView from '@/components/RapportsView';
import ParametresView from '@/components/ParametresView';

import { StorageService, DEFAULT_SETTINGS } from '@/lib/storage';
import { Maison, Locataire, Paiement, Depense, ProprietaireSettings } from '@/types';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Core Data States
  const [maisons, setMaisons] = useState<Maison[]>([]);
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [settings, setSettings] = useState<ProprietaireSettings>(DEFAULT_SETTINGS);

  // Modals trigger states for dashboard actions
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [isNewDepenseModalOpen, setIsNewDepenseModalOpen] = useState(false);

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      try {
        const [m, l, p, d] = await Promise.all([
          StorageService.getMaisons(),
          StorageService.getLocataires(),
          StorageService.getPaiements(),
          StorageService.getDepenses(),
        ]);
        setMaisons(m);
        setLocataires(l);
        setPaiements(p);
        setDepenses(d);
        setSettings(StorageService.getSettings());
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Unpaid Tenants for Notifications
  const currentMonthName = 'Mars';
  const currentYear = 2026;

  const unpaidTenants = locataires.map(l => {
    const maison = maisons.find(m => m.id === l.maison_id);
    const loyerDu = maison ? maison.loyer_mensuel : 0;
    const payeCeMois = paiements
      .filter(p => p.locataire_id === l.id && p.mois.toLowerCase() === currentMonthName.toLowerCase() && p.annee === currentYear)
      .reduce((s, p) => s + Number(p.montant), 0);
    const resteDu = Math.max(0, loyerDu - payeCeMois);
    return {
      nom: `${l.prenom} ${l.nom}`,
      maison: maison?.nom || 'Logement',
      montant: resteDu
    };
  }).filter(item => item.montant > 0);

  // Handlers for data updates
  const handleSaveMaison = async (m: Maison) => {
    await StorageService.saveMaison(m);
    const updated = await StorageService.getMaisons();
    setMaisons(updated);
  };

  const handleDeleteMaison = async (id: string) => {
    await StorageService.deleteMaison(id);
    const updated = await StorageService.getMaisons();
    setMaisons(updated);
  };

  const handleSaveLocataire = async (loc: Locataire) => {
    await StorageService.saveLocataire(loc);
    const [updatedLocs, updatedMaisons] = await Promise.all([
      StorageService.getLocataires(),
      StorageService.getMaisons()
    ]);
    setLocataires(updatedLocs);
    setMaisons(updatedMaisons);
  };

  const handleDeleteLocataire = async (id: string) => {
    await StorageService.deleteLocataire(id);
    const [updatedLocs, updatedMaisons] = await Promise.all([
      StorageService.getLocataires(),
      StorageService.getMaisons()
    ]);
    setLocataires(updatedLocs);
    setMaisons(updatedMaisons);
  };

  const handleSavePaiement = async (p: Paiement) => {
    await StorageService.savePaiement(p);
    const updated = await StorageService.getPaiements();
    setPaiements(updated);
  };

  const handleDeletePaiement = async (id: string) => {
    await StorageService.deletePaiement(id);
    const updated = await StorageService.getPaiements();
    setPaiements(updated);
  };

  const handleSaveDepense = async (d: Depense) => {
    await StorageService.saveDepense(d);
    const updated = await StorageService.getDepenses();
    setDepenses(updated);
  };

  const handleDeleteDepense = async (id: string) => {
    await StorageService.deleteDepense(id);
    const updated = await StorageService.getDepenses();
    setDepenses(updated);
  };

  const handleSaveSettings = (newSettings: ProprietaireSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleUpdateCurrency = (devise: 'FCFA' | 'EUR' | 'USD') => {
    const updated = { ...settings, devise };
    handleSaveSettings(updated);
  };

  const handleResetDemo = async () => {
    StorageService.resetToDemo();
    const [m, l, p, d] = await Promise.all([
      StorageService.getMaisons(),
      StorageService.getLocataires(),
      StorageService.getPaiements(),
      StorageService.getDepenses(),
    ]);
    setMaisons(m);
    setLocataires(l);
    setPaiements(p);
    setDepenses(d);
    setSettings(StorageService.getSettings());
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onUpdateCurrency={handleUpdateCurrency}
        unpaidCount={unpaidTenants.length}
        unpaidTenants={unpaidTenants}
        onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main View Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-hidden">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-400">Chargement de GestionLocative Pro...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  maisons={maisons}
                  locataires={locataires}
                  paiements={paiements}
                  depenses={depenses}
                  settings={settings}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenNewPayment={() => {
                    setCurrentTab('paiements');
                    setIsNewPaymentModalOpen(true);
                  }}
                  onOpenNewMaison={() => setCurrentTab('maisons')}
                  onOpenNewLocataire={() => setCurrentTab('locataires')}
                  onOpenNewDepense={() => {
                    setCurrentTab('depenses');
                    setIsNewDepenseModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'maisons' && (
                <MaisonsView
                  maisons={maisons}
                  locataires={locataires}
                  paiements={paiements}
                  depenses={depenses}
                  settings={settings}
                  onSaveMaison={handleSaveMaison}
                  onDeleteMaison={handleDeleteMaison}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'locataires' && (
                <LocatairesView
                  locataires={locataires}
                  maisons={maisons}
                  paiements={paiements}
                  settings={settings}
                  onSaveLocataire={handleSaveLocataire}
                  onDeleteLocataire={handleDeleteLocataire}
                  onOpenNewPaymentForTenant={() => {
                    setCurrentTab('paiements');
                    setIsNewPaymentModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'paiements' && (
                <PaiementsView
                  paiements={paiements}
                  locataires={locataires}
                  maisons={maisons}
                  settings={settings}
                  onSavePaiement={handleSavePaiement}
                  onDeletePaiement={handleDeletePaiement}
                  isInitialNewOpen={isNewPaymentModalOpen}
                />
              )}

              {currentTab === 'depenses' && (
                <DepensesView
                  depenses={depenses}
                  maisons={maisons}
                  locataires={locataires}
                  settings={settings}
                  onSaveDepense={handleSaveDepense}
                  onDeleteDepense={handleDeleteDepense}
                  isInitialNewOpen={isNewDepenseModalOpen}
                />
              )}

              {currentTab === 'rapports' && (
                <RapportsView
                  maisons={maisons}
                  locataires={locataires}
                  paiements={paiements}
                  depenses={depenses}
                  settings={settings}
                />
              )}

              {currentTab === 'parametres' && (
                <ParametresView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onResetDemo={handleResetDemo}
                  maisons={maisons}
                  locataires={locataires}
                  paiements={paiements}
                  depenses={depenses}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Thumb Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}
