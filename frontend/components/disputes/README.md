# Dispute Resolution Components

This directory contains React components for the dispute resolution system.

## Components

### FileDisputeForm

Form component for filing new disputes.

**Props:**
- `escrowId: bigint` - The escrow ID associated with the dispute
- `bookingId: bigint` - The booking ID associated with the dispute
- `onSuccess?: (disputeId: bigint) => void` - Callback when dispute is filed successfully
- `onCancel?: () => void` - Callback when form is cancelled

**Features:**
- Evidence file upload with IPFS integration
- Multiple evidence type support
- Form validation
- Transaction status tracking

### DisputeCard

Card component for displaying dispute information in lists.

**Props:**
- `dispute: DisputeDetails` - The dispute data to display
- `onClick?: () => void` - Optional click handler

**Features:**
- Status badge display
- Time formatting
- Resolution status indicator

### DisputeHistory

Component for displaying user's dispute history.

**Props:**
- `escrowIds?: bigint[]` - Optional filter by escrow IDs

**Features:**
- Separate active and resolved disputes
- Dispute filtering
- Modal view for dispute details

### EvidenceDisplay

Component for displaying dispute evidence.

**Props:**
- `evidence: Evidence` - Evidence data to display

**Features:**
- Image/video/document rendering
- IPFS gateway URL handling
- Evidence metadata display

### CheckInOut

Component for recording check-in and check-out timestamps.

**Props:**
- `bookingId: bigint` - The booking ID
- `isOwner?: boolean` - Whether current user is the spot owner

**Features:**
- Check-in/check-out status display
- Recording buttons for authorized users
- Transaction status tracking

### AdminDisputePanel

Admin/moderator panel for reviewing and resolving disputes.

**Props:**
- `disputeId: bigint` - The dispute ID to review

**Features:**
- Evidence review
- Manual resolution interface
- Voting interface for voting phase
- Vote history display

## Usage Example

```tsx
import FileDisputeForm from '@/components/disputes/FileDisputeForm';
import DisputeHistory from '@/components/disputes/DisputeHistory';

function DisputesPage() {
  return (
    <div>
      <FileDisputeForm 
        escrowId={BigInt(1)}
        bookingId={BigInt(1)}
        onSuccess={(id) => console.log('Dispute filed:', id)}
      />
      <DisputeHistory />
    </div>
  );
}
```

## Dependencies

- `wagmi` - Wallet connection and contract interactions
- `viem` - Ethereum utilities
- `date-fns` - Date formatting
- `next/image` - Image optimization

## State Management

Components use React hooks for local state and wagmi hooks for blockchain interactions. No global state management library is required.

## Error Handling

All components include error handling for:
- Wallet connection issues
- Transaction failures
- Network errors
- Validation errors

## Styling

Components use Tailwind CSS for styling with a consistent design system. All components are responsive and mobile-friendly.

