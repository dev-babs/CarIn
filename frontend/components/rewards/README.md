# Rewards System Components

This directory contains all frontend components for the token rewards system.

## Components

### ReportForm
Component for submitting inaccuracy reports for parking spots.

**Props:**
- `spotId: number` - The ID of the spot being reported
- `onSuccess?: () => void` - Callback when report is successfully submitted
- `onCancel?: () => void` - Callback when form is cancelled

**Usage:**
```tsx
<ReportForm 
  spotId={1} 
  onSuccess={() => console.log('Report submitted')} 
/>
```

### ReferralShare
Component for sharing spots and creating referrals.

**Props:**
- `spotId: number` - The ID of the spot to share

**Features:**
- Generates referral links automatically
- Allows manual referral creation
- Displays reward information

**Usage:**
```tsx
<ReferralShare spotId={1} />
```

### RewardHistory
Displays user's reward history including reports and referrals.

**Features:**
- Shows all submitted reports with status
- Shows all created referrals with status
- Displays timestamps and reward amounts
- Visual status badges

**Usage:**
```tsx
<RewardHistory />
```

## Integration

All components use the `useRewards` hooks from `@/lib/hooks/useRewards`:
- `useRewards()` - Main hook for balance and claiming
- `useRewardReports()` - Hook for report management
- `useReferrals()` - Hook for referral tracking

## Requirements

- Wallet connection (wagmi)
- Contract addresses configured in environment variables
- Network connection to Celo (Alfajores or Mainnet)

## Styling

Components use Tailwind CSS and follow the design system used throughout the CarIn application.




