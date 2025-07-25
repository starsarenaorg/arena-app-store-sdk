# Arena App SDK ![Alpha](https://img.shields.io/badge/status-alpha-orange)

The Arena App SDK provides developers with tools to integrate with the Arena platform, offering:
- Secure access to user's wallet through Arena's infrastructure
- Ability to interact with Arena's API methods
- Seamless integration with Arena's ecosystem

## Installation

Install via npm:

```bash
npm install arena-app-store-sdk
```

## How It Works in Arena

Your application will be displayed within the Arena platform through the following process:

1. **App Store Integration**
   - Your app will appear in the Arena App Store as a dedicated entry
   - Users can discover and launch your app directly from the store
   - Apps run securely within an iframe on the Arena platform

2. **Hosting Requirements**
   - Your application must be hosted on your own infrastructure
   - Ensure your server supports HTTPS for secure connections
   - CORS headers must be properly configured

3. **Getting Your App Listed**
   - Register your app on the Arene App Store:
     - App name and description
     - Target URL (must be HTTPS)
     - Required permissions
     - App icon (minimum 512x512px)
   - We'll handle the technical integration on our side

4. Locally testing your app:
   - Run your app on your local port `3481`
   - Use the `Run Your App Locally` feature in the Arena App Store to test your app

5. **User Experience**
   - Users will see a permissions dialog when first launching your app
   - Your app will have access to the requested features after user approval
   - Wallet connections are handled through Arena's secure interface

## Getting Started

Before using the SDK, you'll need to create a project in [Reown](https://dashboard.reown.com) and obtain your credentials:

1. Go to the [Reown](https://dashboard.reown.com) developer portal
2. Create a new project
3. Configure your project settings (name, description, URL, etc.)
4. Generate your Project ID and API keys
5. Add your app's domain to the allowed origins
6. Save your credentials securely

## How to Connect SDK to Your HTML Project

To integrate the Arena App SDK into your HTML project, follow these steps:

1. Include the SDK script in your HTML file:

```html
<script type="module">
  import { ArenaAppStoreSdk } from '/path/to/arena-sdk/index.js';
  window.ArenaAppStoreSdk = ArenaAppStoreSdk;
</script>
```

2. Initialize the SDK in your JavaScript code:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const arenaAppStoreSdk = new ArenaAppStoreSdk({
    projectId: "YOUR_PROJECT_ID",
    metadata: {
      name: "Your App Name",
      description: "Your App Description",
      url: window.location.href,
      icons: ["https://your-app.com/icon.png"]
    }
  });

  // Add your event listeners and other initialization code here
});
```

3. Use the SDK methods and events as needed in your application.

## API Examples

Here are some common usage examples from the Arena Demo App:

### Wallet Information
Get the connected wallet address and balance:

```javascript
arenaAppStoreSdk.on('walletChanged', ({ address }) => {
  console.log('Wallet address:', address);
});

const balance = await arenaAppStoreSdk.provider.request({
  method: 'eth_getBalance',
  params: [arenaAppStoreSdk.provider.accounts[0], 'latest']
});
```

### User Profile
Retrieve the user's profile information:

```javascript
const profile = await arenaAppStoreSdk.sendRequest("getUserProfile");
```

### Transactions
Send AVAX transactions:

```javascript
const txHash = await arenaAppStoreSdk.provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: arenaAppStoreSdk.provider.accounts[0],
    to: '0x...',
    value: '0x...'
  }]
});
```

## Alpha Notes
- WalletConnect integration is in early stages
- API may change in future releases

