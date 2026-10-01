import React from 'react';
import { useApprovalStore } from '../context/ApprovalStore';
import { formatAddress } from '../utils/web3Mock';
import { 
  Volume2, 
  VolumeX, 
  Wallet, 
  RotateCcw, 
  ChevronDown,
  Layers,
  Send,
  ShieldCheck,
  Code2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    activeWallet, 
    availableWallets, 
    setActiveWalletByAddress, 
    connectInjectedWallet, 
    soundEnabled, 
    setSoundEnabled,
    resetToDefaultDemo,
    requests 
  } = useApprovalStore();

  const [walletDropdownOpen, setWalletDropdownOpen] = React.useState(false);
  const pendingCount = requests.filter(r => r.status === 'pending' && r.targetWallet.toLowerCase() === activeWallet.address.toLowerCase()).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('split')}
            className="flex items-center gap-2 text-left focus-visible:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors">
              SignaLink
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'split' 
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Split Demo</span>
          </button>

          <button
            onClick={() => setCurrentView('requester')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'requester' 
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Create Request</span>
          </button>

          <button
            onClick={() => setCurrentView('owner')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'owner' 
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Owner Dashboard</span>
            {pendingCount > 0 && (
              <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('allowances')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'allowances' 
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Active Allowances</span>
          </button>

          <button
            onClick={() => setCurrentView('developer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'developer' 
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Integration API</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions & Wallet persona */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute acoustic alerts' : 'Enable acoustic alerts'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          {/* Reset demo */}
          <button
            onClick={resetToDefaultDemo}
            title="Reset demo data"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Active Wallet Dropdown / Connect */}
          <div className="relative">
            <button
              onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-850 transition-colors focus-visible:outline-none"
            >
              <div className={`h-2 w-2 rounded-full ${activeWallet.type === 'injected' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="font-mono">{formatAddress(activeWallet.address, 3)}</span>
              <span className="hidden lg:inline text-slate-500 font-sans">({activeWallet.name.split(' ')[0]})</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {walletDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setWalletDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 z-50 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl shadow-black/60">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Target / Active Wallet
                  </div>
                  <div className="space-y-1">
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet.address}
                        onClick={() => {
                          setActiveWalletByAddress(wallet.address);
                          setWalletDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          activeWallet.address.toLowerCase() === wallet.address.toLowerCase()
                            ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate text-white">{wallet.name}</div>
                          <div className="font-mono text-[11px] text-slate-400 truncate">{formatAddress(wallet.address, 4)}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-400 font-mono tabular-nums">
                          {wallet.balanceEth} ETH
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 border-t border-slate-800 pt-2">
                    <button
                      onClick={async () => {
                        await connectInjectedWallet();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <Wallet className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Connect Injected Web3 (MetaMask)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
