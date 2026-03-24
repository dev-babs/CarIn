import { ethers } from "ethers";

// ParkingSpot contract ABI (simplified - full ABI should come from compiled contract)
export const PARKING_SPOT_ABI = [
  "function listSpot(string memory location, uint256 pricePerHour) external returns (uint256)",
  "function getSpot(uint256 spotId) external view returns (tuple(uint256 id, address owner, string location, uint256 pricePerHour, bool isAvailable, uint256 createdAt))",
  "function updateSpotAvailability(uint256 spotId, bool isAvailable) external",
  "function getOwnerSpots(address owner) external view returns (uint256[] memory)",
];

// Contract addresses (will be set after deployment)
export const PARKING_SPOT_ADDRESSES = {
  alfajores: process.env.NEXT_PUBLIC_PARKING_SPOT_ADDRESS_ALFAJORES || "",
  celo: process.env.NEXT_PUBLIC_PARKING_SPOT_ADDRESS_CELO || "",
};

export function getParkingSpotContract(
  provider: ethers.Provider | ethers.Signer,
  network: "alfajores" | "celo" = "alfajores"
) {
  const address = PARKING_SPOT_ADDRESSES[network];
  if (!address) {
    throw new Error(`ParkingSpot contract address not set for ${network}`);
  }
  return new ethers.Contract(address, PARKING_SPOT_ABI, provider);
}




