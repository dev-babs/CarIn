"use client";

interface Spot {
  id: string;
  location: string;
  pricePerHour: string;
  images: string[];
  description: string;
  owner: string;
  isAvailable: boolean;
}

interface SpotDetailsProps {
  spot: Spot;
}

export default function SpotDetails({ spot }: SpotDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      {/* Images */}
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        {spot.images && spot.images.length > 0 ? (
          <span className="text-gray-500">Image: {spot.images[0]}</span>
        ) : (
          <span className="text-gray-400">No image available</span>
        )}
      </div>

      {/* Details */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">{spot.location}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-4xl font-bold text-blue-600">{spot.pricePerHour}</span>
            <span className="text-gray-500 ml-2">cUSD/hour</span>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              spot.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {spot.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{spot.description}</p>

        <div className="border-t pt-4 text-sm text-gray-500">
          <p>Owner: {spot.owner}</p>
          <p>Spot ID: #{spot.id}</p>
        </div>
      </div>
    </div>
  );
}




