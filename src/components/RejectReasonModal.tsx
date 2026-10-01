import React, { useState } from 'react';
import { ApprovalRequest } from '../types/approval';
import { X, Ban } from 'lucide-react';

interface RejectReasonModalProps {
  request: ApprovalRequest;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({ request, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string>('Unrecognized Spender / Untrusted Origin');
  const [customFeedback, setCustomFeedback] = useState<string>('');

  const commonReasons = [
    'Unrecognized Spender / Untrusted Origin',
    'Suspected Phishing / Malicious Domain',
    'Allowance Amount Exceeds Intention',
    'Transaction Expired or Already Fulfilled elsewhere',
    'Wrong Network / Chain Selected'
  ];

  const handleReject = () => {
    const finalReason = customFeedback.trim() 
      ? `${selectedReason}: ${customFeedback.trim()}`
      : selectedReason;
    onConfirm(finalReason);
  };

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Ban className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Decline Approval Request</h3>
            <p className="text-xs text-slate-400">
              Reject {request.requesterName}'s request and notify their integration callback.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-xs font-medium text-slate-300">
            Select Reason for Decline
          </label>
          <div className="space-y-1.5">
            {commonReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="rejectReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="h-3.5 w-3.5 accent-rose-500"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-400">
              Additional Note for Integrator (Optional)
            </label>
            <textarea
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
              rows={2}
              placeholder="e.g. Please send the request to our secondary treasury address instead."
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
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
            onClick={handleReject}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
          >
            <Ban className="h-4 w-4" />
            <span>Confirm Rejection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
