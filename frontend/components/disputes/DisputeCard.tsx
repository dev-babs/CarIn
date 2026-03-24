'use client';

import { DisputeDetails, ResolutionType } from '@/lib/contracts/disputeResolution';
import { formatEvidenceType } from '@/lib/utils/evidenceHandler';
import { formatDistanceToNow } from 'date-fns';
import DisputeStatusBadge from './DisputeStatusBadge';

interface DisputeCardProps {
  dispute: DisputeDetails;
  onClick?: () => void;
}

export default function DisputeCard({ dispute, onClick }: DisputeCardProps) {

  return (
    <div
      onClick={onClick}
      className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Dispute #{dispute.disputeId.toString()}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Booking #{dispute.bookingId.toString()} • Escrow #{dispute.escrowId.toString()}
          </p>
        </div>
        <DisputeStatusBadge
          isResolved={dispute.isResolved}
          refundApproved={dispute.isResolved ? dispute.refundApproved : null}
          resolutionType={dispute.resolutionType}
          refundPercentage={dispute.refundPercentage}
        />
      </div>

      <div className="mb-4">
        <p className="text-gray-700 line-clamp-2">{dispute.reason}</p>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          <p>
            Filed by: <span className="font-medium">{dispute.filedBy.slice(0, 6)}...{dispute.filedBy.slice(-4)}</span>
          </p>
          <p className="mt-1">
            Filed {formatDistanceToNow(new Date(Number(dispute.filedAt) * 1000), { addSuffix: true })}
          </p>
        </div>
        {dispute.isResolved && dispute.resolvedAt > 0n && (
          <div className="text-right">
            <p className="font-medium">Resolved</p>
            <p className="text-xs mt-1">
              {formatDistanceToNow(new Date(Number(dispute.resolvedAt) * 1000), { addSuffix: true })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

