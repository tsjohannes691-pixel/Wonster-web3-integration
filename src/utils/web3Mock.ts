import { WalletProfile } from '../types/approval';

export const DEMO_WALLETS: WalletProfile[] = [
  {
    address: '0x71C83638379321eaf808359579737b8084d56452',
    name: 'Alice Cooper',
    label: 'Primary DeFi Wallet',
    ens: 'alice.eth',
    balanceEth: 4.825,
    balanceUsdc: 18450.00,
    type: 'hardware',
    avatarColor: 'bg-emerald-600',
  },
  {
    address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    name: 'GenesisDAO Safe',
    label: 'Treasury Multi-Sig (3/5)',
    ens: 'genesisdao.eth',
    balanceEth: 342.15,
    balanceUsdc: 1450200.00,
    type: 'multisig',
    avatarColor: 'bg-indigo-600',
  },
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    name: 'Vitalik Buterin',
    label: 'Public Identity',
    ens: 'vitalik.eth',
    balanceEth: 1250.00,
    balanceUsdc: 850000.00,
    type: 'demo',
    avatarColor: 'bg-amber-600',
  }
];

export const KNOWN_PROTOCOLS: Record<string, { name: string; verified: boolean; domain: string }> = {
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': {
    name: 'Uniswap v3 SwapRouter02',
    verified: true,
    domain: 'app.uniswap.org'
  },
  '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2': {
    name: 'Aave v3 Pool Core',
    verified: true,
    domain: 'app.aave.com'
  },
  '0x00000000000000ADc04C56Bf30aC236fdB265E9d': {
    name: 'OpenSea Seaport v1.6',
    verified: true,
    domain: 'opensea.io'
  },
  '0x111111125421cA6dc452d289314280a0f8842A65': {
    name: '1inch v6 Aggregation Router',
    verified: true,
    domain: 'app.1inch.io'
  },
  '0x388C818CA8B9251b393131C08a736829cc774ACb': {
    name: 'Safe Multisig Proxy Factory',
    verified: true,
    domain: 'app.safe.global'
  }
};

export function isValidWalletAddress(address: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  // EVM address
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return true;
  // ENS name
  if (/^[a-zA-Z0-9-]+\.eth$/.test(trimmed)) return true;
  // Solana base58 fallback
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return true;
  return false;
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  const trimmed = address.trim();
  if (trimmed.length <= chars * 2 + 2) return trimmed;
  return `${trimmed.slice(0, chars + 2)}...${trimmed.slice(-chars)}`;
}

export function generateId(prefix = 'req_'): string {
  const chars = '0123456789abcdef';
  let str = '';
  for (let i = 0; i < 10; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${str}`;
}

export function generatePseudoHash(length = 64): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < length; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function getExplorerUrl(network: string, txHash: string): string {
  switch (network) {
    case 'arbitrum':
      return `https://arbiscan.io/tx/${txHash}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    case 'base':
      return `https://basescan.org/tx/${txHash}`;
    case 'polygon':
      return `https://polygonscan.com/tx/${txHash}`;
    case 'solana':
      return `https://solscan.io/tx/${txHash}`;
    case 'ethereum':
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
}

/**
 * Generates an SVG string of a QR code pattern without external dependencies
 */
export function generateSvgQrCode(text: string, size = 180): string {
  // Simple deterministic 21x21 QR matrix simulator for demo links
  const gridSize = 21;
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Position markers in 3 corners
  const drawCorner = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6) {
          cells[r + i][c + j] = true;
        } else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
          cells[r + i][c + j] = true;
        }
      }
    }
  };

  drawCorner(0, 0);
  drawCorner(0, gridSize - 7);
  drawCorner(gridSize - 7, 0);

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Populate data using deterministic pseudo hash of input text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= gridSize - 8) ||
        (r >= gridSize - 8 && c < 8) ||
        r === 6 || c === 6
      ) {
        continue;
      }
      const val = (Math.abs(hash * (r + 1) * 31 + (c + 1) * 17) % 100);
      cells[r][c] = val > 45;
    }
  }

  const cellSize = size / gridSize;
  let paths = '';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (cells[r][c]) {
        paths += `<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#00f2fe" rx="1.5"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="w-full h-full">${paths}</svg>`;
}
