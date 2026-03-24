# AppKit / WalletConnect Setup Guide

This guide explains how to set up Reown AppKit (formerly WalletConnect) for the CarIn frontend application.

## Prerequisites

- Node.js 18+ installed
- A WalletConnect Cloud account (free at https://c

## Setup Steps

### 1. Get Your WalletConnect Project ID

1. Go to [Reown Cloud](https://cloud.reown.com) and sign in (or create an account)
2. Create a new project or select an existing one
3. 

Create a `.env.local` file in the `frontend/` directory:

```bash
# WalletConnect / Reown AppONNECT_PROJECT_ID=your_project_id_here

# Celo Network Configuration
NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CELO_MAINNET_RPC_URL=https://forno.celo.org
```

Replace `your_project_id_here` with your actual Project ID from Reown Cloud.

### 3. Install Dependencies

```bash
cd frontend
npm install
```

This will install all required dependencies including:
- `@reown/appkit`
- `@reown/appkit-adapter-wagmi`
- `@tanstack/react-query`
- `wagmi` and `viem`

### 4. Verify Setup

The AppKit provider is already configured in:
- `lib/providers/AppKitProvider.tsx` - Provider component
- `app/layout.tsx` - Root layout with provider

### 5. Test Wallet Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Look for wallet connection buttons/components that use AppKit

## Supported Networks

The AppKit is configured to support:
- **Celo Alfajores Testnet** (default) - Chain ID: 44787
- **Celo Mainnet** - Chain ID: 42220

## Supported Wallets

AppKit supports all major wallets including:
- MetaMask
- WalletConnect
- Valora (Celo mobile wallet)
- Coinbase Wallet
- Trust Wallet
- And many more...

## Troubleshooting

### "Project ID is required" Error

- Make sure you've created a `.env.local` file
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- Restart your development server after adding environment variables

### Wallet Not Connecting

- Check that your wallet is unlocked
- Verify you're on a supported network (Celo Alfajores or Celo Mainnet)
- Check browser console for error messages

### Network Not Found

- The networks are pre-configured in `AppKitProvider.tsx`
- If you need to add more networks, update the `networks` array in the provider

## Next Steps

After setting up AppKit:
1. Update wallet connection hooks (`lib/hooks/useWalletBooking.ts`)
2. Update wallet connection UI component (`components/WalletConnect.tsx`)
3. Test the full wallet connection flow

## Resources

- [Reown AppKit Documentation](https://docs.reown.com/appkit)
- [WalletConnect Cloud](https://cloud.reown.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Celo Network Documentation](https://docs.celo.org)

