import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Webhook } from 'lucide-react';

interface DeveloperApiModalProps {
  onClose: () => void;
}

export const DeveloperApiModal: React.FC<DeveloperApiModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'curl' | 'sdk' | 'webhook'>('sdk');
  const [copied, setCopied] = useState(false);

  const curlSnippet = `curl -X POST "https://api.signalink.xyz/v1/approvals" \\
  -H "Authorization: Bearer sec_live_94821a0f8b..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "targetWallet": "0x71C83638379321eaf808359579737b8084d56452",
    "network": "ethereum",
    "type": "token_allowance",
    "token": {
      "symbol": "USDC",
      "amount": "2500.00",
      "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    "spenderAddress": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
    "callbackUrl": "https://myapp.com/api/webhooks/signalink",
    "expiresInMinutes": 60
  }'`;

  const sdkSnippet = `import { SignaLinkGateway } from '@signalink/sdk';

const signalink = new SignaLinkGateway({
  apiKey: process.env.SIGNALINK_API_KEY,
  environment: 'production'
});

// 1. Dispatch approval request to wallet
const request = await signalink.createApprovalRequest({
  targetWallet: userAddress, // e.g. '0x71C83638379321eaf808359579737b8084d56452'
  type: 'token_allowance',
  network: 'arbitrum',
  title: 'USDC Vault Liquidity Deposit',
  token: { symbol: 'USDC', amount: '5000.00' },
  spenderAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  callbackUrl: 'https://api.myapp.com/v1/approvals/webhook'
});

console.log('Request dispatched. QR link:', request.approvalUrl);

// 2. Or subscribe to real-time status stream via SSE/WebSocket
signalink.onApproved(request.id, ({ signature, txHash, signerAddress }) => {
  console.log('Wallet owner approved on chain! Tx:', txHash);
  executeSwap(txHash);
});`;

  const webhookSnippet = `// POST https://myapp.com/api/webhooks/signalink
// Verified signature header: X-SignaLink-Signature: sha256=...

export async function handleWebhook(req, res) {
  const event = req.body;

  if (event.status === 'approved') {
    const { requestId, targetWallet, result } = event;
    console.log(\`Approval confirmed by \${result.signerAddress} for \${requestId}\`);
    console.log(\`Tx Hash: \${result.txHash} | Gas used: \${result.gasUsed}\`);
    
    // Proceed with contract execution in your dApp
    await resumePendingOrder(requestId);
  } else if (event.status === 'rejected') {
    console.warn('Owner rejected approval:', event.result.rejectionReason);
  }

  res.status(200).json({ received: true });
}`;

  const currentSnippet = activeTab === 'curl' ? curlSnippet : activeTab === 'sdk' ? sdkSnippet : webhookSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Developer Integration Gateway</h3>
            <p className="text-xs text-slate-400">
              Integrate wallet address approvals into your dApp, backend checkout, or automated bots.
            </p>
          </div>
        </div>

        {/* Segmented Tab Controls */}
        <div className="mt-5 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('sdk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'sdk'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>TypeScript SDK</span>
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'curl'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>cURL REST</span>
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'webhook'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Webhook className="h-3.5 w-3.5" />
              <span>Webhook Callback</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
          </button>
        </div>

        {/* Code Viewport */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 text-[11px] text-slate-400">
            <span className="font-mono">
              {activeTab === 'sdk' ? 'index.ts' : activeTab === 'curl' ? 'request.sh' : 'webhook-handler.js'}
            </span>
            <span className="text-slate-500">Live Production Gateway</span>
          </div>
          <pre className="max-h-80 overflow-y-auto p-4 text-xs font-mono text-cyan-100/90 leading-relaxed">
            <code>{currentSnippet}</code>
          </pre>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>Status API: </span>
            <span className="font-mono text-emerald-400">https://api.signalink.xyz/v1/approvals/:id</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
