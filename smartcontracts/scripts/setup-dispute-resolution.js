/**
 * Setup script for DisputeResolution contract
 * Adds moderators, voters, and configures thresholds
 */

const hre = require("hardhat");

async function main() {
  const disputeResolutionAddress = process.env.DISPUTE_RESOLUTION_ADDRESS;
  if (!disputeResolutionAddress) {
    throw new Error("DISPUTE_RESOLUTION_ADDRESS must be set in environment");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Setting up DisputeResolution with account:", deployer.address);

  const DisputeResolution = await hre.ethers.getContractFactory("DisputeResolution");
  const disputeResolution = DisputeResolution.attach(disputeResolutionAddress);

  // Add moderators (replace with actual addresses)
  const moderators = process.env.MODERATORS?.split(",") || [];
  console.log("Adding moderators...");
  for (const moderator of moderators) {
    if (moderator.trim()) {
      try {
        const tx = await disputeResolution.addModerator(moderator.trim());
        await tx.wait();
        console.log(`  Added moderator: ${moderator.trim()}`);
      } catch (error) {
        console.log(`  Failed to add moderator ${moderator.trim()}: ${error.message}`);
      }
    }
  }

  // Authorize voters
  const voters = process.env.VOTERS?.split(",") || [];
  console.log("Authorizing voters...");
  for (const voter of voters) {
    if (voter.trim()) {
      try {
        const tx = await disputeResolution.authorizeVoter(voter.trim());
        await tx.wait();
        console.log(`  Authorized voter: ${voter.trim()}`);
      } catch (error) {
        console.log(`  Failed to authorize voter ${voter.trim()}: ${error.message}`);
      }
    }
  }

  // Update configuration (optional, uses defaults if not set)
  const maxResolutionTime = process.env.MAX_RESOLUTION_TIME || "604800"; // 7 days
  const autoRefundThreshold = process.env.AUTO_REFUND_THRESHOLD || "80";
  const minVotes = process.env.MIN_VOTES || "3";
  const lateCheckInThreshold = process.env.LATE_CHECK_IN_THRESHOLD || "1800"; // 30 minutes
  const noShowThreshold = process.env.NO_SHOW_THRESHOLD || "3600"; // 1 hour

  console.log("Updating configuration...");
  try {
    const tx = await disputeResolution.updateConfiguration(
      maxResolutionTime,
      autoRefundThreshold,
      minVotes,
      lateCheckInThreshold,
      noShowThreshold
    );
    await tx.wait();
    console.log("  Configuration updated successfully");
  } catch (error) {
    console.log(`  Failed to update configuration: ${error.message}`);
  }

  console.log("\n=== Setup Complete ===");
  console.log("DisputeResolution address:", disputeResolutionAddress);
  console.log("Moderators:", moderators.length);
  console.log("Voters:", voters.length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




