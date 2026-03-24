"use client";

import { useState, useEffect } from "react";

interface EarningsSummaryProps {
  address: string;
}

interface EarningsData {
  totalEarnings: string;
  pendingEarnings: string;
  withdrawnEarnings: string;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  date: string;
  spotId: number;
  spotLocation: string;
  amount: string;
  status: "pending" | "released" | "withdrawn";
  bookingId: number;
}

export default function EarningsSummary({ address }: EarningsSummaryProps) {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [address]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from PaymentEscrow smart contract
      // For now, use mock data
      const mockEarnings: EarningsData = {
        totalEarnings: "342.50",
        pendingEarnings: "87.25",
        withdrawnEarnings: "255.25",
        transactions: [
          {
            id: "1",
            date: "2024-12-03T10:30:00Z",
            spotId: 1,
            spotLocation: "123 Main St",
            amount: "12.50",
            status: "released",
            bookingId: 101,
          },
          {
            id: "2",
            date: "2024-12-03T08:15:00Z",
            spotId: 1,
            spotLocation: "123 Main St",
            amount: "25.00",
            status: "pending",
            bookingId: 102,
          },
          {
            id: "3",
            date: "2024-12-02T15:45:00Z",
            spotId: 1,
            spotLocation: "123 Main St",
            amount: "18.75",
            status: "withdrawn",
            bookingId: 99,
          },
        ],
      };
      setEarnings(mockEarnings);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!earnings || parseFloat(earnings.pendingEarnings) <= 0) {
      alert("No pending earnings to withdraw");
      return;
    }

    setIsWithdrawing(true);
    try {
      // TODO: Call PaymentEscrow contract to withdraw
      console.log("Withdrawing earnings:", earnings.pendingEarnings);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully withdrew ${earnings.pendingEarnings} cUSD`);
      fetchEarnings(); // Refresh data
    } catch (error) {
      console.error("Error withdrawing earnings:", error);
      alert("Failed to withdraw earnings");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading earnings data...</div>;
  }

  if (!earnings) {
    return <div className="text-center py-8">No earnings data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Earnings Summary</h2>
        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing || parseFloat(earnings.pendingEarnings) <= 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? "Withdrawing..." : `Withdraw ${earnings.pendingEarnings} cUSD`}
        </button>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Earnings</div>
          <div className="text-3xl font-bold text-blue-900">
            {earnings.totalEarnings} <span className="text-lg">cUSD</span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-sm text-yellow-600 font-medium mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-900">
            {earnings.pendingEarnings} <span className="text-lg">cUSD</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-sm text-green-600 font-medium mb-1">Withdrawn</div>
          <div className="text-3xl font-bold text-green-900">
            {earnings.withdrawnEarnings} <span className="text-lg">cUSD</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.spotLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{tx.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.amount} cUSD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.status === "withdrawn"
                          ? "bg-green-100 text-green-800"
                          : tx.status === "released"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




