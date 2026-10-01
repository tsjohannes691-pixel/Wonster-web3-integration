import React, { useState } from 'react';
import { ApprovalRequest } from '../types/approval';
import { X, ShieldAlert, Check } from 'lucide-react';

interface AdjustLimitModalProps {
  request: ApprovalRequest;
  onClose: () => void;
  onConfirm: (adjustedAmount: string) => void;
}

export const AdjustLimitModal: React.FC<AdjustLimitModalProps> = ({ request, onClose, onConfirm }) => {
  const [customAmount, setCustomAmount] = useState<string>(
    request.token?.amount === 'UNLIMITED' ? '500.00' : (request.token?.amount || '100.00')
  );

  const presets = ['100.00', '250.00', '500.00', '1,000.00', '2,500.00'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Adjust Spending Allowance</h3>
            <p className="text-xs text-slate-400">
              Override {request.requesterName}'s requested limit with a custom safe cap.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Custom {request.token?.symbol || 'Token'} Cap
            </label>
            <div className="mt-1.5 flex rounded-lg border border-slate-700 bg-slate-950 focus-within:border-cyan-500">
              <input
                type="text"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                placeholder="0.00"
              />
              <span className="flex items-center pr-3 text-xs font-semibold text-slate-400">
                {request.token?.symbol || 'TOKEN'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomAmount(amt)}
                  className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                    customAmount === amt
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {amt} {request.token?.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Why adjust limits?</div>
            <p className="text-[11px] leading-relaxed">
              Standard dApps often ask for infinite (<code className="font-mono text-amber-300">2^256 - 1</code>) approval. Setting an exact cap restricts smart contract spend strictly to what you intend to trade or deposit today.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(customAmount)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Approve with Cap ({customAmount} {request.token?.symbol})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
