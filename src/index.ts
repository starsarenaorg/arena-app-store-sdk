import Provider, { EthereumProvider } from '@walletconnect/ethereum-provider';
import {ArenaUserProfile} from "./types/ArenaUserProfile";
import {ProviderInfo, ProviderRpcError} from "@walletconnect/ethereum-provider/dist/types/types";

export type { ArenaUserProfile } from './types/ArenaUserProfile';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class ArenaAppStoreSdk {
  private _eventHandlers: Record<string, Array<(...args: any[]) => void>> = {};
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
    initializeArenaAppStoreSdk()
      .catch(e => {
        console.log("Error initializing ArenaAppStoreSdk:", e);
        throw e;
      });
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

  /**
   * Registers an event handler for a specific event.
   * @param event - The event name to listen for.
   * @param handler - The callback function to execute when the event is emitted.
   */
  on(event: string, handler: (...args: any[]) => void) {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
    }
    this._eventHandlers[event].push(handler);
  }

  /**
   * Initializes the WalletConnect Ethereum provider if it has not been initialized yet.
   * Sets up event listeners for provider events such as `display_uri`, `connect`, and `disconnect`.
   * On initialization failure, logs the error and hides the overlay.
   *
   * @throws Will throw an error if the provider initialization fails.
   */
  async initializeProvider() {
    if (this.walletConnectInitialized) return;

    try {
      this._provider = await EthereumProvider.init({
        projectId: this.config.projectId,
        metadata: this.config.metadata,
        showQrModal: false,
        chains: [43114],
        methods: ["eth_sendTransaction", "eth_signTransaction", "eth_sign"],
        events: ["chainChanged", "accountsChanged"],
      });
    } catch (e) {
      console.error("Failed to initialize provider:", e);
      this._showOverlay(false);
      throw e;
    }

    if (!this.walletConnectInitialized) {
      this._provider.on("display_uri", async (uri: string) => {
        this._showOverlay(true);
        try {
          await this.sendRequest("requestWalletConnection", {uri});
        } catch (e) {
          console.error("Error during 'requestWalletConnection' request for wallet connection:", e);
          this._showOverlay(false);
          throw e;
        }
      });

      this._provider.on("connect", (_data: ProviderInfo) => {
        const address = this._provider?.accounts[0];
        this._emit('walletChanged', { address });
        this._showOverlay(false);
      });

      this._provider.on("disconnect", (error: ProviderRpcError) => {
        console.log("Wallet disconnected:", error.message);
        this._emit('walletChanged', { address: null });
        this._showOverlay(false);
      });

      this.walletConnectInitialized = true;
    }
  }


  /**
   * Connects to the user's wallet using the initialized provider.
   * Shows an overlay during the connection process and handles errors.
   *
   * @throws Will throw an error if the provider is not initialized.
   */
  async connectWallet() {
    try {
      if (!this._provider) {
        throw new Error('Provider not initialized');
      }
      await this._provider.connect();
    } catch (e) {
      console.error("Error during connection:", e);
      this._showOverlay(false);
    }
  }

  /**
   * Sends a request to the parent window and waits for a response.
   * The request is identified by a unique ID and uses the postMessage API.
   * Listens for a message event with the matching ID to resolve or reject the promise.
   *
   * @param method - The method name for the request.
   * @param params - Optional parameters to include in the request.
   * @returns A promise that resolves with the result or rejects with an error.
   */
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

  /**
   * Fetches the user profile from the parent window.
   * Sends a 'getUserProfile' request and returns the result as an ArenaUserProfile.
   *
   * @returns A promise that resolves to an ArenaUserProfile or undefined.
   */
  async fetchUserProfile(): Promise<ArenaUserProfile | undefined | null> {
    const response = await this.sendRequest('getUserProfile');
    return response as ArenaUserProfile | undefined | null;
  }

  /**
   * Returns the current WalletConnect provider instance.
   * @returns The initialized Provider or null if not yet initialized.
   */
  get provider(): Provider | null {
    return this._provider;
  }
}
