import React from 'react';
import { RequesterGateway } from './RequesterGateway';
import { WalletOwnerDashboard } from './WalletOwnerDashboard';
import { ArrowRight, Sparkles, Zap, Layers } from 'lucide-react';
import { useApprovalStore } from '../context/ApprovalStore';
import { formatAddress } from '../utils/web3Mock';

export const SplitView: React.FC = () => {
  const { activeWallet } = useApprovalStore();

  return (
    <div className="mx-auto max-w-[1720px] px-3 py-4 sm:px-6 lg:px-8">
      {/* Interactive Loop Guide Banner */}
      <div className="mb-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 p-3 sm:p-4 text-xs text-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-2">
                <span>Side-by-Side Simulation: Requester Gateway & Wallet Owner Dashboard</span>
                <span className="text-[10px] rounded bg-cyan-500/20 px-1.5 py-0.5 text-cyan-300 font-mono">
                  Real-time Cross-Channel
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                1. Put the wallet address on the left & dispatch an approval request.
                <span className="mx-1.5 text-slate-600">→</span>
                2. Watch it appear instantly on the right integration dashboard for the wallet owner.
                <span className="mx-1.5 text-slate-600">→</span>
                3. Approve & sign to generate on-chain proof and deliver webhook callback!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-slate-400">
            <span>Owner Address:</span>
            <code className="font-mono text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {formatAddress(activeWallet.address, 4)} ({activeWallet.name.split(' ')[0]})
            </code>
          </div>
        </div>
      </div>

      {/* Side-by-Side Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Requester Gateway */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-bold font-mono">
                1
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Requester Portal (dApp / Integrator)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Target: {formatAddress(activeWallet.address, 3)}</span>
          </div>

          <RequesterGateway isCompact={true} />
        </div>

        {/* Right Side: Wallet Owner Dashboard */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono">
                2
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Wallet Owner Integration Dashboard
              </h2>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Receiver Active
            </span>
          </div>

          <WalletOwnerDashboard isCompact={true} />
        </div>
      </div>
    </div>
  );
};
