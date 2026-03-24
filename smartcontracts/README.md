# CarIn Smart Contracts

Smart contracts for the CarIn blockchain.

adding more functionality and updates on solidarity 

## Contracts

- **ParkingSpot.sol** - Manages parking spot listings, bookings, and ownership
- **PaymentEscrow.sol** - Handles escrowed payments and refunds

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
PRIVATE_KEY=your_wallet_private_key
CELOSCAN_API_KEY=your_celoscan_api_key
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm run test
```

5. Deploy to Alfajores testnet:
```bash
npm run deploy:alfajores
```

## Network Configuration

- **Alfajores Testnet**: Chain ID 44787
- **Celo Mainnet**: Chain ID 42220

## Security

- Uses OpenZeppelin contracts for security
- Implements reentrancy guards
- Access control for sensitive operations




