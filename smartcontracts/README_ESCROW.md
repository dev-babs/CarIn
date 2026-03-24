# PaymentEscrow Smart Contract

Enhanced payment escrow contract for CarIn parking platform with comprehensive features.

## Features

✅ **Multi-Token Support**: Native CELO, cUSD, and cEUR
✅ **Automatic Releases**: Time-based automatic escrow release
✅ **Partial Refunds**: Split refunds
✅ **Dispute Resolution**: On-chain dispute filing and resolution
✅ **Expiration Handling**: Automatic refund for expired escrows
✅ **Security**: Reentrancy guards and SafeERC20

## Quick Start

### Deployment

```bash
npx hardhat run scripts/deploy-escrow.js --network alfajores
```

### Testing

```bash
npm test
```

## Documentation

- [API Reference](./docs/PAYMENT_ESCROW_API.md)
- [Usage Examples](./docs/PAYMENT_ESCROW_USAGE.md)
- [Security](./docs/PAYMENT_ESCROW_SECURITY.md)
- [Events](./docs/PAYMENT_ESCROW_EVENTS.md)

