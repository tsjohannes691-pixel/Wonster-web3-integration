import React, { useState } from 'react';
import { useApprovalStore } from '../context/ApprovalStore';
import { formatAddress } from '../utils/web3Mock';
import { ShieldAlert, ShieldCheck, Trash2, ExternalLink, Search, RefreshCw } from 'lucide-react';

export const ActiveIntegrationsTab: React.FC = () => {
  const { requests, activeWallet, revokeApproval } = useApprovalStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Filter approved or active requests for current wallet
  const approvedRequests = requests.filter(r => 
    r.targetWallet.toLowerCase() === activeWallet.address.toLowerCase() &&
    (r.status === 'approved' || r.status === 'revoked')
  );

  const filtered = approvedRequests.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.requesterName.toLowerCase().includes(term) ||
      (r.token && r.token.symbol.toLowerCase().includes(term)) ||
      (r.spenderAddress && r.spenderAddress.toLowerCase().includes(term))
    );
  });

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      revokeApproval(id);
      setRevokingId(null);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header and description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Active Token Allowances & Approvals
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>Managing active allowances for</span>
            <span className="font-mono text-cyan-400 font-medium">{formatAddress(activeWallet.address, 4)}</span>
            <span aria-hidden="true">·</span>
            <span>{activeWallet.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by protocol or token..."
              className="rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Active Permissions</div>
          <div className="mt-1 text-2xl font-bold font-mono text-white tabular-nums">
            {approvedRequests.filter(r => r.status === 'approved').length}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Total Value Exposed</div>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            $
            {approvedRequests
              .filter(r => r.status === 'approved')
              .reduce((acc, r) => acc + (r.token?.usdValue || 0), 0)
              .toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Revocation Security Standard</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>EIP-2612 & Zero-Allowance Cap</span>
          </div>
        </div>
      </div>

      {/* Table of Allowances */}
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">Protocol / Integration</th>
                <th scope="col" className="px-4 py-3">Asset</th>
                <th scope="col" className="px-4 py-3">Approved Limit</th>
                <th scope="col" className="px-4 py-3">Network</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No matching allowances or active approvals found for this wallet.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const isRevoked = req.status === 'revoked';
                  const isInfinite = req.token?.isUnlimited;
                  return (
                    <tr key={req.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-sans font-medium text-white">{req.requesterName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {req.spenderAddress ? formatAddress(req.spenderAddress, 4) : req.requesterDomain}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-sans font-semibold text-slate-200">
                          {req.token?.symbol || 'Native'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums">
                        {isRevoked ? (
                          <span className="text-slate-500">0.00 (Revoked)</span>
                        ) : isInfinite ? (
                          <span className="text-amber-400 font-semibold">Unlimited Cap</span>
                        ) : (
                          <span className="text-slate-200">{req.token?.amount} {req.token?.symbol}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 capitalize font-sans text-slate-400">
                        {req.network}
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        {isRevoked ? (
                          <span className="text-slate-500">Revoked</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-sans">
                        {isRevoked ? (
                          <span className="text-xs text-slate-600">Permissions cleared</span>
                        ) : (
                          <button
                            onClick={() => handleRevoke(req.id)}
                            disabled={revokingId === req.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors disabled:opacity-50"
                          >
                            {revokingId === req.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
