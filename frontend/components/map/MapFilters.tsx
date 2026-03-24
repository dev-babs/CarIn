/**
 * Filter component for parking spots (price, availability, distance)
 */

'use client';

import { useState } from 'react';

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  showAvailableOnly: boolean;
  maxDistance: number; // in km
}

interface MapFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  defaultFilters?: Partial<FilterOptions>;
}

export default function MapFilters({
  onFilterChange,
  defaultFilters,
}: MapFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: defaultFilters?.minPrice ?? 0,
    maxPrice: defaultFilters?.maxPrice ?? 10,
    showAvailableOnly: defaultFilters?.showAvailableOnly ?? false,
    maxDistance: defaultFilters?.maxDistance ?? 50,
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-semibold">Filters</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range (cUSD/hr)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.minPrice}
                onChange={(e) =>
                  updateFilter('minPrice', parseFloat(e.target.value) || 0)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.maxPrice}
                onChange={(e) =>
                  updateFilter('maxPrice', parseFloat(e.target.value) || 10)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showAvailableOnly}
                onChange={(e) =>
                  updateFilter('showAvailableOnly', e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show available spots only
              </span>
            </label>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Distance: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.maxDistance}
              onChange={(e) =>
                updateFilter('maxDistance', parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}




