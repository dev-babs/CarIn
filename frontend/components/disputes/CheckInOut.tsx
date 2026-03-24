'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDisputeResolution, useCheckInData } from '@/lib/hooks/useDisputeResolution';
import { useWaitForTransactionReceipt } from 'wagmi';

interface CheckInOutProps {
  bookingId: bigint;
  isOwner?: boolean;
}

export default function CheckInOut({ bookingId, isOwner = false }: CheckInOutProps) {
  const { address } = useAccount();
  const { recordCheckIn, recordCheckOut, hash } = useDisputeResolution();
  const { checkInData, isLoading } = useCheckInData(bookingId);
  const [action, setAction] = useState<'checkin' | 'checkout' | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCheckIn = async () => {
    if (!address) return;
    setAction('checkin');
    try {
      await recordCheckIn(bookingId);
    } catch (error) {
      console.error('Check-in error:', error);
      setAction(null);
    }
  };

  const handleCheckOut = async () => {
    if (!address) return;
    setAction('checkout');
    try {
      await recordCheckOut(bookingId);
    } catch (error) {
      console.error('Check-out error:', error);
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isSuccess && action) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">
          {action === 'checkin' ? 'Check-in' : 'Check-out'} recorded successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {isOwner ? 'Record Check-in/Check-out' : 'Check-in/Check-out Status'}
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-700">Check-in Status</p>
            {checkInData?.checkedIn ? (
              <p className="text-sm text-gray-600">
                Checked in at {new Date(Number(checkInData.checkInTime) * 1000).toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not checked in</p>
            )}
          </div>
          {isOwner && !checkInData?.checkedIn && (
            <button
              onClick={handleCheckIn}
              disabled={action === 'checkin' || isConfirming}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {action === 'checkin' || isConfirming ? 'Recording...' : 'Record Check-in'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-700">Check-out Status</p>
            {checkInData?.checkedOut ? (
              <p className="text-sm text-gray-600">
                Checked out at {new Date(Number(checkInData.checkOutTime) * 1000).toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {checkInData?.checkedIn ? 'Not checked out' : 'Check-in required first'}
              </p>
            )}
          </div>
          {isOwner && checkInData?.checkedIn && !checkInData?.checkedOut && (
            <button
              onClick={handleCheckOut}
              disabled={action === 'checkout' || isConfirming}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {action === 'checkout' || isConfirming ? 'Recording...' : 'Record Check-out'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}




