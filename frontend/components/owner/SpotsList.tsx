"use client";

import { useState, useEffect } from "react";
import SpotCard from "./SpotCard";
import EditSpotModal from "./EditSpotModal";

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

interface SpotsListProps {
  address: string;
  refreshTrigger: number;
}

export default function SpotsList({ address, refreshTrigger }: SpotsListProps) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);

  useEffect(() => {
    fetchOwnerSpots();
  }, [address, refreshTrigger]);

  const fetchOwnerSpots = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from ParkingSpot smart contract
      // For now, use mock data
      const mockSpots: Spot[] = [
        {
          id: 1,
          location: "123 Main St, San Francisco, CA",
          pricePerHour: "2.50",
          isAvailable: true,
          totalBookings: 45,
          totalEarnings: "125.50",
          images: ["QmExample1", "QmExample2"],
          description: "Convenient street parking near downtown",
        },
      ];
      setSpots(mockSpots);
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spot: Spot) => {
    setEditingSpot(spot);
  };

  const handleDelete = async (spotId: number) => {
    if (!confirm("Are you sure you want to remove this spot?")) return;

    try {
      // TODO: Call smart contract to deactivate/remove spot
      console.log("Deactivating spot:", spotId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSpots(prev => prev.filter(s => s.id !== spotId));
      alert("Spot removed successfully");
    } catch (error) {
      console.error("Error removing spot:", error);
      alert("Failed to remove spot");
    }
  };

  const handleToggleAvailability = async (spotId: number) => {
    try {
      // TODO: Call smart contract to toggle availability
      console.log("Toggling availability for spot:", spotId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSpots(prev =>
        prev.map(spot =>
          spot.id === spotId ? { ...spot, isAvailable: !spot.isAvailable } : spot
        )
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Failed to update availability");
    }
  };

  const handleSpotUpdated = () => {
    setEditingSpot(null);
    fetchOwnerSpots();
  };

  if (loading) {
    return <div className="text-center py-8">Loading your spots...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Parking Spots</h2>
        <div className="text-sm text-gray-600">
          Total: {spots.length} spot(s)
        </div>
      </div>

      {spots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven't listed any spots yet.</p>
          <p className="text-sm text-gray-500">List your first spot to start earning!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      {editingSpot && (
        <EditSpotModal
          spot={editingSpot}
          onClose={() => setEditingSpot(null)}
          onUpdated={handleSpotUpdated}
        />
      )}
    </div>
  );
}




