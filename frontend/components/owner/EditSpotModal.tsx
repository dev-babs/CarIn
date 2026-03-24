"use client";

import { useState } from "react";

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

interface EditSpotModalProps {
  spot: Spot;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditSpotModal({ spot, onClose, onUpdated }: EditSpotModalProps) {
  const [formData, setFormData] = useState({
    pricePerHour: spot.pricePerHour,
    description: spot.description,
    isAvailable: spot.isAvailable,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Call smart contract to update spot
      console.log("Updating spot:", spot.id, formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Spot updated successfully!");
      onUpdated();
    } catch (error) {
      console.error("Error updating spot:", error);
      alert("Failed to update spot");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Parking Spot</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Hour (cUSD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.pricePerHour}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
              Available for booking
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




