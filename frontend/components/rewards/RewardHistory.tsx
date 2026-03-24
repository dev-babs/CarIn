"use client";

import { useRewardReports, useReferrals } from "@/lib/hooks/useRewards";
import { formatDistanceToNow } from "date-fns";

// Fallback if date-fns is not available
const formatTimeAgo = (timestamp: number) => {
  try {
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  } catch {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }
};

export default function RewardHistory() {
  const { reports, loading: reportsLoading } = useRewardReports();
  const { referrals, loading: referralsLoading } = useReferrals();

  const loading = reportsLoading || referralsLoading;

  const getClaimStatusBadge = (status: number) => {
    switch (status) {
      case 0: // Pending
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>;
      case 1: // Approved
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Approved</span>;
      case 2: // Rejected
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Rejected</span>;
      case 3: // Claimed
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Claimed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reports History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Report History</h2>
        {reports.length === 0 ? (
          <p className="text-gray-600">No reports submitted yet</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.reportId} className="border rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">Spot #{report.spotId}</p>
                    <p className="text-sm text-gray-600">{report.reason}</p>
                  </div>
                  {getClaimStatusBadge(report.claimStatus)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <span>{formatTimeAgo(report.timestamp)}</span>
                  {report.rewardAmount !== "0.0" && (
                    <span className="font-semibold text-green-600">
                      +{report.rewardAmount} CARIN
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referrals History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Referral Histories</h2>
        {referrals.length === 0 ? (
          <p className="text-gray-600">No referrals created yet</p>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral.referralHash} className="border rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">Spot #{referral.spotId}</p>
                    <p className="text-sm text-gray-600">
                      Referred: {referral.referee.slice(0, 6)}...{referral.referee.slice(-4)}
                    </p>
                  </div>
                  {getClaimStatusBadge(referral.claimStatus)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <span>{formatTimeAgo(referral.timestamp)}</span>
                  {referral.rewardAmount !== "0.0" && (
                    <span className="font-semibold text-green-600">
                      +{referral.rewardAmount} CARIN
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

