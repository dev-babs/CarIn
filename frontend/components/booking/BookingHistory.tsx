"use client";

import { useState, useEffect } from "react";
import BookingCard from "./BookingCard";
import BookingFilters from "./BookingFilters";

interface Booking {
  id: string;
  spotId: string;
  spotLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  totalCost: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  qrCode?: string;
  transactionHash?: string;
  signature?: string;
  signerAddress?: string;
}

interface BookingHistoryProps {
  userAddress: string;
}

export default function BookingHistory({ userAddress }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [userAddress]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with smart contract/API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBookings: Booking[] = [
        {
          id: "booking_123456789",
          spotId: "spot_1",
          spotLocation: "123 Main St, San Francisco, CA",
          date: new Date().toISOString(),
          startTime: "10:00",
          endTime: "14:00",
          totalCost: "15.00",
          status: "confirmed",
          signature: "0x789...signature",
          signerAddress: userAddress || "0x123...user",
          transactionHash: "0xabc...tx"
        },
        {
          id: "booking_987654321",
          spotId: "spot_2",
          spotLocation: "456 Market St, San Francisco, CA",
          date: new Date(Date.now() - 86400000).toISOString(),
          startTime: "09:00",
          endTime: "11:00",
          totalCost: "10.00",
          status: "completed",
          signature: "0x456...signature",
          signerAddress: userAddress || "0x123...user",
          transactionHash: "0xdef...tx"
        }
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    // Filter by status
    if (filter !== "all" && booking.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.spotLocation.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <BookingFilters
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No bookings found</p>
          <p className="text-sm text-gray-500">
            {filter === "all"
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
