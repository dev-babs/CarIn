"use client";

import { useState, useEffect } from "react";

interface StatisticsProps {
  address: string;
}

interface StatsData {
  totalSpots: number;
  activeSpots: number;
  totalBookings: number;
  totalRevenue: string;
  averageBookingDuration: string;
  bookingsByDay: { day: string; count: number }[];
  revenueByMonth: { month: string; amount: string }[];
}

export default function Statistics({ address }: StatisticsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [address]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from smart contracts and aggregate data
      // For now, use mock data
      const mockStats: StatsData = {
        totalSpots: 3,
        activeSpots: 2,
        totalBookings: 127,
        totalRevenue: "342.50",
        averageBookingDuration: "2.5 hours",
        bookingsByDay: [
          { day: "Mon", count: 18 },
          { day: "Tue", count: 22 },
          { day: "Wed", count: 20 },
          { day: "Thu", count: 25 },
          { day: "Fri", count: 28 },
          { day: "Sat", count: 14 },
          { day: "Sun", count: 10 },
        ],
        revenueByMonth: [
          { month: "Oct", amount: "89.50" },
          { month: "Nov", amount: "165.25" },
          { month: "Dec", amount: "87.75" },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">No statistics available</div>;
  }

  const maxBookings = Math.max(...stats.bookingsByDay.map(d => d.count));
  const maxRevenue = Math.max(...stats.revenueByMonth.map(m => parseFloat(m.amount)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Booking Statistics & Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Spots</div>
          <div className="text-2xl font-bold">{stats.totalSpots}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Active Spots</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeSpots}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalRevenue} cUSD</div>
        </div>
      </div>

      {/* Bookings by Day Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Bookings by Day of Week</h3>
        <div className="flex items-end justify-between h-64 gap-2">
          {stats.bookingsByDay.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center">
              <div className="relative w-full h-full flex items-end">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{
                    height: `${(item.count / maxBookings) * 100}%`,
                    minHeight: item.count > 0 ? "4px" : "0",
                  }}
                  title={`${item.count} bookings`}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600">{item.day}</div>
              <div className="text-xs font-medium">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Month Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue by Month</h3>
        <div className="flex items-end justify-between h-64 gap-4">
          {stats.revenueByMonth.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div className="relative w-full h-full flex items-end">
                <div
                  className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                  style={{
                    height: `${(parseFloat(item.amount) / maxRevenue) * 100}%`,
                    minHeight: parseFloat(item.amount) > 0 ? "4px" : "0",
                  }}
                  title={`${item.amount} cUSD`}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600">{item.month}</div>
              <div className="text-xs font-medium">{item.amount} cUSD</div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Average Booking Duration</h3>
          <div className="text-3xl font-bold text-purple-600">{stats.averageBookingDuration}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Booking Rate</h3>
          <div className="text-3xl font-bold text-orange-600">
            {(stats.totalBookings / stats.totalSpots).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-1">bookings per spot</div>
        </div>
      </div>
    </div>
  );
}




