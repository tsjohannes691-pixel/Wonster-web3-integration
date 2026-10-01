import React, { useState } from 'react';
import { generateSvgQrCode } from '../utils/web3Mock';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { ApprovalRequest } from '../types/approval';

interface QRCodeModalProps {
  request: ApprovalRequest | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ request, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!request) return null;

  const directLink = `${window.location.origin}?req=${request.id}`;
  const svgData = generateSvgQrCode(directLink, 220);

  const handleCopy = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-base font-semibold text-white">Direct Approval Link</h3>
          <p className="mt-1 text-xs text-slate-400">
            Scan with any Web3 mobile wallet or share URL with the wallet owner.
          </p>
        </div>

        {/* QR container */}
        <div className="mt-5 flex items-center justify-center rounded-xl bg-slate-950 p-4 border border-slate-800">
          <div 
            className="w-48 h-48 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        </div>

        {/* Request ID & Target */}
        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Request ID</span>
            <span className="font-mono text-cyan-400">{request.id}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Target Wallet</span>
            <span className="font-mono text-slate-200">{request.targetWallet.slice(0, 6)}...{request.targetWallet.slice(-4)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Requester</span>
            <span className="text-slate-200">{request.requesterName}</span>
          </div>
        </div>

        {/* Action Link Copy */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg bg-slate-950 px-3 py-2 text-xs font-mono text-slate-400 border border-slate-800">
            {directLink}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
