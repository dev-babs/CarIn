# Token Rewards System Documentation

## Overview

The CarIn Token Rewards System incentivizes community participation and accurate reporting through a comprehensive ERC20 token reward mechanism. Users earn CARIN tokens for:

- Reporting inaccurate spots
- Sharing underutilized spots
- Referral rewards
- Community contributions

## Architecture

### Contracts

#### RewardsToken
- **Type**: ERC20 with governance support (ERC20Votes)
- **Features**:
  - Minting controlled by RewardsManager
  - Burnable by users
  - Pausable in emergencies
  - Maximum supply cap
  - Voting power for governance

#### RewardsManager
- **Purpose**: Manages reward distribution and validation
- **Features**:
  - Report submission and validation
  - Referral creation and tracking
  - Reward claiming with cooldowns
  - Anti-gaming mechanisms
  - Oracle integration support

## Reward Types

### 1. Inaccuracy Reports
- **Amount**: 100 CARIN tokens
- **Process**:
  1. User submits report with evidence
  2. Oracle/owner validates report
  3. If valid, reward is added to pending balance
  4. User can claim after cooldown period

### 2. Spot Sharing
- **Amount**: 50 CARIN tokens
- **Process**: Share underutilized spots to earn rewards

### 3. Referrals
- **Amount**: 25 CARIN tokens
- **Process**:
  1. User creates referral link
  2. Referee books using referral
  3. Referrer earns reward automatically

### 4. Community Contributions
- **Amount**: Variable (set by owner)
- **Process**: Special rewards for significant contributions

## Anti-Gaming Mechanisms

### Cooldown Periods
- **Report Cooldown**: 1 day (default)
- **Referral Cooldown**: 7 days (default)
- **Claim Cooldown**: 1 day (default)

### Validation Requirements
- Reports require evidence (IPFS hash or URL)
- Oracle validation for reports
- Minimum stake requirements (configurable)

### Limits
- Maximum reports per day: 5 (configurable)
- Maximum referrals per day: 10 (configurable)

## Usage

### Submitting a Report

```solidity
// Submit inaccuracy report
rewardsManager.submitInaccuracyReport(
    spotId,
    "Wrong location coordinates",
    evidenceHash // IPFS hash or URL
);
```

### Creating a Referral

```solidity
// Create referral
rewardsManager.createReferral(refereeAddress, spotId);
```

### Claiming Rewards

```solidity
// Claim specific reward type
rewardsManager.claimReward(RewardType.InaccuracyReport);

// Claim all pending rewards
rewardsManager.claimAllRewards();
```

## Configuration

Reward amounts and cooldowns can be configured by the contract owner:

```solidity
// Update reward amounts
rewardsManager.setInaccuracyReportReward(newAmount);
rewardsManager.setSpotShareReward(newAmount);
rewardsManager.setReferralReward(newAmount);

// Update cooldowns
rewardsManager.setReportCooldown(newCooldown);
rewardsManager.setReferralCooldown(newCooldown);
rewardsManager.setClaimCooldown(newCooldown);
```

## Gas Considerations

- Small rewards may cost more in gas than their value
- Users should accumulate rewards before claiming
- Consider batching claims for efficiency

## Security

- Reentrancy guards on all state-changing functions
- Access control via OpenZeppelin Ownable
- Pausable functionality for emergencies
- Oracle-based validation prevents gaming

## Deployment

See `scripts/deploy-rewards.js` for deployment instructions.

## Testing

Comprehensive test suites available:
- `test/RewardsToken.test.js`
- `test/RewardsManager.test.js`

Run tests with:
```bash
npm test
```




