import type { EIP1193Provider } from 'viem';

export type ArenaProvider = EIP1193Provider & {
  accounts: string[];
  chainId: number | string;
  disconnect?: () => Promise<void>;
};

export interface ArenaWalletConfig {
  provider: ArenaProvider;
}

export type ArenaWalletParameters = ArenaWalletConfig;