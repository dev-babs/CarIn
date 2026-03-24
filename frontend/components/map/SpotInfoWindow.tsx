/**
 * Info window component for parking spot details
 */

'use client';

import Link from 'next/link';
import { ParkingSpot } from '@/lib/hooks/useParkingSpots';

interface SpotInfoWindowProps {
  spot: ParkingSpot;
}

export default function SpotInfoWindow({ spot }: SpotInfoWindowProps) {
  return (
    <div className="spot-info-window p-3 min-w-[250px]">
      <div className="mb-2">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">
          Spot #{spot.id}
        </h3>
        <p className="text-sm text-gray-600 truncate">{spot.location}</p>
      </div>

      {spot.description && (
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
          {spot.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xl font-bold text-blue-600">
            {spot.pricePerHour}
          </span>
          <span className="text-gray-500 text-sm ml-1">cUSD/hr</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            spot.isAvailable
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {spot.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <Link
        href={`/booking/${spot.id}`}
        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        View Details
      </Link>
    </div>
  );
}




