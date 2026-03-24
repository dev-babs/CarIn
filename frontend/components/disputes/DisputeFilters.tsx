'use client';

import { useState } from 'react';
import { ResolutionType } from '@/lib/contracts/disputeResolution';

interface DisputeFiltersProps {
  onFilterChange: (filters: DisputeFilters) => void;
}

export interface DisputeFilters {
  status: 'all' | 'active' | 'resolved';
  resolutionType: ResolutionType | 'all';
  refundStatus: 'all' | 'approved' | 'denied';
}

export default function DisputeFiltersComponent({ onFilterChange }: DisputeFiltersProps) {
  const [filters, setFilters] = useState<DisputeFilters>({
    status: 'all',
    resolutionType: 'all',
    refundStatus: 'all'
  });

  const updateFilter = <K extends keyof DisputeFilters>(key: K, value: DisputeFilters[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value as DisputeFilters['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution Type
          </label>
          <select
            value={filters.resolutionType}
            onChange={(e) => updateFilter('resolutionType', e.target.value === 'all' ? 'all' : Number(e.target.value) as ResolutionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All</option>
            <option value={ResolutionType.Automated}>Automated</option>
            <option value={ResolutionType.PendingVote}>Pending Vote</option>
            <option value={ResolutionType.Manual}>Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refund Status
          </label>
          <select
            value={filters.refundStatus}
            onChange={(e) => updateFilter('refundStatus', e.target.value as DisputeFilters['refundStatus'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>

        <button
          onClick={() => {
            const resetFilters: DisputeFilters = {
              status: 'all',
              resolutionType: 'all',
              refundStatus: 'all'
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
          }}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

