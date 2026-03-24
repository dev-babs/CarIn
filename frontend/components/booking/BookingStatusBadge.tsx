"use client";

interface BookingStatusBadgeProps {
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  size?: "sm" | "md" | "lg";
}

export default function BookingStatusBadge({ status, size = "md" }: BookingStatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "confirmed":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`${sizeClasses[size]} rounded-full font-medium ${getStatusStyles(status)}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}




