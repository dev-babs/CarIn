import { useAccount, useConnect, useDisconnect, useChainId, useBalance, useSwitchChain } from "wagmi";
import { celoAlfajores, celo } from "viem/chains";

export interface WalletBookingState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
}

export function useWalletBooking() {
  // Wagmi hooks for wallet connection
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect, isPending: isDisconnectPending } = useDisconnect();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  // Chain switching support
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  // Format balance for display
  const balance = balanceData
    ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    : null;

  // Connect wallet function - opens AppKit modal
  const connectWallet = async () => {
    try {
      // AppKit will handle the modal automatically
      // We just need to trigger the connect with the first available connector
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
        return { success: true, address: address || null };
      }
      return { success: false, error: "No wallet connectors available" };
    } catch (error: any) {
      return { success: false, error: error?.message || "Failed to connect wallet" };
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    disconnect();
  };

  // Check if wallet is connected
  const checkConnection = () => {
    return isConnected;
  };

  // Switch to Celo Alfajores testnet
  const switchToAlfajores = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: celoAlfajores.id });
        return { success: true };
      }
      return { success: false, error: "Chain switching not available" };
    } catch (error: any) {
      return { success: false, error: error?.message || "Failed to switch chain" };
    }
  };

  // Switch to Celo mainnet
  const switchToMainnet = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: celo.id });
        return { success: true };
      }
      return { success: false, error: "Chain switching not available" };
    } catch (error: any) {
      return { success: false, error: error?.message || "Failed to switch chain" };
    }
  };

  return {
    // State
    isConnected,
    address: address || null,
    chainId: chainId || null,
    balance,
    isConnecting: isConnecting || isConnectPending,
    isDisconnecting: isDisconnectPending,
    isSwitching: isSwitchPending,
    // Actions
    connectWallet,
    disconnectWallet,
    checkConnection,
    switchToAlfajores,
    switchToMainnet,
    // Additional data
    connectors,
  };
}




