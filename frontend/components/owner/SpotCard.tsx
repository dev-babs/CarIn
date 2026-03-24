"use client";

interface Spot {
  id: number;
  location: string;
  pricePerHour: string;
  isAvailable: boolean;
  totalBookings: number;
  totalEarnings: string;
  images: string[];
  description: string;
}

interface SpotCardProps {
  spot: Spot;
  onEdit: (spot: Spot) => void;
  onDelete: (spotId: number) => void;
  onToggleAvailability: (spotId: number) => void;
}

export default function SpotCard({
  spot,
  onEdit,
  onDelete,
  onToggleAvailability,
}: SpotCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        {spot.images.length > 0 ? (
          <span className="text-gray-500 text-sm">Image: {spot.images[0]}</span>
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>

      {/* Spot Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg truncate">{spot.location}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{spot.description}</p>
        
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-2xl font-bold text-blue-600">{spot.pricePerHour}</span>
            <span className="text-gray-500 text-sm ml-1">cUSD/hr</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              spot.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {spot.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>{spot.totalBookings} bookings</span>
          <span className="font-semibold">{spot.totalEarnings} cUSD earned</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <button
          onClick={() => onToggleAvailability(spot.id)}
          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
            spot.isAvailable
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {spot.isAvailable ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onEdit(spot)}
          className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(spot.id)}
          className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}




