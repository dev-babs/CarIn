'use client';

import { ResolutionType } from '@/lib/contracts/disputeResolution';

interface DisputeStatusBadgeProps {
  isResolved: boolean;
  refundApproved: boolean | null;
  resolutionType: ResolutionType;
  refundPercentage?: bigint | number;
}

export default function DisputeStatusBadge({
  isResolved,
  refundApproved,
  resolutionType,
  refundPercentage
}: DisputeStatusBadgeProps) {
  if (isResolved) {
    if (refundApproved) {
      const percent = refundPercentage !== undefined ? Number(refundPercentage) : 100;
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Resolved - {percent}% Refund Approved
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        Resolved - Refund Denied
      </span>
    );
  }

  switch (resolutionType) {
    case ResolutionType.Automated:
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          Automated Review
        </span>
      );
    case ResolutionType.PendingVote:
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending Vote
        </span>
      );
    case ResolutionType.Manual:
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
          Manual Review
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          Unknown
        </span>
      );
  }
}

