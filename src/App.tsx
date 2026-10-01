/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ApprovalProvider, useApprovalStore } from './context/ApprovalStore';
import { Navbar } from './components/Navbar';
import { SplitView } from './components/SplitView';
import { RequesterGateway } from './components/RequesterGateway';
import { WalletOwnerDashboard } from './components/WalletOwnerDashboard';
import { ActiveIntegrationsTab } from './components/ActiveIntegrationsTab';
import { DeveloperApiModal } from './components/DeveloperApiModal';
import { ShieldCheck, Lock, ExternalLink, Code2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, setCurrentView } = useApprovalStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100">
      {/* Universal Top Bar */}
      <Navbar />

      {/* Main Viewport */}
      <main className="flex-1 pb-16">
        {currentView === 'split' && <SplitView />}
        {currentView === 'requester' && <RequesterGateway />}
        {currentView === 'owner' && <WalletOwnerDashboard />}
        {currentView === 'allowances' && <ActiveIntegrationsTab />}
        {currentView === 'developer' && (
          <div className="mx-auto max-w-5xl px-4 py-8">
            <DeveloperApiModal onClose={() => setCurrentView('split')} />
          </div>
        )}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">SignaLink Protocol</span>
            <span className="text-slate-700">·</span>
            <span>Cryptographic Web3 Approval & Allowance Gateway</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('developer')}
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <Code2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>API Docs</span>
            </button>
            <button
              onClick={() => setCurrentView('allowances')}
              className="hover:text-slate-300 transition-colors"
            >
              Revoke Manager
            </button>
            <span className="text-slate-600">EIP-712 / EIP-2612 Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ApprovalProvider>
      <MainContent />
    </ApprovalProvider>
  );
}
