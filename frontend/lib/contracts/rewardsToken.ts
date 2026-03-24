import { ethers } from "ethers";

// RewardsToken contract ABI (simplified - full ABI should come from compiled contract)
export const REWARDS_TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function burn(uint256 amount) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// Contract addresses (will be set after deployment)
export const REWARDS_TOKEN_ADDRESSES = {
  alfajores: process.env.NEXT_PUBLIC_REWARDS_TOKEN_ADDRESS_ALFAJORES || "",
  celo: process.env.NEXT_PUBLIC_REWARDS_TOKEN_ADDRESS_CELO || "",
};

export function getRewardsTokenContract(
  provider: ethers.Provider | ethers.Signer,
  network: "alfajores" | "celo" = "alfajores"
): ethers.Contract {
  const address = REWARDS_TOKEN_ADDRESSES[network];
  if (!address) {
    throw new Error(`RewardsToken address not configured for ${network}`);
  }
  return new ethers.Contract(address, REWARDS_TOKEN_ABI, provider);
}




