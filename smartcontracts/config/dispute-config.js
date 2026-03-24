/**
 * Dispute Resolution Configuration
 * Configuration parameters for the dispute resolution system
 */

module.exports = {
  // Time thresholds (in seconds)
  maxResolutionTime: 7 * 24 * 60 * 60, // 7 days
  lateCheckInThreshold: 30 * 60, // 30 minutes
  noShowThreshold: 60 * 60, // 1 hour

  // Voting thresholds
  autoRefundThreshold: 80, // 80% of votes needed
  minVotesForResolution: 3, // Minimum votes to resolve

  // Refund percentages (0-100)
  maxLateCheckInRefund: 50, // Maximum 50% refund for late check-in
  maxEarlyCheckOutRefund: 30, // Maximum 30% refund for early check-out

  // Evidence types
  evidenceTypes: {
    CHECK_IN_TIMESTAMP: 0,
    CHECK_OUT_TIMESTAMP: 1,
    IMAGE: 2,
    VIDEO: 3,
    DOCUMENT: 4,
    LOCATION_DATA: 5,
    OTHER: 6
  },

  // IPFS configuration
  ipfs: {
    gateway: "https://ipfs.io/ipfs/",
    pinata: {
      // These should be set via environment variables
      apiKey: process.env.PINATA_API_KEY || "",
      secretKey: process.env.PINATA_SECRET_KEY || ""
    }
  }
};

