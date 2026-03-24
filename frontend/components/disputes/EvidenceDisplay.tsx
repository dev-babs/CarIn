'use client';

import { Evidence } from '@/lib/contracts/disputeResolution';
import { formatEvidenceType, getIPFSGatewayURL } from '@/lib/utils/evidenceHandler';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface EvidenceDisplayProps {
  evidence: Evidence;
}

export default function EvidenceDisplay({ evidence }: EvidenceDisplayProps) {
  const evidenceUrl = evidence.evidenceHash.startsWith('0x')
    ? null // Bytes hash, needs conversion
    : getIPFSGatewayURL(evidence.evidenceHash);

  const isImage = evidence.evidenceType === 2; // Image type
  const isVideo = evidence.evidenceType === 3; // Video type

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">
            {formatEvidenceType(evidence.evidenceType as any)}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Submitted by {evidence.submittedBy.slice(0, 6)}...{evidence.submittedBy.slice(-4)}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(Number(evidence.timestamp) * 1000), { addSuffix: true })}
        </span>
      </div>

      {evidence.description && (
        <p className="text-gray-700 mb-3">{evidence.description}</p>
      )}

      {evidenceUrl && (
        <div className="mt-4">
          {isImage && (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={evidenceUrl}
                alt="Evidence"
                fill
                className="object-contain"
                onError={(e) => {
                  // Handle image load error
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {isVideo && (
            <video
              src={evidenceUrl}
              controls
              className="w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {!isImage && !isVideo && (
            <a
              href={evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Evidence
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Evidence ID: {evidence.evidenceId.toString()}
        {evidence.evidenceHash && (
          <span className="ml-2 font-mono">
            Hash: {evidence.evidenceHash.slice(0, 16)}...
          </span>
        )}
      </div>
    </div>
  );
}




