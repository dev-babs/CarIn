"use client";

interface TransactionStatusProps {
  status: "pending" | "confirming" | "confirmed" | "failed";
  transactionHash?: string;
  error?: string;
}

export default function TransactionStatus({
  status,
  transactionHash,
  error,
}: TransactionStatusProps) {
  if (status === "pending") {
    return (
      <div className="text-center py-6">
        <div className="animate-pulse text-yellow-600 mb-2">⏳</div>
        <p className="text-gray-600">Preparing transaction...</p>
      </div>
    );
  }

  if (status === "confirming") {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">Confirming Transaction</p>
        <p className="text-sm text-gray-500 mt-2">Please confirm in your wallet</p>
        {transactionHash && (
          <p className="text-xs text-gray-400 mt-2 font-mono">
            TX: {transactionHash.slice(0, 10)}...
          </p>
        )}
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg text-gray-700 font-medium">Transaction Confirmed!</p>
        {transactionHash && (
          <a
            href={`https://alfajores.celoscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View on CeloScan
          </a>
        )}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-lg text-gray-700 font-medium">Transaction Failed</p>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    );
  }

  return null;
}




