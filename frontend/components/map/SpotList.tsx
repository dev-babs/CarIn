/**
 * List view component for parking spots
 */

'use client';

import Link from 'next/link';
import { ParkingSpot } from '@/lib/hooks/useParkingSpots';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { Coordinates } from '@/lib/utils/distance';

interface SpotListProps {
  spots: ParkingSpot[];
  userLocation?: Coordinates | null;
  onSpotClick?: (spot: ParkingSpot) => void;
}

export default function SpotList({
  spots,
  userLocation,
  onSpotClick,
}: SpotListProps) {
  const sortedSpots = [...spots].sort((a, b) => {
    if (!userLocation || !a.coordinates || !b.coordinates) return 0;

    const distanceA = calculateDistance(userLocation, a.coordinates);
    const distanceB = calculateDistance(userLocation, b.coordinates);

    return distanceA - distanceB;
  });

  if (spots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No parking spots found</p>
        <p className="text-sm text-gray-500 mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedSpots.map((spot) => {
        const distance = userLocation && spot.coordinates
          ? formatDistance(calculateDistance(userLocation, spot.coordinates))
          : null;

        return (
          <div
            key={spot.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onSpotClick?.(spot)}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Image placeholder */}
              <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                {spot.images && spot.images.length > 0 ? (
                  <span className="text-gray-500 text-xs">
                    Image available
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>

              {/* Spot Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    Spot #{spot.id}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      spot.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {spot.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2 truncate">
                  {spot.location}
                </p>

                {spot.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {spot.description}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xl font-bold text-blue-600">
                        {spot.pricePerHour}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        cUSD/hr
                      </span>
                    </div>
                    {distance && (
                      <div className="text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 inline mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {distance} away
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/booking/${spot.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}




