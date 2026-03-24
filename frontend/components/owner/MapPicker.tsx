"use client";

import { useState } from "react";

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  selectedLocation?: string;
}

export default function MapPicker({ onLocationSelect, selectedLocation }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // TODO: Integrate with Google Maps Geocoding API or similar
      // For now, simulate location selection
      const mockLat = 37.7749 + (Math.random() - 0.5) * 0.1;
      const mockLng = -122.4194 + (Math.random() - 0.5) * 0.1;
      
      onLocationSelect(mockLat, mockLng, searchQuery);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = () => {
    // TODO: Open map picker modal with interactive map
    // For now, just trigger search
    handleSearch();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search address or click to pick on map"
        />
        <button
          type="button"
          onClick={handleMapClick}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          📍 Pick on Map
        </button>
      </div>
      
      {/* Map placeholder - will be replaced with actual map integration */}
      <div 
        className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
        onClick={handleMapClick}
      >
        <p className="text-gray-500">Click to select location on map</p>
      </div>
    </div>
  );
}




