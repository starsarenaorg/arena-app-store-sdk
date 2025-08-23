# Arena Wagmi v2 Connector

Arena Wallet connector for wagmi v2.16.4+

## Installation

```bash
npm install @arena-app-store-sdk/wagmi2-connector
```

## Usage

```typescript
import { createConfig, http } from 'wagmi'
import { avalanche } from 'wagmi/chains'
import { arenaWallet } from '@arena-app-store-sdk/wagmi2-connector'

const config = createConfig({
  chains: [avalanche],
  connectors: [
    arenaWallet({
      provider: arenaProvider, // Your arena provider instance
    })
  ],
  transports: {
    [avalanche.id]: http(),
  },
})
```

## Requirements

- wagmi ^2.16.4
- @wagmi/core ^2.16.4
- viem ^2.0.0

## Migration from v1

Replace the class-based connector:

```typescript
// v1 (old)
import { ArenaWagmiConnector } from 'arena-app-store-sdk'
const connector = new ArenaWagmiConnector({ provider, chains })

// v2 (new)
import { arenaWallet } from '@arena-app-store-sdk/wagmi2-connector'
const connector = arenaWallet({ provider })
```