/**
 * Evidence Handler Utilities
 * Utilities for handling dispute evidence submission, IPFS uploads, and validation
 */

export enum EvidenceType {
  CheckInTimestamp = 0,
  CheckOutTimestamp = 1,
  Image = 2,
  Video = 3,
  Document = 4,
  LocationData = 5,
  Other = 6
}

export interface EvidenceMetadata {
  type: EvidenceType;
  hash: string; // IPFS hash
  description: string;
  timestamp: number;
  fileUrl?: string;
}

export interface DisputeEvidence {
  evidenceId: number;
  disputeId: number;
  submittedBy: string;
  evidenceType: EvidenceType;
  evidenceHash: string;
  timestamp: number;
  description: string;
}

/**
 * Convert file to IPFS hash
 * This is a placeholder - actual implementation would upload to IPFS
 */
export async function uploadEvidenceToIPFS(
  file: File | Blob,
  type: EvidenceType
): Promise<string> {
  // TODO: Implement actual IPFS upload
  // For now, return a mock hash
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Example using Pinata or other IPFS service
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

/**
 * Convert IPFS hash to bytes32 format for smart contract
 */
export function ipfsHashToBytes(hash: string): string {
  // Convert IPFS hash (typically base58) to bytes
  // This is a simplified version - actual implementation may vary
  return '0x' + Buffer.from(hash).toString('hex').slice(0, 64);
}

/**
 * Get IPFS gateway URL from hash
 */
export function getIPFSGatewayURL(hash: string): string {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  return `${gateway}${hash}`;
}

/**
 * Validate evidence before submission
 */
export function validateEvidence(
  type: EvidenceType,
  file?: File | Blob,
  description?: string
): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Evidence description is required' };
  }

  if (type === EvidenceType.Image || type === EvidenceType.Video || type === EvidenceType.Document) {
    if (!file) {
      return { valid: false, error: 'File is required for this evidence type' };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Validate image types
    if (type === EvidenceType.Image && file.type.startsWith('image/')) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid image format. Allowed: JPEG, PNG, WebP, GIF' };
      }
    }

    // Validate video types
    if (type === EvidenceType.Video && file.type.startsWith('video/')) {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid video format. Allowed: MP4, WebM, QuickTime' };
      }
    }
  }

  return { valid: true };
}

/**
 * Prepare evidence metadata for submission
 */
export function prepareEvidenceMetadata(
  type: EvidenceType,
  hash: string,
  description: string,
  fileUrl?: string
): EvidenceMetadata {
  return {
    type,
    hash,
    description,
    timestamp: Math.floor(Date.now() / 1000),
    fileUrl
  };
}

/**
 * Format evidence type for display
 */
export function formatEvidenceType(type: EvidenceType): string {
  const types = {
    [EvidenceType.CheckInTimestamp]: 'Check-in Timestamp',
    [EvidenceType.CheckOutTimestamp]: 'Check-out Timestamp',
    [EvidenceType.Image]: 'Image',
    [EvidenceType.Video]: 'Video',
    [EvidenceType.Document]: 'Document',
    [EvidenceType.LocationData]: 'Location Data',
    [EvidenceType.Other]: 'Other'
  };
  return types[type] || 'Unknown';
}

