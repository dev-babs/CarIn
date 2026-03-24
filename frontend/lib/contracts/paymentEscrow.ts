import { ethers } from "ethers";

// PaymentEscrow contract ABI (simplified)
export const PAYMENT_ESCROW_ABI = [
  "function getPayeeEscrows(address payee) external view returns (uint256[] memory)",
  "function getEscrow(uint256 escrowId) external view returns (tuple(uint256 escrowId, uint256 bookingId, address payer, address payee, uint256 amount, address token, uint256 releaseTime, uint8 status))",
  "function releaseEscrow(uint256 escrowId) external",
];

// Contract addresses (will be set after deployment)
export const PAYMENT_ESCROW_ADDRESSES = {
  alfajores: process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS_ALFAJORES || "",
  celo: process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS_CELO || "",
};

export function getPaymentEscrowContract(
  provider: ethers.Provider | ethers.Signer,
  network: "alfajores" | "celo" = "alfajores"
) {
  const address = PAYMENT_ESCROW_ADDRESSES[network];
  if (!address) {
    throw new Error(`PaymentEscrow contract address not set for ${network}`);
  }
  return new ethers.Contract(address, PAYMENT_ESCROW_ABI, provider);
}




