import React, { useState } from 'react';
import { useApprovalStore } from '../context/ApprovalStore';
import { formatAddress, getExplorerUrl } from '../utils/web3Mock';
import { ApprovalRequest } from '../types/approval';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  Ban, 
  Sliders, 
  ExternalLink, 
  Clock, 
  Code, 
  Search, 
  Layers,
  ChevronDown,
  Wallet,
  Sparkles
} from 'lucide-react';
import { AdjustLimitModal } from './AdjustLimitModal';
import { RejectReasonModal } from './RejectReasonModal';

export const WalletOwnerDashboard: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  const { 
    requests, 
    activeWallet, 
    availableWallets, 
    setActiveWalletByAddress, 
    approveRequest, 
    rejectRequest, 
    markAsViewed,
    activeFilter,
    setActiveFilter
  } = useApprovalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayloadTab, setSelectedPayloadTab] = useState<Record<string, 'summary' | 'typed' | 'raw'>>({});
  const [adjustingRequest, setAdjustingRequest] = useState<ApprovalRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<ApprovalRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter requests targeted at currently active wallet
  const walletRequests = requests.filter(r => 
    r.targetWallet.toLowerCase() === activeWallet.address.toLowerCase()
  );

  const pendingRequests = walletRequests.filter(r => r.status === 'pending' || r.status === 'viewed');

  const filteredRequests = walletRequests.filter(r => {
    // Status filter
    if (activeFilter === 'pending' && r.status !== 'pending' && r.status !== 'viewed') return false;
    if (activeFilter === 'approved' && r.status !== 'approved') return false;
    if (activeFilter === 'rejected' && r.status !== 'rejected') return false;
    if (activeFilter === 'revoked' && r.status !== 'revoked') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.requesterName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.token && r.token.symbol.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPayloadTab = (id: string) => selectedPayloadTab[id] || 'summary';
  const setPayloadTab = (id: string, tab: 'summary' | 'typed' | 'raw') => {
    setSelectedPayloadTab(prev => ({ ...prev, [id]: tab }));
  };

  const handleApprove = async (id: string, customAllowance?: string) => {
    setProcessingId(id);
    await approveRequest(id, customAllowance);
    setProcessingId(null);
  };

  return (
    <div className={`flex flex-col h-full ${isCompact ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}`}>
      {/* Wallet Identity & Account Strip */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Wallet Owner Portal
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Incoming Approvals & Security Firewall</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {activeWallet.name}
              </h2>
              <span className="font-mono text-xs rounded-md bg-slate-800 px-2 py-0.5 text-slate-300 border border-slate-700">
                {formatAddress(activeWallet.address, 4)}
              </span>
            </div>
          </div>

          {/* Account Balances */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">ETH Balance</div>
              <div className="text-xs font-bold font-mono text-white tabular-nums">
                {activeWallet.balanceEth.toFixed(3)} ETH
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">USDC Liquid</div>
              <div className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                ${activeWallet.balanceUsdc.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Alert Banner if pending requests exist */}
        {pendingRequests.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5 text-xs text-cyan-200">
            <div className="flex items-center gap-2.5">
              <div className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>
                <strong>{pendingRequests.length} incoming approval request{pendingRequests.length > 1 ? 's' : ''}</strong> waiting for your cryptographic signature.
              </span>
            </div>
            <button
              onClick={() => setActiveFilter('pending')}
              className="text-xs font-semibold text-cyan-300 hover:text-white underline"
            >
              View pending
            </button>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Requests ({walletRequests.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pending Review</span>
              {pendingRequests.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('approved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'approved'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Approved ({walletRequests.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveFilter('rejected')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'rejected'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Declined ({walletRequests.filter(r => r.status === 'rejected' || r.status === 'revoked').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search approvals..."
              className="w-full sm:w-56 rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Request Stream */}
      <div className="mt-6 space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">No Approval Requests</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No requests match your search criteria.'
                : activeFilter === 'pending'
                ? 'You have zero pending signature requests. Your wallet is safe and idle.'
                : 'No approvals recorded for this wallet yet.'}
            </p>
            <p className="mt-4 text-[11px] text-cyan-400">
              Tip: Switch to the Dispatcher or Split View to dispatch an approval to this address!
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending' || req.status === 'viewed';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';
            const isRevoked = req.status === 'revoked';
            const tab = getPayloadTab(req.id);

            return (
              <div
                key={req.id}
                onMouseEnter={() => {
                  if (req.status === 'pending') markAsViewed(req.id);
                }}
                className={`rounded-2xl border transition-all ${
                  isPending
                    ? 'border-cyan-500/40 bg-slate-900/90 shadow-xl shadow-cyan-950/20'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                {/* Request Header */}
                <div className="border-b border-slate-800/80 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Security Shield Asset Thumbnail */}
                      <div className="relative flex-shrink-0 h-10 w-10 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                        <img
                          src="/src/assets/images/crypto_security_shield_1790869770405.jpg"
                          alt="Security Assessment Shield"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Styled CSS fallback container
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-cyan-950/40 text-cyan-400">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white">{req.title}</h3>
                          <span className="text-xs text-slate-500 font-mono">#{req.id}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="text-cyan-400 font-medium">{req.requesterName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-400">{req.requesterDomain}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize text-slate-300">{req.network}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                          Signature Required
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                          Approved & Signed
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-medium text-rose-400">
                          <Ban className="h-3.5 w-3.5" />
                          Declined
                        </span>
                      )}
                      {isRevoked && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 px-3 py-1 text-xs font-medium text-slate-400">
                          Revoked
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {/* Security Risk Assessment Matrix */}
                <div className="border-b border-slate-800/80 bg-slate-950/40 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        req.securityReport.riskLevel === 'low' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : req.securityReport.riskLevel === 'high' || req.securityReport.riskLevel === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {req.securityReport.riskLevel === 'low' ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Security Assessment: {req.securityReport.reputation}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Safety Trust Score: <span className="font-mono font-bold text-slate-200">{req.securityReport.riskScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {req.securityReport.flags.map((flag, i) => (
                        <span key={i} className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {req.securityReport.warnings.length > 0 && (
                    <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                      {req.securityReport.warnings.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Decoded Transaction Payload Inspector */}
                <div className="p-5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Payload Details
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setPayloadTab(req.id, 'summary')}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          tab === 'summary' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => setPayloadTab(req.id, 'typed')}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          tab === 'typed' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        EIP-712 Data
                      </button>
                      <button
                        onClick={() => setPayloadTab(req.id, 'raw')}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          tab === 'raw' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Raw Calldata
                      </button>
                    </div>
                  </div>

                  {/* Summary Tab */}
                  {tab === 'summary' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {req.token && (
                        <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800/80">
                          <div className="text-[11px] text-slate-400">Approved Spending Cap</div>
                          <div className="mt-1 text-sm font-bold font-mono text-cyan-300">
                            {req.token.isUnlimited ? (
                              <span className="text-amber-400">Unlimited Cap (2^256-1)</span>
                            ) : (
                              `${req.token.amount} ${req.token.symbol}`
                            )}
                          </div>
                        </div>
                      )}

                      {req.spenderAddress && (
                        <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800/80">
                          <div className="text-[11px] text-slate-400">Authorized Spender</div>
                          <div className="mt-1 font-mono text-xs text-slate-200 flex items-center justify-between">
                            <span>{formatAddress(req.spenderAddress, 4)}</span>
                            {req.isSpenderVerified && (
                              <span className="text-[10px] text-emerald-400 font-sans font-medium">Verified</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800/80">
                        <div className="text-[11px] text-slate-400">Network Fee Estimate</div>
                        <div className="mt-1 font-mono text-xs text-slate-300">
                          ~{req.payloadData.gasEstimateGwei || 24} Gwei ($0.03)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Typed Data Tab */}
                  {tab === 'typed' && (
                    <pre className="max-h-48 overflow-y-auto rounded-xl bg-slate-950 p-3 text-xs font-mono text-cyan-200/90 border border-slate-800">
                      <code>{JSON.stringify(req.payloadData.typedData || { message: req.payloadData.message }, null, 2)}</code>
                    </pre>
                  )}

                  {/* Raw Calldata Tab */}
                  {tab === 'raw' && (
                    <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                      {req.payloadData.rawCalldata || '0x'}
                    </div>
                  )}
                </div>

                {/* Outcome Proof if already signed */}
                {isApproved && req.result && (
                  <div className="border-t border-slate-800/80 bg-slate-950/70 p-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-slate-400">
                      <div>
                        <span>Signed by: <code className="font-mono text-slate-200">{formatAddress(req.result.signerAddress, 4)}</code></span>
                        <span className="mx-2">·</span>
                        <span>{req.result.gasUsed}</span>
                      </div>
                      <a
                        href={getExplorerUrl(req.network, req.result.txHash || '')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-cyan-400 hover:underline"
                      >
                        <span>Tx: {formatAddress(req.result.txHash || '', 6)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Outcome Reason if rejected */}
                {isRejected && req.result && (
                  <div className="border-t border-slate-800/80 bg-rose-950/20 p-4 text-xs text-rose-300">
                    <div className="font-semibold">Rejection Note:</div>
                    <div className="mt-0.5">{req.result.rejectionReason}</div>
                  </div>
                )}

                {/* Interactive Action Footer for Pending Requests */}
                {isPending && (
                  <div className="border-t border-slate-800/80 bg-slate-950/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Request is active and awaiting your signature</span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {/* Reject button */}
                      <button
                        type="button"
                        onClick={() => setRejectingRequest(req)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>

                      {/* Adjust Limit button if token allowance */}
                      {req.type === 'token_allowance' && (
                        <button
                          type="button"
                          onClick={() => setAdjustingRequest(req)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-750 transition-colors"
                        >
                          <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Custom Limit</span>
                        </button>
                      )}

                      {/* Primary Approve Button */}
                      <button
                        type="button"
                        disabled={processingId === req.id}
                        onClick={() => handleApprove(req.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 focus-visible:outline-none transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>
                          {processingId === req.id ? 'Signing...' : 'Approve & Sign'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Adjust Limit Modal */}
      {adjustingRequest && (
        <AdjustLimitModal
          request={adjustingRequest}
          onClose={() => setAdjustingRequest(null)}
          onConfirm={(newAmount) => {
            handleApprove(adjustingRequest.id, newAmount);
            setAdjustingRequest(null);
          }}
        />
      )}

      {/* Reject Modal */}
      {rejectingRequest && (
        <RejectReasonModal
          request={rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onConfirm={(reason) => {
            rejectRequest(rejectingRequest.id, reason);
            setRejectingRequest(null);
          }}
        />
      )}
    </div>
  );
};
