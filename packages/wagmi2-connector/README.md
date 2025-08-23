# Arena Wagmi v2 Connector

Arena Wallet connector for wagmi v2.16.4+ - A modern function-based connector that integrates Arena's wallet infrastructure with wagmi v2.

> **Note:** This package requires the main [Arena App Store SDK](https://www.npmjs.com/package/arena-app-store-sdk) to be installed and configured first.

## Installation

```bash
npm install @arena-app-store-sdk/wagmi2-connector
```

## Prerequisites

You must first install and set up the main Arena SDK:

```bash
npm install arena-app-store-sdk
```

See the [Arena App Store SDK documentation](https://www.npmjs.com/package/arena-app-store-sdk) for setup instructions.

## Basic Usage

```typescript
import { createConfig, http } from 'wagmi'
import { avalanche } from 'viem/chains' // Use viem chains for v2
import { arenaWagmi2ConnectorFactory } from '@arena-app-store-sdk/wagmi2-connector'
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

// 2. Create wagmi config with Arena connector
const config = createConfig({
  chains: [avalanche],
  connectors: [
    arenaWagmi2ConnectorFactory({
      provider: arenaSDK.provider, // Arena provider instance
    })
  ],
  transports: {
    [avalanche.id]: http(),
  },
})

// 3. Use with wagmi hooks
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
import { arenaWagmi2ConnectorFactory } from '@arena-app-store-sdk/wagmi2-connector'
import { avalanche } from 'viem/chains'

// Create connector factory
const connectorFactory = arenaWagmi2ConnectorFactory({
  provider: arenaSDK.provider,
})

// Create connector instance
const connector = connectorFactory({
  chains: [avalanche],
  emitter: { emit: () => {} }, // Minimal emitter
})

// Connect
const { accounts, chainId } = await connector.connect()
const address = accounts[0]

// Get provider for transactions
const provider = await connector.getProvider()
```

## API Reference

### `arenaWagmi2ConnectorFactory(parameters)`

Creates a wagmi v2 connector factory for Arena wallet integration.

**Parameters:**
- `parameters.provider` - Arena provider instance from `ArenaAppStoreSdk.provider`

**Returns:** A wagmi v2 connector factory function

### Connector Methods

The created connector implements the standard wagmi v2 connector interface:

- `connect({ chainId? })` - Connect to Arena wallet
- `disconnect()` - Disconnect from wallet
- `getAccounts()` - Get connected wallet addresses
- `getChainId()` - Get current chain ID
- `getProvider()` - Get underlying EIP-1193 provider
- `isAuthorized()` - Check if wallet is connected
- `switchChain({ chainId })` - Switch to different chain

## Requirements

- **Node.js:** >=16
- **wagmi:** ^2.16.4
- **@wagmi/core:** ^2.16.4  
- **viem:** ^2.0.0
- **arena-app-store-sdk:** ^0.1.11

## Migration from wagmi v1

Replace the class-based connector with the new factory function:

```typescript
// v1 (old - class-based)
import { ArenaWagmiConnector } from 'arena-app-store-sdk'
const connector = new ArenaWagmiConnector({ 
  provider: arenaSDK.provider, 
  chains: [avalanche] 
})

// v2 (new - function-based)
import { arenaWagmi2ConnectorFactory } from '@arena-app-store-sdk/wagmi2-connector'
const connectorFactory = arenaWagmi2ConnectorFactory({ 
  provider: arenaSDK.provider 
})
const connector = connectorFactory({ 
  chains: [avalanche], 
  emitter: { emit: () => {} } 
})
```

## Key Differences from v1

1. **Function-based:** Uses wagmi v2's `createConnector` pattern
2. **Chain handling:** Chains are passed to connector instance, not factory
3. **Viem compatibility:** Uses viem chain definitions
4. **Modern types:** Full TypeScript support with wagmi v2 types

## Links

- [Arena App Store SDK](https://www.npmjs.com/package/arena-app-store-sdk) - Main SDK package
- [wagmi v2 Documentation](https://wagmi.sh/) - wagmi framework docs
- [Arena Documentation](https://arena.social/) - Platform documentation

## License

ISC