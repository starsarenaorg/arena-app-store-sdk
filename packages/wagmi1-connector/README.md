# Arena Wagmi v1 Connector

Arena Wallet connector for wagmi v1.4.13+ - A stable class-based connector that integrates Arena's wallet infrastructure with wagmi v1.

> **Note:** This package requires the main [Arena App Store SDK](https://www.npmjs.com/package/arena-app-store-sdk) to be installed and configured first.

## Installation

```bash
npm install @arena-app-store-sdk/wagmi1-connector
```

## Prerequisites

You must first install and set up the main Arena SDK:

```bash
npm install arena-app-store-sdk
```

See the [Arena App Store SDK documentation](https://www.npmjs.com/package/arena-app-store-sdk) for setup instructions.

## Basic Usage

```typescript
import { createClient, configureChains } from 'wagmi'
import { avalanche } from 'wagmi/chains' // Use wagmi chains for v1
import { publicProvider } from 'wagmi/providers/public'
import { ArenaWagmi1Connector } from '@arena-app-store-sdk/wagmi1-connector'
import { ArenaAppStoreSdk } from 'arena-app-store-sdk'

// 1. Initialize Arena SDK first
const arenaSDK = new ArenaAppStoreSdk({
  projectId: "YOUR_REOWN_PROJECT_ID",
  metadata: {
    name: "Your App Name",
    description: "Your App Description", 
    url: window.location.origin,
    icons: ["https://your-app.com/icon.png"]
  }
})

// 2. Configure chains and providers
const { chains, provider } = configureChains(
  [avalanche],
  [publicProvider()]
)

// 3. Create wagmi client with Arena connector
const client = createClient({
  autoConnect: true,
  connectors: [
    new ArenaWagmi1Connector({
      provider: arenaSDK.provider, // Arena provider instance
      chains,
    })
  ],
  provider,
})

// 4. Use with wagmi hooks
import { useConnect, useAccount } from 'wagmi'

function ConnectButton() {
  const { connect, connectors } = useConnect()
  const { address, isConnected } = useAccount()

  if (isConnected) return <div>Connected: {address}</div>

  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Arena Wallet
    </button>
  )
}
```

## Manual Connection (without wagmi hooks)

```typescript
import { ArenaWagmi1Connector } from '@arena-app-store-sdk/wagmi1-connector'
import { avalanche } from 'wagmi/chains'

// Create connector instance
const connector = new ArenaWagmi1Connector({
  provider: arenaSDK.provider,
  chains: [avalanche],
})

// Connect
const { account, chain, provider } = await connector.connect()
const address = account

// Get wallet client for transactions
const walletClient = await connector.getWalletClient()
```

## API Reference

### `ArenaWagmi1Connector`

A wagmi v1 class-based connector for Arena wallet integration.

**Constructor Parameters:**
- `provider` - Arena provider instance from `ArenaAppStoreSdk.provider`
- `chains` - Array of wagmi chain configurations

**Methods:**

#### Connection Methods
- `connect()` - Connect to Arena wallet
  - **Returns:** `Promise<{ account: Address; chain: { id: number; unsupported: boolean }; provider: WalletConnectProvider }>`

- `disconnect()` - Disconnect from wallet
  - **Returns:** `Promise<void>`

- `isAuthorized()` - Check if wallet is connected
  - **Returns:** `Promise<boolean>`

#### Account & Chain Methods
- `getAccount()` - Get connected wallet address
  - **Returns:** `Promise<Address>`

- `getChainId()` - Get current chain ID
  - **Returns:** `Promise<number>`

- `getProvider(config?)` - Get underlying EIP-1193 provider
  - **Parameters:** `config?: { chainId?: number }`
  - **Returns:** `Promise<WalletConnectProvider>`

#### Wallet Client
- `getWalletClient(config?)` - Get viem wallet client for transactions
  - **Parameters:** `config?: { chainId?: number }`
  - **Returns:** `Promise<WalletClient<Transport, Chain, Account>>`

#### Event Handlers (Internal)
- `onAccountsChanged(accounts: string[])` - Handle account changes
- `onChainChanged(chainId: number | string)` - Handle chain changes  
- `onDisconnect(error: Error)` - Handle disconnection

### Types

```typescript
// Provider type
export type WalletConnectProvider = EIP1193Provider & {
  accounts: string[];
  chainId: number | string;
  disconnect?: () => Promise<void>;
};
```

## Requirements

- **Node.js:** >=16
- **wagmi:** ^1.4.13
- **viem:** ^1.21.4
- **arena-app-store-sdk:** ^0.1.11

## Usage with React Context

```typescript
import { WagmiConfig } from 'wagmi'
import { ArenaWagmi1Connector } from '@arena-app-store-sdk/wagmi1-connector'

function App() {
  return (
    <WagmiConfig client={client}>
      <ConnectButton />
      {/* Your app components */}
    </WagmiConfig>
  )
}
```

## Transaction Examples

```typescript
// Using the connector directly
const connector = new ArenaWagmi1Connector({
  provider: arenaSDK.provider,
  chains: [avalanche],
})

await connector.connect()
const walletClient = await connector.getWalletClient()

// Send transaction
const hash = await walletClient.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
})

// Contract interaction
const contract = getContract({
  address: '0x...',
  abi: contractAbi,
  walletClient,
})

const result = await contract.write.myMethod(['param1'])
```

## Migration to wagmi v2

When you're ready to upgrade to wagmi v2, use the companion package:

```bash
npm install @arena-app-store-sdk/wagmi2-connector
```

```typescript
// v1 (class-based)
import { ArenaWagmi1Connector } from '@arena-app-store-sdk/wagmi1-connector'
const connector = new ArenaWagmi1Connector({ 
  provider: arenaSDK.provider, 
  chains: [avalanche] 
})

// v2 (function-based)
import { arenaWagmi2ConnectorFactory } from '@arena-app-store-sdk/wagmi2-connector'
const connectorFactory = arenaWagmi2ConnectorFactory({ 
  provider: arenaSDK.provider 
})
```

## Key Features

1. **Class-based:** Traditional wagmi v1 connector pattern
2. **Full compatibility:** Works with all wagmi v1 hooks and patterns
3. **Arena integration:** Seamless connection to Arena's wallet infrastructure
4. **Type safe:** Full TypeScript support
5. **Event handling:** Automatic account and chain change detection
6. **Stable API:** Mature and battle-tested wagmi v1 ecosystem

## Troubleshooting

### Common Issues

**"No account connected" error:**
- Ensure Arena SDK is initialized before creating connector
- Check that wallet is connected through Arena interface

**Chain mismatch:**
- Verify chain configuration matches your target network
- Use `wagmi/chains` imports for proper chain definitions

**Transaction failures:**
- Ensure wallet has sufficient balance
- Check chain ID matches transaction network

### Debug Mode

Enable debug logs by setting:
```typescript
// In browser console
localStorage.debug = 'wagmi:*'
```

## Links

- [Arena App Store SDK](https://www.npmjs.com/package/arena-app-store-sdk) - Main SDK package
- [Arena Wagmi v2 Connector](https://www.npmjs.com/package/@arena-app-store-sdk/wagmi2-connector) - wagmi v2 version
- [wagmi v1 Documentation](https://1.x.wagmi.sh/) - wagmi v1 framework docs
- [Arena Documentation](https://arena.social/) - Platform documentation

## License

ISC