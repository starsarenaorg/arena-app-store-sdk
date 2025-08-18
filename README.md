# Arena App SDK ![Alpha](https://img.shields.io/badge/status-alpha-orange)

The Arena App SDK provides developers with tools to integrate with the Arena platform, offering:
- Secure access to users' wallets through Arena's infrastructure
- The ability to interact with Arena's API methods
- Seamless integration with Arena's ecosystem

## Table of Contents

- [How It Works in Arena](#how-it-works-in-arena)
- [Getting Started](#getting-started)
- [How to Connect the SDK to Your HTML Project](#how-to-connect-the-sdk-to-your-html-project)
- [API Examples](#api-examples)
    - [Wallet Information](#wallet-information)
    - [User Profile](#user-profile)
    - [Transactions](#transactions)
- [FAQ](#faq)
- [Alpha Notes](#alpha-notes)

## How It Works in Arena

Your application will be displayed within the Arena platform through the following process:

1. **App Store Integration**
   - Your app will appear in the Arena App Store as a dedicated entry
   - Users can discover and launch your app directly from the store
   - Apps run securely within an iframe on the Arena platform

2. **Hosting Requirements**
   - Your application must be hosted on your own infrastructure
   - Ensure your server supports HTTPS for secure connections
   - CORS headers must be properly configured. One example configuration is:
   ```
    Access-Control-Allow-Origin: https://arena.social
    Access-Control-Allow-Credentials: true
    Access-Control-Allow-Methods: GET, POST, OPTIONS
    Access-Control-Allow-Headers: Content-Type, Authorization
   ```

3. **Getting Your App Listed**
   - Register your app on the Arena App Store:
     - App name and description
     - Target URL (must be HTTPS)
     - Select the required features (e.g., wallet access, user profile, etc.) from the dropdown menu
     - App icon (minimum 512x512px)
   - We'll handle the technical integration on our side

4. Locally Testing Your App:
   - Run your app on local port `3481`
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

## How to Connect the SDK to Your HTML Project

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

## FAQ
**Q:** What origins should I allow for CORS?  
**A:** Allow https://arena.social as the origin. You do not need to specify full paths.

**Q:** Is authentication required on the Arena platform side?  
**A:** No, authentication is not required on Arena's side. Your app should handle any necessary authentication independently if needed. 
However, you can already load the logged-in user profile using the `getUserProfile` method 
and then use it and not need a separate login flow.

**Q:** Can I test my app locally?  
**A:** Yes, run your app on local port 3481 and use the Run Your App Locally feature in the Arena App Store. 
And try from a browser with dev mode like Chrome or Firefox. 
Brave like secure browsers don't allow our https site to open localhost (which is running on http).

**Q:** I am seeing a black screen when I try to display my app. What should I do?
**A:** 
1. If it is your production app. Make sure your app is running on https protocol, and you have registered your app with the `https` url.
1. If it is your local app, make sure you are running it on port `3481` and you have selected the `Run Your App Locally` option in the Arena App Store, and you are using a browser that allows localhost http connections from https context (like Chrome or Firefox).

**Q:** What features can my app request?  
**A:** Your app can request features such as wallet access and user profile. Select the required features during registration.

**Q:** Is the SDK stable?  
**A:** The SDK is in alpha. The API may change in future releases.

## Alpha Notes
- WalletConnect integration is in early stages
- The API may change in future releases

