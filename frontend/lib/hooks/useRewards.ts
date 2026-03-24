import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  getRewardsManagerContract,
  RewardType,
  calculateReferralHash,
} from "../contracts/rewardsManager";
import { getRewardsTokenContract } from "../contracts/rewardsToken";

interface RewardBalance {
  balance: string;
  pendingTotal: string;
  pendingByType: {
    inaccuracyReport: string;
    spotShare: string;
    referral: string;
    communityContribution: string;
  };
}

interface Report {
  reportId: number;
  spotId: number;
  reason: string;
  timestamp: number;
  isValid: boolean;
  claimStatus: number;
  rewardAmount: string;
}

interface Referral {
  referralHash: string;
  referee: string;
  spotId: number;
  timestamp: number;
  isActive: boolean;
  rewardAmount: string;
  claimStatus: number;
}

export function useRewards() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [balance, setBalance] = useState<RewardBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!address || !publicClient || !isConnected) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const network = "alfajores"; // TODO: Get from config
      const tokenAddress = process.env.NEXT_PUBLIC_REWARDS_TOKEN_ADDRESS_ALFAJORES;
      const managerAddress = process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS_ALFAJORES;

      if (!tokenAddress || !managerAddress) {
        throw new Error("Rewards contracts not configured");
      }

      // Get token balance
      const tokenContract = getRewardsTokenContract(
        publicClient as unknown as ethers.Provider,
        network
      );
      const tokenBalance = await tokenContract.balanceOf(address);

      // Get pending rewards
      const managerContract = getRewardsManagerContract(
        publicClient as unknown as ethers.Provider,
        network
      );
      const pendingTotal = await managerContract.getPendingRewards(address);
      const pendingInaccuracy = await managerContract.getPendingRewardByType(
        address,
        RewardType.InaccuracyReport
      );
      const pendingSpotShare = await managerContract.getPendingRewardByType(
        address,
        RewardType.SpotShare
      );
      const pendingReferral = await managerContract.getPendingRewardByType(
        address,
        RewardType.Referral
      );
      const pendingCommunity = await managerContract.getPendingRewardByType(
        address,
        RewardType.CommunityContribution
      );

      setBalance({
        balance: ethers.formatEther(tokenBalance),
        pendingTotal: ethers.formatEther(pendingTotal),
        pendingByType: {
          inaccuracyReport: ethers.formatEther(pendingInaccuracy),
          spotShare: ethers.formatEther(pendingSpotShare),
          referral: ethers.formatEther(pendingReferral),
          communityContribution: ethers.formatEther(pendingCommunity),
        },
      });
    } catch (err) {
      console.error("Error loading rewards balance:", err);
      setError(err instanceof Error ? err.message : "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, isConnected]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const claimReward = useCallback(
    async (rewardType: RewardType) => {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const network = "alfajores";
        const managerContract = getRewardsManagerContract(
          walletClient as unknown as ethers.Signer,
          network
        );

        const tx = await managerContract.claimReward(rewardType);
        await tx.wait();

        await loadBalance();
      } catch (err) {
        console.error("Error claiming reward:", err);
        setError(err instanceof Error ? err.message : "Failed to claim reward");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, loadBalance]
  );

  const claimAllRewards = useCallback(async () => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);
      setError(null);

      const network = "alfajores";
      const managerContract = getRewardsManagerContract(
        walletClient as unknown as ethers.Signer,
        network
      );

      const tx = await managerContract.claimAllRewards();
      await tx.wait();

      await loadBalance();
    } catch (err) {
      console.error("Error claiming all rewards:", err);
      setError(err instanceof Error ? err.message : "Failed to claim rewards");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletClient, address, loadBalance]);

  return {
    balance,
    loading,
    error,
    loadBalance,
    claimReward,
    claimAllRewards,
  };
}

export function useRewardReports() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = useCallback(async () => {
    if (!address || !publicClient || !isConnected) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      const network = "alfajores";
      const managerContract = getRewardsManagerContract(
        publicClient as unknown as ethers.Provider,
        network
      );

      const reportIds = await managerContract.userReports(address);
      const reportsData = await Promise.all(
        reportIds.map((id: bigint) => managerContract.reports(id))
      );

      setReports(
        reportsData.map((report: any, index: number) => ({
          reportId: Number(reportIds[index]),
          spotId: Number(report.spotId),
          reason: report.reason,
          timestamp: Number(report.timestamp),
          isValid: report.isValid,
          claimStatus: Number(report.claimStatus),
          rewardAmount: ethers.formatEther(report.rewardAmount),
        }))
      );
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, isConnected]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const submitReport = useCallback(
    async (spotId: number, reason: string, evidenceHash: string) => {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        const network = "alfajores";
        const managerContract = getRewardsManagerContract(
          walletClient as unknown as ethers.Signer,
          network
        );

        const evidenceBytes = ethers.toUtf8Bytes(evidenceHash);
        const tx = await managerContract.submitInaccuracyReport(
          spotId,
          reason,
          evidenceBytes
        );
        await tx.wait();

        await loadReports();
      } catch (err) {
        console.error("Error submitting report:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, loadReports]
  );

  return { reports, loading, submitReport, loadReports };
}

export function useReferrals() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReferrals = useCallback(async () => {
    if (!address || !publicClient || !isConnected) {
      setReferrals([]);
      return;
    }

    try {
      setLoading(true);
      const network = "alfajores";
      const managerContract = getRewardsManagerContract(
        publicClient as unknown as ethers.Provider,
        network
      );

      const referralHashes = await managerContract.userReferrals(address);
      const referralsData = await Promise.all(
        referralHashes.map((hash: string) => managerContract.referrals(hash))
      );

      setReferrals(
        referralsData.map((referral: any, index: number) => ({
          referralHash: referralHashes[index],
          referee: referral.referee,
          spotId: Number(referral.spotId),
          timestamp: Number(referral.timestamp),
          isActive: referral.isActive,
          rewardAmount: ethers.formatEther(referral.rewardAmount),
          claimStatus: Number(referral.claimStatus),
        }))
      );
    } catch (err) {
      console.error("Error loading referrals:", err);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, isConnected]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const createReferral = useCallback(
    async (referee: string, spotId: number) => {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        const network = "alfajores";
        const managerContract = getRewardsManagerContract(
          walletClient as unknown as ethers.Signer,
          network
        );

        const tx = await managerContract.createReferral(referee, spotId);
        await tx.wait();

        await loadReferrals();
      } catch (err) {
        console.error("Error creating referral:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, loadReferrals]
  );

  return { referrals, loading, createReferral, loadReferrals };
}




