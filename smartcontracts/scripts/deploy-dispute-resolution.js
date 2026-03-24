const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DisputeResolution with account:", deployer.address);

  // Get contract addresses from config
  const paymentEscrowAddress = process.env.PAYMENT_ESCROW_ADDRESS;
  const parkingSpotAddress = process.env.PARKING_SPOT_ADDRESS;

  if (!paymentEscrowAddress || !parkingSpotAddress) {
    throw new Error("PAYMENT_ESCROW_ADDRESS and PARKING_SPOT_ADDRESS must be set in environment");
  }

  console.log("PaymentEscrow address:", paymentEscrowAddress);
  console.log("ParkingSpot address:", parkingSpotAddress);

  // Deploy DisputeResolution
  const DisputeResolution = await hre.ethers.getContractFactory("DisputeResolution");
  const disputeResolution = await DisputeResolution.deploy(
    paymentEscrowAddress,
    parkingSpotAddress
  );

  await disputeResolution.waitForDeployment();
  const address = await disputeResolution.getAddress();

  console.log("DisputeResolution deployed to:", address);

  // Verify contract on block explorer if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await disputeResolution.deploymentTransaction().wait(5);

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [paymentEscrowAddress, parkingSpotAddress],
      });
      console.log("Contract verified on block explorer");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("DisputeResolution:", address);
  console.log("PaymentEscrow:", paymentEscrowAddress);
  console.log("ParkingSpot:", parkingSpotAddress);
  console.log("\nNext steps:");
  console.log("1. Update contract addresses in frontend/.env");
  console.log("2. Add moderators using addModerator()");
  console.log("3. Configure voting thresholds using updateConfiguration()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

