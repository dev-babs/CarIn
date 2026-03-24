import { ethers } from "ethers";

// RewardsManager contract ABI (simplified - full ABI should come from compiled contract)
export const REWARDS_MANAGER_ABI = [
  "function submitInaccuracyReport(uint256 spotId, string memory reason, bytes memory evidenceHash) external",
  "function createReferral(address referee, uint256 spotId) external",
  "function claimReward(uint8 rewardType) external",
  "function claimAllRewards() external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getPendingRewardByType(address user, uint8 rewardType) external view returns (uint256)",
  "function reports(uint256 reportId) external view returns (tuple(uint256 reportId, uint256 spotId, address reporter, string reason, bytes evidenceHash, uint256 timestamp, bool isValid, uint8 claimStatus, uint256 rewardAmount))",
  "function referrals(bytes32 referralHash) external view returns (tuple(address referrer, address referee, uint256 spotId, uint256 timestamp, bool isActive, uint256 rewardAmount, uint8 claimStatus))",
  "function userReports(address user) external view returns (uint256[] memory)",
  "function userReferrals(address user) external view returns (bytes32[] memory)",
  "function inaccuracyReportReward() external view returns (uint256)",
  "function spotShareReward() external view returns (uint256)",
  "function referralReward() external view returns (uint256)",
  "event ReportSubmitted(uint256 indexed reportId, uint256 indexed spotId, address indexed reporter, string reason)",
  "event ReferralCreated(bytes32 indexed referralHash, address indexed referrer, address indexed referee, uint256 spotId)",
  "event RewardClaimed(address indexed user, uint8 rewardType, uint256 amount, uint256 timestamp)",
];

// Reward types enum
export enum RewardType {
  InaccuracyReport = 0,
  SpotShare = 1,
  Referral = 2,
  CommunityContribution = 3,
}

// Contract addresses
export const REWARDS_MANAGER_ADDRESSES = {
  alfajores: process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS_ALFAJORES || "",
  celo: process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS_CELO || "",
};

export function getRewardsManagerContract(
  provider: ethers.Provider | ethers.Signer,
  network: "alfajores" | "celo" = "alfajores"
): ethers.Contract {
  const address = REWARDS_MANAGER_ADDRESSES[network];
  if (!address) {
    throw new Error(`RewardsManager address not configured for ${network}`);
  }
  return new ethers.Contract(address, REWARDS_MANAGER_ABI, provider);
}

export function calculateReferralHash(
  referrer: string,
  referee: string,
  spotId: number
): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256"],
      [referrer, referee, spotId]
    )
  );
}




