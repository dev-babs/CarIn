const hre = require("hardhat");
const rewardsConfig = require("../config/rewards-config");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy RewardsToken
  console.log("\n1. Deploying RewardsToken...");
  const RewardsToken = await hre.ethers.getContractFactory("RewardsToken");
  const rewardsToken = await RewardsToken.deploy(
    rewardsConfig.TOKEN.NAME,
    rewardsConfig.TOKEN.SYMBOL,
    rewardsConfig.TOKEN.INITIAL_SUPPLY,
    rewardsConfig.TOKEN.MAX_SUPPLY
  );
  await rewardsToken.waitForDeployment();
  const tokenAddress = await rewardsToken.getAddress();
  console.log("RewardsToken deployed to:", tokenAddress);

  // Get ParkingSpot address (should be set as environment variable or hardcoded)
  const parkingSpotAddress = process.env.PARKING_SPOT_ADDRESS || "0x0000000000000000000000000000000000000000";
  if (parkingSpotAddress === "0x0000000000000000000000000000000000000000") {
    console.log("WARNING: PARKING_SPOT_ADDRESS not set. Please update RewardsManager after deployment.");
  }

  // Deploy RewardsManager
  console.log("\n2. Deploying RewardsManager...");
  const RewardsManager = await hre.ethers.getContractFactory("RewardsManager");
  const rewardsManager = await RewardsManager.deploy(tokenAddress, parkingSpotAddress);
  await rewardsManager.waitForDeployment();
  const managerAddress = await rewardsManager.getAddress();
  console.log("RewardsManager deployed to:", managerAddress);

  // Configure RewardsManager as minter
  console.log("\n3. Setting RewardsManager as token minter...");
  const setMinterTx = await rewardsToken.setRewardsManager(managerAddress);
  await setMinterTx.wait();
  console.log("RewardsManager set as minter");

  // Configure reward amounts
  console.log("\n4. Configuring reward amounts...");
  await rewardsManager.setInaccuracyReportReward(rewardsConfig.REWARDS.INACCURACY_REPORT);
  await rewardsManager.setSpotShareReward(rewardsConfig.REWARDS.SPOT_SHARE);
  await rewardsManager.setReferralReward(rewardsConfig.REWARDS.REFERRAL);
  console.log("Reward amounts configured");

  // Configure cooldowns
  console.log("\n5. Configuring cooldown periods...");
  await rewardsManager.setReportCooldown(rewardsConfig.COOLDOWNS.REPORT);
  await rewardsManager.setReferralCooldown(rewardsConfig.COOLDOWNS.REFERRAL);
  await rewardsManager.setClaimCooldown(rewardsConfig.COOLDOWNS.CLAIM);
  console.log("Cooldown periods configured");

  // Set oracle if enabled
  if (rewardsConfig.ORACLE.ENABLED && rewardsConfig.ORACLE.ADDRESS !== "0x0000000000000000000000000000000000000000") {
    console.log("\n6. Setting oracle address...");
    await rewardsManager.setOracle(rewardsConfig.ORACLE.ADDRESS);
    console.log("Oracle address set");
  }

  console.log("\n✅ Deployment complete!");
  console.log("\nContract Addresses:");
  console.log("RewardsToken:", tokenAddress);
  console.log("RewardsManager:", managerAddress);
  console.log("ParkingSpot:", parkingSpotAddress);

  console.log("\nNext steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Set PARKING_SPOT_ADDRESS if not already set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




