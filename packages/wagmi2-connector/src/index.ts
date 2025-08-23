import { createConnector } from '@wagmi/core';
import type { Address } from 'viem';
import { getAddress } from 'viem';
import type { ArenaWalletParameters } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

function parseChainId(input: number | string): number {
  if (typeof input === 'number') return input;
  const s = String(input);
  return s.startsWith('0x') ? parseInt(s, 16) : Number(s);
}

export const arenaWagmi2ConnectorFactory = (parameters: ArenaWalletParameters) =>
  createConnector((config) => ({
    id: 'arena-wallet',
    name: 'Arena Wallet',
    type: 'arena-wallet' as const,
    icon: 'https://arena.social/favicon.ico',

    async setup() {
      const provider = parameters.provider;
      
      // Setup event listeners with proper casting
      (provider as any).on?.('accountsChanged', this.onAccountsChanged.bind(this));
      (provider as any).on?.('chainChanged', this.onChainChanged.bind(this));
      (provider as any).on?.('disconnect', this.onDisconnect.bind(this));
    },

    async connect({ chainId } = {}) {
      const provider = parameters.provider;
      
      const accounts = provider.accounts || [];
      if (accounts.length === 0) {
        throw new Error('No accounts connected');
      }

      // Ensure addresses are checksummed and properly typed
      const checkedAccounts = accounts.map((account: string) => getAddress(account)) as readonly Address[];

      const currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain!({ chainId }).catch(() => ({
          id: currentChainId,
        }));
        return { accounts: checkedAccounts, chainId: chain.id };
      }

      return { accounts: checkedAccounts, chainId: currentChainId };
    },

    async disconnect() {
      const provider = parameters.provider;
      await provider.disconnect?.();

      (provider as any).removeListener?.('accountsChanged', this.onAccountsChanged);
      (provider as any).removeListener?.('chainChanged', this.onChainChanged);
      (provider as any).removeListener?.('disconnect', this.onDisconnect);
    },

    async getAccounts() {
      const provider = parameters.provider;
      const accounts = provider.accounts || [];
      return accounts.map((account: string) => getAddress(account)) as readonly Address[];
    },

    async getChainId() {
      const provider = parameters.provider;
      const chainId = await provider.request({ method: 'eth_chainId' });
      return parseChainId(chainId as number | string);
    },

    async getProvider() {
      return parameters.provider;
    },

    async isAuthorized() {
      try {
        const provider = parameters.provider;
        const accounts = provider.accounts || [];
        return accounts.length > 0;
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }: { chainId: number }) {
      const provider = parameters.provider;
      const chain = config.chains.find((chain) => chain.id === chainId);
      if (!chain) throw new Error(`Chain "${chainId}" not configured.`);

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      return chain;
    },

    onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit('change', {
          accounts: accounts.map((account: string) => getAddress(account)) as readonly Address[],
        });
    },

    onChainChanged(chain: string | number) {
      const chainId = parseChainId(chain);
      config.emitter.emit('change', { chainId });
    },

    onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));

// Re-export types for convenience
export type { ArenaProvider, ArenaWalletConfig, ArenaWalletParameters } from './types';