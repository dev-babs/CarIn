"use client";

interface BookingReceiptProps {
  booking: {
    id: string;
    spotLocation: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    subtotal: string;
    serviceFee: string;
    total: string;
    transactionHash?: string;
  };
}

export default function BookingReceipt({ booking }: BookingReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Booking Receipt</h2>
        <p className="text-gray-600">CarIn Parking Booking</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium">{booking.id}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium">{booking.spotLocation}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Duration:</span>
          <span className="font-medium">{booking.duration} hour(s)</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{booking.subtotal} cUSD</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Service Fee:</span>
          <span className="font-medium">{booking.serviceFee} cUSD</span>
        </div>
        <div className="flex justify-between py-2 border-t-2 pt-2">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-lg font-bold text-blue-600">{booking.total} cUSD</span>
        </div>
        {booking.transactionHash && (
          <div className="flex justify-between py-2 border-t pt-4">
            <span className="text-gray-600">Transaction:</span>
            <a
              href={`https://alfajores.celoscan.io/tx/${booking.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm font-mono"
            >
              {booking.transactionHash.slice(0, 10)}...
            </a>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}




