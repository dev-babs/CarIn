"use client";

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const handleConnect = async () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    onConnect(mockAddress);
  };

  return (
    <button
      onClick={handleConnect}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  );
}




