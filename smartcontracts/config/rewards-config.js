/**
 * @file Rewards Configuration
 * @notice Configuration for token rewards system
 */

module.exports = {
  // Token Configuration
  TOKEN: {
    NAME: "CarIn Rewards Token",
    SYMBOL: "CARIN",
    INITIAL_SUPPLY: 0, // Mint as needed
    MAX_SUPPLY: "10000000000000000000000000", // 10,000,000 tokens (18 decimals)
  },

  // Reward Amounts (in wei, 18 decimals)
  REWARDS: {
    INACCURACY_REPORT: "100000000000000000000", // 100 tokens
    SPOT_SHARE: "50000000000000000000", // 50 tokens
    REFERRAL: "25000000000000000000", // 25 tokens
    COMMUNITY_CONTRIBUTION: "10000000000000000000", // 10 tokens
  },

  // Cooldown Periods (in seconds)
  COOLDOWNS: {
    REPORT: 86400, // 1 day
    REFERRAL: 604800, // 7 days
    CLAIM: 86400, // 1 day
  },

  // Anti-Gaming Configuration
  ANTI_GAMING: {
    MIN_REPORT_STAKE: "0", // Minimum stake for reports (can be set later)
    MAX_REPORTS_PER_DAY: 5, // Maximum reports per user per day
    MAX_REFERRALS_PER_DAY: 10, // Maximum referrals per user per day
  },

  // Oracle Configuration
  ORACLE: {
    ENABLED: false, // Oracle verification disabled by default
    ADDRESS: "0x0000000000000000000000000000000000000000", // Set after deployment
  },
};




