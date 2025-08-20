import { Connector } from 'wagmi';
import type {
  Address,
  Account,
  Chain,
  EIP1193Provider,
  Transport,
  WalletClient,
} from 'viem';
import { createWalletClient, custom } from 'viem';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/** WalletConnect provider instance shape (do NOT override EIP-1193 events). */
export type WalletConnectProvider = EIP1193Provider & {
  accounts: string[];
  chainId: number | string;
  disconnect?: () => Promise<void>;
};

type GetProviderConfig = { chainId?: number };
type GetWalletClientConfig = { chainId?: number };

function parseChainId(input: number | string): number {
  if (typeof input === 'number') return input;
  const s = String(input);
  return s.startsWith('0x') ? parseInt(s, 16) : Number(s);
}

export class ArenaWagmiConnector extends Connector<
  WalletConnectProvider,
  Record<string, never>
> {
  readonly id = 'arena-walletconnect' as const;
  readonly name = 'Arena Wallet' as const;
  readonly ready = true as const;

  private provider: WalletConnectProvider;

  /** Keep our own chains so we don't depend on base `.chains` typings */
  protected readonly _chains: Chain[];
  /** Local emitter shim so we don't depend on base `.emit` typings */
  private readonly _emit: (event: 'change' | 'disconnect', payload?: any) => void;

  constructor(args: { provider: WalletConnectProvider; chains: Chain[] }) {
    super({ options: {}, chains: args.chains });
    this.provider = args.provider;
    this._chains = args.chains;

    // Bind a safe emitter: use base `.emit` if present; else no-op
    this._emit = ((this as any).emit?.bind(this)) ?? (() => {});

    // Wire provider events → connector lifecycle (cast to avoid generic mismatch noise)
    (this.provider as any).on?.('accountsChanged', this.onAccountsChanged.bind(this) as any);
    (this.provider as any).on?.('chainChanged', this.onChainChanged.bind(this) as any);
    (this.provider as any).on?.('disconnect', this.onDisconnect.bind(this) as any);
  }

  // --- Core required methods -------------------------------------------------

  async connect(): Promise<{
    account: Address;
    chain: { id: number; unsupported: boolean };
    provider: WalletConnectProvider;
  }> {
    const account = this.provider.accounts?.[0] as Address | undefined;
    if (!account) throw new Error('No account connected');

    const chainIdRaw = await this.provider.request({ method: 'eth_chainId' });
    const chainId = parseChainId(chainIdRaw as number | string);
    const unsupported = !this._chains.some((c) => c.id === chainId);

    return { account, chain: { id: chainId, unsupported }, provider: this.provider };
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect?.();
    this._emit('disconnect');
  }

  async getAccount(): Promise<Address> {
    const account = this.provider.accounts?.[0] as Address | undefined;
    if (!account) throw new Error('No account found');
    return account;
  }

  async getChainId(): Promise<number> {
    const chainIdRaw = await this.provider.request({ method: 'eth_chainId' });
    return parseChainId(chainIdRaw as number | string);
  }

  // Optional param keeps compatibility across wagmi builds
  async getProvider(_config?: GetProviderConfig): Promise<WalletConnectProvider> {
    return this.provider;
  }

  async isAuthorized(): Promise<boolean> {
    return Array.isArray(this.provider.accounts) && this.provider.accounts.length > 0;
  }

  async getWalletClient(
    config?: GetWalletClientConfig
  ): Promise<WalletClient<Transport, Chain, Account>> {
    const addr = this.provider.accounts?.[0] as Address | undefined;
    if (!addr) throw new Error('No account connected');

    const desiredChainId = config?.chainId ?? (await this.getChainId());
    const chain = this._chains.find((c) => c.id === desiredChainId);
    if (!chain) throw new Error(`Chain ${desiredChainId} not found in configured chains.`);

    return createWalletClient({
      account: addr,
      chain,
      transport: custom(this.provider),
    }) as WalletClient<Transport, Chain, Account>;
  }

  // --- Lifecycle hooks -------------------------------------------------------

  protected onAccountsChanged = (accounts: string[]): void => {
    const next = (accounts?.[0] ?? '') as Address | '';
    if (next) this._emit('change', { account: next });
    else this._emit('disconnect');
  };

  protected onChainChanged = (nextChainId: number | string): void => {
    const id = parseChainId(nextChainId);
    const unsupported = !this._chains.some((c) => c.id === id);
    this._emit('change', { chain: { id, unsupported } });
  };

  protected onDisconnect = (_error: Error): void => {
    this._emit('disconnect');
  };
}
