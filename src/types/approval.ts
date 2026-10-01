export type ApprovalType = 
  | 'token_allowance' 
  | 'personal_sign' 
  | 'typed_data' 
  | 'contract_execution' 
  | 'connect_session';

export type NetworkId = 
  | 'ethereum' 
  | 'arbitrum' 
  | 'optimism' 
  | 'base' 
  | 'polygon' 
  | 'solana';

export type ApprovalStatus = 
  | 'pending' 
  | 'viewed' 
  | 'approved' 
  | 'rejected' 
  | 'revoked' 
  | 'expired';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TokenDetails {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress: string;
  amount: string; // e.g. "500.00" or "UNLIMITED"
  isUnlimited: boolean;
  usdValue?: number;
}

export interface SecurityReport {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100 (100 = completely secure)
  flags: string[];
  warnings: string[];
  verifiedSource: boolean;
  reputation: 'Trusted Tier 1' | 'Verified Protocol' | 'Unverified Contract' | 'Flagged Malicious';
}

export interface ApprovalResult {
  txHash?: string;
  signature?: string;
  signerAddress: string;
  timestamp: string;
  gasUsed?: string;
  adjustedAllowance?: string;
  rejectionReason?: string;
}

export interface ApprovalRequest {
  id: string; // e.g. "req_8f192b0c"
  createdAt: string;
  expiresAt: string;
  targetWallet: string; // Target wallet address
  requesterName: string; // e.g. "Uniswap v3 Protocol"
  requesterDomain: string; // e.g. "app.uniswap.org"
  type: ApprovalType;
  network: NetworkId;
  title: string;
  description: string;
  status: ApprovalStatus;
  
  spenderAddress?: string;
  spenderName?: string;
  isSpenderVerified?: boolean;
  
  token?: TokenDetails;
  
  payloadData: {
    rawCalldata?: string;
    message?: string;
    typedData?: Record<string, unknown>;
    gasEstimateGwei?: number;
    targetContract?: string;
    actionName?: string;
  };
  
  securityReport: SecurityReport;
  result?: ApprovalResult;
  
  callbackUrl?: string;
  webhookDelivered?: boolean;
  webhookDeliveryTime?: string;
  webhookResponseCode?: number;
}

export interface WalletProfile {
  address: string;
  name: string;
  label: string;
  ens?: string;
  balanceEth: number;
  balanceUsdc: number;
  type: 'hardware' | 'multisig' | 'injected' | 'demo';
  avatarColor: string;
}
