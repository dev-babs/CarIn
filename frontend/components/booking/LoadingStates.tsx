"use client";

interface LoadingStatesProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export default function LoadingStates({ message, size = "medium" }: LoadingStatesProps) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-4`}></div>
      {message && (
        <p className="text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

export function BookingLoading() {
  return (
    <div className="text-center py-12">
      <LoadingStates message="Loading booking information..." size="large" />
    </div>
  );
}

export function TransactionLoading() {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <LoadingStates message="Processing transaction..." size="medium" />
      <p className="text-sm text-gray-500 mt-4">
        Please confirm the transaction in your wallet
      </p>
    </div>
  );
}

export function SpotsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}




