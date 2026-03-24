/**
 * useDisputeResolution Hook
 * React hook for interacting with the DisputeResolution smart contract
 */

import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { DISPUTE_RESOLUTION_ABI, DISPUTE_RESOLUTION_ADDRESSES, type DisputeDetails, type Evidence, type CheckInData, type Vote, ResolutionType } from '@/lib/contracts/disputeResolution';
import { parseEther, formatEther } from 'viem';
import { useChainId } from 'wagmi';

export function useDisputeResolution() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Get contract address based on chain
  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  /**
   * File a new dispute
   */
  const fileDispute = async (
    escrowId: bigint,
    bookingId: bigint,
    reason: string,
    evidenceHash: `0x${string}`,
    evidenceType: number
  ) => {
    return writeContract({
      address: contractAddress,
      abi: DISPUTE_RESOLUTION_ABI,
      functionName: 'fileDispute',
      args: [escrowId, bookingId, reason, evidenceHash, evidenceType]
    });
  };

  /**
   * Submit additional evidence to a dispute
   */
  const submitEvidence = async (
    disputeId: bigint,
    evidenceType: number,
    evidenceHash: `0x${string}`,
    description: string
  ) => {
    return writeContract({
      address: contractAddress,
      abi: DISPUTE_RESOLUTION_ABI,
      functionName: 'submitEvidence',
      args: [disputeId, evidenceType, evidenceHash, description]
    });
  };

  /**
   * Record check-in for a booking
   */
  const recordCheckIn = async (bookingId: bigint, checkInTime: bigint = BigInt(Math.floor(Date.now() / 1000))) => {
    return writeContract({
      address: contractAddress,
      abi: DISPUTE_RESOLUTION_ABI,
      functionName: 'recordCheckIn',
      args: [bookingId, checkInTime]
    });
  };

  /**
   * Record check-out for a booking
   */
  const recordCheckOut = async (bookingId: bigint, checkOutTime: bigint = BigInt(Math.floor(Date.now() / 1000))) => {
    return writeContract({
      address: contractAddress,
      abi: DISPUTE_RESOLUTION_ABI,
      functionName: 'recordCheckOut',
      args: [bookingId, checkOutTime]
    });
  };

  /**
   * Submit a vote on a dispute (authorized voters only)
   */
  const submitVote = async (
    disputeId: bigint,
    supportsRefund: boolean,
    refundPercentage: bigint,
    justification: string
  ) => {
    return writeContract({
      address: contractAddress,
      abi: DISPUTE_RESOLUTION_ABI,
      functionName: 'submitVote',
      args: [disputeId, supportsRefund, refundPercentage, justification]
    });
  };

  /**
   * Resolve dispute manually (moderator only)
   */
  const resolveDisputeManually = async (
    disputeId: bigint,
    refundApproved: boolean,
    refundPercentage: bigint
  ) => {
    return writeContract({
      address: contractAddress,
      abi: DISPUTE_RESOLUTION_ABI,
      functionName: 'resolveDisputeManually',
      args: [disputeId, refundApproved, refundPercentage]
    });
  };

  return {
    fileDispute,
    submitEvidence,
    recordCheckIn,
    recordCheckOut,
    submitVote,
    resolveDisputeManually,
    hash,
    isPending,
    error
  };
}

/**
 * Hook to read dispute details
 */
export function useDisputeDetails(disputeId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: DISPUTE_RESOLUTION_ABI,
    functionName: 'getDispute',
    args: disputeId ? [disputeId] : undefined,
    query: {
      enabled: !!disputeId
    }
  });

  return {
    dispute: data as DisputeDetails | undefined,
    isLoading,
    error
  };
}

/**
 * Hook to read dispute evidence
 */
export function useDisputeEvidence(disputeId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: DISPUTE_RESOLUTION_ABI,
    functionName: 'getDisputeEvidence',
    args: disputeId ? [disputeId] : undefined,
    query: {
      enabled: !!disputeId
    }
  });

  return {
    evidence: data as Evidence[] | undefined,
    isLoading,
    error
  };
}

/**
 * Hook to read check-in data
 */
export function useCheckInData(bookingId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: DISPUTE_RESOLUTION_ABI,
    functionName: 'getCheckInData',
    args: bookingId ? [bookingId] : undefined,
    query: {
      enabled: !!bookingId
    }
  });

  return {
    checkInData: data as CheckInData | undefined,
    isLoading,
    error
  };
}

/**
 * Hook to read dispute votes
 */
export function useDisputeVotes(disputeId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: DISPUTE_RESOLUTION_ABI,
    functionName: 'getDisputeVotes',
    args: disputeId ? [disputeId] : undefined,
    query: {
      enabled: !!disputeId
    }
  });

  return {
    votes: data as Vote[] | undefined,
    isLoading,
    error
  };
}

