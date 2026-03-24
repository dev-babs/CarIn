"use client";

import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

interface Spot {
  id: string;
  pricePerHour: string;
}

interface DateTimePickerProps {
  spot: Spot;
  onSelect: (date: Date | null, startTime: string, endTime: string) => void;
}

export default function DateTimePicker({ spot, onSelect }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

  const handleContinue = () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    onSelect(selectedDate, startTime, endTime);
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);
    const hours = end > start ? end - start : (24 - start) + end;
    return hours || 1;
  };

  const calculateCost = () => {
    const hours = calculateHours();
    return (parseFloat(spot.pricePerHour) * hours).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date *
        </label>
        <div className="border border-gray-300 rounded-lg p-4">
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
            onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Time Picker */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time *
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Duration Preview */}
      {selectedDate && startTime && endTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold">{calculateHours()} hour(s)</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Cost</p>
              <p className="text-lg font-semibold text-blue-600">{calculateCost()} cUSD</p>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !startTime || !endTime}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Summary
        </button>
      </div>
    </div>
  );
}




