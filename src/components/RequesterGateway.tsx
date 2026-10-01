import React, { useState } from 'react';
import { useApprovalStore } from '../context/ApprovalStore';
import { isValidWalletAddress, formatAddress, getExplorerUrl } from '../utils/web3Mock';
import { ApprovalRequest, ApprovalType, NetworkId } from '../types/approval';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink, 
  QrCode, 
  Webhook, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

export const RequesterGateway: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  const { 
    createRequest, 
    requests, 
    activeWallet, 
    availableWallets, 
    setActiveWalletByAddress,
    setCurrentView 
  } = useApprovalStore();

  // Form states
  const [targetWallet, setTargetWallet] = useState<string>(activeWallet.address);
  const [requesterName, setRequesterName] = useState<string>('Uniswap v3 Protocol');
  const [requesterDomain, setRequesterDomain] = useState<string>('app.uniswap.org');
  const [type, setType] = useState<ApprovalType>('token_allowance');
  const [network, setNetwork] = useState<NetworkId>('ethereum');
  const [title, setTitle] = useState<string>('ERC-20 Spending Cap Allowance');
  const [description, setDescription] = useState<string>('Authorize SwapRouter02 contract to spend USDC for token swaps.');
  
  // Token allowance specific
  const [tokenSymbol, setTokenSymbol] = useState<string>('USDC');
  const [tokenAmount, setTokenAmount] = useState<string>('2,500.00');
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [spenderAddress, setSpenderAddress] = useState<string>('0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45');
  const [spenderName, setSpenderName] = useState<string>('Uniswap v3 SwapRouter02');
  
  // Advanced options
  const [callbackUrl, setCallbackUrl] = useState<string>('https://myapp.com/api/webhooks/signalink');
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(60);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Status feedback
  const [lastDispatched, setLastDispatched] = useState<ApprovalRequest | null>(null);
  const [qrModalRequest, setQrModalRequest] = useState<ApprovalRequest | null>(null);
  const [inspectWebhook, setInspectWebhook] = useState<ApprovalRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isValid = isValidWalletAddress(targetWallet);

  // Apply Quick Presets
  const applyPreset = (preset: 'uniswap' | 'opensea' | 'multisig' | 'siwe') => {
    if (preset === 'uniswap') {
      setRequesterName('Uniswap v3 Protocol');
      setRequesterDomain('app.uniswap.org');
      setType('token_allowance');
      setNetwork('ethereum');
      setTitle('ERC-20 USDC Spending Cap');
      setDescription('Grant Uniswap SwapRouter02 permission to execute automated token trades.');
      setTokenSymbol('USDC');
      setTokenAmount('2,500.00');
      setIsUnlimited(false);
      setSpenderAddress('0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45');
      setSpenderName('Uniswap v3 SwapRouter02');
    } else if (preset === 'opensea') {
      setRequesterName('OpenSea Seaport');
      setRequesterDomain('opensea.io');
      setType('typed_data');
      setNetwork('ethereum');
      setTitle('Seaport Order Signature (Listing)');
      setDescription('Cryptographically sign NFT listing order #89210 on Seaport protocol.');
      setTokenSymbol('WETH');
      setTokenAmount('0.85');
      setIsUnlimited(false);
      setSpenderAddress('0x00000000000000ADc04C56Bf30aC236fdB265E9d');
      setSpenderName('OpenSea Seaport v1.6');
    } else if (preset === 'multisig') {
      setRequesterName('GenesisDAO Treasury');
      setRequesterDomain('app.safe.global');
      setType('contract_execution');
      setNetwork('ethereum');
      setTitle('Treasury Contributor Grant #42');
      setDescription('Multi-sig treasury payout: Release 45,000 DAI to core engineering team.');
      setTokenSymbol('DAI');
      setTokenAmount('45,000.00');
      setIsUnlimited(false);
      setSpenderAddress('0x388C818CA8B9251b393131C08a736829cc774ACb');
      setSpenderName('Safe Multisig Proxy');
    } else if (preset === 'siwe') {
      setRequesterName('CryptoPunks Club');
      setRequesterDomain('cryptopunks.app');
      setType('personal_sign');
      setNetwork('ethereum');
      setTitle('Sign-In With Ethereum (SIWE)');
      setDescription('Verify ownership of your wallet address to access exclusive members dashboard.');
      setTokenAmount('0');
      setIsUnlimited(false);
      setSpenderAddress('');
      setSpenderName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newReq = createRequest({
        targetWallet,
        requesterName,
        requesterDomain,
        type,
        network,
        title,
        description,
        spenderAddress: spenderAddress || undefined,
        spenderName: spenderName || undefined,
        token: type === 'token_allowance' ? {
          symbol: tokenSymbol,
          name: tokenSymbol === 'USDC' ? 'USD Coin' : tokenSymbol === 'WETH' ? 'Wrapped Ether' : `${tokenSymbol} Token`,
          decimals: 18,
          amount: isUnlimited ? 'UNLIMITED' : tokenAmount,
          isUnlimited,
        } : undefined,
        callbackUrl: callbackUrl.trim() || undefined,
        expiresInMinutes,
      });

      setLastDispatched(newReq);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className={`flex flex-col h-full ${isCompact ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}`}>
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Approval Request Dispatcher
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Input any target wallet address to route an instant cryptographic approval request to its owner.
            </p>
          </div>
          <button
            onClick={() => setQrModalRequest(lastDispatched || requests[0])}
            disabled={requests.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <QrCode className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">QR Scan Link</span>
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Quick Scenarios:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('uniswap')}
            className="rounded-md border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
          >
            Uniswap USDC Allowance
          </button>
          <button
            type="button"
            onClick={() => applyPreset('multisig')}
            className="rounded-md border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
          >
            Safe Multisig $45k DAI
          </button>
          <button
            type="button"
            onClick={() => applyPreset('opensea')}
            className="rounded-md border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
          >
            OpenSea Seaport
          </button>
          <button
            type="button"
            onClick={() => applyPreset('siwe')}
            className="rounded-md border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
          >
            SIWE Auth
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Target Wallet Address Input */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-200">
              Target Wallet Address <span className="text-cyan-400">*</span>
            </label>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Quick pick:</span>
              {availableWallets.slice(0, 3).map((w) => (
                <button
                  key={w.address}
                  type="button"
                  onClick={() => setTargetWallet(w.address)}
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {w.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-1.5 relative">
            <input
              type="text"
              required
              value={targetWallet}
              onChange={(e) => setTargetWallet(e.target.value)}
              placeholder="0x... or vitalik.eth"
              className={`w-full rounded-lg border bg-slate-950 px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 transition-colors focus:outline-none ${
                targetWallet.length > 0 && !isValid
                  ? 'border-rose-500/80 focus:border-rose-500'
                  : 'border-slate-800 focus:border-cyan-500'
              }`}
            />
            {targetWallet.length > 0 && (
              <div className="absolute right-3 top-2.5">
                {isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
            )}
          </div>
          {targetWallet.length > 0 && !isValid && (
            <p className="mt-1 text-[11px] text-rose-400">
              Please enter a valid EVM hex address (0x...) or registered ENS domain (.eth)
            </p>
          )}
        </div>

        {/* Grid: Type & Network */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Approval Request Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ApprovalType)}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="token_allowance">Token Spending Allowance (ERC-20)</option>
              <option value="typed_data">EIP-712 Typed Structured Data</option>
              <option value="personal_sign">Personal Message Signature</option>
              <option value="contract_execution">Smart Contract Execution</option>
              <option value="connect_session">dApp Session Connect</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Blockchain Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as NetworkId)}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none capitalize"
            >
              <option value="ethereum">Ethereum Mainnet</option>
              <option value="arbitrum">Arbitrum One</option>
              <option value="optimism">Optimism</option>
              <option value="base">Base</option>
              <option value="polygon">Polygon PoS</option>
              <option value="solana">Solana</option>
            </select>
          </div>
        </div>

        {/* Title & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Request Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. USDC Allowance for Swap"
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Requester Identity / dApp
            </label>
            <input
              type="text"
              required
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="e.g. Uniswap v3"
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Token Allowance specific fields */}
        {type === 'token_allowance' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Token Spending Parameters</span>
              <label className="flex items-center gap-2 cursor-pointer font-normal text-slate-400">
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 accent-cyan-500 h-3.5 w-3.5"
                />
                <span className={isUnlimited ? 'text-amber-400 font-medium' : ''}>Request Unlimited Cap</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400">Asset Symbol</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400">Spending Cap</label>
                <input
                  type="text"
                  disabled={isUnlimited}
                  value={isUnlimited ? 'UNLIMITED (2^256-1)' : tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  className={`mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none ${
                    isUnlimited ? 'text-amber-400 bg-slate-900' : 'text-white'
                  }`}
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] text-slate-400">Authorized Spender Contract</label>
                <input
                  type="text"
                  value={spenderAddress}
                  onChange={(e) => setSpenderAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Options Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showAdvanced ? '− Hide webhook & expiration settings' : '+ Advanced webhook & expiry options'}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300">
                  Webhook Callback Endpoint (POST)
                </label>
                <input
                  type="url"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  placeholder="https://your-dapp.com/api/webhooks"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">
                  Integrator receives instant JSON callback once signed.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300">
                  Request Expiration Window
                </label>
                <select
                  value={expiresInMinutes}
                  onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value={15}>15 Minutes (High Urgency)</option>
                  <option value={60}>1 Hour (Standard Trade)</option>
                  <option value={1440}>24 Hours (Multi-Sig Governance)</option>
                  <option value={10080}>7 Days (Offchain Agreement)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Dispatch CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-semibold text-slate-950 hover:bg-cyan-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>
              {isSubmitting ? 'Dispatching to Cryptographic Channel...' : 'Dispatch Approval Request to Target Wallet'}
            </span>
          </button>
        </div>
      </form>

      {/* Dispatched Requests Live Tracker */}
      <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Dispatched Requests Log
          </h3>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {requests.length} total requests
          </span>
        </div>

        <div className="space-y-3">
          {requests.slice(0, 4).map((req) => {
            const isTargetActive = req.targetWallet.toLowerCase() === activeWallet.address.toLowerCase();
            return (
              <div
                key={req.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{req.title}</span>
                      <span className="text-xs text-slate-500 font-mono">({req.id})</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Target: <code className="font-mono text-cyan-300">{formatAddress(req.targetWallet, 4)}</code></span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{req.network}</span>
                      <span aria-hidden="true">·</span>
                      <span>{req.requesterName}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                        <Clock className="h-3 w-3 animate-spin" />
                        Pending Approval
                      </span>
                    )}
                    {req.status === 'viewed' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
                        <Clock className="h-3 w-3" />
                        Reviewing
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved & Signed
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                        <XCircle className="h-3 w-3" />
                        Declined
                      </span>
                    )}
                    {req.status === 'revoked' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/30 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        Revoked
                      </span>
                    )}
                  </div>
                </div>

                {/* Outcome Proof or Actions */}
                {req.status === 'approved' && req.result && (
                  <div className="mt-3 rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 font-mono">
                      <span>Tx Hash</span>
                      <a
                        href={getExplorerUrl(req.network, req.result.txHash || '')}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {formatAddress(req.result.txHash || '', 6)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 font-mono">
                      <span>Cryptographic Proof</span>
                      <span className="text-slate-300 truncate max-w-[200px]" title={req.result.signature}>
                        {formatAddress(req.result.signature || '', 8)}
                      </span>
                    </div>
                    {req.callbackUrl && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <Webhook className="h-3 w-3" />
                          Webhook Dispatched (200 OK)
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspectWebhook(req)}
                          className="text-cyan-400 hover:underline"
                        >
                          Inspect JSON
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {req.status === 'rejected' && req.result && (
                  <div className="mt-2.5 text-xs text-rose-300/90 bg-rose-500/5 rounded-lg p-2.5 border border-rose-500/20">
                    <span className="font-semibold">Reason: </span>
                    <span>{req.result.rejectionReason}</span>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span>Expires in ~60m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQrModalRequest(req)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Share QR</span>
                      </button>
                      {/* If target wallet is active wallet in demo, allow jumping directly */}
                      <button
                        onClick={() => {
                          setActiveWalletByAddress(req.targetWallet);
                          setCurrentView('owner');
                        }}
                        className="text-slate-300 hover:text-white text-xs flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                      >
                        <span>Open in Owner View</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalRequest && (
        <QRCodeModal
          request={qrModalRequest}
          onClose={() => setQrModalRequest(null)}
        />
      )}

      {/* Webhook Payload Inspector Modal */}
      {inspectWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Webhook className="h-4 w-4 text-emerald-400" />
                <span>Simulated Webhook Delivery Payload</span>
              </div>
              <button
                onClick={() => setInspectWebhook(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              POST to: <code className="font-mono text-cyan-400">{inspectWebhook.callbackUrl}</code>
            </div>
            <pre className="mt-3 max-h-72 overflow-y-auto rounded-xl bg-slate-950 p-4 text-xs font-mono text-emerald-300 leading-relaxed border border-slate-800">
              {JSON.stringify(
                {
                  event: 'approval.confirmed',
                  timestamp: inspectWebhook.result?.timestamp,
                  requestId: inspectWebhook.id,
                  targetWallet: inspectWebhook.targetWallet,
                  network: inspectWebhook.network,
                  result: inspectWebhook.result,
                  token: inspectWebhook.token,
                },
                null,
                2
              )}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectWebhook(null)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
