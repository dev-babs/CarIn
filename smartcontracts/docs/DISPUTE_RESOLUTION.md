# Dispute Resolution System Documentation

## Overview

The Dispute Resolution System provides automated and manual dispute handling for parking spot bookings. It uses on-chain timestamps, evidence submission (via IPFS), and voting mechanisms to fairly resolve disputes between renters and spot owners.

## Architecture

### Components

1. **DisputeResolution Contract**: Main contract handling dispute logic
2. **PaymentEscrow Integration**: Works with PaymentEscrow for refund processing
3. **ParkingSpot Integration**: Tracks booking and check-in/out data
4. **Evidence System**: IPFS-based evidence storage with hash verification

### Resolution Types

1. **Automated**: Resolved automatically based on timestamps and evidence
2. **PendingVote**: Requires voting from authorized voters
3. **Manual**: Requires moderator/admin review

## Key Features

### Automated Resolution

The system can automatically resolve disputes based on:

- **No-show Detection**: If check-in doesn't occur within threshold (default 1 hour)
- **Late Check-in**: Calculates refund percentage based on lateness (max 50%)
- **Early Check-out**: Provides partial refund for unused time (max 30%)

### Evidence Submission

Supports multiple evidence types:
- Check-in/Check-out Timestamps
- Images (JPEG, PNG, WebP, GIF)
- Videos (MP4, WebM, QuickTime)
- Documents (PDF, DOC, DOCX)
- Location Data
- Other evidence types

All evidence is stored on IPFS with hash stored on-chain for verification.

### Voting Mechanism

For complex disputes, authorized voters can submit votes:
- Minimum votes required: 3 (configurable)
- Threshold for auto-resolution: 80% (configurable)
- Equal weight voting (can be extended to token-based)

### Manual Resolution

Moderators can manually resolve disputes with:
- Full or partial refund approval
- Refund percentage control (0-100%)
- Dispute status tracking

## Usage

### Filing a Dispute

```solidity
disputeResolution.fileDispute(
    escrowId,
    bookingId,
    reason,
    evidenceHash, // IPFS hash
    evidenceType
);
```

### Recording Check-in/Check-out

```solidity
// Check-in
disputeResolution.recordCheckIn(bookingId, checkInTime);

// Check-out
disputeResolution.recordCheckOut(bookingId, checkOutTime);
```

### Submitting Evidence

```solidity
disputeResolution.submitEvidence(
    disputeId,
    evidenceType,
    evidenceHash,
    description
);
```

### Manual Resolution (Moderator)

```solidity
disputeResolution.resolveDisputeManually(
    disputeId,
    refundApproved, // bool
    refundPercentage // 0-100
);
```

### Voting

```solidity
disputeResolution.submitVote(
    disputeId,
    supportsRefund, // bool
    refundPercentage, // 0-100
    justification // string
);
```

## Configuration

### Thresholds

- `maxResolutionTime`: Maximum time for dispute resolution (default: 7 days)
- `lateCheckInThreshold`: Minutes late before refund (default: 30 minutes)
- `noShowThreshold`: Hours before no-show detection (default: 1 hour)
- `autoRefundThreshold`: Vote percentage for auto-resolution (default: 80%)
- `minVotesForResolution`: Minimum votes needed (default: 3)

### Access Control

- **Owner**: Full control, can add/remove moderators and voters
- **Moderator**: Can manually resolve disputes
- **Authorized Voter**: Can vote on disputes in voting phase

## Security Considerations

1. **Reentrancy Protection**: All state-changing functions use ReentrancyGuard
2. **Access Control**: Role-based access with OpenZeppelin Ownable
3. **Evidence Verification**: IPFS hash verification prevents tampering
4. **Timestamp Validation**: On-chain timestamps prevent manipulation
5. **Pausable**: Can pause contract in emergency situations

## Gas Optimization

- Struct packing for efficient storage
- Event indexing for efficient querying
- Minimal storage operations
- Batch operations where possible

## Testing

Run tests with:
```bash
npm run test:disputes
```

Test coverage includes:
- Check-in/check-out recording
- Dispute filing and evidence submission
- Automated resolution scenarios
- Manual resolution
- Voting mechanism
- Integration tests

## Deployment

Deploy with:
```bash
npm run deploy:dispute:alfajores
```

Required environment variables:
- `PAYMENT_ESCROW_ADDRESS`: Address of deployed PaymentEscrow contract
- `PARKING_SPOT_ADDRESS`: Address of deployed ParkingSpot contract
- `PRIVATE_KEY`: Deployer private key
- `CELO_RPC_URL`: RPC URL for network

## Future Enhancements

1. Token-based voting weights
2. Oracle integration for external evidence verification
3. Multi-language dispute reason support
4. Dispute appeal mechanism
5. Reputation system integration

