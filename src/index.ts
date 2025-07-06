import Provider, { EthereumProvider } from '@walletconnect/ethereum-provider';

export class ArenaAppStoreSdk {
  private _eventHandlers: Record<string, Function[]> = {};
  private _provider: Provider | null = null;
  private walletConnectInitialized = false;
  private requestId = 0;

  constructor(
    private config: {
      projectId: string;
      metadata: {
        name: string;
        description: string;
        url: string;
        icons: string[];
      };
    }
  ) {
    const initializeArenaAppStoreSdk = async () => {
        await this.initializeProvider();
        await this.connectWallet();
    }
    initializeArenaAppStoreSdk();
  }

  on(event: string, handler: Function) {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
    }
    this._eventHandlers[event].push(handler);
  }

  private _emit(event: string, data: any) {
    if (this._eventHandlers[event]) {
      this._eventHandlers[event].forEach(handler => handler(data));
    }
  }

  private _showOverlay(visible: boolean) {
    window.parent.postMessage({
      type: 'arena-overlay',
      visible: visible
    }, '*');
  }

  async initializeProvider() {
    if (this.walletConnectInitialized) return;
    
    this._provider = await EthereumProvider.init({
      projectId: this.config.projectId,
      metadata: this.config.metadata,
      showQrModal: false,
      chains: [43114],
      methods: ["eth_sendTransaction", "eth_signTransaction", "eth_sign"],
      events: ["chainChanged", "accountsChanged"],
    });

    if (!this.walletConnectInitialized) {
      this._provider.on("display_uri", async (uri) => {
        this._showOverlay(true);
        await this.sendRequest("requestWalletConnection", { uri });
      });

      this._provider.on("connect", (_data) => {
        const address = this._provider?.accounts[0];
        this._emit('walletChanged', { address });
        this._showOverlay(false);
      });

      this._provider.on("disconnect", (error) => {
        console.log("Wallet disconnected:", error.message);
        this._emit('walletChanged', { address: null });
        this._showOverlay(false);
      });

      this.walletConnectInitialized = true;
    }
  }

  async connectWallet() {
    try {
      if (!this._provider) {
        throw new Error('Provider not initialized');
      }
      await this._provider.connect();
    } catch (error) {
      console.error("Connection error:", error);
      this._showOverlay(false);
    }
  }

  async sendRequest(method: string, params: any = {}) {
    return new Promise((resolve, reject) => {
      const currentId = ++this.requestId;

      const handleResponse = (event: MessageEvent) => {
        if (event.data.id === currentId) {
          window.removeEventListener("message", handleResponse);
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener("message", handleResponse);

      window.parent.postMessage(
        {
          type: "arena-request",
          id: currentId,
          method,
          params,
        },
        "*",
      );
    });
  }

  get provider(): Provider | null {
    return this._provider;
  }
}
