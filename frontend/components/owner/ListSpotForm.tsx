"use client";

import { useState } from "react";
import MapPicker from "./MapPicker";
import ImageUpload from "./ImageUpload";

interface ListSpotFormProps {
  address: string;
  onSpotCreated: () => void;
}

export default function ListSpotForm({ address, onSpotCreated }: ListSpotFormProps) {
  const [formData, setFormData] = useState({
    location: "",
    latitude: 0,
    longitude: 0,
    pricePerHour: "",
    description: "",
    images: [] as string[],
    availabilityStart: "00:00",
    availabilityEnd: "23:59",
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address,
    }));
  };

  const handleImageUpload = (ipfsHash: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ipfsHash],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Integrate with ParkingSpot smart contract
      // await listSpotOnChain(formData);
      console.log("Listing spot:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Spot listed successfully!");
      onSpotCreated();
      
      // Reset form
      setFormData({
        location: "",
        latitude: 0,
        longitude: 0,
        pricePerHour: "",
        description: "",
        images: [],
        availabilityStart: "00:00",
        availabilityEnd: "23:59",
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      });
    } catch (error) {
      console.error("Error listing spot:", error);
      alert("Failed to list spot. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">List New Parking Spot</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <MapPicker
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location}
          />
          {formData.location && (
            <p className="mt-2 text-sm text-gray-600">
              {formData.location} ({formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)})
            </p>
          )}
        </div>

        {/* Price Per Hour */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Per Hour (cUSD) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.pricePerHour}
            onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2.50"
          />
        </div>

        {/* Availability Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability Schedule
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.availabilityStart}
                onChange={(e) => setFormData(prev => ({ ...prev, availabilityStart: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={formData.availabilityEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, availabilityEnd: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <label key={day} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[day as keyof typeof formData] as boolean}
                  onChange={(e) => setFormData(prev => ({ ...prev, [day]: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700 capitalize">{day.slice(0, 3)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Spot Images Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spot Images (IPFS)
          </label>
          <ImageUpload onImageUploaded={handleImageUpload} />
          {formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Uploaded {formData.images.length} image(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((hash, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {hash.slice(0, 10)}...
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your parking spot, nearby landmarks, accessibility, etc."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !formData.location || !formData.pricePerHour}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Listing Spot..." : "List Spot"}
          </button>
        </div>
      </form>
    </div>
  );
}




