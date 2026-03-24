/**
 * DisputeResolution Contract Interface
 * ABI and utilities for interacting with the DisputeResolution smart contract
 */

export const DISPUTE_RESOLUTION_ABI = [
  // Events
  "event DisputeFiled(uint256 indexed disputeId, uint256 indexed escrowId, uint256 indexed bookingId, address filedBy, address opposingParty, string reason, uint8 resolutionType)",
  "event EvidenceSubmitted(uint256 indexed evidenceId, uint256 indexed disputeId, address submittedBy, uint8 evidenceType, bytes evidenceHash)",
  "event CheckInRecorded(uint256 indexed bookingId, uint256 checkInTime, address verifiedBy)",
  "event CheckOutRecorded(uint256 indexed bookingId, uint256 checkOutTime, address verifiedBy)",
  "event AutomatedResolution(uint256 indexed disputeId, bool refundApproved, uint256 refundPercentage, string reason)",
  "event VoteSubmitted(uint256 indexed disputeId, address indexed voter, bool supportsRefund, uint256 weight)",
  "event DisputeResolved(uint256 indexed disputeId, address resolvedBy, bool refundApproved, uint256 refundPercentage, uint8 resolutionType)",
  
  // Functions
  "function fileDispute(uint256 escrowId, uint256 bookingId, string memory reason, bytes memory evidenceHash, uint8 evidenceType) external returns (uint256)",
  "function submitEvidence(uint256 disputeId, uint8 evidenceType, bytes memory evidenceHash, string memory description) external",
  "function recordCheckIn(uint256 bookingId, uint256 checkInTime) external",
  "function recordCheckOut(uint256 bookingId, uint256 checkOutTime) external",
  "function submitVote(uint256 disputeId, bool supportsRefund, uint256 refundPercentage, string memory justification) external",
  "function resolveDisputeManually(uint256 disputeId, bool refundApproved, uint256 refundPercentage) external",
  "function getDispute(uint256 disputeId) external view returns (tuple(uint256 disputeId, uint256 escrowId, uint256 bookingId, address filedBy, address opposingParty, string reason, bytes primaryEvidenceHash, uint256 filedAt, uint8 resolutionType, bool isResolved, address resolvedBy, uint256 resolvedAt, bool refundApproved, uint256 refundPercentage))",
  "function getDisputeEvidence(uint256 disputeId) external view returns (tuple(uint256 evidenceId, uint256 disputeId, address submittedBy, uint8 evidenceType, bytes evidenceHash, uint256 timestamp, string description)[])",
  "function getCheckInData(uint256 bookingId) external view returns (tuple(uint256 bookingId, uint256 checkInTime, uint256 checkOutTime, bool checkedIn, bool checkedOut, address verifiedBy))",
  "function getDisputeVotes(uint256 disputeId) external view returns (tuple(address voter, bool supportsRefund, uint256 weight, uint256 timestamp, string justification)[])",
  "function getDisputeByEscrowId(uint256 escrowId) external view returns (tuple(uint256 disputeId, uint256 escrowId, uint256 bookingId, address filedBy, address opposingParty, string reason, bytes primaryEvidenceHash, uint256 filedAt, uint8 resolutionType, bool isResolved, address resolvedBy, uint256 resolvedAt, bool refundApproved, uint256 refundPercentage))"
] as const;

// Contract addresses (set these after deployment)
export const DISPUTE_RESOLUTION_ADDRESSES = {
  alfajores: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS_ALFAJORES || "",
  celo: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS_CELO || ""
};

export enum ResolutionType {
  Automated = 0,
  PendingVote = 1,
  Manual = 2
}

export interface DisputeDetails {
  disputeId: bigint;
  escrowId: bigint;
  bookingId: bigint;
  filedBy: string;
  opposingParty: string;
  reason: string;
  primaryEvidenceHash: string;
  filedAt: bigint;
  resolutionType: ResolutionType;
  isResolved: boolean;
  resolvedBy: string;
  resolvedAt: bigint;
  refundApproved: boolean;
  refundPercentage: bigint;
}

export interface Evidence {
  evidenceId: bigint;
  disputeId: bigint;
  submittedBy: string;
  evidenceType: number;
  evidenceHash: string;
  timestamp: bigint;
  description: string;
}

export interface CheckInData {
  bookingId: bigint;
  checkInTime: bigint;
  checkOutTime: bigint;
  checkedIn: boolean;
  checkedOut: boolean;
  verifiedBy: string;
}

export interface Vote {
  voter: string;
  supportsRefund: boolean;
  weight: bigint;
  timestamp: bigint;
  justification: string;
}




