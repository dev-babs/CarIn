"use client";

import { useState } from "react";
import SpotsList from "./SpotsList";
import EarningsSummary from "./EarningsSummary";
import ListSpotForm from "./ListSpotForm";
import Statistics from "./Statistics";
import QRScanner from "./QRScanner";

interface OwnerDashboardProps {
  address: string;
}

export default function OwnerDashboard({ address }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "spots" | "list" | "earnings" | "statistics" | "scan"
  >("spots");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleSpotCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("spots");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Owner Dashboard</h1>
        <p className="text-gray-600">
          Manage your parking spots, view earnings, and track bookings
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("spots")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "spots"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Spots
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "list"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List New Spot
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "earnings"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "statistics"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab("scan")}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "scan"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Scan QR
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "spots" && (
            <SpotsList address={address} refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "list" && (
            <ListSpotForm address={address} onSpotCreated={handleSpotCreated} />
          )}
          {activeTab === "earnings" && <EarningsSummary address={address} />}
          {activeTab === "statistics" && <Statistics address={address} />}
          {activeTab === "scan" && (
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-6">
                Verify Booking Access
              </h2>
              <div className="w-full max-w-lg mb-6">
                <QRScanner
                  onScanSuccess={(data) => {
                    console.log("Scanned:", data);
                    setScanResult({
                      valid: true,
                      message: "Valid Booking Found!",
                      data: data,
                    });
                  }}
                  onScanError={(err) => {
                    // Only show error if it's not a scanning error (e.g. invalid data)
                    if (err && !err.includes("No QR code found")) {
                      setScanResult({
                        valid: false,
                        message: err,
                      });
                    }
                  }}
                />
              </div>

              {scanResult && (
                <div
                  className={`p-4 rounded-lg border ${
                    scanResult.valid
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  } w-full max-w-lg`}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        scanResult.valid ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <h3
                      className={`font-bold ${
                        scanResult.valid ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {scanResult.valid ? "Access Granted" : "Access Denied"}
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      scanResult.valid ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.valid && scanResult.data && (
                    <div className="mt-3 text-sm text-green-800 border-t border-green-200 pt-2">
                      <p>
                        <strong>Booking ID:</strong> {scanResult.data.bookingId}
                      </p>
                      <p>
                        <strong>Spot ID:</strong> {scanResult.data.spotId}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {new Date(scanResult.data.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setScanResult(null)}
                    className="mt-4 text-sm underline text-gray-600 hover:text-gray-900"
                  >
                    Scan Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


