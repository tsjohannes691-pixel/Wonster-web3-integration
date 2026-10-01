import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  ApprovalRequest, 
  ApprovalType, 
  NetworkId, 
  TokenDetails, 
  SecurityReport, 
  WalletProfile 
} from '../types/approval';
import { 
  DEMO_WALLETS, 
  KNOWN_PROTOCOLS, 
  generateId, 
  generatePseudoHash, 
  formatAddress 
} from '../utils/web3Mock';
import { soundFx } from '../utils/sound';

interface CreateRequestParams {
  targetWallet: string;
  requesterName: string;
  requesterDomain?: string;
  type: ApprovalType;
  network: NetworkId;
  title: string;
  description: string;
  spenderAddress?: string;
  spenderName?: string;
  token?: {
    symbol: string;
    name: string;
    decimals: number;
    amount: string;
    isUnlimited: boolean;
    contractAddress?: string;
  };
  payloadData?: {
    rawCalldata?: string;
    message?: string;
    typedData?: Record<string, unknown>;
  };
  callbackUrl?: string;
  expiresInMinutes?: number;
}

interface ApprovalContextType {
  requests: ApprovalRequest[];
  activeWallet: WalletProfile;
  availableWallets: WalletProfile[];
  currentView: 'split' | 'requester' | 'owner' | 'allowances' | 'developer';
  soundEnabled: boolean;
  selectedRequestId: string | null;
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' | 'revoked';
  setCurrentView: (view: 'split' | 'requester' | 'owner' | 'allowances' | 'developer') => void;
  setActiveWalletByAddress: (address: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
  setActiveFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected' | 'revoked') => void;
  createRequest: (params: CreateRequestParams) => ApprovalRequest;
  markAsViewed: (id: string) => void;
  approveRequest: (id: string, customAllowance?: string) => Promise<boolean>;
  rejectRequest: (id: string, reason: string) => void;
  revokeApproval: (id: string) => void;
  connectInjectedWallet: () => Promise<boolean>;
  resetToDefaultDemo: () => void;
}

const STORAGE_KEY = 'signalink_approval_requests_v2';
const WALLET_KEY = 'signalink_active_wallet_v2';

const SEED_REQUESTS: ApprovalRequest[] = [
  {
    id: 'req_a9f182c1',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 56 * 60 * 1000).toISOString(),
    targetWallet: '0x71C83638379321eaf808359579737b8084d56452',
    requesterName: 'Uniswap v3 Protocol',
    requesterDomain: 'app.uniswap.org',
    type: 'token_allowance',
    network: 'ethereum',
    title: 'ERC-20 Spending Cap Allowance',
    description: 'Grant Uniswap SwapRouter02 permission to spend your USDC for multi-hop liquidity swaps.',
    status: 'pending',
    spenderAddress: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    spenderName: 'Uniswap v3 SwapRouter02',
    isSpenderVerified: true,
    token: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      amount: '2,500.00',
      isUnlimited: false,
      usdValue: 2500,
    },
    payloadData: {
      rawCalldata: '0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000000000000009502f900',
      gasEstimateGwei: 28,
      actionName: 'approve(address spender, uint256 amount)',
      targetContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      typedData: {
        domain: { name: 'USD Coin', version: '2', chainId: 1, verifyingContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
        types: { Permit: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }, { name: 'nonce', type: 'uint256' }, { name: 'deadline', type: 'uint256' }] },
        value: { owner: '0x71C83638379321eaf808359579737b8084d56452', spender: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', value: '2500000000', nonce: 3, deadline: 1793540000 }
      }
    },
    securityReport: {
      riskLevel: 'low',
      riskScore: 94,
      flags: ['Verified Official Spender Contract', 'Explicit Spending Cap ($2,500)', 'Standard ERC-20 Implementation'],
      warnings: [],
      verifiedSource: true,
      reputation: 'Trusted Tier 1',
    },
    callbackUrl: 'https://api.uniswap.org/v1/integrations/approvals/callback',
  },
  {
    id: 'req_f4892c30',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    targetWallet: '0x71C83638379321eaf808359579737b8084d56452',
    requesterName: 'Aave v3 Liquidity Pool',
    requesterDomain: 'app.aave.com',
    type: 'contract_execution',
    network: 'arbitrum',
    title: 'Collateral Supply Authorization',
    description: 'Authorize deposit of 1.50 WETH as interest-bearing collateral into Aave v3 Arbitrum market.',
    status: 'approved',
    spenderAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    spenderName: 'Aave v3 Pool Core',
    isSpenderVerified: true,
    token: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      contractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      amount: '1.50',
      isUnlimited: false,
      usdValue: 4890,
    },
    payloadData: {
      rawCalldata: '0x617ba03700000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000014d1120d7b160000',
      gasEstimateGwei: 0.15,
      actionName: 'supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
      targetContract: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'
    },
    securityReport: {
      riskLevel: 'low',
      riskScore: 98,
      flags: ['Verified Bluechip Protocol', 'Fixed Deposit Amount', 'Valid Audited Nonce'],
      warnings: [],
      verifiedSource: true,
      reputation: 'Trusted Tier 1',
    },
    result: {
      txHash: '0x4f8e219ba3741893245781a7491cf23947812984180491820491823091823901',
      signature: '0x99238fba718923a19b89712a89312b9812948719827391827391827391823901b81923789127391827391827391827391827391827391827391827391827391c',
      signerAddress: '0x71C83638379321eaf808359579737b8084d56452',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      gasUsed: '42,190 Gas ($0.04)',
    },
    callbackUrl: 'https://gateway.aave.com/webhooks/approvals',
    webhookDelivered: true,
    webhookDeliveryTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    webhookResponseCode: 200,
  },
  {
    id: 'req_82bc1947',
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    targetWallet: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    requesterName: 'Unknown Swap Router',
    requesterDomain: 'quick-dex-aggregator.xyz',
    type: 'token_allowance',
    network: 'ethereum',
    title: 'Infinite Spending Approval Request',
    description: 'Contract requests unlimited allowance over all your USDC tokens.',
    status: 'rejected',
    spenderAddress: '0xd929104812a02391029481029481029481029481',
    spenderName: 'Unverified Router Proxy',
    isSpenderVerified: false,
    token: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      amount: 'UNLIMITED',
      isUnlimited: true,
      usdValue: 1450200,
    },
    payloadData: {
      rawCalldata: '0x095ea7b3000000000000000000000000d929104812a02391029481029481029481029481ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      gasEstimateGwei: 35,
      actionName: 'approve(address spender, uint256 0xffffff...)',
      targetContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    securityReport: {
      riskLevel: 'critical',
      riskScore: 18,
      flags: ['Unverified Spender Contract', 'Infinite Spending Cap (Entire Balance at Risk)', 'Domain registered < 14 days ago'],
      warnings: ['CRITICAL: Spender could drain your entire USDC treasury!'],
      verifiedSource: false,
      reputation: 'Flagged Malicious',
    },
    result: {
      signerAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
      timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      rejectionReason: 'Security Alert: Unverified spender requested unlimited spending cap. Rejected by Treasury Multi-Sig.',
    },
    callbackUrl: 'https://quick-dex-aggregator.xyz/api/approvals',
    webhookDelivered: true,
    webhookDeliveryTime: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    webhookResponseCode: 403,
  }
];

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const ApprovalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return SEED_REQUESTS;
  });

  const [availableWallets, setAvailableWallets] = useState<WalletProfile[]>(DEMO_WALLETS);

  const [activeWallet, setActiveWallet] = useState<WalletProfile>(() => {
    try {
      const stored = localStorage.getItem(WALLET_KEY);
      if (stored) {
        const found = DEMO_WALLETS.find(w => w.address.toLowerCase() === stored.toLowerCase());
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return DEMO_WALLETS[0];
  });

  const [currentView, setCurrentView] = useState<'split' | 'requester' | 'owner' | 'allowances' | 'developer'>('split');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revoked'>('all');

  // Broadcast channel for multi-tab synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('signalink_approval_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'UPDATE_REQUESTS' && Array.isArray(event.data.requests)) {
          setRequests(event.data.requests);
        }
      };
    } catch {
      // BroadcastChannel not available
    }

    return () => {
      channel?.close();
    };
  }, []);

  // Save requests to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      // Notify other tabs
      try {
        const channel = new BroadcastChannel('signalink_approval_channel');
        channel.postMessage({ type: 'UPDATE_REQUESTS', requests });
        channel.close();
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }, [requests]);

  // Save active wallet to storage
  useEffect(() => {
    try {
      localStorage.setItem(WALLET_KEY, activeWallet.address);
    } catch {
      // ignore
    }
  }, [activeWallet]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundFx.enabled = enabled;
  }, []);

  const setActiveWalletByAddress = useCallback((address: string) => {
    const trimmed = address.trim();
    const found = availableWallets.find(w => w.address.toLowerCase() === trimmed.toLowerCase() || (w.ens && w.ens.toLowerCase() === trimmed.toLowerCase()));
    if (found) {
      setActiveWallet(found);
    } else {
      // Create ad-hoc profile
      const newProfile: WalletProfile = {
        address: trimmed,
        name: formatAddress(trimmed, 4),
        label: 'Custom Wallet Target',
        balanceEth: 1.25,
        balanceUsdc: 2500.00,
        type: 'demo',
        avatarColor: 'bg-cyan-600',
      };
      setAvailableWallets(prev => [newProfile, ...prev]);
      setActiveWallet(newProfile);
    }
  }, [availableWallets]);

  const connectInjectedWallet = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum) {
      try {
        const eth = (window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          const address = accounts[0];
          const newProfile: WalletProfile = {
            address,
            name: 'Connected Web3 Wallet',
            label: 'MetaMask / Browser Injected',
            balanceEth: 3.12,
            balanceUsdc: 8400.00,
            type: 'injected',
            avatarColor: 'bg-amber-500',
          };
          setAvailableWallets(prev => [newProfile, ...prev.filter(w => w.address.toLowerCase() !== address.toLowerCase())]);
          setActiveWallet(newProfile);
          soundFx.playApproved();
          return true;
        }
      } catch (err) {
        console.warn('Wallet connection rejected:', err);
      }
    } else {
      // Simulate connection if no browser extension
      const simulatedInjected: WalletProfile = {
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        name: 'Injected Hardware Key',
        label: 'Ledger Nano X (Simulated)',
        balanceEth: 9.42,
        balanceUsdc: 32000.00,
        type: 'injected',
        avatarColor: 'bg-emerald-500',
      };
      setAvailableWallets(prev => [simulatedInjected, ...prev]);
      setActiveWallet(simulatedInjected);
      soundFx.playApproved();
      return true;
    }
    return false;
  }, []);

  const createRequest = useCallback((params: CreateRequestParams): ApprovalRequest => {
    const id = generateId('req_');
    const now = new Date();
    const expiresIn = params.expiresInMinutes || 60;
    const expiresAt = new Date(now.getTime() + expiresIn * 60 * 1000).toISOString();

    // Check spender against known protocols
    const spenderAddr = params.spenderAddress?.toLowerCase() || '';
    const known = spenderAddr ? KNOWN_PROTOCOLS[spenderAddr] : undefined;
    const isSpenderVerified = Boolean(known?.verified);
    const spenderName = params.spenderName || known?.name || (params.spenderAddress ? `Contract (${formatAddress(params.spenderAddress)})` : undefined);

    // Compute security analysis
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let riskScore = 95;
    const flags: string[] = [];
    const warnings: string[] = [];

    if (params.token?.isUnlimited) {
      riskLevel = 'high';
      riskScore -= 35;
      flags.push('Infinite Spending Cap Requested');
      warnings.push('High Allowance Risk: Granting unlimited token spending privileges.');
    } else if (params.token?.amount) {
      flags.push(`Capped Spending Limit: ${params.token.amount} ${params.token.symbol}`);
    }

    if (isSpenderVerified) {
      flags.push('Verified Bluechip Protocol Spender');
      riskScore += 10;
    } else if (params.spenderAddress) {
      riskLevel = riskLevel === 'high' ? 'critical' : 'medium';
      riskScore -= 25;
      warnings.push('Unverified Spender: Target contract has not been verified in registry.');
    }

    riskScore = Math.max(15, Math.min(100, riskScore));

    const tokenDetails: TokenDetails | undefined = params.token ? {
      symbol: params.token.symbol,
      name: params.token.name,
      decimals: params.token.decimals,
      contractAddress: params.token.contractAddress || generatePseudoHash(20),
      amount: params.token.isUnlimited ? 'UNLIMITED' : params.token.amount,
      isUnlimited: params.token.isUnlimited,
      usdValue: params.token.isUnlimited ? 10000 : parseFloat(params.token.amount.replace(/,/g, '')) || 500,
    } : undefined;

    const securityReport: SecurityReport = {
      riskLevel,
      riskScore,
      flags,
      warnings,
      verifiedSource: isSpenderVerified,
      reputation: isSpenderVerified ? 'Trusted Tier 1' : (riskScore > 60 ? 'Verified Protocol' : 'Unverified Contract'),
    };

    const newReq: ApprovalRequest = {
      id,
      createdAt: now.toISOString(),
      expiresAt,
      targetWallet: params.targetWallet.trim(),
      requesterName: params.requesterName,
      requesterDomain: params.requesterDomain || 'integrator.dapp',
      type: params.type,
      network: params.network,
      title: params.title,
      description: params.description,
      status: 'pending',
      spenderAddress: params.spenderAddress,
      spenderName,
      isSpenderVerified,
      token: tokenDetails,
      payloadData: {
        rawCalldata: params.payloadData?.rawCalldata || `0x095ea7b3000000000000000000000000${(params.spenderAddress || generatePseudoHash(20)).replace('0x', '')}00000000000000000000000000000000000000000000000000000000${params.token?.isUnlimited ? 'ffffffff' : '05f5e100'}`,
        message: params.payloadData?.message || `${params.requesterName} requests your cryptographic signature to authorize: ${params.title}`,
        typedData: params.payloadData?.typedData,
        gasEstimateGwei: 24,
        actionName: params.type === 'token_allowance' ? 'approve(address,uint256)' : 'personal_sign',
        targetContract: params.spenderAddress,
      },
      securityReport,
      callbackUrl: params.callbackUrl,
    };

    setRequests(prev => [newReq, ...prev]);
    soundFx.playNotification();

    return newReq;
  }, []);

  const markAsViewed = useCallback((id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id && req.status === 'pending') {
        return { ...req, status: 'viewed' };
      }
      return req;
    }));
  }, []);

  const approveRequest = useCallback(async (id: string, customAllowance?: string): Promise<boolean> => {
    const target = requests.find(r => r.id === id);
    if (!target) return false;

    let signature = generatePseudoHash(65);
    const txHash = generatePseudoHash(32);

    // If real browser wallet is present and active, attempt real sign prompt for realism
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: { request: (args: unknown) => Promise<string> } }).ethereum) {
      try {
        const eth = (window as unknown as { ethereum: { request: (args: unknown) => Promise<string> } }).ethereum;
        const accounts = await (eth as unknown as { request: (args: { method: string }) => Promise<string[]> }).request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === activeWallet.address.toLowerCase()) {
          const sig = await eth.request({
            method: 'personal_sign',
            params: [
              `[SignaLink Auth] Approve ${target.title} for ${target.requesterName}\nNonce: ${id}\nTimestamp: ${new Date().toISOString()}`,
              accounts[0]
            ]
          });
          if (sig) signature = sig;
        }
      } catch {
        // user rejected or not connected to that specific account; continue with cryptographic mock
      }
    }

    const timestamp = new Date().toISOString();
    const gasUsed = `${(Math.floor(Math.random() * 8000) + 38000).toLocaleString()} Gas ($0.03)`;

    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'approved',
          token: customAllowance && req.token ? {
            ...req.token,
            amount: customAllowance,
            isUnlimited: false,
          } : req.token,
          result: {
            txHash,
            signature,
            signerAddress: activeWallet.address,
            timestamp,
            gasUsed,
            adjustedAllowance: customAllowance,
          },
          webhookDelivered: Boolean(req.callbackUrl),
          webhookDeliveryTime: req.callbackUrl ? timestamp : undefined,
          webhookResponseCode: req.callbackUrl ? 200 : undefined,
        };
      }
      return req;
    }));

    soundFx.playApproved();
    return true;
  }, [requests, activeWallet]);

  const rejectRequest = useCallback((id: string, reason: string) => {
    const timestamp = new Date().toISOString();
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'rejected',
          result: {
            signerAddress: activeWallet.address,
            timestamp,
            rejectionReason: reason || 'Declined by wallet owner',
          },
          webhookDelivered: Boolean(req.callbackUrl),
          webhookDeliveryTime: req.callbackUrl ? timestamp : undefined,
          webhookResponseCode: req.callbackUrl ? 403 : undefined,
        };
      }
      return req;
    }));

    soundFx.playReject();
  }, [activeWallet]);

  const revokeApproval = useCallback((id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'revoked',
        };
      }
      return req;
    }));
    soundFx.playReject();
  }, []);

  const resetToDefaultDemo = useCallback(() => {
    setRequests(SEED_REQUESTS);
    setAvailableWallets(DEMO_WALLETS);
    setActiveWallet(DEMO_WALLETS[0]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WALLET_KEY);
  }, []);

  return (
    <ApprovalContext.Provider
      value={{
        requests,
        activeWallet,
        availableWallets,
        currentView,
        soundEnabled,
        selectedRequestId,
        activeFilter,
        setCurrentView,
        setActiveWalletByAddress,
        setSoundEnabled,
        setSelectedRequestId,
        setActiveFilter,
        createRequest,
        markAsViewed,
        approveRequest,
        rejectRequest,
        revokeApproval,
        connectInjectedWallet,
        resetToDefaultDemo,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
};

export function useApprovalStore() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApprovalStore must be used within an ApprovalProvider');
  }
  return context;
}
